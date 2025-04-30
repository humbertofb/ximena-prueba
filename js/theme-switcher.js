// Reemplaza completamente tu archivo theme-switcher.js con esto
document.addEventListener('DOMContentLoaded', function() {
    // Elementos que necesitaremos
    const themeToggleBtn = document.getElementById('theme-toggle-dropdown');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Función simplificada para cambiar el tema
    function toggleTheme() {
        // 1. Verificar el tema actual
        const isDarkTheme = document.body.classList.contains('dark-theme');
        console.log('Tema actual:', isDarkTheme ? 'oscuro' : 'claro');
        
        // 2. Aplicar el tema contrario
        if (isDarkTheme) {
            // Cambiar a tema claro
            document.body.classList.remove('dark-theme');
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            console.log('Cambiado a tema claro');
            
            // Cambiar icono a luna (tema claro)
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        } else {
            // Cambiar a tema oscuro
            document.body.classList.add('dark-theme');
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            console.log('Cambiado a tema oscuro');
            
            // Cambiar icono a sol (tema oscuro)
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
        
        // 3. Cerrar el menú desplegable
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    }
    
    // Inicializar tema según localStorage
    const savedTheme = localStorage.getItem('theme');
    console.log('Tema guardado:', savedTheme);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.documentElement.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
    
    // Asignar evento al botón de tema
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
        console.log('Evento asignado al botón de tema');
    } else {
        console.error('No se encontró el botón de tema (#theme-toggle-dropdown)');
    }
});
