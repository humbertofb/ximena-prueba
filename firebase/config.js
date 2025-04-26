// Configuración de Firebase
const firebaseConfig = {
    // Aquí debes insertar la configuración de Firebase de tu proyecto
    // Puedes obtener esta información en la consola de Firebase después de crear un proyecto
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase que usaremos
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Configuraciones adicionales de Firestore
db.settings({
    timestampsInSnapshots: true
});
