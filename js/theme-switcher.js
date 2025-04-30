document.addEventListener('DOMContentLoaded', function() {
    // Función para aplicar el tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.remove('dark-theme');
        }
        
        // Actualizar cualquier ícono presente
        updateThemeIcons(theme);
        
        // Guardar preferencia
        localStorage.setItem('theme', theme);
        
        console.log('Tema aplicado:', theme); // Ayuda a depurar
    }

    // Actualiza todos los posibles iconos de tema en la página
    function updateThemeIcons(theme) {
        // Buscar por ID específico
        const themeToggleIcon = document.querySelector('#theme-toggle-dropdown i, #theme-toggle i, .theme-toggle i');
        if (themeToggleIcon) {
            themeToggleIcon.classList.remove('fa-moon', 'fa-sun');
            themeToggleIcon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
        }
        
        // Buscar por clase (alternativa)
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.classList.remove('fa-moon', 'fa-sun');
            icon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
        });
    }

    // Función global para cambiar el tema
    window.toggleTheme = function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        console.log('Cambiando tema de', currentTheme, 'a', newTheme); // Ayuda a depurar
        
        applyTheme(newTheme);
        
        // Cerrar cualquier dropdown abierto (si existe)
        const dropdowns = document.querySelectorAll('.dropdown-content, .dropdown-menu, #user-dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
            }
        });
        
        return newTheme; // Retorna el nuevo tema (útil para testing)
    };

    // Inicializar tema al cargar la página
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    
    // Añadir event listener a todos los posibles botones de tema
    const themeToggles = document.querySelectorAll('#theme-toggle-dropdown, #theme-toggle, .theme-toggle, [data-toggle="theme"]');
    themeToggles.forEach(toggle => {
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Evitar propagación del evento
                toggleTheme();
            });
            console.log('Event listener añadido a:', toggle.id || toggle.className); // Ayuda a depurar
        }
    });
    
    // También responder a cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
    });
});
