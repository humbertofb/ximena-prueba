document.addEventListener('DOMContentLoaded', function() {
    // Función para aplicar el tema con más información de debug
    function applyTheme(theme) {
        console.log('Aplicando tema:', theme);
        
        // Eliminar clases primero para evitar conflictos
        document.body.classList.remove('dark-theme', 'light-theme');
        document.documentElement.classList.remove('dark-theme', 'light-theme');
        
        // Añadir la clase del tema actual
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark-theme');
            document.body.style.backgroundColor = '#1a1a1a'; // Forzar cambio de color
            document.body.style.color = '#f0f0f0'; // Forzar cambio de color de texto
            console.log('Clase dark-theme aplicada al body:', document.body.classList.contains('dark-theme'));
            console.log('Clase dark-theme aplicada al html:', document.documentElement.classList.contains('dark-theme'));
        } else {
            document.body.classList.add('light-theme');
            document.documentElement.classList.add('light-theme');
            document.body.style.backgroundColor = ''; // Restaurar a default
            document.body.style.color = ''; // Restaurar a default
            console.log('Clase light-theme aplicada al body:', document.body.classList.contains('light-theme'));
            console.log('Clase light-theme aplicada al html:', document.documentElement.classList.contains('light-theme'));
        }
        
        // Actualizar cualquier ícono presente
        updateThemeIcons(theme);
        
        // Guardar preferencia
        localStorage.setItem('theme', theme);
        
        console.log('Classes en body después de cambio:', document.body.className);
        console.log('Color de fondo actual:', getComputedStyle(document.body).backgroundColor);
        
        // Forzar un repintado del DOM
        document.body.offsetHeight;
    }

    // Actualiza todos los posibles iconos de tema en la página
    function updateThemeIcons(theme) {
        console.log('Actualizando iconos para tema:', theme);
        
        // Buscar por ID específico
        const themeToggleIcon = document.querySelector('#theme-toggle-dropdown i, #theme-toggle i, .theme-toggle i');
        if (themeToggleIcon) {
            themeToggleIcon.classList.remove('fa-moon', 'fa-sun');
            themeToggleIcon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
            console.log('Icono actualizado:', themeToggleIcon.className);
        } else {
            console.log('No se encontró el icono de tema');
        }
    }

    // Función global para cambiar el tema
    window.toggleTheme = function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        console.log('Cambiando tema de', currentTheme, 'a', newTheme);
        
        applyTheme(newTheme);
        
        // Cerrar cualquier dropdown abierto (si existe)
        const dropdowns = document.querySelectorAll('.dropdown-content, .dropdown-menu, #user-dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
                console.log('Dropdown cerrado:', dropdown.id || dropdown.className);
            }
        });
        
        // Emitir un evento personalizado que indique el cambio de tema
        const event = new CustomEvent('themeChanged', { detail: { theme: newTheme } });
        document.dispatchEvent(event);
        
        return newTheme; // Retorna el nuevo tema (útil para testing)
    };

    // Inicializar tema al cargar la página
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    console.log('Tema inicial cargado:', savedTheme);
    applyTheme(savedTheme);
    
    // Añadir event listener a todos los posibles botones de tema
    const themeToggles = document.querySelectorAll('#theme-toggle-dropdown, #theme-toggle, .theme-toggle, [data-toggle="theme"]');
    themeToggles.forEach(toggle => {
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                console.log('Botón de tema clickeado:', toggle.id || toggle.className);
                e.preventDefault();
                e.stopPropagation(); // Evitar propagación del evento
                toggleTheme();
            });
            console.log('Event listener añadido a:', toggle.id || toggle.className);
        }
    });
    
    // Reportar si no se encontraron botones de tema
    if (themeToggles.length === 0) {
        console.warn('No se encontraron botones para cambiar el tema. Verifica los selectores.');
    }
    
    // También responder a cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log('Preferencia del sistema cambiada a:', newTheme);
        applyTheme(newTheme);
    });
    
    // Evento de carga completa
    window.addEventListener('load', function() {
        console.log('Página completamente cargada. Estado del tema:', localStorage.getItem('theme'));
        console.log('Classes en body:', document.body.className);
    });
});
