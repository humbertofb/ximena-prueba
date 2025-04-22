import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

const noteText = document.getElementById("noteText");
const saveNote = document.getElementById("saveNote");
const savedNotes = document.getElementById("savedNotes");

saveNote.addEventListener("click", () => {
  if (noteText.value.trim() !== "") {
    push(ref(db, "notas"), { texto: noteText.value, timestamp: Date.now() });
    noteText.value = "";
  }
});

onValue(ref(db, "notas"), snapshot => {
  savedNotes.innerHTML = "";
  snapshot.forEach(child => {
    const note = child.val();
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <p>${note.texto}</p>
      <button onclick="deleteNote('${child.key}')">Eliminar</button>
    `;
    savedNotes.appendChild(div);
  });
});

window.deleteNote = function(id) {
  remove(ref(db, "notas/" + id));
};
