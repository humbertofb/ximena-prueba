// Versión corregida
document.addEventListener('DOMContentLoaded', function() {
    // Función para cambiar el tema
    window.toggleTheme = function() {
        const body = document.body;
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Cambiar al tema opuesto
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Cambiar la clase en el body
        body.classList.toggle('dark-theme', newTheme === 'dark');
        
        // Actualizar icono
        const themeButton = document.getElementById('theme-toggle-dropdown');
        if (themeButton) {
            const themeIcon = themeButton.querySelector('i');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon', 'fa-sun');
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
            
            // Cerrar el dropdown después de cambiar el tema
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
        });
    }
    
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    
    // Actualizar el icono según el tema actual
    const themeIcon = document.querySelector('#theme-toggle-dropdown i');
    if (themeIcon && savedTheme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
});
