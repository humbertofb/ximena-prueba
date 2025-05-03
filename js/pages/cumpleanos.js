// js/pages/cumpleanos.js

// Menú hamburguesa
document.getElementById('menu-button').addEventListener('click', () => {
  document.getElementById('side-menu').classList.toggle('open');
});

document.addEventListener('click', function (e) {
  const menu = document.getElementById('side-menu');
  const button = document.getElementById('menu-button');
  if (!menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// Confeti 🎊
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const colors = ['#f48fb1', '#fce4ec', '#f06292', '#ce93d8'];

  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r / 2, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    update();
  }

  function update() {
    confetti.forEach(p => {
      p.y += p.d;
      p.x += Math.sin(p.y * 0.01);
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  (function animate() {
    draw();
    requestAnimationFrame(animate);
  })();
}

startConfetti();

// Regalos interactivos
function mostrarMensaje() {
  document.getElementById('gift-result').textContent = "Eres mi alegría diaria. Gracias por existir ❤️";
}

function mostrarPlaylist() {
  document.getElementById('gift-result').innerHTML = `
    Nuestra playlist especial 🎶<br/>
    <a href="https://open.spotify.com" target="_blank">Haz clic para escucharla 💖</a>
  `;
}

function mostrarPoema() {
  document.getElementById('gift-result').innerHTML = `
    Tus ojos son mi luz,<br/>
    Tu voz es mi canción,<br/>
    Y cada día contigo,<br/>
    Es pura bendición. 🌸
  `;
}

function mostrarCita() {
  document.getElementById('gift-result').innerHTML = `
    ¡Nuestra cita sorpresa será el 14 de mayo a las 5PM! 🥰<br/>
    Prepárate para un día mágico 💫
  `;
}

// Slideshow de recuerdos
let index = 0;
const recuerdos = [
  '../assets/recuerdo1.jpg',
  '../assets/recuerdo2.jpg',
  '../assets/recuerdo3.jpg'
];

function updateSlideshow() {
  const img = document.getElementById('slideshow-img');
  img.src = recuerdos[index];
}

function nextFoto() {
  index = (index + 1) % recuerdos.length;
  updateSlideshow();
}

function prevFoto() {
  index = (index - 1 + recuerdos.length) % recuerdos.length;
  updateSlideshow();
}

updateSlideshow();
