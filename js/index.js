// Ejemplo de Firebase Cloud Function (index.js en tu proyecto de Cloud Functions)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.https.onCall((data, context) => {
  // Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado');
  }

  const { token, message, senderId, senderEmail } = data;
  
  if (!token || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Se requieren token y mensaje');
  }

  // Construir mensaje de notificación
  const payload = {
    notification: {
      title: 'Alguien está pensando en ti ❤️',
      body: message,
      icon: '/images/notification-icon.png',
      click_action: 'https://tudominio.com/'
    },
    data: {
      senderId: senderId,
      senderEmail: senderEmail,
      message: message,
      timestamp: Date.now().toString()
    }
  };

  // Enviar mensaje
  return admin.messaging().sendToDevice(token, payload)
    .then(response => {
      console.log('Notificación enviada con éxito:', response);
      return { success: true, response: response };
    })
    .catch(error => {
      console.error('Error al enviar notificación:', error);
      throw new functions.https.HttpsError('internal', 'Error al enviar notificación', error);
    });
});

// También podemos crear una función que se active cuando se crea una nueva notificación
exports.sendNotificationOnCreate = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    try {
      const notificationData = snap.data();
      const { recipientId, message } = notificationData;
      
      // Obtener token del destinatario
      const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();
      
      if (!recipientDoc.exists || !recipientDoc.data().fcmToken) {
        console.log('No se encontró token para el destinatario');
        return null;
      }
      
      const token = recipientDoc.data().fcmToken;
      
      // Construir mensaje
      const payload = {
        notification: {
          title: 'Alguien está pensando en ti ❤️',
          body: message,
          icon: '/images/notification-icon.png',
          click_action: 'https://tudominio.com/'
        },
        data: {
          notificationId: context.params.notificationId,
          message: message,
          timestamp: Date.now().toString()
        }
      };
      
      // Enviar mensaje
      return admin.messaging().sendToDevice(token, payload);
    } catch (error) {
      console.error('Error al enviar notificación automática:', error);
      return null;
    }
  });
