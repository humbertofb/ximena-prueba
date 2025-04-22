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

const form = document.getElementById("videoForm");
const desc = document.getElementById("desc");
const url = document.getElementById("url");
const videosList = document.getElementById("videosList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const video = {
    descripcion: desc.value,
    url: url.value
  };
  push(ref(db, "videos"), video);
  form.reset();
});

onValue(ref(db, "videos"), snapshot => {
  videosList.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const videoContainer = document.createElement("div");
    videoContainer.innerHTML = `
      <p><strong>${data.descripcion}</strong></p>
      <iframe width="100%" height="200" src="${convertToEmbed(data.url)}" 
              frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
              gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
    videosList.appendChild(videoContainer);
  });
});

function convertToEmbed(url) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  return url; // Para enlaces ya embed o Instagram
}
