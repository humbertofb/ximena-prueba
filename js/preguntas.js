// preguntas.js

document.addEventListener('DOMContentLoaded', function() {
    // Referencia a la base de datos
    const db = firebase.firestore();
    
    // Elementos DOM
    const preguntaActualContainer = document.getElementById('pregunta-actual');
    const respuestasContainer = document.getElementById('respuestas-container');
    const nuevaPreguntaBtn = document.getElementById('nueva-pregunta-btn');
    
    // Variables globales
    let preguntaActiva = null;
    let respuestasTotales = 0;
    let respuestasMostradas = 0;
    const respuestasPorPagina = 3; // Número de respuestas a mostrar por página en móviles
    const esMobil = window.innerWidth <= 768;
    
    // Añadir botón "Volver arriba"
    crearBotonVolverArriba();
    
    // Comprobamos la autenticación del usuario
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Si el usuario está autenticado, cargamos las preguntas
            cargarPreguntaDelDia();
            
            // Configuramos el listener para el botón de nueva pregunta
            if (nuevaPreguntaBtn) {
                nuevaPreguntaBtn.addEventListener('click', mostrarModalNuevaPregunta);
            }
        }
    });
    
    // Función para crear el botón de volver arriba
    function crearBotonVolverArriba() {
        const botonVolver = document.createElement('button');
        botonVolver.id = 'boton-volver-arriba';
        botonVolver.className = 'boton-volver-arriba';
        botonVolver.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(botonVolver);
        
        // Mostrar u ocultar el botón según el scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                botonVolver.classList.add('mostrar');
            } else {
                botonVolver.classList.remove('mostrar');
            }
        });
        
        // Configurar evento click para volver arriba
        botonVolver.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Función para cargar la pregunta del día
    function cargarPreguntaDelDia() {
    db.collection('preguntas')
        .orderBy('fechaCreacion', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                mostrarMensajeNoHayPreguntas();
                return;
            }

            preguntaActualContainer.innerHTML = ''; // Limpiar contenedor

            querySnapshot.forEach((doc) => {
                const pregunta = {
                    id: doc.id,
                    ...doc.data()
                };

                // Mostrar pregunta
                mostrarPregunta(pregunta);

                // Cargar respuestas de esta pregunta
                cargarRespuestas(pregunta.id);

                // Configurar listener en tiempo real por cada pregunta
                configurarListenerRespuestas(pregunta.id);
            });
        })
        .catch((error) => {
            console.error('Error al cargar preguntas:', error);
            mostrarMensajeNoHayPreguntas();
        });
}

    
    // Función para mostrar un mensaje cuando no hay preguntas
    function mostrarMensajeNoHayPreguntas() {
        if (preguntaActualContainer) {
            preguntaActualContainer.innerHTML = `
                <div class="pregunta-card">
                    <div class="pregunta-header">
                        <div class="pregunta-texto">No hay preguntas disponibles</div>
                    </div>
                    <p>¡Sé el primero en crear una pregunta!</p>
                </div>
            `;
        }
    }
    
    // Función para mostrar la pregunta actual
    function mostrarPregunta(pregunta) {
        if (!preguntaActualContainer) return;
        
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && pregunta.usuarioId === usuario.uid;
        
        preguntaActualContainer.innerHTML = `
            <div class="pregunta-card" data-id="${pregunta.id}">
                <div class="pregunta-header">
                    <div class="pregunta-texto">${pregunta.texto}</div>
                    ${esCreador ? `
                        <div class="pregunta-admin">
                            <button class="btn-editar-pregunta" title="Editar pregunta">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-eliminar-pregunta" title="Eliminar pregunta">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <p>${formatearFecha(pregunta.fechaCreacion)}</p>
                
                <!-- Sección para añadir una nueva respuesta -->
                <div class="nueva-respuesta">
                    <h3>Tu respuesta</h3>
                    <textarea id="nueva-respuesta-texto" class="respuesta-input" 
                        placeholder="Escribe tu respuesta aquí..."></textarea>
                    <button id="guardar-respuesta" class="btn-guardar-respuesta">
                        <i class="fas fa-paper-plane"></i> Enviar respuesta
                    </button>
                </div>
            </div>
        `;
        
        // Configurar listeners para los botones de editar y eliminar
        if (esCreador) {
            const btnEditar = preguntaActualContainer.querySelector('.btn-editar-pregunta');
            if (btnEditar) {
                btnEditar.addEventListener('click', () => {
                    mostrarModalEditarPregunta(pregunta);
                });
            }
            
            const btnEliminar = preguntaActualContainer.querySelector('.btn-eliminar-pregunta');
            if (btnEliminar) {
                btnEliminar.addEventListener('click', () => {
                    confirmarEliminarPregunta(pregunta.id);
                });
            }
        }
        
        // Configurar listener para guardar respuesta
        const btnGuardarRespuesta = preguntaActualContainer.querySelector('#guardar-respuesta');
        if (btnGuardarRespuesta) {
            btnGuardarRespuesta.addEventListener('click', () => {
                guardarRespuesta(pregunta.id);
            });
        }
    }
    
    // Función para cargar las respuestas de una pregunta
    function cargarRespuestas(preguntaId) {
        if (!respuestasContainer) return;
        
        respuestasContainer.innerHTML = '<h2>Respuestas</h2>';
        
        // Añadir contenedor para las respuestas
        respuestasContainer.innerHTML += '<div id="respuestas-lista" class="respuestas-lista"></div>';
        const respuestasLista = document.getElementById('respuestas-lista');
        
        // Reiniciar contadores
        respuestasTotales = 0;
        respuestasMostradas = 0;
        
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc')
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    respuestasLista.innerHTML = '<p>Aún no hay respuestas. ¡Sé el primero en responder!</p>';
                    return;
                }
                
                respuestasTotales = querySnapshot.size;
                
                // Determinar cuántas respuestas mostrar inicialmente
                const limiteMostrar = esMobil ? respuestasPorPagina : respuestasTotales;
                
                querySnapshot.forEach((doc, index) => {
                    const respuesta = {
                        id: doc.id,
                        ...doc.data()
                    };
                    
                    if (index < limiteMostrar) {
                        mostrarRespuesta(respuesta);
                        respuestasMostradas++;
                    }
                });
                
                // Añadir botón "Ver más" si es necesario
                if (esMobil && respuestasTotales > respuestasPorPagina) {
                    mostrarBotonVerMas();
                }
            })
            .catch((error) => {
                console.error('Error al cargar respuestas:', error);
            });
    }
    
    // Función para mostrar el botón "Ver más"
    function mostrarBotonVerMas() {
        // Si ya existe el botón, lo removemos para volver a crearlo
        const botonExistente = document.getElementById('boton-ver-mas');
        if (botonExistente) {
            botonExistente.remove();
        }
        
        const botonVerMas = document.createElement('button');
        botonVerMas.id = 'boton-ver-mas';
        botonVerMas.className = 'boton-ver-mas';
        botonVerMas.textContent = `Ver más respuestas (${respuestasMostradas}/${respuestasTotales})`;
        
        respuestasContainer.appendChild(botonVerMas);
        
        botonVerMas.addEventListener('click', cargarMasRespuestas);
    }
    
    // Función para cargar más respuestas
    function cargarMasRespuestas() {
        if (!preguntaActiva) return;
        
        const respuestasAMostrar = Math.min(respuestasPorPagina, respuestasTotales - respuestasMostradas);
        
        if (respuestasAMostrar <= 0) return;
        
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaActiva.id)
            .orderBy('fechaCreacion', 'desc')
            .get()
            .then((querySnapshot) => {
                const todasLasRespuestas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Mostrar el siguiente lote de respuestas
                for (let i = respuestasMostradas; i < respuestasMostradas + respuestasAMostrar && i < respuestasTotales; i++) {
                    mostrarRespuesta(todasLasRespuestas[i]);
                }
                
                respuestasMostradas += respuestasAMostrar;
                
                // Actualizar o eliminar el botón "Ver más"
                if (respuestasMostradas >= respuestasTotales) {
                    const botonVerMas = document.getElementById('boton-ver-mas');
                    if (botonVerMas) {
                        botonVerMas.remove();
                    }
                } else {
                    // Actualizar el contador del botón
                    const botonVerMas = document.getElementById('boton-ver-mas');
                    if (botonVerMas) {
                        botonVerMas.textContent = `Ver más respuestas (${respuestasMostradas}/${respuestasTotales})`;
                    }
                }
            });
    }
    
    // Configurar un listener en tiempo real para las respuestas
    function configurarListenerRespuestas(preguntaId) {
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc')
            .onSnapshot((snapshot) => {
                let cambioRealizado = false;
                
                snapshot.docChanges().forEach((change) => {
                    const respuesta = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    
                    if (change.type === 'added') {
                        // Solo mostramos automáticamente si es la primera carga o si estamos mostrando todas las respuestas
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (!existingElement && (!esMobil || respuestasMostradas < respuestasPorPagina)) {
                            mostrarRespuesta(respuesta);
                            respuestasMostradas++;
                            cambioRealizado = true;
                        }
                    } else if (change.type === 'modified') {
                        // Si es una respuesta modificada, actualizamos el DOM
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (existingElement) {
                            existingElement.outerHTML = crearHtmlRespuesta(respuesta);
                            configurarListenersRespuestaItem(respuesta);
                            cambioRealizado = true;
                        }
                    } else if (change.type === 'removed') {
                        // Si es una respuesta eliminada, la quitamos del DOM
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (existingElement) {
                            existingElement.remove();
                            respuestasMostradas--;
                            cambioRealizado = true;
                        }
                    }
                });
                
                // Actualizamos el contador de respuestas totales
                if (cambioRealizado) {
                    db.collection('respuestas')
                        .where('preguntaId', '==', preguntaId)
                        .get()
                        .then((querySnapshot) => {
                            respuestasTotales = querySnapshot.size;
                            
                            // Actualizar el botón Ver más si existe
                            const botonVerMas = document.getElementById('boton-ver-mas');
                            if (botonVerMas) {
                                if (respuestasMostradas >= respuestasTotales) {
                                    botonVerMas.remove();
                                } else {
                                    botonVerMas.textContent = `Ver más respuestas (${respuestasMostradas}/${respuestasTotales})`;
                                }
                            } else if (esMobil && respuestasTotales > respuestasMostradas) {
                                mostrarBotonVerMas();
                            }
                        });
                }
            });
    }
    
    // Función para mostrar una respuesta
    function mostrarRespuesta(respuesta) {
        if (!respuestasContainer) return;
        
        const respuestaHTML = crearHtmlRespuesta(respuesta);
        const respuestasLista = document.getElementById('respuestas-lista');
        
        if (!respuestasLista) return;
        
        // Verificamos si el elemento ya existe
        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
        if (existingElement) {
            existingElement.outerHTML = respuestaHTML;
        } else {
            // Si no existe, lo añadimos a la lista de respuestas
            respuestasLista.insertAdjacentHTML('beforeend', respuestaHTML);
        }
        
        configurarListenersRespuestaItem(respuesta);
    }
    
    // Crear HTML para una respuesta
    function crearHtmlRespuesta(respuesta) {
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;
        
        // Obtener reacciones actuales o inicializar si no existen
        const reacciones = respuesta.reacciones || {
            '💛': 0,    // Corazón amarillo
            '🖤': 0,    // Corazón negro
            '🙈': 0,    // Mono tapándose los ojos
            '🥹': 0,    // Cara con lágrima
            '😂': 0     // Risa
        };
        
        // Obtener las reacciones del usuario actual
        const misReacciones = (usuario && respuesta.usuariosReacciones && respuesta.usuariosReacciones[usuario.uid]) || {};
        
        return `
            <div class="respuesta-item" data-id="${respuesta.id}">
                <div class="respuesta-header">
                    <div class="respuesta-autor">${respuesta.nombreUsuario || 'Usuario'}</div>
                    <div class="respuesta-fecha">${formatearFecha(respuesta.fechaCreacion)}</div>
                </div>
                <div class="respuesta-contenido">${respuesta.texto}</div>
                <div class="respuesta-acciones">
                    <div class="reacciones">
                        <div class="reacciones-botones">
                            <button class="btn-reaccion ${misReacciones['💛'] ? 'active' : ''}" data-emoji="💛">
                                💛 <span class="reaccion-count">${reacciones['💛'] || 0}</span>
                            </button>
                            <button class="btn-reaccion ${misReacciones['🖤'] ? 'active' : ''}" data-emoji="🖤">
                                🖤 <span class="reaccion-count">${reacciones['🖤'] || 0}</span>
                            </button>
                            <button class="btn-reaccion ${misReacciones['🙈'] ? 'active' : ''}" data-emoji="🙈">
                                🙈 <span class="reaccion-count">${reacciones['🙈'] || 0}</span>
                            </button>
                            <button class="btn-reaccion ${misReacciones['🥹'] ? 'active' : ''}" data-emoji="🥹">
                                🥹 <span class="reaccion-count">${reacciones['🥹'] || 0}</span>
                            </button>
                            <button class="btn-reaccion ${misReacciones['😂'] ? 'active' : ''}" data-emoji="😂">
                                😂 <span class="reaccion-count">${reacciones['😂'] || 0}</span>
                            </button>
                        </div>
                    </div>
                    ${esCreador ? `
                        <div class="respuesta-admin">
                            <button class="btn-editar-respuesta" title="Editar respuesta">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-eliminar-respuesta" title="Eliminar respuesta">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Configurar listeners para una respuesta individual
    function configurarListenersRespuestaItem(respuesta) {
        const respuestaElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
        if (!respuestaElement) return;
        
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;
        
        // Configurar listeners para botones de reacción
        const botonesReaccion = respuestaElement.querySelectorAll('.btn-reaccion');
        botonesReaccion.forEach(boton => {
            boton.addEventListener('click', () => {
                if (!usuario) {
                    mostrarNotificacion('Debes iniciar sesión para reaccionar', 'error');
                    return;
                }
                
                const emoji = boton.getAttribute('data-emoji');
                toggleReaccion(respuesta.id, emoji);
            });
        });
        
        if (esCreador) {
            const btnEditar = respuestaElement.querySelector('.btn-editar-respuesta');
            if (btnEditar) {
                btnEditar.addEventListener('click', () => {
                    mostrarModalEditarRespuesta(respuesta);
                });
            }
            
            const btnEliminar = respuestaElement.querySelector('.btn-eliminar-respuesta');
            if (btnEliminar) {
                btnEliminar.addEventListener('click', () => {
                    confirmarEliminarRespuesta(respuesta.id);
                });
            }
        }
    }
    
    // Función para alternar una reacción (añadir o quitar)
    function toggleReaccion(respuestaId, emoji) {
        const usuario = firebase.auth().currentUser;
        if (!usuario) return;
        
        const respuestaRef = db.collection('respuestas').doc(respuestaId);
        
        // Primero obtenemos el documento para ver el estado actual
        respuestaRef.get().then(doc => {
            if (!doc.exists) {
                console.error('No existe esta respuesta');
                return;
            }
            
            const respuesta = doc.data();
            
            // Inicializar objetos si no existen
            const reacciones = respuesta.reacciones || {
                '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0
            };
            
            const usuariosReacciones = respuesta.usuariosReacciones || {};
            const misReacciones = usuariosReacciones[usuario.uid] || {};
            
            // Comprobar si ya había reaccionado con este emoji
            const yaHabiaReaccionado = misReacciones[emoji];
            
            // Actualizar el contador de reacciones
            if (yaHabiaReaccionado) {
                reacciones[emoji] = Math.max(0, (reacciones[emoji] || 0) - 1);
                delete misReacciones[emoji];
            } else {
                reacciones[emoji] = (reacciones[emoji] || 0) + 1;
                misReacciones[emoji] = true;
            }
            
            // Actualizar objeto de usuarios que han reaccionado
            usuariosReacciones[usuario.uid] = misReacciones;
            
            // Guardar los cambios en Firestore
            return respuestaRef.update({
                reacciones: reacciones,
                usuariosReacciones: usuariosReacciones
            });
        })
        .catch(error => {
            console.error('Error al actualizar reacción:', error);
            mostrarNotificacion('Error al actualizar reacción', 'error');
        });
    }
    
    // Función para guardar una respuesta
    function guardarRespuesta(preguntaId) {
        const textoRespuesta = document.getElementById('nueva-respuesta-texto');
        
        if (!textoRespuesta || !textoRespuesta.value.trim()) {
            mostrarNotificacion('Por favor, escribe una respuesta', 'error');
            return;
        }
        
        const usuario = firebase.auth().currentUser;
        if (!usuario) {
            mostrarNotificacion('Debes iniciar sesión para responder', 'error');
            return;
        }
        
        const nuevaRespuesta = {
            preguntaId: preguntaId,
            texto: textoRespuesta.value.trim(),
            usuarioId: usuario.uid,
            nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            reacciones: {
                '💛': 0, '🖤': 0, '🙈': 0, '🥹': 0, '😂': 0
            },
            usuariosReacciones: {}
        };
        
        db.collection('respuestas').add(nuevaRespuesta)
            .then(() => {
                textoRespuesta.value = '';
                mostrarNotificacion('Respuesta guardada correctamente', 'success');
            })
            .catch((error) => {
                console.error('Error al guardar respuesta:', error);
                mostrarNotificacion('Error al guardar la respuesta', 'error');
            });
    }
    
    // Función para mostrar el modal de nueva pregunta
    function mostrarModalNuevaPregunta() {
        // Crear el modal si no existe
        if (!document.getElementById('pregunta-modal')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="pregunta-modal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Nueva Pregunta</h2>
                        <form id="pregunta-form">
                            <div class="form-group">
                                <label for="pregunta-texto">Texto de la pregunta</label>
                                <textarea id="pregunta-texto" placeholder="Escribe aquí tu pregunta..." required></textarea>
                            </div>
                            <button type="submit" class="btn-modal-guardar">Guardar pregunta</button>
                        </form>
                    </div>
                </div>
            `);
            
            // Configurar evento para cerrar el modal
            const modal = document.getElementById('pregunta-modal');
            const closeBtn = modal.querySelector('.close');
            
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
            
            // Configurar evento para guardar la pregunta
            const preguntaForm = document.getElementById('pregunta-form');
            preguntaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const textoElement = document.getElementById('pregunta-texto');
                const texto = textoElement.value.trim();
                
                if (!texto) {
                    mostrarNotificacion('Por favor, escribe una pregunta', 'error');
                    return;
                }
                
                const usuario = firebase.auth().currentUser;
                if (!usuario) {
                    mostrarNotificacion('Debes iniciar sesión para crear preguntas', 'error');
                    return;
                }
                
                const nuevaPregunta = {
                    texto: texto,
                    usuarioId: usuario.uid,
                    nombreUsuario: usuario.displayName || usuario.email.split('@')[0],
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                db.collection('preguntas').add(nuevaPregunta)
                    .then(() => {
                        modal.classList.remove('show');
                        textoElement.value = '';
                        mostrarNotificacion('Pregunta guardada correctamente', 'success');
                        
                        // Recargar la pregunta del día
                        cargarPreguntaDelDia();
                    })
                    .catch((error) => {
                        console.error('Error al guardar pregunta:', error);
                        mostrarNotificacion('Error al guardar la pregunta', 'error');
                    });
            });
        }
        
        // Mostrar el modal
        const modal = document.getElementById('pregunta-modal');
        modal.classList.add('show');
    }
    
    // Función para mostrar el modal de editar pregunta
    function mostrarModalEditarPregunta(pregunta) {
        // Crear el modal si no existe
        if (!document.getElementById('editar-pregunta-modal')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="editar-pregunta-modal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Editar Pregunta</h2>
                        <form id="editar-pregunta-form">
                            <input type="hidden" id="editar-pregunta-id">
                            <div class="form-group">
                                <label for="editar-pregunta-texto">Texto de la pregunta</label>
                                <textarea id="editar-pregunta-texto" placeholder="Escribe aquí tu pregunta..." required></textarea>
                            </div>
                            <button type="submit" class="btn-modal-guardar">Guardar cambios</button>
                        </form>
                    </div>
                </div>
            `);
            
            // Configurar evento para cerrar el modal
            const modal = document.getElementById('editar-pregunta-modal');
            const closeBtn = modal.querySelector('.close');
            
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
            
            // Configurar evento para guardar la pregunta
            const editarPreguntaForm = document.getElementById('editar-pregunta-form');
            editarPreguntaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const idElement = document.getElementById('editar-pregunta-id');
                const textoElement = document.getElementById('editar-pregunta-texto');
                
                const id = idElement.value;
                const texto = textoElement.value.trim();
                
                if (!texto) {
                    mostrarNotificacion('Por favor, escribe una pregunta', 'error');
                    return;
                }
                
                db.collection('preguntas').doc(id).update({
                    texto: texto,
                    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    modal.classList.remove('show');
                    mostrarNotificacion('Pregunta actualizada correctamente', 'success');
                    
                    // Actualizar la pregunta en el DOM
                    if (preguntaActiva && preguntaActiva.id === id) {
                        preguntaActiva.texto = texto;
                        mostrarPregunta(preguntaActiva);
                    }
                })
                .catch((error) => {
                    console.error('Error al actualizar pregunta:', error);
                    mostrarNotificacion('Error al actualizar la pregunta', 'error');
                });
            });
        }

    // Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Eliminar notificaciones existentes
    const notificacionesExistentes = document.querySelectorAll('.notification');
    notificacionesExistentes.forEach(notif => notif.remove());
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    // Añadir al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// Función para cargar más preguntas (paginación)
function cargarMasPreguntas() {
    const ultimaPregunta = document.querySelector('.pregunta-card:last-child');
    if (!ultimaPregunta) return;
    
    const ultimaPreguntaId = ultimaPregunta.getAttribute('data-id');
    
    db.collection('preguntas')
        .orderBy('fechaCreacion', 'desc')
        .startAfter(preguntaActiva.fechaCreacion)
        .limit(5)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                mostrarNotificacion('No hay más preguntas para cargar', 'info');
                return;
            }
            
            const preguntasContainer = document.createElement('div');
            preguntasContainer.className = 'preguntas-anteriores';
            
            querySnapshot.forEach((doc) => {
                const pregunta = {
                    id: doc.id,
                    ...doc.data()
                };
                
                const preguntaCard = document.createElement('div');
                preguntaCard.className = 'pregunta-card';
                preguntaCard.setAttribute('data-id', pregunta.id);
                
                preguntaCard.innerHTML = `
                    <div class="pregunta-header">
                        <div class="pregunta-texto">${pregunta.texto}</div>
                    </div>
                    <p>${formatearFecha(pregunta.fechaCreacion)}</p>
                    <button class="btn-ver-pregunta" data-id="${pregunta.id}">Ver respuestas</button>
                `;
                
                preguntasContainer.appendChild(preguntaCard);
            });
            
            // Insertar después de la pregunta actual
            document.querySelector('.pregunta-actual').after(preguntasContainer);
            
            // Configurar eventos para los botones de ver pregunta
            document.querySelectorAll('.btn-ver-pregunta').forEach(btn => {
                btn.addEventListener('click', () => {
                    const preguntaId = btn.getAttribute('data-id');
                    cargarPreguntaEspecifica(preguntaId);
                });
            });
        })
        .catch((error) => {
            console.error('Error al cargar más preguntas:', error);
            mostrarNotificacion('Error al cargar más preguntas', 'error');
        });
}

// Función para cargar una pregunta específica
function cargarPreguntaEspecifica(preguntaId) {
    db.collection('preguntas').doc(preguntaId).get()
        .then((doc) => {
            if (!doc.exists) {
                mostrarNotificacion('La pregunta no existe', 'error');
                return;
            }
            
            preguntaActiva = {
                id: doc.id,
                ...doc.data()
            };
            
            mostrarPregunta(preguntaActiva);
            cargarRespuestas(preguntaActiva.id);
            
            // Desplazar la pantalla hacia arriba
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        })
        .catch((error) => {
            console.error('Error al cargar pregunta específica:', error);
            mostrarNotificacion('Error al cargar la pregunta', 'error');
        });
}

// Función para limitar el número de respuestas en móvil
function limitarRespuestasMobile() {
    // Detectar si es un dispositivo móvil
    const esMobile = window.innerWidth < 768;
    
    if (esMobile) {
        const respuestas = document.querySelectorAll('.respuesta-item');
        
        // Si hay más de 3 respuestas, ocultar el resto
        if (respuestas.length > 3) {
            let contadorRespuestas = 0;
            respuestas.forEach(respuesta => {
                contadorRespuestas++;
                if (contadorRespuestas > 3) {
                    respuesta.classList.add('hidden');
                }
            });
            
            // Agregar botón "Ver más respuestas"
            if (!document.querySelector('.btn-ver-mas')) {
                const verMasBtn = document.createElement('button');
                verMasBtn.className = 'btn-ver-mas';
                verMasBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más respuestas';
                verMasBtn.addEventListener('click', mostrarMasRespuestas);
                
                respuestasContainer.appendChild(verMasBtn);
            }
        }
    }
}

// Función para mostrar más respuestas
function mostrarMasRespuestas() {
    const respuestasOcultas = document.querySelectorAll('.respuesta-item.hidden');
    
    // Mostrar las siguientes 3 respuestas
    let contador = 0;
    respuestasOcultas.forEach(respuesta => {
        if (contador < 3) {
            respuesta.classList.remove('hidden');
            contador++;
        }
    });
    
    // Si ya no hay más respuestas ocultas, quitar el botón
    if (document.querySelectorAll('.respuesta-item.hidden').length === 0) {
        const verMasBtn = document.querySelector('.btn-ver-mas');
        if (verMasBtn) {
            verMasBtn.remove();
        }
    }
}

// Función para añadir el botón de volver arriba
function agregarBotonVolverArriba() {
    // Crear botón si no existe
    if (!document.querySelector('.btn-volver-arriba')) {
        const botonVolver = document.createElement('button');
        botonVolver.className = 'btn-volver-arriba';
        botonVolver.innerHTML = '<i class="fas fa-arrow-up"></i>';
        botonVolver.title = 'Volver arriba';
        
        // Añadir al DOM
        document.body.appendChild(botonVolver);
        
        // Añadir evento
        botonVolver.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Mostrar/ocultar dependiendo del scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                botonVolver.classList.add('visible');
            } else {
                botonVolver.classList.remove('visible');
            }
        });
    }
}

// Función principal para inicializar todas las funcionalidades
function inicializarFuncionalidades() {
    cargarPreguntaDelDia();
    agregarBotonVolverArriba();
    
    // Añadir botón para cargar más preguntas
    const cargarMasBtn = document.createElement('button');
    cargarMasBtn.className = 'btn-cargar-mas';
    cargarMasBtn.innerHTML = '<i class="fas fa-plus"></i> Cargar más preguntas';
    cargarMasBtn.addEventListener('click', cargarMasPreguntas);
    
    document.querySelector('.preguntas-container').appendChild(cargarMasBtn);
    
    // Observar cambios en el DOM para aplicar limitaciones en móvil
    const observer = new MutationObserver(() => {
        limitarRespuestasMobile();
    });
    
    observer.observe(respuestasContainer, { childList: true, subtree: true });
    
    // Comprobar también al redimensionar la ventana
    window.addEventListener('resize', limitarRespuestasMobile);
}
        
// Iniciar cuando el usuario esté autenticado
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        inicializarFuncionalidades();
    }
});
});
