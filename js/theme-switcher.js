// theme-switcher.js simplificado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }
    
    // Función para cambiar tema según la hora
    function setThemeByTime() {
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 7) {
            document.documentElement.classList.add('dark-theme');
        }
    }
    
    // Si no hay tema guardado, usar hora
    if (!savedTheme) {
        setThemeByTime();
    }
    
    // Establecer texto fijo
    if (themeToggleDropdown) {
        themeToggleDropdown.innerHTML = '<i class="fas fa-palette"></i> Cambiar tema';
        
        // Event listener para cambio de tema
        themeToggleDropdown.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Cambiar tema
            if (document.documentElement.classList.contains('dark-theme')) {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            }
            
            // Cerrar menú desplegable
            if (userDropdown) {
                userDropdown.classList.add('hidden');
            }
            
            console.log('Tema cambiado'); // Para depuración
        });
    }
    
    // Event listener para abrir/cerrar menú de usuario
    const userMenuButton = document.getElementById('user-menu-button');
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (userDropdown && !userDropdown.classList.contains('hidden')) {
            if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
        }
    });
});
