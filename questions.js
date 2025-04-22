import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
const questionsContainer = document.getElementById("questions-container");

const preguntas = {
  amor: [
    "¿Qué es lo que más te gusta de mí?",
    "¿Cuál fue tu primer amor?",
    "¿Crees en el amor para siempre?"
  ],
  sueños: [
    "¿Qué sueño no has cumplido aún?",
    "¿Qué harías si no tuvieras miedo?",
    "¿Dónde te gustaría vivir?"
  ],
  risas: [
    "¿Cuál es tu chiste favorito?",
    "¿Qué te hace reír sin parar?",
    "¿La peor broma que te han hecho?"
  ],
  traviesas: [
    "¿Te animarías a un beso en la primera cita?",
    "¿Has tenido un sueño subido de tono conmigo?",
    "¿Qué parte de mi cuerpo te gusta más?"
  ]
};

function loadCategory(category) {
  questionsContainer.innerHTML = "";
  preguntas[category].forEach((text, index) => {
    const id = `${category}-${index}`;
    const div = document.createElement("div");
    div.className = "question-card";
    div.innerHTML = `
      <p>${text}</p>
      <div class="reactions">
        <button onclick="react('${id}', '❤️')">❤️</button>
        <button onclick="react('${id}', '😂')">😂</button>
        <button onclick="react('${id}', '🔥')">🔥</button>
      </div>
    `;
    questionsContainer.appendChild(div);
  });
}

window.loadCategory = loadCategory;
window.react = function (id, emoji) {
  const reactionRef = ref(db, 'reactions/' + id + '/' + emoji);
  onValue(reactionRef, snapshot => {
    const current = snapshot.val() || 0;
    set(reactionRef, current + 1);
  }, { onlyOnce: true });
};
