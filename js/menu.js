document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const menuLinks = document.querySelectorAll('.side-menu .menu-items a'); // Más específico

    // 1. Abrir/Cerrar Menú con botón y overlay
    if (menuButton) {
        menuButton.addEventListener('click', toggleMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    function toggleMenu() {
        body.classList.toggle('menu-open');
        // Si quieres que el contenido principal se desplace en desktop:
        const mainContent = document.getElementById('main-content');
        if (mainContent && window.innerWidth > 768) { // Ajusta el breakpoint si es necesario
            mainContent.classList.toggle('active', body.classList.contains('menu-open'));
        }
    }

    function closeMenu() {
        body.classList.remove('menu-open');
        const mainContent = document.getElementById('main-content');
        if (mainContent && window.innerWidth > 768) {
            mainContent.classList.remove('active');
        }
    }

    // 2. Resaltar enlace activo y cerrar menú al hacer clic en enlace
    const currentLocation = window.location.pathname;
    const currentOrigin = window.location.origin;

    menuLinks.forEach(link => {
        // Normalizar href del enlace para comparación precisa
        const linkUrl = new URL(link.href, currentOrigin); // Asegura que sea una URL absoluta
        const linkPath = linkUrl.pathname;
        const linkHash = linkUrl.hash; // Considerar hashes si son relevantes para "páginas"

        // Lógica para determinar si es la página actual
        // Compara pathname. Si es la raíz, verifica contra 'index.html' también.
        let isCurrentPage = (currentLocation === linkPath);
        if (currentLocation === '/' && linkPath.endsWith('index.html')) {
            isCurrentPage = true;
        }
        if (currentLocation.endsWith('index.html') && linkPath === '/') {
             isCurrentPage = true;
        }
        // Si tu logout es un '#' o javascript:void(0), no lo marques como activo
        if (link.getAttribute('href') === '#' || link.getAttribute('href').startsWith('javascript:')) {
            isCurrentPage = false;
        }
        
        // Aplicar/Quitar clase 'active'
        if (isCurrentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }

        // Cerrar menú al hacer clic en un enlace (excepto si es un ancla en la misma página)
        link.addEventListener('click', function(e) {
            const isSamePageAnchor = linkPath === currentLocation && linkHash !== '';
            const isLogoutButton = link.id === 'logout-button'; // Asumiendo que tu botón de logout tiene este ID

            // No cerrar si es un ancla en la misma página y el menú ya está abierto en desktop (opcional)
            // Cerrar siempre en móvil, o si navega a otra página.
            // Si el logout es un simple '#', siempre cerramos.
            if (!isSamePageAnchor || window.innerWidth < 768 || isLogoutButton || link.getAttribute('href') === '#') {
                // Solo cerrar si el enlace no es el botón de logout que podría tener su propia lógica de modal
                // o si es una navegación real.
                if (link.getAttribute('href') !== '#' || isLogoutButton) { // Evita cerrar por enlaces tipo ancla '#' sin destino
                     // No cerrar si el enlace es el botón de logout que necesita permanecer para confirmación, etc.
                     // A menos que el logout SÍ navegue inmediatamente. Es una decisión de UX.
                    if (link.id !== 'logout-button' || !link.getAttribute('href').startsWith('javascript:')) { // Ajusta esta lógica si el logout tiene un modal
                        closeMenu();
                    }
                }
            }
        });
    });

    // Asegúrate que el desplazamiento del contenido principal se maneje
    // en conjunto con la clase 'menu-open' en el body.
    // Tu CSS debería tener algo como:
    // @media (min-width: 769px) {
    //     body.menu-open #main-content.active { /* O solo body.menu-open #main-content si 'active' no es necesaria */
    //         margin-left: var(--side-menu-width);
    //     }
    // }
});
