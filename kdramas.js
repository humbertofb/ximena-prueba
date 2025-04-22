import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

const form = document.getElementById("kdramaForm");
const nombre = document.getElementById("nombre");
const comentario = document.getElementById("comentario");
const kdramaList = document.getElementById("kdramaList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const drama = {
    nombre: nombre.value,
    comentario: comentario.value
  };
  push(ref(db, "kdramas"), drama);
  form.reset();
});

onValue(ref(db, "kdramas"), snapshot => {
  kdramaList.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${data.nombre}</strong><p>💬 ${data.comentario}</p>`;
    kdramaList.appendChild(div);
  });
});
