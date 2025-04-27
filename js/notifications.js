// notifications.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Firebase Messaging está disponible
    if (firebase.messaging) {
        initNotifications();
    } else {
        console.warn('Firebase Messaging no está disponible');
    }
});

function initNotifications() {
    const messaging = firebase.messaging();
    
    // Solicitar permiso
    function requestPermission() {
        console.log('Solicitando permiso...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Permiso de notificación concedido.');
                // Obtener token FCM
                getTokenAndSaveToDB(messaging);
            } else {
                console.log('No se pudo obtener permiso para notificar.');
            }
        });
    }
    
    // Obtener token y guardarlo en la base de datos
    function getTokenAndSaveToDB(messaging) {
        messaging.getToken().then((currentToken) => {
            if (currentToken) {
                // Guardar el token en Firestore para el usuario actual
                if (auth.currentUser) {
                    db.collection('users').doc(auth.currentUser.uid).set({
                        fcmToken: currentToken,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true })
                    .then(() => {
                        console.log('Token guardado en base de datos');
                    })
                    .catch((error) => {
                        console.error('Error al guardar token:', error);
                    });
                }
            } else {
                console.log('No se obtuvo ningún token de registro de instancia. Solicitando permiso para generar uno.');
                requestPermission();
            }
        }).catch((err) => {
            console.log('Ocurrió un error al recuperar el token.', err);
        });
    }
    
    // Configurar manejo de mensajes
    messaging.onMessage((payload) => {
        console.log('Mensaje recibido:', payload);
        
        // Mostrar notificación personalizada
        const notificationElement = document.getElementById('thinking-notification');
        if (notificationElement) {
            const notificationContent = notificationElement.querySelector('p');
            if (notificationContent) {
                notificationContent.textContent = payload.data.message || '¡Alguien está pensando en ti!';
            }
            
            // Mostrar notificación
            notificationElement.classList.remove('hidden');
            
            // Configurar cierre de notificación
            const closeButton = notificationElement.querySelector('.close-notification');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    notificationElement.classList.add('hidden');
                });
            }
            
            // Auto-cerrar después de 10 segundos
            setTimeout(() => {
                notificationElement.classList.add('hidden');
            }, 10000);
        }
    });
    
    // Listener para cierre de notificaciones
    document.addEventListener('click', function(e) {
        if (e.target.matches('.close-notification') || e.target.closest('.close-notification')) {
            const notification = e.target.closest('.notification');
            if (notification) {
                notification.classList.add('hidden');
            }
        }
    });
    
    // Solicitar permiso cuando el usuario esté autenticado
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Usuario autenticado, solicitar permiso para notificaciones
            requestPermission();
        }
    });
}
