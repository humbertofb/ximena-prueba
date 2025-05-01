// theme-switcher.js - Versión sin iconos en el menú desplegable
console.log("Script theme-switcher.js cargado"); 

// Esperar a que el DOM esté completamente cargado
window.onload = function() {
    console.log("DOM completamente cargado");
    
    // Obtener referencias a elementos con logging
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
    
    // *** MODIFICACIÓN PRINCIPAL: Eliminar el icono del enlace de cambio de tema ***
    if (themeToggleDropdown) {
        // Verificar si el tema es oscuro o claro actualmente
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        
        // Establecer solo el texto sin icono
        themeToggleDropdown.textContent = isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
        console.log("Icono eliminado y texto del enlace establecido a:", themeToggleDropdown.textContent);
        
        // Añadir listener con depuración
        themeToggleDropdown.addEventListener('click', function(event) {
            console.log("Clic en 'Cambiar tema' detectado");
            event.preventDefault();
            
            // Alternar tema
            if (document.documentElement.classList.contains('dark-theme')) {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                console.log("Cambiado a tema claro");
                themeToggleDropdown.textContent = 'Cambiar a tema oscuro';
            } else {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                console.log("Cambiado a tema oscuro");
                themeToggleDropdown.textContent = 'Cambiar a tema claro';
            }
            
            // Intentar cerrar el menú desplegable
            if (userDropdown) {
                console.log("Intentando cerrar menú desplegable");
                userDropdown.classList.add('hidden');
                console.log("Clase 'hidden' añadida al menú");
            }
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
};

// También agregar listener en DOMContentLoaded para mayor compatibilidad
document.addEventListener('DOMContentLoaded', function() {
    console.log("Evento DOMContentLoaded disparado");
    
    // Intentamos establecer el texto sin icono lo antes posible
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    if (themeToggleDropdown) {
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        themeToggleDropdown.textContent = isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
        console.log("Texto establecido tempranamente en DOMContentLoaded");
    } else {
        console.log("Enlace no disponible todavía en DOMContentLoaded");
    }
});
