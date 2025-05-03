document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openCardBtn");
  const card = document.getElementById("birthdayCard");
  const playBtn = document.getElementById("playSongBtn");

  let audio;

  openBtn.addEventListener("click", () => {
    card.classList.add("opened");
    launchConfetti();
  });

  playBtn.addEventListener("click", () => {
    if (!audio) {
      audio = new Audio("https://www.bensound.com/bensound-music/bensound-sunny.mp3"); // Cambia por la canción que elijas
    }
    audio.play();
  });
});

// Confetti
function launchConfetti() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const canvas = document.getElementById("confettiCanvas");
  const confetti = confettiLib.create(canvas, { resize: true });

  (function frame() {
    confetti({
      particleCount: 5,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
}

// Pequeña librería de confeti (usa esta versión si no tienes una)
const confettiLib = {
  create(canvas, options) {
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    return (settings) => {
      for (let i = 0; i < settings.particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 6 + 4;
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    };
  }
};
