// Archivo theme-switcher.js mejorado

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    
    // Verifica si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Función para aplicar el tema oscuro
    function enableDarkTheme() {
        document.documentElement.classList.add('dark-theme');
        // Cambiar el ícono en el menú desplegable
        if (themeToggleDropdown) {
            themeToggleDropdown.innerHTML = '<i class="fas fa-sun"></i> Cambiar a Tema Claro';
        }
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', 'dark');
    }
    
    // Función para aplicar el tema claro
    function enableLightTheme() {
        document.documentElement.classList.remove('dark-theme');
        // Cambiar el ícono en el menú desplegable
        if (themeToggleDropdown) {
            themeToggleDropdown.innerHTML = '<i class="fas fa-moon"></i> Cambiar a Tema Oscuro';
        }
        // Guardar preferencia en localStorage
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
    
    // Event listener para el botón de cambio de tema en el menú desplegable
    if (themeToggleDropdown) {
        themeToggleDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
            
            // Cerrar el menú desplegable automáticamente
            if (userDropdown) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Event listener para el botón de usuario que abre/cierra el menú desplegable
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', function(e) {
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
            !themeToggleButton.contains(e.target) && 
            !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
});
