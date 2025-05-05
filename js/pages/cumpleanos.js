function toggleMenu() {
  document.body.classList.toggle("menu-open");
}

function abrirRegalo() {
  const mensaje = document.querySelector('.mensaje-container');
  mensaje.classList.remove('hidden');
  setTimeout(() => mensaje.classList.add('show'), 100);

  // Confeti animado
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 }
  });

  // Desplaza hacia el mensaje
  mensaje.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  const audio = document.getElementById("audio");

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      audio.play();
    } else {
      audio.pause();
    }
  });
});
