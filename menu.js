const toggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

toggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== toggle) {
    sidebar.classList.remove('show');
  }
});

// Ocultar menú al hacer clic en enlaces
const links = document.querySelectorAll('#sidebar a');
links.forEach(link => {
  link.addEventListener('click', () => sidebar.classList.remove('show'));
});
