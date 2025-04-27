// Theme Switcher arreglado
document.addEventListener('DOMContentLoaded', function() {
    // Función para cambiar el tema
    window.toggleTheme = function() {
        const body = document.body;
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Cambiar al tema opuesto
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Cambiar la clase en el body
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(newTheme + '-theme');
        
        // Actualizar icono
        const themeButton = document.getElementById('theme-toggle-dropdown');
        if (themeButton) {
            const themeIcon = themeButton.querySelector('i');
            if (themeIcon) {
                // Eliminar las clases antiguas
                themeIcon.classList.remove('fa-moon', 'fa-sun');
                // Añadir el icono correspondiente
                themeIcon.classList.add(newTheme === 'light' ? 'fa-moon' : 'fa-sun');
            }
        }
        
        // Guardar preferencia
        localStorage.setItem('theme', newTheme);
        
        console.log('Tema cambiado a:', newTheme); // Depuración
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
    const themeIcon = document.querySelector('#theme-toggle-dropdown i');
    if (themeIcon && savedTheme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
});
