// menu.js
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const sideMenu = document.getElementById('side-menu'); // Referencia al menú
    const menuLinks = sideMenu ? sideMenu.querySelectorAll('.menu-items a') : []; // Solo si sideMenu existe
    const mainContent = document.getElementById('main-content');

    if (menuButton && sideMenu && overlay) { // Asegurarse que todos los elementos existen
        menuButton.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);
    } else {
        console.warn("Elementos del menú (botón, sideMenu o overlay) no encontrados. El menú no funcionará.");
    }

    function toggleMenu() {
        body.classList.toggle('menu-open');
        if (mainContent) { // Solo modificar si mainContent existe
            // Solo activar el desplazamiento si el menú se está abriendo y es desktop
            const menuIsOpen = body.classList.contains('menu-open');
            const isDesktop = window.innerWidth > 768; // O tu breakpoint

            if (menuIsOpen && isDesktop) {
                mainContent.classList.add('active');
            } else {
                mainContent.classList.remove('active'); // Quitar si se cierra o es móvil
            }
        }
    }

    function closeMenu() {
        body.classList.remove('menu-open');
        if (mainContent) {
            mainContent.classList.remove('active');
        }
    }

    // Resaltar enlace activo y cerrar menú al hacer clic en enlace
    const currentLocation = window.location.pathname;
    const currentOrigin = window.location.origin;

    menuLinks.forEach(link => {
        const linkUrl = new URL(link.href, currentOrigin);
        const linkPath = linkUrl.pathname;
        
        let isCurrentPage = (currentLocation === linkPath);
        if ((currentLocation === '/' || currentLocation.endsWith('index.html')) && 
            (linkPath.endsWith('index.html') || linkPath === '/')) {
            // Normalizar para que / y /index.html se traten igual para el enlace de inicio
            const normCurrent = currentLocation.endsWith('index.html') ? currentLocation : currentLocation + (currentLocation.endsWith('/') ? 'index.html' : '/index.html');
            const normLink = linkPath.endsWith('index.html') ? linkPath : linkPath + (linkPath.endsWith('/') ? 'index.html' : '/index.html');
            if (normCurrent.includes(normLink) || normLink.includes(normCurrent)){ // Hacerlo más flexible
                 isCurrentPage = true;
            }
        }
         // Casos especiales como preguntas.html
        if (currentLocation.includes(linkPath.substring(linkPath.lastIndexOf('/') + 1)) && linkPath.substring(linkPath.lastIndexOf('/') + 1) !== 'index.html' && linkPath !== '/') {
           isCurrentPage = true;
        }


        if (link.getAttribute('href') === '#' || link.getAttribute('href').startsWith('javascript:')) {
            isCurrentPage = false;
        }
        
        if (isCurrentPage) {
            // Primero quitar 'active' de todos los demás
            menuLinks.forEach(el => el.classList.remove('active'));
            link.classList.add('active');
        }
        // No necesitas un 'else remove' aquí si ya lo haces arriba para todos.

        link.addEventListener('click', function(e) {
            // Si es un enlace que efectivamente navega (no es solo #)
            if (link.getAttribute('href') && link.getAttribute('href') !== '#') {
                 // Cerrar menú en móvil o si el menú no debe permanecer abierto (decisión de UX)
                if (window.innerWidth < 768 || !link.classList.contains('no-close-menu')) {
                     closeMenu();
                }
            }
        });
    });
});
