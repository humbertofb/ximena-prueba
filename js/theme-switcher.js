// theme-switcher.js mejorado
console.log("Script theme-switcher.js cargado");

// Definir la función toggleTheme para que esté disponible globalmente
window.toggleTheme = function() {
    console.log("Función toggleTheme llamada");
    
    // Alternar tema
    if (document.documentElement.classList.contains('dark-theme')) {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        console.log("Cambiado a tema claro");
    } else {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        console.log("Cambiado a tema oscuro");
    }
    
    // Cerrar el menú desplegable
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.add('hidden');
        console.log("Menú cerrado después de cambiar tema");
    }
};

// Configuración al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("Evento DOMContentLoaded disparado");
    
    // Obtener referencias a elementos
    const themeToggleButton = document.getElementById('theme-toggle-button');
    console.log("Botón de usuario:", themeToggleButton);
    
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    console.log("Enlace cambio tema:", themeToggleDropdown);
    
    const userDropdown = document.getElementById('user-dropdown');
    console.log("Menú desplegable:", userDropdown);
    
    // Verificar el tema actual
    const currentTheme = localStorage.getItem('theme');
    console.log("Tema actual guardado:", currentTheme);
    
    // Aplicar tema guardado
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        console.log("Tema oscuro aplicado desde localStorage");
    }
    
    // Cambiar tema según hora si no hay preferencia guardada
    if (!currentTheme) {
        const hour = new Date().getHours();
        console.log("Hora actual:", hour);
        
        if (hour >= 19 || hour < 7) {
            document.documentElement.classList.add('dark-theme');
            console.log("Tema oscuro aplicado según hora");
        } else {
            console.log("Tema claro aplicado según hora");
        }
    }
    
    // Configurar el enlace de cambio de tema
    if (themeToggleDropdown) {
        themeToggleDropdown.innerHTML = '<i class="fas fa-palette"></i> Cambiar tema';
        console.log("Texto del enlace establecido a 'Cambiar tema'");
        
        // Añadir listener que usa la función global toggleTheme
        themeToggleDropdown.addEventListener('click', function(event) {
            console.log("Clic en 'Cambiar tema' detectado");
            event.preventDefault();
            toggleTheme();
        });
    } else {
        console.error("No se encontró el elemento con ID 'theme-toggle-dropdown'");
    }
    
    // Manejar botón para abrir/cerrar menú
    if (themeToggleButton && userDropdown) {
        themeToggleButton.addEventListener('click', function(event) {
            console.log("Clic en botón de usuario detectado");
            event.preventDefault();
            event.stopPropagation();
            userDropdown.classList.toggle('hidden');
            console.log("Alternado visibilidad del menú desplegable");
        });
    } else {
        console.error("No se encontró el botón de usuario o el menú desplegable");
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (userDropdown && !userDropdown.classList.contains('hidden')) {
            if (themeToggleButton && !themeToggleButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
                console.log("Menú cerrado por clic externo");
            }
        }
    });
});

// Mantener también el listener en window.onload para máxima compatibilidad
window.onload = function() {
    console.log("DOM completamente cargado (window.onload)");
    // No es necesario duplicar la lógica, ya que toggleTheme ahora es global
    // y el listener de DOMContentLoaded ya estableció todo
};
