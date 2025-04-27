// Sistema de notificaciones
document.addEventListener('DOMContentLoaded', function() {
    const thinkingButton = document.getElementById('thinking-button');
    const notificationElement = document.getElementById('thinking-notification');
    let notificationTimeout;

    // Configuración de Firebase para las notificaciones
    async function setupFirebaseNotifications() {
        try {
            // Verificar si las notificaciones están soportadas en el navegador
            if (!('Notification' in window)) {
                console.log('Este navegador no soporta notificaciones.');
                return;
            }

            // Solicitar permiso para mostrar notificaciones
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                await Notification.requestPermission();
            }

            // Configurar Firebase Cloud Messaging si está disponible
            if (firebase.messaging && Notification.permission === 'granted') {
                const messaging = firebase.messaging();
                
                // Obtener token para identificar el dispositivo
                messaging.getToken({ vapidKey: 'TU_CLAVE_PUBLICA_WEB_PUSH' })
                    .then((currentToken) => {
                        if (currentToken) {
                            // Guardar el token en la base de datos del usuario
                            saveTokenToDatabase(currentToken);
                        } else {
                            console.log('No se pudo obtener el token para notificaciones push.');
                        }
                    })
                    .catch((err) => {
                        console.log('Error al obtener el token:', err);
                    });
                
                // Manejar mensajes cuando la app está en primer plano
                messaging.onMessage((payload) => {
                    console.log('Mensaje recibido:', payload);
                    showLocalNotification(payload.notification.title, payload.notification.body);
                });
            }
        } catch (error) {
            console.error('Error en la configuración de notificaciones:', error);
        }
    }

    // Guardar el token en Firestore
    function saveTokenToDatabase(token) {
        const user = firebase.auth().currentUser;
        if (user) {
            const userTokensRef = db.collection('userTokens').doc(user.uid);
            
            // Agregar el token con timestamp
            userTokensRef.set({
                tokens: firebase.firestore.FieldValue.arrayUnion({
                    token: token,
                    timestamp: new Date()
                })
            }, { merge: true });
        }
    }

    // Mostrar notificación local
    function showLocalNotification(title, body) {
        if (notificationElement) {
            // Actualizar contenido de la notificación
            const notificationText = notificationElement.querySelector('p');
            if (notificationText) {
                notificationText.textContent = body || '¡Alguien está pensando en ti!';
            }
            
            // Mostrar notificación
            notificationElement.classList.remove('hidden');
            
            // Establecer timeout para ocultar la notificación
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
            }
            notificationTimeout = setTimeout(() => {
                notificationElement.classList.add('hidden');
            }, 5000);
        }
    }

    // Configurar el botón de "Estoy pensando en ti"
    if (thinkingButton) {
        thinkingButton.addEventListener('click', function() {
            const user = firebase.auth().currentUser;
            if (user) {
                // Registrar el "pensamiento" en la base de datos
                db.collection('thoughts').add({
                    from: user.uid,
                    to: 'partner_user_id', // ID del destinatario
                    timestamp: new Date()
                })
                .then(() => {
                    // Animación de confirmación
                    thinkingButton.classList.add('thinking-sent');
                    setTimeout(() => {
                        thinkingButton.classList.remove('thinking-sent');
                    }, 1000);
                    
                    // Mostrar notificación temporal
                    showLocalNotification('Pensamiento enviado', 'Tu pareja sabrá que estás pensando en ella');
                })
                .catch((error) => {
                    console.error('Error al enviar el pensamiento:', error);
                });
            }
        });
    }

    // Cerrar la notificación al hacer clic en el botón de cierre
    const closeButton = document.querySelector('.close-notification');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notificationElement.classList.add('hidden');
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
            }
        });
    }

    // Escuchar cambios en la colección de "pensamientos"
    function listenForThoughts() {
        const user = firebase.auth().currentUser;
        if (user) {
            db.collection('thoughts')
                .where('to', '==', user.uid)
                .where('timestamp', '>', new Date(Date.now() - 300000)) // Últimos 5 minutos
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            // Mostrar notificación local
                            showLocalNotification('Nuevo pensamiento', '¡Tu pareja está pensando en ti!');
                            
                            // Crear notificación del navegador si está en segundo plano
                            if (document.visibilityState !== 'visible' && Notification.permission === 'granted') {
                                new Notification('¡Alguien está pensando en ti!', {
                                    icon: 'images/heart-icon.png',
                                    body: 'Tu pareja te ha enviado un pensamiento'
                                });
                            }
                        }
                    });
                });
        }
    }

    // Inicializar cuando se confirme la autenticación
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            setupFirebaseNotifications();
            listenForThoughts();
        }
    });
});
