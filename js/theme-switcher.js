// theme-switcher.js - Versión corregida

// Definir la función toggleTheme para que esté disponible globalmente
window.toggleTheme = function() {
    console.log("Función toggleTheme llamada");
    
    try {
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
        
        // Añadir una alerta visual temporal para móvil (se eliminará automáticamente después de 1.5 segundos)
        const feedbackElement = document.createElement('div');
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.top = '20px';
        feedbackElement.style.left = '50%';
        feedbackElement.style.transform = 'translateX(-50%)';
        feedbackElement.style.padding = '10px 20px';
        feedbackElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        feedbackElement.style.color = 'white';
        feedbackElement.style.borderRadius = '5px';
        feedbackElement.style.zIndex = '9999';
        feedbackElement.textContent = document.documentElement.classList.contains('dark-theme') ? 
                                      '🌙 Tema oscuro activado' : '☀️ Tema claro activado';
        document.body.appendChild(feedbackElement);
        
        // Eliminar el elemento después de 1.5 segundos
        setTimeout(function() {
            if (document.body.contains(feedbackElement)) {
                document.body.removeChild(feedbackElement);
            }
        }, 1500);
        
        // Actualizar el icono después de cambiar el tema
        updateThemeIcon();
        
        // Cerrar el menú desplegable explícitamente
        hideUserDropdown();
    } catch (error) {
        console.error("Error en toggleTheme:", error);
        // Intento de recuperación en caso de error
        document.location.reload();
    }
};

// Función para mostrar/ocultar el menú desplegable
function toggleUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.toggle('hidden');
        console.log("Menú de usuario alternado");
    } else {
        console.error("Elemento user-dropdown no encontrado");
    }
}

// Función para ocultar el menú desplegable
function hideUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.add('hidden');
        console.log("Menú cerrado después de cambiar tema");
    } else {
        console.error("Elemento user-dropdown no encontrado");
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
    
    // Configurar el botón principal de cambio de tema (el botón que abre el menú)
    if (themeToggleButton) {
        // Añadir listeners tanto para click como para touchstart (dispositivos móviles)
        ['click', 'touchstart'].forEach(function(eventType) {
            themeToggleButton.addEventListener(eventType, function(event) {
                console.log(eventType + " en botón de usuario detectado");
                event.preventDefault();
                event.stopPropagation();
                toggleUserDropdown();
            });
        });
    } else {
        console.error("No se encontró el botón theme-toggle-button");
    }
    
    // Configurar el enlace de cambio de tema dentro del menú desplegable
    if (themeToggleDropdown) {
        // Actualizar icono según el tema actual
        updateThemeIcon();
        
        // Añadir listeners tanto para click como para touchstart (dispositivos móviles)
        ['click', 'touchstart'].forEach(function(eventType) {
            themeToggleDropdown.addEventListener(eventType, function(event) {
                console.log(eventType + " en 'Cambiar tema' detectado");
                event.preventDefault();
                event.stopPropagation(); // Detener propagación del evento
                
                // Usar la función global toggleTheme
                window.toggleTheme();
            });
        });
    } else {
        console.error("No se encontró el elemento theme-toggle-dropdown");
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
    const themeToggleButton = document.getElementById('theme-toggle-button');
    
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    
    // Actualizar el texto e icono en el menú desplegable
    if (themeToggleDropdown) {
        if (isDarkTheme) {
            themeToggleDropdown.innerHTML = '<i class="fas fa-sun"></i> Cambiar a tema claro';
        } else {
            themeToggleDropdown.innerHTML = '<i class="fas fa-moon"></i> Cambiar a tema oscuro';
        }
    }
    
    // Actualizar también el icono del botón principal (opcional)
    if (themeToggleButton) {
        // Buscar un elemento icon dentro del botón
        const buttonIcon = themeToggleButton.querySelector('i');
        if (buttonIcon) {
            if (isDarkTheme) {
                buttonIcon.className = buttonIcon.className.replace(/fa-moon/g, 'fa-sun');
            } else {
                buttonIcon.className = buttonIcon.className.replace(/fa-sun/g, 'fa-moon');
            }
        }
    }
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("Evento DOMContentLoaded disparado en theme-switcher.js");
    applyInitialTheme();
    setupThemeToggle();
    
    // Añadir un clic directo para móviles
    // Esto es una solución alternativa que permite cambiar el tema con un clic en cualquier parte específica
    const alternativeToggleArea = document.createElement('div');
    alternativeToggleArea.id = 'alternative-theme-toggle';
    alternativeToggleArea.style.position = 'fixed';
    alternativeToggleArea.style.bottom = '20px';
    alternativeToggleArea.style.right = '20px';
    alternativeToggleArea.style.width = '50px';
    alternativeToggleArea.style.height = '50px';
    alternativeToggleArea.style.borderRadius = '50%';
    alternativeToggleArea.style.backgroundColor = 'rgba(0,0,0,0.1)';
    alternativeToggleArea.style.display = 'flex';
    alternativeToggleArea.style.alignItems = 'center';
    alternativeToggleArea.style.justifyContent = 'center';
    alternativeToggleArea.style.zIndex = '999';
    alternativeToggleArea.style.cursor = 'pointer';
    alternativeToggleArea.innerHTML = document.documentElement.classList.contains('dark-theme') ?
                                     '<span style="font-size:24px">☀️</span>' : 
                                     '<span style="font-size:24px">🌙</span>';
    
    // Añadir un listener de clic para cambiar el tema directamente
    ['click', 'touchstart'].forEach(function(eventType) {
        alternativeToggleArea.addEventListener(eventType, function(event) {
            event.preventDefault();
            event.stopPropagation();
            window.toggleTheme();
            // Actualizar el icono después de cambiar
            this.innerHTML = document.documentElement.classList.contains('dark-theme') ?
                           '<span style="font-size:24px">☀️</span>' : 
                           '<span style="font-size:24px">🌙</span>';
        });
    });
    
    document.body.appendChild(alternativeToggleArea);
});

