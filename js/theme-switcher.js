document.addEventListener('DOMContentLoaded', function() {
    // Verificar preferencia de tema en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('switch').checked = true;
    }

    // Evento para cambiar tema desde el menú hamburguesa
    const themeToggleLink = document.getElementById('theme-toggle');
    if (themeToggleLink) {
        themeToggleLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // Evento para el nuevo switch de tema
    const themeSwitch = document.getElementById('switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function() {
            toggleTheme();
        });
    }

    // Función para cambiar el tema
    function toggleTheme() {
        const isDarkTheme = document.body.classList.toggle('dark-theme');
        
        // Actualizar el estado del switch
        if (themeSwitch) {
            themeSwitch.checked = isDarkTheme;
        }
        
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }
});
