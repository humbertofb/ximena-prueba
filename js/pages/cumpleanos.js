// Menú hamburguesa
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Regalo y mensaje
const openBtn = document.getElementById('openGift');
const lid = document.querySelector('.lid');
const message = document.getElementById('message');

openBtn.addEventListener('click', () => {
  lid.style.transform = 'rotateX(120deg)';
  setTimeout(() => {
    message.classList.remove('hidden');
    message.classList.add('show');
  }, 800);
});

// Botón música
const toggle = document.getElementById('toggle-audio');
const audio = document.getElementById('birthday-audio');
toggle.addEventListener('change', () => {
  if (toggle.checked) {
    audio.play();
  } else {
    audio.pause();
  }
});

// Tema claro/oscuro
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});
