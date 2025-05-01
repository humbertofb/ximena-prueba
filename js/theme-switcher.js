// theme-switcher.js - Versión simplificada y funcional

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

// Función para aplicar el tema inicial
function applyInitialTheme() {
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
}

// Configurar el evento de clic para el botón de cambio de tema
function setupThemeToggle() {
    // Obtener referencias a elementos
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    
    // Configurar el enlace de cambio de tema
    if (themeToggleDropdown) {
        themeToggleDropdown.innerHTML = '<i class="fas fa-palette"></i> Cambiar tema';
        
        // Añadir listener que usa la función global toggleTheme
        themeToggleDropdown.addEventListener('click', function(event) {
            console.log("Clic en 'Cambiar tema' detectado");
            event.preventDefault();
            // Usar la función global toggleTheme
            window.toggleTheme();
        });
    }
    
    // Manejar botón para abrir/cerrar menú
    if (themeToggleButton && userDropdown) {
        themeToggleButton.addEventListener('click', function(event) {
            console.log("Clic en botón de usuario detectado");
            event.preventDefault();
            event.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
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
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("Evento DOMContentLoaded disparado en theme-switcher.js");
    applyInitialTheme();
    setupThemeToggle();
});

// También ejecutar en window.onload para mayor compatibilidad
window.onload = function() {
    console.log("Window onload disparado en theme-switcher.js");
    // Solo verificar los elementos, la lógica principal está en DOMContentLoaded
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    if (!themeToggleDropdown) {
        console.warn("No se encontró el elemento theme-toggle-dropdown");
    }
};
