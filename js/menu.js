// Manejo del menú lateral

// Referencias a elementos DOM
const menuButton = document.getElementById('menu-button');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const body = document.body;

// Abrir/cerrar el menú al hacer clic en el botón
menuButton.addEventListener('click', toggleMenu);

// Cerrar el menú al hacer clic en el overlay
overlay.addEventListener('click', closeMenu);

// Cerrar el menú al hacer clic en cualquier enlace del menú
const menuLinks = document.querySelectorAll('.menu-items a');
menuLinks.forEach(link => {
    // No cerrar si es el botón de cambio de tema
    if (link.id !== 'theme-toggle') {
        link.addEventListener('click', closeMenu);
    }
});

// Función para alternar el menú
function toggleMenu() {
    body.classList.toggle('menu-open');
}

// Función para cerrar el menú
function closeMenu() {
    body.classList.remove('menu-open');
}

// Manejar transiciones de página
document.addEventListener('DOMContentLoaded', () => {
    // Marcar el elemento activo del menú según la página actual
    const currentPage = window.location.pathname;
    
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentPage.includes(linkPath) && linkPath !== '#') {
            link.classList.add('active');
        } else if (currentPage.endsWith('/') && linkPath === 'index.html') {
            link.classList.add('active');
        }
    });
});
