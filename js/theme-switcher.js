// Theme Switcher
document.addEventListener('DOMContentLoaded', function() {
    // Función para cambiar el tema
    window.toggleTheme = function() {
        const body = document.body;
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Cambiar al tema opuesto
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Cambiar la clase en el body
        body.classList.remove(currentTheme + '-theme');
        body.classList.add(newTheme + '-theme');
        
        // Actualizar icono si existe
        const themeButton = document.getElementById('theme-toggle-dropdown');
        if (themeButton) {
            const themeIcon = themeButton.querySelector('i');
            if (themeIcon) {
                themeIcon.classList.remove(newTheme === 'light' ? 'fa-sun' : 'fa-moon');
                themeIcon.classList.add(newTheme === 'light' ? 'fa-moon' : 'fa-sun');
            }
        }
        
        // Guardar preferencia
        localStorage.setItem('theme', newTheme);
    };
    
    // Configurar evento para el botón de cambio de tema
    const themeToggle = document.getElementById('theme-toggle-dropdown');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(savedTheme + '-theme');
    
    // Actualizar el icono según el tema actual
    const themeButton = document.getElementById('theme-toggle-dropdown');
    if (themeButton && savedTheme === 'dark') {
        const themeIcon = themeButton.querySelector('i');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
});
