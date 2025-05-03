// 🎂 Cuenta regresiva al próximo cumpleaños (12 de junio)
const countdown = document.getElementById("countdown");
const nextBirthday = new Date(new Date().getFullYear(), 5, 12); // 12 junio

function updateCountdown() {
  const now = new Date();
  if (now > nextBirthday) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }
  const diff = nextBirthday - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  countdown.textContent = `Faltan ${days} días para tu cumple 🎈`;
}
updateCountdown();

// 🎁 Sorpresas
function mostrarMensaje() {
  document.getElementById("sorpresa-texto").innerText =
    "Eres una luz hermosa que ilumina mi vida. Gracias por existir ❤️";
}
function mostrarPlaylist() {
  document.getElementById("sorpresa-texto").innerHTML =
    `Nuestra playlist especial: <br><a href="https://open.spotify.com/playlist/3D7RvY8dHwEnLmlI2y6Czi" target="_blank">Escuchar 🎶</a>`;
}
function mostrarPoema() {
  document.getElementById("sorpresa-texto").innerText =
    "Como la luna ilumina la noche, tú iluminas mis días. Cada sonrisa tuya es poesía que el universo escribe solo para mí.";
}
function mostrarCita() {
  document.getElementById("sorpresa-texto").innerText =
    "“Eres mi lugar favorito al que quiero volver siempre.” 💫";
}

// 🎉 Confetti
function lanzarConfetti() {
  const confettiContainer = document.getElementById("confetti-container");
  for (let i = 0; i < 50; i++) {
    const span = document.createElement("span");
    span.style.left = Math.random() * 100 + "vw";
    span.style.animationDelay = Math.random() * 3 + "s";
    confettiContainer.appendChild(span);
  }
}
lanzarConfetti();

// 📸 Slideshow automático
let slideIndex = 0;
function showSlides() {
  let slides = document.getElementsByClassName("mySlides");
  for (let s of slides) s.style.display = "none";
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;
  slides[slideIndex - 1].style.display = "block";
  setTimeout(showSlides, 3000);
}
showSlides();
