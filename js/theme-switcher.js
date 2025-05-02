document.addEventListener('DOMContentLoaded', function () {
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const userDropdown = document.getElementById('user-dropdown');

    // Aplicar tema guardado o según la hora
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    } else if (!currentTheme) {
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 7) {
            document.documentElement.classList.add('dark-theme');
        }
    }

    // Mostrar texto con emoji de paleta 🎨
    if (themeToggleDropdown) {
        themeToggleDropdown.textContent = '🎨 Cambiar Tema';

        themeToggleDropdown.addEventListener('click', function (e) {
            e.preventDefault();

            // Alternar tema
            const isDark = document.documentElement.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Cerrar el menú desplegable
            if (userDropdown) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Botón de usuario que abre/cierra el menú
    if (themeToggleButton && userDropdown) {
        themeToggleButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function (e) {
        if (
            userDropdown &&
            !userDropdown.classList.contains('hidden') &&
            !userDropdown.contains(e.target) &&
            !themeToggleButton.contains(e.target)
        ) {
            userDropdown.classList.add('hidden');
        }
    });
});