// También ejecutar en window.onload para mayor compatibilidad
window.onload = function() {
    console.log("Window onload disparado en theme-switcher.js");
    
    // Verificar que los elementos existan
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    
    console.log("Verificando elementos en window.onload:");
    if (!themeToggleButton) {
        console.error("No se encontró el elemento theme-toggle-button");
    }
    
    if (!themeToggleDropdown) {
        console.error("No se encontró el elemento theme-toggle-dropdown");
    }
    
    if (!userDropdown) {
        console.error("No se encontró el elemento user-dropdown");
    } else {
        // Verificar si la clase hidden está funcionando correctamente
        if (userDropdown.classList.contains('hidden')) {
            const computedStyle = window.getComputedStyle(userDropdown);
            if (computedStyle.display !== 'none') {
                console.warn("La clase 'hidden' no está ocultando el elemento correctamente");
            }
        }
    }
    
    // Si los elementos existen pero los listeners no se configuraron correctamente, intentar configurarlos de nuevo
    if (themeToggleButton && themeToggleDropdown) {
        setupThemeToggle();
    }
    
    // Actualizar el icono según el tema actual
    updateThemeIcon();
    
    // Verificar la aplicación del tema
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    console.log("Tema actual aplicado:", isDarkTheme ? "oscuro" : "claro");
};

// Agregar una función para depuración que se pueda llamar desde la consola
window.debugThemeSwitcher = function() {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
    const userDropdown = document.getElementById('user-dropdown');
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    
    console.group("Debug Theme Switcher");
    console.log("Estado actual del tema:", isDarkTheme ? "oscuro" : "claro");
    console.log("localStorage theme:", localStorage.getItem('theme'));
    console.log("Elemento theme-toggle-button:", themeToggleButton);
    console.log("Elemento theme-toggle-dropdown:", themeToggleDropdown);
    console.log("Elemento user-dropdown:", userDropdown);
    console.log("user-dropdown tiene clase hidden:", userDropdown ? userDropdown.classList.contains('hidden') : "N/A");
    console.groupEnd();
    
    return {
        themeToggleButton,
        themeToggleDropdown,
        userDropdown,
        isDarkTheme,
        localStorageTheme: localStorage.getItem('theme')
    };
};
