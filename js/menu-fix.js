// Este script arregla los problemas de navegación del menú
document.addEventListener('DOMContentLoaded', function() {
    // Configuración del botón de menú hamburguesa
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            menuButton.classList.toggle('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
            menuButton.classList.remove('active');
        });
    }
    
    // Detectar la página actual para resaltar el enlace correcto en el menú
    const currentLocation = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-items a');
    
    menuLinks.forEach(link => {
        // Normalizar las rutas para la comparación
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // Detectar si esta es la página actual o la página de inicio
        const isCurrentPage = currentLocation === linkPath || 
                               (currentLocation === '/' && linkPath.endsWith('index.html')) ||
                               (currentLocation.endsWith('index.html') && linkPath === '/');
        
        // Aplicar clase activa al enlace correspondiente
        if (isCurrentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
        
        // Asegurarse de que los enlaces del menú funcionan correctamente
        link.addEventListener('click', function(e) {
            // No interrumpir la navegación normal
            // Solo cerramos el menú en dispositivos móviles
            if (window.innerWidth < 768) {
                sideMenu.classList.remove('active');
                overlay.classList.remove('active');
                menuButton.classList.remove('active');
            }
        });
    });
});
