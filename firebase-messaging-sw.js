importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
  authDomain: "my-humber-project-319815.firebaseapp.com",
  projectId: "my-humber-project-319815",
  storageBucket: "my-humber-project-319815.firebasestorage.app",
  messagingSenderId: "110994378936",
  appId: "1:110994378936:web:60b20c16ce5f40b47e644d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Recibido mensaje en background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Alguien está pensando en ti';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuevo mensaje',
    icon: '/images/notification-icon.png'  // Ajusta esta ruta a tu icono
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
