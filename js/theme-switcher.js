// theme-switcher.js - Versión corregida

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
    
    // Cerrar el menú desplegable explícitamente
    hideUserDropdown();
};

// Función para mostrar/ocultar el menú desplegable
function toggleUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.toggle('hidden');
    }
}

// Función para ocultar el menú desplegable
function hideUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.add('hidden');
        console.log("Menú cerrado después de cambiar tema");
    }
}

// Función para aplicar el tema inicial
function applyInitialTheme() {
    // Verificar el tema actual
    const currentTheme = localStorage.getItem('theme');
    console.log("Tema actual guardado:", currentTheme);
    
    // Aplicar tema guardado
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        console.log("Tema oscuro aplicado desde localStorage");
    } else if (currentTheme === 'light') {
        document.documentElement.classList.remove('dark-theme');
        console.log("Tema claro aplicado desde localStorage");
    } else {
        // Cambiar tema según hora si no hay preferencia guardada
        const hour = new Date().getHours();
        console.log("Hora actual:", hour);
        
        if (hour >= 19 || hour < 7) {
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            console.log("Tema oscuro aplicado según hora");
        } else {
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
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
    
    console.log("Configurando toggles de tema. Botón:", themeToggleButton ? "encontrado" : "no encontrado", 
                "Enlace:", themeToggleDropdown ? "encontrado" : "no encontrado", 
                "Menú:", userDropdown ? "encontrado" : "no encontrado");
    
    // Configurar el enlace de cambio de tema
    if (themeToggleDropdown) {
        // Actualizar icono según el tema actual
        updateThemeIcon();
        
        // Añadir listener que usa la función global toggleTheme
        themeToggleDropdown.addEventListener('click', function(event) {
            console.log("Clic en 'Cambiar tema' detectado");
            event.preventDefault();
            event.stopPropagation(); // Detener propagación del evento
            
            // Usar la función global toggleTheme
            window.toggleTheme();
            
            // Actualizar el icono del tema
            updateThemeIcon();
        });
    }
    
    // Manejar botón para abrir/cerrar menú
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', function(event) {
            console.log("Clic en botón de usuario detectado");
            event.preventDefault();
            event.stopPropagation();
            toggleUserDropdown();
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (userDropdown && !userDropdown.classList.contains('hidden')) {
            if (themeToggleButton && !themeToggleButton.contains(event.target) && !userDropdown.contains(event.target)) {
                hideUserDropdown();
                console.log("Menú cerrado por clic externo");
            }
        }
    });
}

// Función para actualizar el icono del tema según el tema actual
function updateThemeIcon() {
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    if (themeToggleDropdown) {
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        if (isDarkTheme) {
            themeToggleDropdown.innerHTML = '<i class="fas fa-sun"></i> Cambiar a tema claro';
        } else {
            themeToggleDropdown.innerHTML = '<i class="fas fa-moon"></i> Cambiar a tema oscuro';
        }
    }
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
    
    // Verificar que los elementos existan
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (!themeToggleDropdown) {
        console.warn("No se encontró el elemento theme-toggle-dropdown");
    }
    
    if (!userDropdown) {
        console.warn("No se encontró el elemento user-dropdown");
    } else {
        // Verificar si la clase hidden está funcionando correctamente
        if (userDropdown.classList.contains('hidden')) {
            const computedStyle = window.getComputedStyle(userDropdown);
            if (computedStyle.display !== 'none') {
                console.warn("La clase 'hidden' no está ocultando el elemento correctamente");
            }
        }
    }
    
    // Actualizar el icono según el tema actual
    updateThemeIcon();
    
    // Verificar la aplicación del tema
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    console.log("Tema actual aplicado:", isDarkTheme ? "oscuro" : "claro");
};
