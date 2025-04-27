// Configuración de Firebase
const firebaseConfig = {
    // Aquí debes insertar la configuración de Firebase de tu proyecto
    // Puedes obtener esta información en la consola de Firebase después de crear un proyecto
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
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
