// Configuración de Firebase
const firebaseConfig = {
    // Aquí debes insertar la configuración de Firebase de tu proyecto
    // Puedes obtener esta información en la consola de Firebase después de crear un proyecto
    apiKey: "AIzaSyBtf--tWrqRVItAGJGQ6hEk81iggP4I-SU",
    authDomain: "my-humber-project-319815.firebaseapp.com",
    projectId: "my-humber-project-319815",
    storageBucket: "my-humber-project-319815.firebasestorage.app",
    messagingSenderId: "110994378936",
    appId: "1:110994378936:web:60b20c16ce5f40b47e644d"
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
