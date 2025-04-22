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

const form = document.getElementById("songForm");
const titulo = document.getElementById("titulo");
const artista = document.getElementById("artista");
const link = document.getElementById("link");
const playlist = document.getElementById("playlist");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const song = {
    titulo: titulo.value,
    artista: artista.value,
    link: link.value
  };
  push(ref(db, "playlist"), song);
  form.reset();
});

onValue(ref(db, "playlist"), snapshot => {
  playlist.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${data.titulo}</strong> - ${data.artista}<br>
      <a href="${data.link}" target="_blank">🎧 Escuchar</a>
    `;
    playlist.appendChild(div);
  });
});
