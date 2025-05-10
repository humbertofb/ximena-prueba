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
    
    // Función para cargar la pregunta del día
    function cargarPreguntaDelDia() {
        db.collection('preguntas')
            .orderBy('fechaCreacion', 'desc')
            .limit(1)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    console.log('No hay preguntas en la base de datos');
                    mostrarMensajeNoHayPreguntas();
                    return;
                }
                
                const doc = querySnapshot.docs[0];
                preguntaActiva = {
                    id: doc.id,
                    ...doc.data()
                };
                
                mostrarPregunta(preguntaActiva);
                cargarRespuestas(preguntaActiva.id);
                
                // Configuramos un listener en tiempo real para las respuestas
                configurarListenerRespuestas(preguntaActiva.id);
            })
            .catch((error) => {
                console.error('Error al cargar pregunta del día:', error);
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
        
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc')
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    respuestasContainer.innerHTML += '<p>Aún no hay respuestas. ¡Sé el primero en responder!</p>';
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const respuesta = {
                        id: doc.id,
                        ...doc.data()
                    };
                    mostrarRespuesta(respuesta);
                });
            })
            .catch((error) => {
                console.error('Error al cargar respuestas:', error);
            });
    }
    
    // Configurar un listener en tiempo real para las respuestas
    function configurarListenerRespuestas(preguntaId) {
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .orderBy('fechaCreacion', 'desc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const respuesta = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    
                    if (change.type === 'added') {
                        // Si es una respuesta nueva, la añadimos al DOM
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (!existingElement) {
                            mostrarRespuesta(respuesta);
                        }
                    } else if (change.type === 'modified') {
                        // Si es una respuesta modificada, actualizamos el DOM
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (existingElement) {
                            existingElement.outerHTML = crearHtmlRespuesta(respuesta);
                            configurarListenersRespuestaItem(respuesta);
                        }
                    } else if (change.type === 'removed') {
                        // Si es una respuesta eliminada, la quitamos del DOM
                        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
                        if (existingElement) {
                            existingElement.remove();
                        }
                    }
                });
            });
    }
    
    // Función para mostrar una respuesta
    function mostrarRespuesta(respuesta) {
        if (!respuestasContainer) return;
        
        const respuestaHTML = crearHtmlRespuesta(respuesta);
        
        // Verificamos si el elemento ya existe
        const existingElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
        if (existingElement) {
            existingElement.outerHTML = respuestaHTML;
        } else {
            // Si no existe, lo añadimos después del título
            const titulo = respuestasContainer.querySelector('h2');
            if (titulo) {
                titulo.insertAdjacentHTML('afterend', respuestaHTML);
            } else {
                respuestasContainer.innerHTML += respuestaHTML;
            }
        }
        
        configurarListenersRespuestaItem(respuesta);
    }
    
    // Crear HTML para una respuesta
    function crearHtmlRespuesta(respuesta) {
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;
        
        return `
            <div class="respuesta-item" data-id="${respuesta.id}">
                <div class="respuesta-header">
                    <div class="respuesta-autor">${respuesta.nombreUsuario || 'Usuario'}</div>
                    <div class="respuesta-fecha">${formatearFecha(respuesta.fechaCreacion)}</div>
                </div>
                <div class="respuesta-contenido">${respuesta.texto}</div>
                ${esCreador ? `
                    <div class="respuesta-acciones">
                        <div class="reacciones">
                            <!-- Aquí puedes añadir botones de reacción si lo deseas -->
                        </div>
                        <div class="respuesta-admin">
                            <button class="btn-editar-respuesta" title="Editar respuesta">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-eliminar-respuesta" title="Eliminar respuesta">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Configurar listeners para una respuesta individual
    function configurarListenersRespuestaItem(respuesta) {
        const respuestaElement = document.querySelector(`.respuesta-item[data-id="${respuesta.id}"]`);
        if (!respuestaElement) return;
        
        const usuario = firebase.auth().currentUser;
        const esCreador = usuario && respuesta.usuarioId === usuario.uid;
        
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
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
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
        
        // Rellenar el modal con los datos de la pregunta
        const modal = document.getElementById('editar-pregunta-modal');
        const idElement = document.getElementById('editar-pregunta-id');
        const textoElement = document.getElementById('editar-pregunta-texto');
        
        idElement.value = pregunta.id;
        textoElement.value = pregunta.texto;
        
        // Mostrar el modal
        modal.classList.add('show');
    }
    
    // Función para confirmar la eliminación de una pregunta
    function confirmarEliminarPregunta(preguntaId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.')) {
            eliminarPregunta(preguntaId);
        }
    }
    
    // Función para eliminar una pregunta
    function eliminarPregunta(preguntaId) {
        // Primero eliminar todas las respuestas asociadas
        db.collection('respuestas')
            .where('preguntaId', '==', preguntaId)
            .get()
            .then((querySnapshot) => {
                const batch = db.batch();
                
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                
                return batch.commit();
            })
            .then(() => {
                // Luego eliminar la pregunta
                return db.collection('preguntas').doc(preguntaId).delete();
            })
            .then(() => {
                mostrarNotificacion('Pregunta eliminada correctamente', 'success');
                
                // Cargar la siguiente pregunta disponible
                cargarPreguntaDelDia();
            })
            .catch((error) => {
                console.error('Error al eliminar pregunta:', error);
                mostrarNotificacion('Error al eliminar la pregunta', 'error');
            });
    }
    
    // Función para mostrar el modal de editar respuesta
    function mostrarModalEditarRespuesta(respuesta) {
        // Crear el modal si no existe
        if (!document.getElementById('editar-respuesta-modal')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="editar-respuesta-modal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Editar Respuesta</h2>
                        <form id="editar-respuesta-form">
                            <input type="hidden" id="editar-respuesta-id">
                            <div class="form-group">
                                <label for="editar-respuesta-texto">Tu respuesta</label>
                                <textarea id="editar-respuesta-texto" placeholder="Escribe aquí tu respuesta..." required></textarea>
                            </div>
                            <button type="submit" class="btn-modal-guardar">Guardar cambios</button>
                        </form>
                    </div>
                </div>
            `);
            
            // Configurar evento para cerrar el modal
            const modal = document.getElementById('editar-respuesta-modal');
            const closeBtn = modal.querySelector('.close');
            
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
            
            // Configurar evento para guardar la respuesta
            const editarRespuestaForm = document.getElementById('editar-respuesta-form');
            editarRespuestaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const idElement = document.getElementById('editar-respuesta-id');
                const textoElement = document.getElementById('editar-respuesta-texto');
                
                const id = idElement.value;
                const texto = textoElement.value.trim();
                
                if (!texto) {
                    mostrarNotificacion('Por favor, escribe una respuesta', 'error');
                    return;
                }
                
                db.collection('respuestas').doc(id).update({
                    texto: texto,
                    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    modal.classList.remove('show');
                    mostrarNotificacion('Respuesta actualizada correctamente', 'success');
                })
                .catch((error) => {
                    console.error('Error al actualizar respuesta:', error);
                    mostrarNotificacion('Error al actualizar la respuesta', 'error');
                });
            });
        }
        
        // Rellenar el modal con los datos de la respuesta
        const modal = document.getElementById('editar-respuesta-modal');
        const idElement = document.getElementById('editar-respuesta-id');
        const textoElement = document.getElementById('editar-respuesta-texto');
        
        idElement.value = respuesta.id;
        textoElement.value = respuesta.texto;
        
        // Mostrar el modal
        modal.classList.add('show');
    }
    
    // Función para confirmar la eliminación de una respuesta
    function confirmarEliminarRespuesta(respuestaId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta respuesta? Esta acción no se puede deshacer.')) {
            eliminarRespuesta(respuestaId);
        }
    }
    
    // Función para eliminar una respuesta
    function eliminarRespuesta(respuestaId) {
        db.collection('respuestas').doc(respuestaId).delete()
            .then(() => {
                mostrarNotificacion('Respuesta eliminada correctamente', 'success');
            })
            .catch((error) => {
                console.error('Error al eliminar respuesta:', error);
                mostrarNotificacion('Error al eliminar la respuesta', 'error');
            });
    }
    
    // Función para formatear la fecha
    function formatearFecha(timestamp) {
        if (!timestamp) return 'Fecha desconocida';
        
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        // Formatear la fecha como: 12 de mayo de 2023, 15:30
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear el elemento de notificación si no existe
        let notificacion = document.querySelector('.notification');
        
        if (!notificacion) {
            notificacion = document.createElement('div');
            notificacion.className = 'notification';
            document.body.appendChild(notificacion);
        }
        
        // Configurar la notificación
        notificacion.textContent = mensaje;
        notificacion.className = `notification ${tipo}`;
        
        // Mostrar la notificación
        setTimeout(() => {
            notificacion.classList.add('show');
        }, 10);
        
        // Ocultar la notificación después de un tiempo
        setTimeout(() => {
            notificacion.classList.remove('show');
        }, 3000);
    }
});
