document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    function formatearFecha(timestamp) {
        if (!timestamp) return 'Fecha no disponible';
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1e6);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    const mainContentElement = document.getElementById('main-content');
    const preguntaActualContainer = document.getElementById('pregunta-actual');
    const respuestasContainer = document.getElementById('respuestas-container');
    const nuevaPreguntaBtn = document.getElementById('nueva-pregunta-btn');
    const overlayElement = document.getElementById('overlay');

    let preguntaActiva = null;
    let respuestasListeners = {}; // Objeto para almacenar funciones de desuscripción
    const RESPUESTAS_POR_PAGINA_MOVIL = 3;
    let ultimaPreguntaAnteriorVisibleDoc = null; // Para paginación de preguntas anteriores

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            inicializarFuncionalidadesPrincipales();
            if (nuevaPreguntaBtn) {
                nuevaPreguntaBtn.addEventListener('click', () => mostrarModalFormularioPregunta());
            }
        } else {
            console.log("Usuario no autenticado.");
            if (preguntaActualContainer) preguntaActualContainer.innerHTML = '<p class="auth-message">Inicia sesión para ver y participar en las preguntas.</p>';
            if (respuestasContainer) respuestasContainer.innerHTML = '';
            // Podrías ocultar botones como "nueva pregunta" o "preguntas anteriores"
            document.getElementById('btn-cargar-mas-preguntas')?.remove();
            document.getElementById('preguntas-anteriores-lista')?.remove();
        }
    });

    function inicializarFuncionalidadesPrincipales() {
        cargarPreguntaMasReciente();
        inicializarMenuHamburguesa();
        configurarBotonVolverArriba();
        configurarBotonCargarMasPreguntasAnteriores();
        // theme-switcher.js debería manejar el tema globalmente
    }

    function inicializarMenuHamburguesa() {
        const menuButton = document.getElementById('menu-button');
        const sideMenu = document.getElementById('side-menu');

        if (!menuButton || !sideMenu || !overlayElement || !mainContentElement) {
            console.error('Elementos del menú no encontrados');
            return;
        }

        menuButton.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
            mainContentElement.classList.toggle('active'); 
        });

        overlayElement.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
            mainContentElement.classList.remove('active');
        });
    }

    function configurarBotonVolverArriba() {
        let botonVolver = document.querySelector('.btn-volver-arriba');
        if (!botonVolver) {
            botonVolver = document.createElement('button');
            botonVolver.className = 'btn-volver-arriba';
            botonVolver.innerHTML = '<i class="fas fa-arrow-up"></i>';
            botonVolver.title = 'Volver arriba';
            document.body.appendChild(botonVolver);

            botonVolver.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        window.addEventListener('scroll', () => {
            botonVolver.classList.toggle('visible', window.pageYOffset > 300);
        });
    }

    function cargarPreguntaMasReciente() {
        // Limpiar cualquier lista de "preguntas anteriores" y resetear paginación de anteriores
        document.getElementById('preguntas-anteriores-lista')?.remove();
        ultimaPreguntaAnteriorVisibleDoc = null;
        // Re-configurar el botón de cargar anteriores por si fue removido
        if (!document.getElementById('btn-cargar-mas-preguntas') && firebase.auth().currentUser) {
            configurarBotonCargarMasPreguntasAnteriores();
        }

        db.collection('preguntas')
            .orderBy('fechaCreacion', 'desc')
            .limit(1)
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
        if (respuestasContainer) respuestasContainer.innerHTML = '';
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
            preguntaActualContainer.querySelector('.btn-eliminar-pregunta')?.addEventListener('click', () => confirmarEliminacion('pregunta', pregunta.id, `"${pregunta.texto.substring(0, 30)}..."`));
        }

        preguntaActualContainer.querySelector('.responder-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = preguntaActualContainer.querySelector('.responder-textarea');
            guardarRespuesta(pregunta.id, textarea);
        });
    }

    function cargarYMostrarRespuestas(preguntaId) {
        if (!respuestasContainer) return;
        respuestasContainer.innerHTML = '<h2>Respuestas:</h2><div class="respuestas-lista"></div>';
        const respuestasLista = respuestasContainer.querySelector('.respuestas-lista');

        if (respuestasListeners[preguntaId]) {
            respuestasListeners[preguntaId](); 
            delete respuestasListeners[preguntaId];
        }
        
        let query = db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc');
        
        let primerasRespuestasCargadas = false;
        let todasLasRespuestas = []; // Para manejar "ver más" correctamente con onSnapshot

        respuestasListeners[preguntaId] = query.onSnapshot((snapshot) => {
            todasLasRespuestas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            respuestasLista.innerHTML = ''; // Limpiar para repintar
            
            if (todasLasRespuestas.length === 0) {
                respuestasLista.innerHTML = '<p>Aún no hay respuestas. ¡Sé el primero en responder!</p>';
                eliminarBotonVerMasRespuestas();
                return;
            }
            
            const esDispositivoMovil = window.innerWidth <= 768;
            const limiteInicial = primerasRespuestasCargadas && esDispositivoMovil ? respuestasLista.children.length + RESPUESTAS_POR_PAGINA_MOVIL : (esDispositivoMovil ? RESPUESTAS_POR_PAGINA_MOVIL : todasLasRespuestas.length);

            todasLasRespuestas.slice(0, limiteInicial).forEach(respuesta => {
                 const respuestaElementHTML = crearHtmlRespuesta(respuesta);
                 respuestasLista.insertAdjacentHTML('beforeend', respuestaElementHTML);
                 configurarListenersRespuestaItem(respuesta.id);
            });
            
            if (!primerasRespuestasCargadas) primerasRespuestasCargadas = true;

            if (esDispositivoMovil && limiteInicial < todasLasRespuestas.length) {
                actualizarBotonVerMasRespuestas(preguntaId, limiteInicial, todasLasRespuestas.length);
            } else {
                eliminarBotonVerMasRespuestas();
            }

        }, error => {
            console.error("Error al escuchar respuestas: ", error);
            respuestasLista.innerHTML = '<p>Error al cargar respuestas.</p>';
        });
    }
    
    function actualizarBotonVerMasRespuestas(preguntaId, mostradas, total) {
        eliminarBotonVerMasRespuestas(); 
        const botonVerMas = document.createElement('button');
        botonVerMas.id = 'btn-ver-mas-respuestas';
        botonVerMas.className = 'btn-ver-mas';
        botonVerMas.innerHTML = `<i class="fas fa-chevron-down"></i> Ver ${total - mostradas} respuestas más`;
        
        botonVerMas.addEventListener('click', () => {
            // Esta función ahora solo fuerza una re-evaluación del renderizado en el onSnapshot
            // o carga más si no se usa onSnapshot para "ver más"
            const respuestasLista = respuestasContainer.querySelector('.respuestas-lista');
            const esDispositivoMovil = window.innerWidth <= 768;
            if (!respuestasLista || !esDispositivoMovil) return;

            const snapshot = respuestasListeners[preguntaId]; // Necesitas la query original o las docs cacheadas
            // Esta parte es compleja con onSnapshot. Una forma más simple es solo mostrar más de las ya cargadas.
            const actualmenteMostradas = respuestasLista.children.length;
            const nuevasAMostrar = todasLasRespuestas.slice(actualmenteMostradas, actualmenteMostradas + RESPUESTAS_POR_PAGINA_MOVIL);
            
            nuevasAMostrar.forEach(respuesta => {
                const respuestaElementHTML = crearHtmlRespuesta(respuesta);
                respuestasLista.insertAdjacentHTML('beforeend', respuestaElementHTML);
                configurarListenersRespuestaItem(respuesta.id);
            });

            if (respuestasLista.children.length < todasLasRespuestas.length) {
                actualizarBotonVerMasRespuestas(preguntaId, respuestasLista.children.length, todasLasRespuestas.length);
            } else {
                eliminarBotonVerMasRespuestas();
            }
        });
        if (respuestasContainer) respuestasContainer.appendChild(botonVerMas);
    }


    function eliminarBotonVerMasRespuestas() {
        document.getElementById('btn-ver-mas-respuestas')?.remove();
    }

    function crearHtmlRespuesta(respuesta) {
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;
        const reacciones = respuesta.reacciones || { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 };
        
        // Lógica para reacción única
        const emojiReaccionadoPorUsuario = (usuario && respuesta.usuariosReacciones && respuesta.usuariosReacciones[usuario.uid]) 
                                            ? respuesta.usuariosReacciones[usuario.uid] 
                                            : null;

        return `
            <div class="respuesta-item" data-id="${respuesta.id}">
                <div class="respuesta-header">
                    <span class="respuesta-autor">${respuesta.nombreUsuario || 'Usuario'}</span>
                    <span class="respuesta-fecha">${formatearFecha(respuesta.fechaCreacion)}</span>
                </div>
                <p class="respuesta-contenido">${respuesta.texto}</p>
                <div class="respuesta-acciones">
                    <div class="reacciones">
                        <div class="reacciones-botones">
                            ${Object.entries(reacciones).map(([emoji, count]) => `
                                <button class="btn-reaccion ${emojiReaccionadoPorUsuario === emoji ? 'active' : ''}" data-emoji="${emoji}" title="Reaccionar con ${emoji}">
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
                toggleReaccion(respuestaId, boton.dataset.emoji, preguntaActiva.id);
            });
        });

        const btnEditar = respuestaElement.querySelector('.btn-editar-respuesta');
        const btnEliminar = respuestaElement.querySelector('.btn-eliminar-respuesta');

        if (btnEditar) {
            btnEditar.addEventListener('click', async () => {
                const docSnap = await db.collection('respuestas').doc(respuestaId).get();
                if (docSnap.exists()) mostrarModalFormularioRespuesta(preguntaActiva.id, { id: docSnap.id, ...docSnap.data() });
            });
        }
        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => confirmarEliminacion('respuesta', respuestaId, "esta respuesta"));
        }
    }

    function guardarRespuesta(preguntaId, textareaElement) {
        const texto = textareaElement.value.trim();
        if (!texto) { mostrarNotificacion('Por favor, escribe una respuesta.', 'error'); return; }
        const usuario = firebase.auth().currentUser;
        if (!usuario) { mostrarNotificacion('Debes iniciar sesión para responder.', 'error'); return; }
        
        const nuevaRespuesta = {
            preguntaId: preguntaId, texto: texto, usuarioId: usuario.uid,
            nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            reacciones: { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 },
            usuariosReacciones: {}
        };
        db.collection('respuestas').add(nuevaRespuesta)
            .then(() => {
                textareaElement.value = '';
                mostrarNotificacion('Respuesta guardada con éxito.', 'success');
            })
            .catch(error => {
                console.error('Error al guardar respuesta:', error);
                mostrarNotificacion('Error al guardar la respuesta.', 'error');
            });
    }

    function toggleReaccion(respuestaId, emojiSeleccionado, preguntaIdActual) {
        const usuario = firebase.auth().currentUser;
        if (!usuario) return;
        const respuestaRef = db.collection('respuestas').doc(respuestaId);

        db.runTransaction(transaction => {
            return transaction.get(respuestaRef).then(doc => {
                if (!doc.exists) throw "El documento de respuesta no existe!";
                
                let data = doc.data();
                let reacciones = data.reacciones || { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 };
                let usuariosReacciones = data.usuariosReacciones || {};
                const uid = usuario.uid;
                const emojiReaccionadoAnteriormente = usuariosReacciones[uid];

                if (emojiReaccionadoAnteriormente === emojiSeleccionado) {
                    reacciones[emojiSeleccionado] = Math.max(0, (reacciones[emojiSeleccionado] || 0) - 1);
                    delete usuariosReacciones[uid];
                } else {
                    if (emojiReaccionadoAnteriormente) {
                        reacciones[emojiReaccionadoAnteriormente] = Math.max(0, (reacciones[emojiReaccionadoAnteriormente] || 0) - 1);
                    }
                    reacciones[emojiSeleccionado] = (reacciones[emojiSeleccionado] || 0) + 1;
                    usuariosReacciones[uid] = emojiSeleccionado;
                }
                transaction.update(respuestaRef, { reacciones, usuariosReacciones });
            });
        }).catch(error => {
            console.error("Error al actualizar reacción: ", error);
            mostrarNotificacion("Error al reaccionar.", "error");
        });
    }

    function mostrarModalFormularioPregunta(preguntaExistente = null) {
        const modalId = 'modal-formulario-pregunta';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = crearModalBase(modalId, preguntaExistente ? 'Editar Pregunta' : 'Nueva Pregunta', `
                <div class="form-group">
                    <label for="modal-pregunta-texto" class="form-label">Texto de la pregunta:</label>
                    <textarea id="modal-pregunta-texto" class="form-control" placeholder="Escribe aquí tu pregunta..." required></textarea>
                </div>
            `);
            document.body.appendChild(modal);
            configurarListenersModalBase(modal, '#form-pregunta', (form) => {
                const texto = form.querySelector('#modal-pregunta-texto').value.trim();
                if (!texto) { mostrarNotificacion('El texto no puede estar vacío.', 'error'); return; }
                const usuario = firebase.auth().currentUser;
                if (!usuario) { mostrarNotificacion('Debes iniciar sesión.', 'error'); return; }

                const datosPregunta = {
                    texto: texto,
                    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                };

                let promesa;
                if (preguntaExistente) {
                    promesa = db.collection('preguntas').doc(preguntaExistente.id).update(datosPregunta);
                } else {
                    datosPregunta.usuarioId = usuario.uid;
                    datosPregunta.nombreUsuario = usuario.displayName || usuario.email.split('@')[0];
                    datosPregunta.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
                    promesa = db.collection('preguntas').add(datosPregunta);
                }

                promesa.then(() => {
                    mostrarNotificacion(`Pregunta ${preguntaExistente ? 'actualizada' : 'creada'} con éxito.`, 'success');
                    modal.classList.remove('show');
                    if (preguntaExistente && preguntaActiva && preguntaActiva.id === preguntaExistente.id) {
                        preguntaActiva.texto = texto;
                        mostrarPreguntaEnContenedorPrincipal(preguntaActiva); // Re-render pregunta actual
                    } else if (!preguntaExistente) {
                        cargarPreguntaMasReciente(); // Cargar la nueva pregunta como activa
                    }
                }).catch(err => mostrarNotificacion(`Error: ${err.message}`, 'error'));
            });
        }
        
        modal.querySelector('.modal-title').textContent = preguntaExistente ? 'Editar Pregunta' : 'Nueva Pregunta';
        modal.querySelector('.btn-guardar').textContent = preguntaExistente ? 'Guardar Cambios' : 'Crear Pregunta';
        modal.querySelector('#modal-pregunta-texto').value = preguntaExistente ? preguntaExistente.texto : '';
        modal.classList.add('show');
    }

    function mostrarModalFormularioRespuesta(preguntaIdParaNueva, respuestaExistente = null) {
        const modalId = 'modal-formulario-respuesta';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = crearModalBase(modalId, respuestaExistente ? 'Editar Respuesta' : 'Nueva Respuesta', `
                <div class="form-group">
                    <label for="modal-respuesta-texto" class="form-label">Tu respuesta:</label>
                    <textarea id="modal-respuesta-texto" class="form-control" placeholder="Escribe aquí tu respuesta..." required></textarea>
                </div>
            `);
            document.body.appendChild(modal);
            configurarListenersModalBase(modal, '#form-respuesta', (form) => {
                const texto = form.querySelector('#modal-respuesta-texto').value.trim();
                if (!texto) { mostrarNotificacion('La respuesta no puede estar vacía.', 'error'); return; }
                const usuario = firebase.auth().currentUser;
                if (!usuario) { mostrarNotificacion('Debes iniciar sesión.', 'error'); return; }

                const datosRespuesta = {
                    texto: texto,
                    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                let promesa;
                if (respuestaExistente) {
                    promesa = db.collection('respuestas').doc(respuestaExistente.id).update(datosRespuesta);
                } else { // Nueva respuesta (esto es si se quiere modal para nueva respuesta en vez del form en página)
                    datosRespuesta.preguntaId = preguntaIdParaNueva;
                    datosRespuesta.usuarioId = usuario.uid;
                    datosRespuesta.nombreUsuario = usuario.displayName || usuario.email.split('@')[0];
                    datosRespuesta.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
                    datosRespuesta.reacciones = { '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0 };
                    datosRespuesta.usuariosReacciones = {};
                    promesa = db.collection('respuestas').add(datosRespuesta);
                }

                promesa.then(() => {
                    mostrarNotificacion(`Respuesta ${respuestaExistente ? 'actualizada' : 'enviada'} con éxito.`, 'success');
                    modal.classList.remove('show');
                    // onSnapshot debería actualizar el DOM para respuestas
                }).catch(err => mostrarNotificacion(`Error: ${err.message}`, 'error'));
            });
        }
        
        modal.querySelector('.modal-title').textContent = respuestaExistente ? 'Editar Respuesta' : 'Nueva Respuesta';
        modal.querySelector('.btn-guardar').textContent = respuestaExistente ? 'Guardar Cambios' : 'Enviar Respuesta';
        modal.querySelector('#modal-respuesta-texto').value = respuestaExistente ? respuestaExistente.texto : '';
        modal.classList.add('show');
    }
    
    function crearModalBase(id, titulo, bodyHtml) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${titulo}</h2>
                    <button class="close-modal" title="Cerrar">×</button>
                </div>
                <form id="${id.replace('modal-', 'form-')}" class="modal-body">
                    ${bodyHtml}
                    <div class="modal-footer">
                        <button type="button" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-guardar">Guardar</button>
                    </div>
                </form>
            </div>`;
        return modal;
    }

    function configurarListenersModalBase(modalElement, formSelector, onSubmitCallback) {
        modalElement.querySelector('.close-modal').addEventListener('click', () => modalElement.classList.remove('show'));
        modalElement.querySelector('.btn-cancelar').addEventListener('click', () => modalElement.classList.remove('show'));
        modalElement.addEventListener('click', (e) => { if (e.target === modalElement) modalElement.classList.remove('show'); });
        modalElement.querySelector(formSelector).addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmitCallback(e.target);
        });
    }

    function confirmarEliminacion(tipo, id, nombreItem = "este elemento") {
        const modalId = 'modal-confirmar-eliminacion';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = crearModalBase(modalId, 'Confirmar Eliminación', `<p>¿Estás seguro de que deseas eliminar ${nombreItem}? Esta acción no se puede deshacer.</p>`);
            // Cambiar el botón de guardar por uno de eliminar específico
            const footer = modal.querySelector('.modal-footer');
            footer.innerHTML = `
                <button type="button" class="btn-cancelar">Cancelar</button>
                <button type="button" id="btn-confirmar-eliminar" class="btn-eliminar-confirmado">Eliminar</button>
            `; // btn-eliminar-confirmado necesita CSS
            document.body.appendChild(modal);
            configurarListenersModalBase(modal, 'form', () => {}); // El form no se usa para submit aquí
        }
        
        modal.querySelector('.modal-title').textContent = 'Confirmar Eliminación';
        modal.querySelector('.modal-body p').innerHTML = `¿Estás seguro de que deseas eliminar <strong>${nombreItem}</strong>? Esta acción no se puede deshacer.`;
        
        const btnConfirmar = modal.querySelector('#btn-confirmar-eliminar');
        const newBtnConfirmar = btnConfirmar.cloneNode(true); // Remover listeners antiguos
        btnConfirmar.parentNode.replaceChild(newBtnConfirmar, btnConfirmar);

        newBtnConfirmar.addEventListener('click', () => {
            const coleccion = tipo === 'pregunta' ? 'preguntas' : 'respuestas';
            db.collection(coleccion).doc(id).delete()
                .then(() => {
                    mostrarNotificacion(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminada con éxito.`, 'success');
                    modal.classList.remove('show');
                    if (tipo === 'pregunta') {
                        if (preguntaActiva && preguntaActiva.id === id) {
                            cargarPreguntaMasReciente(); 
                        }
                        document.querySelector(`.preguntas-anteriores .pregunta-card[data-id="${id}"]`)?.remove();
                    }
                    // Para respuestas, onSnapshot actualizará el DOM.
                })
                .catch(err => mostrarNotificacion(`Error al eliminar: ${err.message}`, 'error'));
        });
        modal.classList.add('show');
    }

    function configurarBotonCargarMasPreguntasAnteriores() {
        let cargarMasBtn = document.getElementById('btn-cargar-mas-preguntas');
        const container = document.querySelector('.preguntas-container');

        if (!container) return; // Necesitamos el contenedor para insertar el botón

        if (!cargarMasBtn) {
            cargarMasBtn = document.createElement('button');
            cargarMasBtn.id = 'btn-cargar-mas-preguntas';
            cargarMasBtn.className = 'btn-cargar-mas'; 
            cargarMasBtn.innerHTML = '<i class="fas fa-history"></i> Ver preguntas anteriores';
            
            // Insertar el botón después del contenedor de respuestas, o al final del .preguntas-container
            if (respuestasContainer && respuestasContainer.nextSibling) {
                 container.insertBefore(cargarMasBtn, respuestasContainer.nextSibling);
            } else if (preguntaActualContainer && preguntaActualContainer.nextSibling) {
                container.insertBefore(cargarMasBtn, preguntaActualContainer.nextSibling);
            } else {
                container.appendChild(cargarMasBtn);
            }
        }
        cargarMasBtn.style.display = 'block'; // Asegurar que sea visible si se recrea
        cargarMasBtn.removeEventListener('click', cargarLotePreguntasAnteriores); // Evitar duplicados
        cargarMasBtn.addEventListener('click', cargarLotePreguntasAnteriores);
    }
    
    async function cargarLotePreguntasAnteriores() {
        const preguntasAnterioresContainerId = 'preguntas-anteriores-lista';
        let contenedorAnteriores = document.getElementById(preguntasAnterioresContainerId);
        
        if (!contenedorAnteriores) {
            contenedorAnteriores = document.createElement('div');
            contenedorAnteriores.id = preguntasAnterioresContainerId;
            contenedorAnteriores.className = 'preguntas-anteriores';
            contenedorAnteriores.innerHTML = '<h2>Preguntas Anteriores</h2>'; // Título para la sección
            
            const cargarMasBtn = document.getElementById('btn-cargar-mas-preguntas');
            if (cargarMasBtn && cargarMasBtn.parentNode) {
                cargarMasBtn.parentNode.insertBefore(contenedorAnteriores, cargarMasBtn.nextSibling);
            } else if (respuestasContainer && respuestasContainer.parentNode) {
                respuestasContainer.parentNode.appendChild(contenedorAnteriores);
            }
        }

        let query = db.collection('preguntas').orderBy('fechaCreacion', 'desc');
        
        if (ultimaPreguntaAnteriorVisibleDoc) {
            query = query.startAfter(ultimaPreguntaAnteriorVisibleDoc);
        } else if (preguntaActiva) { 
            // Si es la primera vez que se cargan anteriores, queremos las que son más antiguas que la activa
            const preguntaActivaDoc = await db.collection('preguntas').doc(preguntaActiva.id).get();
            if (preguntaActivaDoc.exists) {
                query = query.startAfter(preguntaActivaDoc);
            }
        }
        
        query.limit(5).get().then(snapshot => {
            if (snapshot.empty) {
                mostrarNotificacion('No hay más preguntas anteriores.', 'info');
                document.getElementById('btn-cargar-mas-preguntas')?.style.setProperty('display', 'none', 'important');
                return;
            }
            snapshot.docs.forEach(doc => {
                const pregunta = { id: doc.id, ...doc.data() };
                // Evitar duplicar la pregunta activa si por alguna razón la query la trae
                if (preguntaActiva && pregunta.id === preguntaActiva.id) return;

                const preguntaCardHTML = `
                    <div class="pregunta-card" data-id="${pregunta.id}"> <!-- Reutilizar .pregunta-card -->
                        <h3 class="pregunta-texto-anterior">${pregunta.texto}</h3>
                        <p class="pregunta-fecha-anterior">Por ${pregunta.nombreUsuario || 'Anónimo'} - ${formatearFecha(pregunta.fechaCreacion)}</p>
                        <button class="btn-ver-pregunta-completa" data-id="${pregunta.id}">
                            <i class="fas fa-eye"></i> Ver esta pregunta y sus respuestas
                        </button>
                    </div>`;
                contenedorAnteriores.insertAdjacentHTML('beforeend', preguntaCardHTML);
                contenedorAnteriores.querySelector(`.btn-ver-pregunta-completa[data-id="${pregunta.id}"]`)
                    .addEventListener('click', () => cargarPreguntaEspecificaComoPrincipal(pregunta.id));
            });
            if (snapshot.docs.length > 0) {
                ultimaPreguntaAnteriorVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            }
            if (snapshot.docs.length < 5) { // Si se cargaron menos del límite, no hay más
                document.getElementById('btn-cargar-mas-preguntas')?.style.setProperty('display', 'none', 'important');
            }
        }).catch(error => {
            console.error("Error al cargar preguntas anteriores: ", error);
            mostrarNotificacion("Error al cargar preguntas anteriores.", "error");
        });
    }

    function cargarPreguntaEspecificaComoPrincipal(preguntaId) {
        db.collection('preguntas').doc(preguntaId).get()
            .then((doc) => {
                if (!doc.exists) {
                    mostrarNotificacion('La pregunta seleccionada ya no existe.', 'error');
                    // Podrías removerla de la lista de anteriores si aún está ahí
                    document.querySelector(`.preguntas-anteriores .pregunta-card[data-id="${preguntaId}"]`)?.remove();
                    return;
                }
                preguntaActiva = { id: doc.id, ...doc.data() };
                mostrarPreguntaEnContenedorPrincipal(preguntaActiva);
                cargarYMostrarRespuestas(preguntaActiva.id);
                window.scrollTo({ top: preguntaActualContainer.offsetTop - 20 || 0, behavior: 'smooth' }); 
                
                // Opcional: limpiar o colapsar lista de preguntas anteriores para dar foco
                const contenedorAnteriores = document.getElementById('preguntas-anteriores-lista');
                if (contenedorAnteriores) contenedorAnteriores.innerHTML = '<h2>Preguntas Anteriores</h2>'; // Limpiar, pero dejar título
                ultimaPreguntaAnteriorVisibleDoc = null; // Resetear paginación de anteriores
                
                // Volver a mostrar el botón de cargar anteriores si no está ya
                const btnCargarMas = document.getElementById('btn-cargar-mas-preguntas');
                if (btnCargarMas) btnCargarMas.style.display = 'block';
                else configurarBotonCargarMasPreguntasAnteriores();


            })
            .catch((error) => {
                console.error('Error al cargar pregunta específica:', error);
                mostrarNotificacion('Error al cargar la pregunta.', 'error');
            });
    }

    function mostrarNotificacion(mensaje, tipo = 'info') { // tipo puede ser 'success', 'error', 'info'
        document.querySelector('.notification')?.remove(); // Remover notificaciones previas

        const notificacion = document.createElement('div');
        notificacion.className = `notification ${tipo}`;
        notificacion.innerHTML = mensaje; // Usar innerHTML por si quieres pasar iconos <i>
        document.body.appendChild(notificacion);

        setTimeout(() => notificacion.classList.add('show'), 10); 
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => notificacion.remove(), 500); 
        }, 3000 + (tipo === 'error' ? 1000 : 0)); // Errores duran un poco más
    }
});
