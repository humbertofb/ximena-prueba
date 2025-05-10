document.addEventListener('DOMContentLoaded', function() {
    // Verificar preferencia de tema en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('switch').checked = true;
    }

    // Ya no necesitamos el evento para cambiar tema desde el menú hamburguesa
    // porque eliminamos ese enlace

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
