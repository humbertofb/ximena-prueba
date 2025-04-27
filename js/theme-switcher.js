document.addEventListener('DOMContentLoaded', function() {
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    function updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle-dropdown i');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon', 'fa-sun');
            themeIcon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
        }
    }

    window.toggleTheme = function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        applyTheme(newTheme);
        updateThemeIcon(newTheme);

        localStorage.setItem('theme', newTheme);

        // Cerrar dropdown
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggle = document.getElementById('theme-toggle-dropdown');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
});
