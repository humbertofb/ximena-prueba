// Archivo theme-switcher.js completamente reescrito

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    const userMenuButton = document.getElementById('user-menu-button');
    
    // Verifica si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Función para aplicar el tema oscuro
    function enableDarkTheme() {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
    
    // Función para aplicar el tema claro
    function enableLightTheme() {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
    
    // Función para alternar el tema
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark-theme')) {
            enableLightTheme();
        } else {
            enableDarkTheme();
        }
    }
    
    // Función para cambiar el tema según la hora del día
    function setThemeByTime() {
        const currentHour = new Date().getHours();
        // Tema oscuro entre las 19:00 y las 7:00
        if (currentHour >= 19 || currentHour < 7) {
            enableDarkTheme();
        } else {
            enableLightTheme();
        }
    }
    
    // Aplicar tema guardado o configurar por hora si es la primera visita
    if (savedTheme) {
        if (savedTheme === 'dark') {
            enableDarkTheme();
        } else {
            enableLightTheme();
        }
    } else {
        // Si no hay tema guardado, establecer según la hora
        setThemeByTime();
    }
    
    // Asegurarse de que el texto del menú desplegable es siempre "Cambiar tema"
    if (themeToggleDropdown) {
        themeToggleDropdown.innerHTML = '<i class="fas fa-palette"></i> Cambiar tema';
    }
    
    // Event listener para el botón de cambio de tema en el menú desplegable
    if (themeToggleDropdown) {
        themeToggleDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
            
            // Cerrar el menú desplegable después de cambiar el tema
            if (userDropdown) {
                userDropdown.classList.add('hidden');
                
                // Solución adicional: force el cierre usando display none
                userDropdown.style.display = 'none';
                
                // Restaurar el display después de un breve retraso
                setTimeout(function() {
                    userDropdown.style.display = '';
                }, 100);
            }
        });
    }
    
    // Botón de usuario que muestra/oculta el menú desplegable
    if (userMenuButton) {
        userMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (userDropdown) {
                userDropdown.classList.toggle('hidden');
            }
        });
    }
    
    // Cerrar el menú desplegable al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (userDropdown && !userDropdown.classList.contains('hidden') && 
            !userMenuButton.contains(e.target) && 
            !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
});
