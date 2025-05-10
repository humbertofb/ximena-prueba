// Script para la funcionalidad de la página de preguntas con Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario está autenticado
            inicializarPaginaPreguntas(user);
        } else {
            // Redirigir al login si no está autenticado
            window.location.href = '../index.html';
        }
    });

    // Función para inicializar la página cuando el usuario está autenticado
    function inicializarPaginaPreguntas(user) {
        const db = firebase.firestore();
        const userId = user.uid;
        const preguntasRef = db.collection('preguntas');
        const respuestasRef = db.collection('respuestas');
        
        // Abrir/cerrar categorías
        const categorias = document.querySelectorAll('.categoria');
        categorias.forEach(categoria => {
            const header = categoria.querySelector('.categoria-header');
            header.addEventListener('click', () => {
                categoria.classList.toggle('active');
            });
        });
        
        // Cargar preguntas existentes desde Firebase
        cargarPreguntas();
        
        // Referencia al contenedor de categorías
        const categoriasContainer = document.querySelector('.categorias-list');
        
        // Botón para añadir nueva pregunta
        const btnNuevaPregunta = document.getElementById('nueva-pregunta-btn');
        btnNuevaPregunta.addEventListener('click', () => {
            mostrarModalNuevaPregunta();
        });
        
        // Funcionalidad del botón de pregunta aleatoria
        const randomBtn = document.getElementById('random-btn');
        const randomContent = document.getElementById('pregunta-random-content');
        
        randomBtn.addEventListener('click', async () => {
            try {
                // Obtener todas las preguntas de Firebase
                const snapshot = await preguntasRef.get();
                if (snapshot.empty) {
                    console.log('No hay preguntas disponibles');
                    return;
                }
                
                // Convertir a array para seleccionar una aleatoria
                const preguntas = [];
                snapshot.forEach(doc => {
                    preguntas.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Seleccionar una pregunta aleatoria
                const preguntaAleatoria = preguntas[Math.floor(Math.random() * preguntas.length)];
                
                // Buscar respuestas para esta pregunta
                const respuestasSnapshot = await respuestasRef
                    .where('preguntaId', '==', preguntaAleatoria.id)
                    .get();
                    
                const respuestas = {};
                respuestasSnapshot.forEach(doc => {
                    const data = doc.data();
                    respuestas[data.usuarioId] = {
                        id: doc.id,
                        texto: data.texto,
                        reacciones: data.reacciones || {}
                    };
                });
                
                // Crear el contenido HTML para la pregunta aleatoria
                randomContent.innerHTML = crearHTMLPregunta(preguntaAleatoria, respuestas, userId);
                
                // Configurar listeners para los campos de texto
                configurarListenersRespuestas(randomContent, preguntaAleatoria.id, userId);
                
                // Configurar listeners para los botones de edición
                configurarListenersEdicion(randomContent, preguntaAleatoria.id);
                
                // Configurar listeners para los botones de reacción
                configurarListenersReacciones(randomContent);
                
                // Mostrar el contenido con animación
                randomContent.classList.add('visible');
                
            } catch (error) {
                console.error('Error al cargar pregunta aleatoria:', error);
                mostrarNotificacion('Error al cargar pregunta aleatoria', 'error');
            }
        });
        
        // Función para cargar todas las preguntas desde Firebase
        async function cargarPreguntas() {
            try {
                // Limpiar contenido existente en categorías
                document.querySelectorAll('.categoria-content').forEach(cat => {
                    cat.innerHTML = '';
                });
                
                // Obtener todas las preguntas
                const snapshot = await preguntasRef.get();
                
                if (snapshot.empty) {
                    console.log('No hay preguntas en la base de datos');
                    return;
                }
                
                // Agrupar preguntas por categoría
                const preguntasPorCategoria = {};
                
                for (const doc of snapshot.docs) {
                    const pregunta = {
                        id: doc.id,
                        ...doc.data()
                    };
                    
                    // Si la categoría no existe en el objeto, crearla
                    if (!preguntasPorCategoria[pregunta.categoria]) {
                        preguntasPorCategoria[pregunta.categoria] = [];
                    }
                    
                    // Obtener respuestas para esta pregunta
                    const respuestasSnapshot = await respuestasRef
                        .where('preguntaId', '==', doc.id)
                        .get();
                        
                    const respuestas = {};
                    respuestasSnapshot.forEach(respDoc => {
                        const data = respDoc.data();
                        respuestas[data.usuarioId] = {
                            id: respDoc.id,
                            texto: data.texto,
                            reacciones: data.reacciones || {}
                        };
                    });
                    
                    preguntasPorCategoria[pregunta.categoria].push({
                        pregunta,
                        respuestas
                    });
                }
                
                // Insertar preguntas en sus respectivas categorías
                for (const categoria in preguntasPorCategoria) {
                    const categoriaEl = document.getElementById(`cat-${categoria.toLowerCase().replace(/\s+/g, '-')}`);
                    if (categoriaEl) {
                        const contenidoEl = categoriaEl.querySelector('.categoria-content');
                        
                        preguntasPorCategoria[categoria].forEach(item => {
                            const preguntaHTML = crearHTMLPregunta(item.pregunta, item.respuestas, userId);
                            const preguntaDiv = document.createElement('div');
                            preguntaDiv.innerHTML = preguntaHTML;
                            contenidoEl.appendChild(preguntaDiv.firstChild);
                            
                            // Configurar listeners para esta pregunta
                            const preguntaCard = contenidoEl.lastChild;
                            configurarListenersRespuestas(preguntaCard, item.pregunta.id, userId);
                            configurarListenersEdicion(preguntaCard, item.pregunta.id);
                            configurarListenersReacciones(preguntaCard);
                        });
                    }
                }
                
            } catch (error) {
                console.error('Error al cargar preguntas:', error);
                mostrarNotificacion('Error al cargar preguntas', 'error');
            }
        }
        
        // Función para crear el HTML de una pregunta con sus respuestas
        function crearHTMLPregunta(pregunta, respuestas, currentUserId) {
            // Determinar el otro usuario (asumiendo que solo hay dos usuarios)
            const otroUsuarioId = pregunta.creadorId !== currentUserId ? pregunta.creadorId : 'otroUsuario';
            
            // Crear botones de administración para la pregunta si el usuario actual es el creador
            const botonesAdmin = pregunta.creadorId === currentUserId ? 
                `<div class="pregunta-admin">
                    <button class="btn-editar-pregunta" data-id="${pregunta.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar-pregunta" data-id="${pregunta.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>` : '';
            
            // Obtener respuestas de ambos usuarios si existen
            const miRespuesta = respuestas[currentUserId] || { texto: '', reacciones: {} };
            const suRespuesta = respuestas[otroUsuarioId] || { texto: '', reacciones: {} };
            
            // Crear HTML para las reacciones de cada respuesta
            const misReacciones = crearHTMLReacciones(miRespuesta.reacciones, miRespuesta.id || '', 'mi');
            const susReacciones = crearHTMLReacciones(suRespuesta.reacciones, suRespuesta.id || '', 'su');
            
            return `
                <div class="pregunta-card" data-id="${pregunta.id}">
                    <div class="pregunta-header">
                        <div class="pregunta-texto">${pregunta.texto}</div>
                        ${botonesAdmin}
                    </div>
                    <div class="respuestas">
                        <div class="respuesta">
                            <span class="respuesta-label">Tu respuesta:</span>
                            <textarea class="respuesta-input mi-respuesta" data-pregunta-id="${pregunta.id}" placeholder="Escribe tu respuesta aquí...">${miRespuesta.texto}</textarea>
                            <div class="respuesta-acciones">
                                <button class="btn-guardar-respuesta" data-tipo="mi" data-respuesta-id="${miRespuesta.id || ''}">
                                    <i class="fas fa-save"></i> Guardar
                                </button>
                                ${misReacciones}
                            </div>
                        </div>
                        <div class="respuesta">
                            <span class="respuesta-label">Su respuesta:</span>
                            <textarea class="respuesta-input su-respuesta" data-pregunta-id="${pregunta.id}" placeholder="Esperando respuesta..." readonly>${suRespuesta.texto}</textarea>
                            <div class="respuesta-acciones">
                                ${susReacciones}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Función para crear el HTML de las reacciones
        function crearHTMLReacciones(reacciones = {}, respuestaId = '', tipo) {
            if (!respuestaId) return '<div class="reacciones"></div>'; // No mostrar botones si no hay respuesta guardada
            
            const emojis = [
                { id: 'heart-yellow', emoji: '💛', label: 'Corazón amarillo' },
                { id: 'heart-black', emoji: '🖤', label: 'Corazón negro' },
                { id: 'laugh', emoji: '😂', label: 'Risa' },
                { id: 'wow', emoji: '😮', label: 'Asombro' },
                { id: 'monkey', emoji: '🙈', label: 'Mono tapándose los ojos' },
                { id: 'cry', emoji: '😢', label: 'Llorando' }
            ];
            
            let reaccionesHTML = `<div class="reacciones" data-respuesta-id="${respuestaId}">`;
            
            // Botones de reacción
            reaccionesHTML += '<div class="reacciones-botones">';
            emojis.forEach(emoji => {
                const count = reacciones[emoji.id] || 0;
                const active = count > 0 ? 'active' : '';
                reaccionesHTML += `
                    <button class="btn-reaccion ${active}" data-emoji="${emoji.id}" data-tipo="${tipo}" title="${emoji.label}">
                        ${emoji.emoji} <span class="reaccion-count">${count > 0 ? count : ''}</span>
                    </button>
                `;
            });
            reaccionesHTML += '</div>';
            
            reaccionesHTML += '</div>';
            return reaccionesHTML;
        }
        
        // Función para configurar listeners para los campos de texto de respuestas
        function configurarListenersRespuestas(container, preguntaId, userId) {
            // Listener para botones de guardar respuesta
            container.querySelectorAll('.btn-guardar-respuesta').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const tipo = this.getAttribute('data-tipo');
                    const respuestaId = this.getAttribute('data-respuesta-id');
                    const preguntaCard = this.closest('.pregunta-card');
                    const texto = preguntaCard.querySelector(`.${tipo}-respuesta`).value.trim();
                    
                    if (!texto) {
                        mostrarNotificacion('La respuesta no puede estar vacía', 'error');
                        return;
                    }
                    
                    try {
                        if (respuestaId) {
                            // Actualizar respuesta existente
                            await respuestasRef.doc(respuestaId).update({
                                texto: texto,
                                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        } else {
                            // Crear nueva respuesta
                            const nuevaRespuesta = await respuestasRef.add({
                                preguntaId: preguntaId,
                                usuarioId: userId,
                                texto: texto,
                                reacciones: {},
                                creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
                                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            
                            // Actualizar el atributo data-respuesta-id en el botón
                            this.setAttribute('data-respuesta-id', nuevaRespuesta.id);
                            
                            // Actualizar el contenedor de reacciones
                            const reaccionesContainer = this.parentElement.querySelector('.reacciones');
                            if (reaccionesContainer) {
                                reaccionesContainer.setAttribute('data-respuesta-id', nuevaRespuesta.id);
                            } else {
                                // Si no existe el contenedor de reacciones, añadirlo
                                const nuevoContenedorReacciones = document.createElement('div');
                                nuevoContenedorReacciones.className = 'reacciones';
                                nuevoContenedorReacciones.setAttribute('data-respuesta-id', nuevaRespuesta.id);
                                this.parentElement.appendChild(nuevoContenedorReacciones);
                            }
                        }
                        
                        mostrarNotificacion('Respuesta guardada correctamente', 'success');
                        
                        // Recargar la página para mostrar los cambios
                        setTimeout(() => {
                            cargarPreguntas();
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Error al guardar respuesta:', error);
                        mostrarNotificacion('Error al guardar respuesta', 'error');
                    }
                });
            });
        }
        
        // Función para configurar listeners para botones de edición de preguntas
        function configurarListenersEdicion(container, preguntaId) {
            // Editar pregunta
            container.querySelectorAll('.btn-editar-pregunta').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const preguntaId = this.getAttribute('data-id');
                    
                    try {
                        // Obtener datos de la pregunta
                        const doc = await preguntasRef.doc(preguntaId).get();
                        if (doc.exists) {
                            const pregunta = doc.data();
                            
                            // Mostrar modal de edición
                            mostrarModalEditarPregunta(preguntaId, pregunta.texto, pregunta.categoria);
                        }
                    } catch (error) {
                        console.error('Error al obtener pregunta:', error);
                        mostrarNotificacion('Error al cargar datos de la pregunta', 'error');
                    }
                });
            });
            
            // Eliminar pregunta
            container.querySelectorAll('.btn-eliminar-pregunta').forEach(btn => {
                btn.addEventListener('click', function() {
                    const preguntaId = this.getAttribute('data-id');
                    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta pregunta y todas sus respuestas?');
                    
                    if (confirmar) {
                        eliminarPregunta(preguntaId);
                    }
                });
            });
        }
        
        // Función para configurar listeners para botones de reacción
        function configurarListenersReacciones(container) {
            container.querySelectorAll('.btn-reaccion').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const emoji = this.getAttribute('data-emoji');
                    const respuestaId = this.closest('.reacciones').getAttribute('data-respuesta-id');
                    
                    if (!respuestaId) return;
                    
                    try {
                        // Verificar si ya reaccionó con este emoji
                        const doc = await respuestasRef.doc(respuestaId).get();
                        if (!doc.exists) {
                            mostrarNotificacion('La respuesta no existe', 'error');
                            return;
                        }
                        
                        const respuesta = doc.data();
                        const reacciones = respuesta.reacciones || {};
                        
                        // Alternar la reacción (añadir o quitar)
                        if (reacciones[emoji]) {
                            // Ya existía esta reacción, quitar
                            const actualizacion = {};
                            actualizacion[`reacciones.${emoji}`] = firebase.firestore.FieldValue.delete();
                            await respuestasRef.doc(respuestaId).update(actualizacion);
                            this.classList.remove('active');
                            this.querySelector('.reaccion-count').textContent = '';
                        } else {
                            // No existía, añadir
                            const actualizacion = {};
                            actualizacion[`reacciones.${emoji}`] = 1;
                            await respuestasRef.doc(respuestaId).update(actualizacion);
                            this.classList.add('active');
                            this.querySelector('.reaccion-count').textContent = '1';
                        }
                        
                    } catch (error) {
                        console.error('Error al actualizar reacción:', error);
                        mostrarNotificacion('Error al actualizar reacción', 'error');
                    }
                });
            });
        }
        
        // Función para mostrar modal de nueva pregunta
        function mostrarModalNuevaPregunta() {
            // Crear el modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Nueva Pregunta</h2>
                    <form id="nueva-pregunta-form">
                        <div class="form-group">
                            <label for="pregunta-texto">Texto de la pregunta:</label>
                            <textarea id="pregunta-texto" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="pregunta-categoria">Categoría:</label>
                            <select id="pregunta-categoria" required>
                                <option value="conocernos">Para conocernos mejor</option>
                                <option value="momentos">Momentos Especiales</option>
                                <option value="divertidas">Preguntas Divertidas</option>
                                <option value="futuro">Sueños y Futuro</option>
                                <option value="random">Aleatorias</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-modal-guardar">Guardar</button>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Mostrar el modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Cerrar modal
            modal.querySelector('.close').addEventListener('click', () => {
                cerrarModal(modal);
            });
            
            // Manejar clic fuera del modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cerrarModal(modal);
                }
            });
            
            // Manejar envío del formulario
            modal.querySelector('#nueva-pregunta-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const texto = document.getElementById('pregunta-texto').value.trim();
                const categoria = document.getElementById('pregunta-categoria').value;
                
                if (!texto) {
                    mostrarNotificacion('Por favor escribe una pregunta', 'error');
                    return;
                }
                
                try {
                    // Guardar nueva pregunta en Firebase
                    await preguntasRef.add({
                        texto: texto,
                        categoria: categoria,
                        creadorId: userId,
                        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    mostrarNotificacion('Pregunta creada correctamente', 'success');
                    cerrarModal(modal);
                    
                    // Recargar preguntas
                    cargarPreguntas();
                    
                } catch (error) {
                    console.error('Error al crear pregunta:', error);
                    mostrarNotificacion('Error al crear pregunta', 'error');
                }
            });
        }
        
        // Función para mostrar modal de editar pregunta
        function mostrarModalEditarPregunta(preguntaId, textoActual, categoriaActual) {
            // Crear el modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Editar Pregunta</h2>
                    <form id="editar-pregunta-form">
                        <div class="form-group">
                            <label for="pregunta-texto-edit">Texto de la pregunta:</label>
                            <textarea id="pregunta-texto-edit" required>${textoActual}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="pregunta-categoria-edit">Categoría:</label>
                            <select id="pregunta-categoria-edit" required>
                                <option value="conocernos" ${categoriaActual === 'conocernos' ? 'selected' : ''}>Para conocernos mejor</option>
                                <option value="momentos" ${categoriaActual === 'momentos' ? 'selected' : ''}>Momentos Especiales</option>
                                <option value="divertidas" ${categoriaActual === 'divertidas' ? 'selected' : ''}>Preguntas Divertidas</option>
                                <option value="futuro" ${categoriaActual === 'futuro' ? 'selected' : ''}>Sueños y Futuro</option>
                                <option value="random" ${categoriaActual === 'random' ? 'selected' : ''}>Aleatorias</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-modal-guardar">Actualizar</button>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Mostrar el modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Cerrar modal
            modal.querySelector('.close').addEventListener('click', () => {
                cerrarModal(modal);
            });
            
            // Manejar clic fuera del modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cerrarModal(modal);
                }
            });
            
            // Manejar envío del formulario
            modal.querySelector('#editar-pregunta-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const texto = document.getElementById('pregunta-texto-edit').value.trim();
                const categoria = document.getElementById('pregunta-categoria-edit').value;
                
                if (!texto) {
                    mostrarNotificacion('Por favor escribe una pregunta', 'error');
                    return;
                }
                
                try {
                    // Actualizar pregunta en Firebase
                    await preguntasRef.doc(preguntaId).update({
                        texto: texto,
                        categoria: categoria,
                        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    mostrarNotificacion('Pregunta actualizada correctamente', 'success');
                    cerrarModal(modal);
                    
                    // Recargar preguntas
                    cargarPreguntas();
                    
                } catch (error) {
                    console.error('Error al actualizar pregunta:', error);
                    mostrarNotificacion('Error al actualizar pregunta', 'error');
                }
            });
        }
        
        // Función para eliminar una pregunta y sus respuestas
        async function eliminarPregunta(preguntaId) {
            try {
                // Primero eliminar todas las respuestas asociadas
                const respuestasSnapshot = await respuestasRef.where('preguntaId', '==', preguntaId).get();
                
                // Usar batch para operaciones múltiples
                const batch = db.batch();
                
                respuestasSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                // Eliminar la pregunta
                batch.delete(preguntasRef.doc(preguntaId));
                
                // Commit batch
                await batch.commit();
                
                mostrarNotificacion('Pregunta eliminada correctamente', 'success');
                
                // Recargar preguntas
                cargarPreguntas();
                
            } catch (error) {
                console.error('Error al eliminar pregunta:', error);
                mostrarNotificacion('Error al eliminar pregunta', 'error');
            }
        }
        
        // Funciones de utilidad
        function cerrarModal(modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
        
        function mostrarNotificacion(mensaje, tipo = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${tipo}`;
            notification.textContent = mensaje;
            
            document.body.appendChild(notification);
            
            // Mostrar la notificación
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    }
});
