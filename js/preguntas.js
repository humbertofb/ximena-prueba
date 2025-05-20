// preguntas.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencia a la base de datos
    const db = firebase.firestore();

    // Función formatearFecha (asumo que está correcta y la mantengo)
    function formatearFecha(timestamp) {
        if (!timestamp) {
            return 'Fecha no disponible';
        }
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const opciones = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    // Elementos DOM
    const mainContentElement = document.getElementById('main-content'); // Para el menú
    const preguntaActualContainer = document.getElementById('pregunta-actual');
    const respuestasContainer = document.getElementById('respuestas-container');
    const nuevaPreguntaBtn = document.getElementById('nueva-pregunta-btn');
    const overlayElement = document.getElementById('overlay'); // Para el menú

    // Variables globales
    let preguntaActiva = null; // Objeto de la pregunta actualmente mostrada en #pregunta-actual
    let respuestasListeners = {}; // Para manejar los listeners de respuestas y evitar duplicados

    const RESPUESTAS_POR_PAGINA_MOVIL = 3; // Número de respuestas a mostrar inicialmente en móviles

    // --- INICIALIZACIÓN ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Si el usuario está autenticado, inicializamos funcionalidades
            inicializarFuncionalidadesPrincipales();
            if (nuevaPreguntaBtn) {
                nuevaPreguntaBtn.addEventListener('click', () => mostrarModalFormularioPregunta());
            }
        } else {
            // Manejar caso de usuario no autenticado si es necesario (ej. redirigir a login)
            console.log("Usuario no autenticado. Funcionalidades de preguntas no activas.");
            // Podrías limpiar los contenedores o mostrar un mensaje
            if (preguntaActualContainer) preguntaActualContainer.innerHTML = '<p>Inicia sesión para ver y participar en las preguntas.</p>';
            if (respuestasContainer) respuestasContainer.innerHTML = '';
        }
    });

    function inicializarFuncionalidadesPrincipales() {
        cargarPreguntaMasReciente();
        inicializarMenuHamburguesa();
        configurarBotonVolverArriba();
        // inicializarSwitchTema(); // Comentado porque no está definida
        configurarBotonCargarMasPreguntasAnteriores();
    }

    // --- MENÚ HAMBURGUESA ---
    function inicializarMenuHamburguesa() {
        const menuButton = document.getElementById('menu-button'); // ID del HTML
        const sideMenu = document.getElementById('side-menu'); // ID del HTML

        if (!menuButton || !sideMenu || !overlayElement || !mainContentElement) {
            console.error('Elementos del menú (botón, menú lateral, overlay o main-content) no encontrados');
            return;
        }

        menuButton.addEventListener('click', () => {
            // Alternar clase en el body o un elemento contenedor principal
            // Esto asume que tu CSS tiene .menu-open .side-menu { left: 0; } etc.
            document.body.classList.toggle('menu-open');
            // mainContentElement.classList.toggle('active'); // Si el contenido principal debe moverse
        });

        overlayElement.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
            // mainContentElement.classList.remove('active');
        });
    }

    // --- BOTÓN VOLVER ARRIBA ---
    function configurarBotonVolverArriba() {
        let botonVolver = document.querySelector('.btn-volver-arriba');
        if (!botonVolver) {
            botonVolver = document.createElement('button');
            // botonVolver.id = 'btn-volver-arriba'; // ID si es necesario, clase es suficiente
            botonVolver.className = 'btn-volver-arriba'; // Clase del CSS
            botonVolver.innerHTML = '<i class="fas fa-arrow-up"></i>';
            botonVolver.title = 'Volver arriba';
            document.body.appendChild(botonVolver);

            botonVolver.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                botonVolver.classList.add('visible'); // Clase del CSS para mostrarlo
            } else {
                botonVolver.classList.remove('visible');
            }
        });
    }

    // --- CARGA DE PREGUNTAS ---
    function cargarPreguntaMasReciente() {
        db.collection('preguntas')
            .orderBy('fechaCreacion', 'desc')
            .limit(1) // Solo la más reciente
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    mostrarMensajeNoHayPreguntas();
                    preguntaActiva = null;
                    if(respuestasContainer) respuestasContainer.innerHTML = '';
                    return;
                }
                const doc = querySnapshot.docs[0];
                preguntaActiva = { id: doc.id, ...doc.data() };
                mostrarPreguntaEnContenedorPrincipal(preguntaActiva);
                cargarYMostrarRespuestas(preguntaActiva.id);
            })
            .catch((error) => {
                console.error('Error al cargar la pregunta más reciente:', error);
                mostrarMensajeNoHayPreguntas();
            });
    }

    function mostrarMensajeNoHayPreguntas() {
        if (preguntaActualContainer) {
            preguntaActualContainer.innerHTML = `
                <div class="pregunta-card">
                    <div class="pregunta-header">
                        <p class="pregunta-texto">No hay preguntas disponibles actualmente.</p>
                    </div>
                    <p>¡Anímate a crear la primera!</p>
                </div>`;
        }
    }

    function mostrarPreguntaEnContenedorPrincipal(pregunta) {
        if (!preguntaActualContainer || !pregunta) return;

        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && pregunta.usuarioId === usuario.uid;

        preguntaActualContainer.innerHTML = `
            <div class="pregunta-card" data-id="${pregunta.id}">
                <div class="pregunta-header">
                    <h2 class="pregunta-texto">${pregunta.texto}</h2>
                    ${esCreador ? `
                        <div class="pregunta-admin">
                            <button class="btn-editar-pregunta" title="Editar pregunta"><i class="fas fa-edit"></i></button>
                            <button class="btn-eliminar-pregunta" title="Eliminar pregunta"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    ` : ''}
                </div>
                <p class="pregunta-fecha">Publicada por ${pregunta.nombreUsuario || 'Anónimo'} el ${formatearFecha(pregunta.fechaCreacion)}</p>
                
                <div class="responder-container">
                    <h3 class="responder-titulo">Tu respuesta:</h3>
                    <form class="responder-form">
                        <textarea class="responder-textarea form-control" placeholder="Escribe tu respuesta aquí..." required></textarea>
                        <button type="submit" class="responder-btn">
                            <i class="fas fa-paper-plane"></i> Enviar respuesta
                        </button>
                    </form>
                </div>
            </div>
        `;

        if (esCreador) {
            preguntaActualContainer.querySelector('.btn-editar-pregunta')?.addEventListener('click', () => mostrarModalFormularioPregunta(pregunta));
            preguntaActualContainer.querySelector('.btn-eliminar-pregunta')?.addEventListener('click', () => confirmarEliminacion('pregunta', pregunta.id, pregunta.texto));
        }

        preguntaActualContainer.querySelector('.responder-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = preguntaActualContainer.querySelector('.responder-textarea');
            guardarRespuesta(pregunta.id, textarea);
        });
    }

    // --- CARGA DE RESPUESTAS Y PAGINACIÓN ---
    function cargarYMostrarRespuestas(preguntaId) {
        if (!respuestasContainer) return;
        respuestasContainer.innerHTML = '<h2>Respuestas:</h2><div class="respuestas-lista"></div>'; // Contenedor para lista
        const respuestasLista = respuestasContainer.querySelector('.respuestas-lista');

        // Desuscribirse de listeners anteriores para esta pregunta si existen
        if (respuestasListeners[preguntaId]) {
            respuestasListeners[preguntaId](); // Llama a la función de desuscripción
            delete respuestasListeners[preguntaId];
        }
        
        let respuestasMostradasCount = 0;
        const esDispositivoMovil = window.innerWidth <= 768;

        const query = db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc');

        respuestasListeners[preguntaId] = query.onSnapshot((snapshot) => {
            respuestasLista.innerHTML = ''; // Limpiar para repintar en cada actualización
            respuestasMostradasCount = 0; 
            let totalRespuestasEnSnapshot = snapshot.size;

            if (snapshot.empty) {
                respuestasLista.innerHTML = '<p>Aún no hay respuestas. ¡Sé el primero en responder!</p>';
                eliminarBotonVerMasRespuestas();
                return;
            }
            
            snapshot.docs.forEach((doc, index) => {
                const respuesta = { id: doc.id, ...doc.data() };
                if (esDispositivoMovil && respuestasMostradasCount >= RESPUESTAS_POR_PAGINA_MOVIL) {
                    // No mostrar más si ya se alcanzó el límite inicial en móvil
                    // El botón "ver más" se encargará del resto
                } else {
                    const respuestaElement = crearHtmlRespuesta(respuesta);
                    respuestasLista.insertAdjacentHTML('beforeend', respuestaElement);
                    configurarListenersRespuestaItem(doc.id);
                    respuestasMostradasCount++;
                }
            });

            if (esDispositivoMovil && totalRespuestasEnSnapshot > respuestasMostradasCount) {
                actualizarBotonVerMasRespuestas(preguntaId, respuestasMostradasCount, totalRespuestasEnSnapshot);
            } else {
                eliminarBotonVerMasRespuestas();
            }

        }, error => {
            console.error("Error al escuchar respuestas: ", error);
            respuestasLista.innerHTML = '<p>Error al cargar respuestas.</p>';
        });
    }

    function actualizarBotonVerMasRespuestas(preguntaId, mostradas, total) {
        eliminarBotonVerMasRespuestas(); // Eliminar si ya existe para evitar duplicados

        const botonVerMas = document.createElement('button');
        botonVerMas.id = 'btn-ver-mas-respuestas'; // ID único
        botonVerMas.className = 'btn-ver-mas'; // Clase CSS
        botonVerMas.innerHTML = `<i class="fas fa-chevron-down"></i> Ver más respuestas (${total - mostradas} restantes)`;
        
        botonVerMas.addEventListener('click', () => cargarLoteAdicionalDeRespuestas(preguntaId));
        respuestasContainer.appendChild(botonVerMas);
    }

    function eliminarBotonVerMasRespuestas() {
        const botonExistente = document.getElementById('btn-ver-mas-respuestas');
        if (botonExistente) {
            botonExistente.remove();
        }
    }

    async function cargarLoteAdicionalDeRespuestas(preguntaId) {
        const esDispositivoMovil = window.innerWidth <= 768;
        if (!esDispositivoMovil) return; // Esta lógica es principalmente para móviles

        const respuestasLista = respuestasContainer.querySelector('.respuestas-lista');
        if (!respuestasLista) return;

        const ultimaRespuestaVisibleElement = respuestasLista.querySelector('.respuesta-item:last-child');
        if (!ultimaRespuestaVisibleElement) return; // No hay respuestas visibles para paginar después

        const ultimaRespuestaVisibleId = ultimaRespuestaVisibleElement.dataset.id;

        try {
            const ultimoDocSnapshot = await db.collection('respuestas').doc(ultimaRespuestaVisibleId).get();
            if (!ultimoDocSnapshot.exists) {
                console.warn("Última respuesta visible no encontrada en DB, cargando sin paginación.");
                // Podrías intentar cargar sin startAfter como fallback, pero esto es complejo con listeners.
                // Por ahora, si esto pasa, el botón "ver más" podría no funcionar como se espera.
                eliminarBotonVerMasRespuestas();
                return;
            }

            const snapshot = await db.collection('respuestas')
                .where('preguntaId', '==', preguntaId)
                .orderBy('fechaCreacion', 'desc')
                .startAfter(ultimoDocSnapshot)
                .limit(RESPUESTAS_POR_PAGINA_MOVIL)
                .get();

            let nuevasRespuestasCargadas = 0;
            snapshot.forEach(doc => {
                const respuesta = { id: doc.id, ...doc.data() };
                const respuestaElement = crearHtmlRespuesta(respuesta);
                respuestasLista.insertAdjacentHTML('beforeend', respuestaElement);
                configurarListenersRespuestaItem(doc.id);
                nuevasRespuestasCargadas++;
            });

            if (nuevasRespuestasCargadas < RESPUESTAS_POR_PAGINA_MOVIL || snapshot.empty) {
                eliminarBotonVerMasRespuestas(); // No hay más o se cargaron todas las disponibles en este lote
            } else {
                // Recontar para actualizar el botón (esto es simplificado, idealmente el listener general lo manejaría)
                 const totalRespuestasQuery = await db.collection('respuestas').where('preguntaId', '==', preguntaId).get();
                 const totalGeneral = totalRespuestasQuery.size;
                 const mostradasActuales = respuestasLista.querySelectorAll('.respuesta-item').length;
                 if (mostradasActuales < totalGeneral) {
                    actualizarBotonVerMasRespuestas(preguntaId, mostradasActuales, totalGeneral);
                 } else {
                    eliminarBotonVerMasRespuestas();
                 }
            }

        } catch (error) {
            console.error("Error al cargar más respuestas:", error);
            mostrarNotificacion("Error al cargar más respuestas", "error");
        }
    }
    
    // --- HTML Y LISTENERS PARA RESPUESTAS INDIVIDUALES ---
    function crearHtmlRespuesta(respuesta) {
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;

        const reacciones = respuesta.reacciones || { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 };
        const misReacciones = (usuario && respuesta.usuariosReacciones && respuesta.usuariosReacciones[usuario.uid]) || {};

        // Clase para tema oscuro si está activo
        const themeClass = document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';

        return `
            <div class="respuesta-item ${themeClass}" data-id="${respuesta.id}">
                <div class="respuesta-header">
                    <span class="respuesta-autor">${respuesta.nombreUsuario || 'Usuario'}</span>
                    <span class="respuesta-fecha">${formatearFecha(respuesta.fechaCreacion)}</span>
                </div>
                <p class="respuesta-contenido">${respuesta.texto}</p>
                <div class="respuesta-acciones">
                    <div class="reacciones">
                        <div class="reacciones-botones">
                            ${Object.entries(reacciones).map(([emoji, count]) => `
                                <button class="btn-reaccion ${misReacciones[emoji] ? 'active' : ''}" data-emoji="${emoji}" title="Reaccionar con ${emoji}">
                                    <span class="reaccion-emoji">${emoji}</span>
                                    <span class="reaccion-count">${count || 0}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    ${esCreador ? `
                        <div class="respuesta-admin">
                            <button class="btn-editar-respuesta" title="Editar respuesta"><i class="fas fa-edit"></i></button>
                            <button class="btn-eliminar-respuesta" title="Eliminar respuesta"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function configurarListenersRespuestaItem(respuestaId) {
        const respuestaElement = document.querySelector(`.respuesta-item[data-id="${respuestaId}"]`);
        if (!respuestaElement) return;

        const usuario = firebase.auth().currentUser;

        respuestaElement.querySelectorAll('.btn-reaccion').forEach(boton => {
            boton.addEventListener('click', () => {
                if (!usuario) {
                    mostrarNotificacion('Debes iniciar sesión para reaccionar.', 'error');
                    return;
                }
                toggleReaccion(respuestaId, boton.dataset.emoji);
            });
        });

        const btnEditar = respuestaElement.querySelector('.btn-editar-respuesta');
        const btnEliminar = respuestaElement.querySelector('.btn-eliminar-respuesta');

        if (btnEditar) {
            btnEditar.addEventListener('click', async () => {
                const doc = await db.collection('respuestas').doc(respuestaId).get();
                if (doc.exists) mostrarModalFormularioRespuesta(preguntaActiva.id, { id: doc.id, ...doc.data() });
            });
        }
        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => confirmarEliminacion('respuesta', respuestaId, "esta respuesta"));
        }
    }

    // --- ACCIONES CRUD (Crear, Leer, Actualizar, Eliminar) ---
    function guardarRespuesta(preguntaId, textareaElement) {
        const texto = textareaElement.value.trim();
        if (!texto) {
            mostrarNotificacion('Por favor, escribe una respuesta.', 'error');
            return;
        }
        const usuario = firebase.auth().currentUser;
        if (!usuario) {
            mostrarNotificacion('Debes iniciar sesión para responder.', 'error');
            return;
        }
        const nuevaRespuesta = {
            preguntaId: preguntaId,
            texto: texto,
            usuarioId: usuario.uid,
            nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            reacciones: { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 },
            usuariosReacciones: {}
        };
        db.collection('respuestas').add(nuevaRespuesta)
            .then(() => {
                textareaElement.value = '';
                mostrarNotificacion('Respuesta guardada.', 'success');
            })
            .catch(error => {
                console.error('Error al guardar respuesta:', error);
                mostrarNotificacion('Error al guardar la respuesta.', 'error');
            });
    }

    function toggleReaccion(respuestaId, emoji) {
        const usuario = firebase.auth().currentUser;
        if (!usuario) return;

        const respuestaRef = db.collection('respuestas').doc(respuestaId);
        db.runTransaction(transaction => {
            return transaction.get(respuestaRef).then(doc => {
                if (!doc.exists) throw "Document does not exist!";
                
                let reacciones = doc.data().reacciones || { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 };
                let usuariosReacciones = doc.data().usuariosReacciones || {};
                let misReacciones = usuariosReacciones[usuario.uid] || {};

                if (misReacciones[emoji]) {
                    reacciones[emoji] = Math.max(0, (reacciones[emoji] || 0) - 1);
                    delete misReacciones[emoji];
                } else {
                    reacciones[emoji] = (reacciones[emoji] || 0) + 1;
                    misReacciones[emoji] = true;
                }
                usuariosReacciones[usuario.uid] = misReacciones;
                transaction.update(respuestaRef, { reacciones, usuariosReacciones });
            });
        }).catch(error => {
            console.error("Error al actualizar reacción: ", error);
            mostrarNotificacion("Error al reaccionar.", "error");
        });
    }

    // --- MODALES (Creación y Edición) ---
    // Modal genérico para Pregunta (crear/editar)
    function mostrarModalFormularioPregunta(preguntaExistente = null) {
        const modalId = 'modal-formulario-pregunta';
        let modal = document.getElementById(modalId);

        if (!modal) {
            const modalHTML = `
                <div id="${modalId}" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">${preguntaExistente ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
                            <button class="close-modal" title="Cerrar">×</button>
                        </div>
                        <form id="form-pregunta" class="modal-body">
                            <div class="form-group">
                                <label for="modal-pregunta-texto" class="form-label">Texto de la pregunta:</label>
                                <textarea id="modal-pregunta-texto" class="form-control" placeholder="Escribe aquí tu pregunta..." required></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-cancelar">Cancelar</button>
                                <button type="submit" class="btn-guardar">${preguntaExistente ? 'Guardar Cambios' : 'Crear Pregunta'}</button>
                            </div>
                        </form>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById(modalId);

            modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
            modal.querySelector('.btn-cancelar').addEventListener('click', () => modal.classList.remove('show'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

            modal.querySelector('#form-pregunta').addEventListener('submit', (e) => {
                e.preventDefault();
                const texto = modal.querySelector('#modal-pregunta-texto').value.trim();
                if (!texto) {
                    mostrarNotificacion('El texto de la pregunta no puede estar vacío.', 'error');
                    return;
                }
                const usuario = firebase.auth().currentUser;
                if (!usuario) {
                    mostrarNotificacion('Debes iniciar sesión.', 'error');
                    return;
                }

                if (preguntaExistente) { // Editar
                    db.collection('preguntas').doc(preguntaExistente.id).update({
                        texto: texto,
                        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        mostrarNotificacion('Pregunta actualizada.', 'success');
                        modal.classList.remove('show');
                        if (preguntaActiva && preguntaActiva.id === preguntaExistente.id) {
                            preguntaActiva.texto = texto; // Actualizar localmente también
                            mostrarPreguntaEnContenedorPrincipal(preguntaActiva);
                        }
                    }).catch(err => mostrarNotificacion('Error al actualizar: ' + err.message, 'error'));
                } else { // Crear
                    db.collection('preguntas').add({
                        texto: texto,
                        usuarioId: usuario.uid,
                        nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
                        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        mostrarNotificacion('Pregunta creada.', 'success');
                        modal.classList.remove('show');
                        cargarPreguntaMasReciente(); // Recargar para ver la nueva
                    }).catch(err => mostrarNotificacion('Error al crear: ' + err.message, 'error'));
                }
            });
        } else {
            // Si el modal ya existe, solo actualizar título y botón si es necesario
            modal.querySelector('.modal-title').textContent = preguntaExistente ? 'Editar Pregunta' : 'Nueva Pregunta';
            modal.querySelector('.btn-guardar').textContent = preguntaExistente ? 'Guardar Cambios' : 'Crear Pregunta';
        }
        
        modal.querySelector('#modal-pregunta-texto').value = preguntaExistente ? preguntaExistente.texto : '';
        modal.classList.add('show');
    }

    // Modal genérico para Respuesta (crear/editar) - Adaptado de Pregunta
    function mostrarModalFormularioRespuesta(preguntaIdParaNuevaRespuesta, respuestaExistente = null) {
        const modalId = 'modal-formulario-respuesta';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            const modalHTML = `
                <div id="${modalId}" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">${respuestaExistente ? 'Editar Respuesta' : 'Nueva Respuesta'}</h2>
                            <button class="close-modal" title="Cerrar">×</button>
                        </div>
                        <form id="form-respuesta" class="modal-body">
                             <div class="form-group">
                                <label for="modal-respuesta-texto" class="form-label">Tu respuesta:</label>
                                <textarea id="modal-respuesta-texto" class="form-control" placeholder="Escribe aquí tu respuesta..." required></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-cancelar">Cancelar</button>
                                <button type="submit" class="btn-guardar">${respuestaExistente ? 'Guardar Cambios' : 'Enviar Respuesta'}</button>
                            </div>
                        </form>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById(modalId);

            modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
            modal.querySelector('.btn-cancelar').addEventListener('click', () => modal.classList.remove('show'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

            modal.querySelector('#form-respuesta').addEventListener('submit', (e) => {
                e.preventDefault();
                const texto = modal.querySelector('#modal-respuesta-texto').value.trim();
                 if (!texto) {
                    mostrarNotificacion('La respuesta no puede estar vacía.', 'error');
                    return;
                }
                const usuario = firebase.auth().currentUser;
                 if (!usuario) {
                    mostrarNotificacion('Debes iniciar sesión.', 'error');
                    return;
                }

                if (respuestaExistente) { // Editar
                    db.collection('respuestas').doc(respuestaExistente.id).update({
                        texto: texto,
                        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        mostrarNotificacion('Respuesta actualizada.', 'success');
                        modal.classList.remove('show');
                        // El listener onSnapshot debería actualizar el DOM automáticamente
                    }).catch(err => mostrarNotificacion('Error al actualizar: ' + err.message, 'error'));
                } else { // Crear (aunque ya tenemos un formulario en la página, este es por si se quiere un modal)
                    // Esta parte es redundante si ya tienes el formulario de respuesta en la página.
                    // Lo mantengo por si decides usar un modal para nuevas respuestas también.
                    db.collection('respuestas').add({
                        preguntaId: preguntaIdParaNuevaRespuesta,
                        texto: texto,
                        usuarioId: usuario.uid,
                        nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
                        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                        reacciones: { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 },
                        usuariosReacciones: {}
                    }).then(() => {
                        mostrarNotificacion('Respuesta enviada.', 'success');
                        modal.classList.remove('show');
                    }).catch(err => mostrarNotificacion('Error al enviar: ' + err.message, 'error'));
                }
            });
        } else {
            modal.querySelector('.modal-title').textContent = respuestaExistente ? 'Editar Respuesta' : 'Nueva Respuesta';
            modal.querySelector('.btn-guardar').textContent = respuestaExistente ? 'Guardar Cambios' : 'Enviar Respuesta';
        }
        
        modal.querySelector('#modal-respuesta-texto').value = respuestaExistente ? respuestaExistente.texto : '';
        modal.classList.add('show');
    }

    // Modal de Confirmación de Eliminación
    function confirmarEliminacion(tipo, id, nombreItem = "este elemento") {
        const modalId = 'modal-confirmar-eliminacion';
        let modal = document.getElementById(modalId);

        if (!modal) {
            const modalHTML = `
                <div id="${modalId}" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">Confirmar Eliminación</h2>
                            <button class="close-modal" title="Cerrar">×</button>
                        </div>
                        <div class="modal-body">
                            <p>¿Estás seguro de que deseas eliminar "${nombreItem}"? Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-cancelar">Cancelar</button>
                            <button type="button" id="btn-confirmar-eliminar" class="btn-eliminar-confirmado">Eliminar</button> 
                        </div>
                    </div>
                </div>`;
            // Nota: .btn-eliminar-confirmado necesita estilos CSS, similar a .btn-eliminar-pregunta
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById(modalId);

            modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
            modal.querySelector('.btn-cancelar').addEventListener('click', () => modal.classList.remove('show'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
        }
        
        // Actualizar texto si el modal ya existía
        modal.querySelector('.modal-body p').textContent = `¿Estás seguro de que deseas eliminar "${nombreItem}"? Esta acción no se puede deshacer.`;

        // Configurar el botón de confirmación para la acción específica
        const btnConfirmar = modal.querySelector('#btn-confirmar-eliminar');
        // Clonar y reemplazar para remover listeners antiguos
        const newBtnConfirmar = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(newBtnConfirmar, btnConfirmar);

        newBtnConfirmar.addEventListener('click', () => {
            let coleccion = tipo === 'pregunta' ? 'preguntas' : 'respuestas';
            db.collection(coleccion).doc(id).delete()
                .then(() => {
                    mostrarNotificacion(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminada.`, 'success');
                    modal.classList.remove('show');
                    if (tipo === 'pregunta') {
                        // Si se elimina la pregunta activa, cargar la siguiente más reciente o mostrar mensaje
                        if (preguntaActiva && preguntaActiva.id === id) {
                            cargarPreguntaMasReciente(); 
                        }
                        // Si la pregunta eliminada estaba en la lista de "anteriores", removerla del DOM.
                        const preguntaCardAnterior = document.querySelector(`.preguntas-anteriores .pregunta-card[data-id="${id}"]`);
                        preguntaCardAnterior?.remove();

                    } 
                    // Para respuestas, el listener onSnapshot debería manejar la actualización del DOM.
                })
                .catch(err => mostrarNotificacion(`Error al eliminar: ${err.message}`, 'error'));
        });
        modal.classList.add('show');
    }

    // --- PREGUNTAS ANTERIORES ---
    function configurarBotonCargarMasPreguntasAnteriores() {
        let cargarMasBtn = document.getElementById('btn-cargar-mas-preguntas');
        if (!cargarMasBtn) {
            cargarMasBtn = document.createElement('button');
            cargarMasBtn.id = 'btn-cargar-mas-preguntas';
            cargarMasBtn.className = 'btn-cargar-mas'; // Usa una clase genérica o crea una específica
            cargarMasBtn.innerHTML = '<i class="fas fa-history"></i> Ver preguntas anteriores';
            
            const container = document.querySelector('.preguntas-container');
            // Insertar después del contenedor de la pregunta actual, o al final del contenedor principal.
            if (preguntaActualContainer && preguntaActualContainer.nextSibling) {
                 preguntaActualContainer.parentNode.insertBefore(cargarMasBtn, preguntaActualContainer.nextSibling.nextSibling); // Después de respuestas
            } else if (container) {
                container.appendChild(cargarMasBtn);
            }
        }
        cargarMasBtn.addEventListener('click', cargarLotePreguntasAnteriores);
    }
    
    async function cargarLotePreguntasAnteriores() {
        const preguntasAnterioresContainerId = 'preguntas-anteriores-lista';
        let contenedorAnteriores = document.getElementById(preguntasAnterioresContainerId);
        if (!contenedorAnteriores) {
            contenedorAnteriores = document.createElement('div');
            contenedorAnteriores.id = preguntasAnterioresContainerId;
            contenedorAnteriores.className = 'preguntas-anteriores'; // Para estilizar
            // Insertar después del contenedor de respuestas
            if (respuestasContainer && respuestasContainer.nextSibling) {
                respuestasContainer.parentNode.insertBefore(contenedorAnteriores, respuestasContainer.nextSibling);
            } else if (preguntaActualContainer && preguntaActualContainer.parentNode) {
                 preguntaActualContainer.parentNode.appendChild(contenedorAnteriores);
            }
        }

        const ultimaPreguntaAnteriorVisible = contenedorAnteriores.querySelector('.pregunta-card:last-child');
        let query = db.collection('preguntas').orderBy('fechaCreacion', 'desc');

        // Queremos preguntas ANTERIORES a la actual, o si ya hay anteriores, anteriores a la última anterior
        let docReferenciaParaStartAfter = null;

        if (ultimaPreguntaAnteriorVisible) {
            const ultimaId = ultimaPreguntaAnteriorVisible.dataset.id;
            docReferenciaParaStartAfter = await db.collection('preguntas').doc(ultimaId).get();
        } else if (preguntaActiva) { // Primera carga de anteriores, paginar después de la activa
            docReferenciaParaStartAfter = await db.collection('preguntas').doc(preguntaActiva.id).get();
        }
        
        if (docReferenciaParaStartAfter && docReferenciaParaStartAfter.exists) {
            query = query.startAfter(docReferenciaParaStartAfter);
        } else if (!ultimaPreguntaAnteriorVisible && !preguntaActiva) {
            // No hay pregunta activa y no hay anteriores, no hacer nada o cargar desde el inicio (pero ya lo hizo cargarPreguntaMasReciente)
            mostrarNotificacion('No hay pregunta activa para paginar después.', 'info');
            return;
        }


        query.limit(5).get().then(snapshot => {
            if (snapshot.empty) {
                mostrarNotificacion('No hay más preguntas anteriores.', 'info');
                document.getElementById('btn-cargar-mas-preguntas')?.remove(); // Ocultar botón si no hay más
                return;
            }
            snapshot.forEach(doc => {
                const pregunta = { id: doc.id, ...doc.data() };
                const preguntaCardHTML = `
                    <div class="pregunta-card" data-id="${pregunta.id}">
                        <div class="pregunta-header">
                            <h3 class="pregunta-texto-anterior">${pregunta.texto}</h3>
                        </div>
                        <p class="pregunta-fecha-anterior">Por ${pregunta.nombreUsuario || 'Anónimo'} - ${formatearFecha(pregunta.fechaCreacion)}</p>
                        <button class="btn-ver-pregunta-completa" data-id="${pregunta.id}">
                            <i class="fas fa-eye"></i> Ver esta pregunta y sus respuestas
                        </button>
                    </div>`;
                // CSS necesitará .pregunta-texto-anterior, .pregunta-fecha-anterior, .btn-ver-pregunta-completa
                contenedorAnteriores.insertAdjacentHTML('beforeend', preguntaCardHTML);
                contenedorAnteriores.querySelector(`.btn-ver-pregunta-completa[data-id="${pregunta.id}"]`)
                    .addEventListener('click', () => cargarPreguntaEspecificaComoPrincipal(pregunta.id));
            });
        }).catch(error => {
            console.error("Error al cargar preguntas anteriores: ", error);
            mostrarNotificacion("Error al cargar preguntas anteriores.", "error");
        });
    }

    function cargarPreguntaEspecificaComoPrincipal(preguntaId) {
        // Similar a cargarPreguntaMasReciente pero con un ID específico
        db.collection('preguntas').doc(preguntaId).get()
            .then((doc) => {
                if (!doc.exists) {
                    mostrarNotificacion('La pregunta no existe.', 'error');
                    return;
                }
                preguntaActiva = { id: doc.id, ...doc.data() };
                mostrarPreguntaEnContenedorPrincipal(preguntaActiva);
                cargarYMostrarRespuestas(preguntaActiva.id);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al inicio
                
                // Limpiar lista de preguntas anteriores, ya que la seleccionada es ahora la principal
                const contenedorAnteriores = document.getElementById('preguntas-anteriores-lista');
                if (contenedorAnteriores) contenedorAnteriores.innerHTML = '';
                // Volver a mostrar el botón de cargar anteriores si no está ya
                if (!document.getElementById('btn-cargar-mas-preguntas')) {
                    configurarBotonCargarMasPreguntasAnteriores();
                }

            })
            .catch((error) => {
                console.error('Error al cargar pregunta específica:', error);
                mostrarNotificacion('Error al cargar la pregunta.', 'error');
            });
    }


    // --- NOTIFICACIONES ---
    // (Asegúrate de tener el CSS para .notification y .notification.show)
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const existingNotif = document.querySelector('.notification');
        if(existingNotif) existingNotif.remove();

        const notificacion = document.createElement('div');
        notificacion.className = `notification ${tipo}`; // ej. info, success, error
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => notificacion.classList.add('show'), 10); // Para la animación de entrada
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => notificacion.remove(), 500); // Esperar a que termine la animación de salida
        }, 3000);
    }
});
