import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Mostrar respuestas guardadas
const savedAnswersDiv = document.getElementById("savedAnswers");
onValue(ref(db, "respuestas"), snapshot => {
  savedAnswersDiv.innerHTML = "";
  snapshot.forEach(child => {
    const respuesta = child.val();
    const p = document.createElement("p");
    p.textContent = `• ${respuesta.texto}`;
    savedAnswersDiv.appendChild(p);
  });
});

// Mostrar notas privadas
const sharedNotesDiv = document.getElementById("sharedNotes");
onValue(ref(db, "notas"), snapshot => {
  sharedNotesDiv.innerHTML = "";
  snapshot.forEach(child => {
    const nota = child.val();
    const p = document.createElement("p");
    p.textContent = `💌 ${nota.texto}`;
    sharedNotesDiv.appendChild(p);
  });
});
