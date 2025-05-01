// theme-switcher.js - Versión final optimizada

// Función para alternar el tema con retroalimentación visual
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
        
        // Añadir una alerta visual temporal para móvil
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
        
        // Actualizar el icono del botón alternativo
        updateAlternativeButton();
        
        // Cerrar el menú desplegable explícitamente
        hideUserDropdown();
    } catch (error) {
        console.error("Error en toggleTheme:", error);
        alert("Error al cambiar tema: " + error.message);
    }
};

// Función para actualizar el botón alternativo
function updateAlternativeButton() {
    const alternativeToggleArea = document.getElementById('alternative-theme-toggle');
    if (alternativeToggleArea) {
        alternativeToggleArea.innerHTML = document.documentElement.classList.contains('dark-theme') ?
                                     '<span style="font-size:24px">☀️</span>' : 
                                     '<span style="font-size:24px">🌙</span>';
    }
}

// Función para mostrar/ocultar el menú desplegable
function toggleUserDropdown() {
    try {
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            // Si está oculto, mostrarlo
            if (userDropdown.classList.contains('hidden')) {
                userDropdown.classList.remove('hidden');
                // Asegurarse de que esté visible aunque la clase hidden no funcione
                userDropdown.style.display = 'block';
                console.log("Menú de usuario mostrado");
            } else {
                // Si está visible, ocultarlo
                userDropdown.classList.add('hidden');
                userDropdown.style.display = 'none';
                console.log("Menú de usuario ocultado");
            }
        } else {
            console.error("Elemento user-dropdown no encontrado");
            alert("Error: No se encontró el menú desplegable");
        }
    } catch (error) {
        console.error("Error en toggleUserDropdown:", error);
        alert("Error con el menú desplegable: " + error.message);
    }
}

// Función para ocultar el menú desplegable
function hideUserDropdown() {
    try {
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
            // Asegurarse de que esté oculto aunque la clase hidden no funcione
            userDropdown.style.display = 'none';
            console.log("Menú cerrado después de cambiar tema");
        }
    } catch (error) {
        console.error("Error en hideUserDropdown:", error);
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

// Configurar el tema y los eventos
function setupThemeToggle() {
    try {
        // Obtener referencias a elementos
        const themeToggleButton = document.getElementById('theme-toggle-button');
        const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
        const userDropdown = document.getElementById('user-dropdown');
        
        console.log("Configurando toggles de tema. Botón:", themeToggleButton ? "encontrado" : "no encontrado", 
                    "Enlace:", themeToggleDropdown ? "encontrado" : "no encontrado", 
                    "Menú:", userDropdown ? "encontrado" : "no encontrado");
        
        // CONFIGURACIÓN DEL BOTÓN PRINCIPAL QUE ABRE EL MENÚ
        if (themeToggleButton) {
            // Eliminar todos los event listeners existentes (si los hay)
            const newButton = themeToggleButton.cloneNode(true);
            themeToggleButton.parentNode.replaceChild(newButton, themeToggleButton);
            
            // Añadir listeners para click y touchstart
            ['click', 'touchstart'].forEach(function(eventType) {
                newButton.addEventListener(eventType, function(event) {
                    console.log(eventType + " en botón de usuario detectado");
                    event.preventDefault();
                    event.stopPropagation();
                    toggleUserDropdown();
                }, { passive: false });
            });
            
            console.log("Event listeners añadidos al botón de usuario");
        } else {
            console.error("No se encontró el botón theme-toggle-button");
        }
        
        // CONFIGURACIÓN DEL ENLACE DENTRO DEL MENÚ DESPLEGABLE
        if (themeToggleDropdown) {
            // Eliminar todos los event listeners existentes (si los hay)
            const newDropdown = themeToggleDropdown.cloneNode(true);
            themeToggleDropdown.parentNode.replaceChild(newDropdown, themeToggleDropdown);
            
            // Actualizar icono según el tema actual
            updateThemeIcon();
            
            // Añadir listeners para click y touchstart
            ['click', 'touchstart'].forEach(function(eventType) {
                newDropdown.addEventListener(eventType, function(event) {
                    console.log(eventType + " en 'Cambiar tema' detectado");
                    event.preventDefault();
                    event.stopPropagation();
                    window.toggleTheme();
                }, { passive: false });
            });
            
            console.log("Event listeners añadidos al enlace de cambio de tema");
        } else {
            console.error("No se encontró el elemento theme-toggle-dropdown");
        }
        
        // Configurar cierre de menú al hacer clic fuera
        document.addEventListener('click', function(event) {
            if (userDropdown && !userDropdown.classList.contains('hidden')) {
                const themeToggleButton = document.getElementById('theme-toggle-button');
                if (themeToggleButton && !themeToggleButton.contains(event.target) && !userDropdown.contains(event.target)) {
                    hideUserDropdown();
                    console.log("Menú cerrado por clic externo");
                }
            }
        });
        
        // Si el menú desplegable existe, asegurarse de que esté oculto inicialmente
        if (userDropdown) {
            userDropdown.classList.add('hidden');
            userDropdown.style.display = 'none';
        }
    } catch (error) {
        console.error("Error en setupThemeToggle:", error);
        alert("Error configurando el cambio de tema: " + error.message);
    }
}

// Función para actualizar el icono del tema según el tema actual
function updateThemeIcon() {
    try {
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
    } catch (error) {
        console.error("Error en updateThemeIcon:", error);
    }
}

// Crear y añadir el botón alternativo
function createAlternativeButton() {
    try {
        // Comprobar si ya existe
        if (document.getElementById('alternative-theme-toggle')) {
            return;
        }
        
        const alternativeToggleArea = document.createElement('div');
        alternativeToggleArea.id = 'alternative-theme-toggle';
        alternativeToggleArea.style.position = 'fixed';
        alternativeToggleArea.style.bottom = '20px';
        alternativeToggleArea.style.right = '20px';
        alternativeToggleArea.style.width = '50px';
        alternativeToggleArea.style.height = '50px';
        alternativeToggleArea.style.borderRadius = '50%';
        alternativeToggleArea.style.backgroundColor = 'rgba(0,0,0,0.2)';
        alternativeToggleArea.style.display = 'flex';
        alternativeToggleArea.style.alignItems = 'center';
        alternativeToggleArea.style.justifyContent = 'center';
        alternativeToggleArea.style.zIndex = '999';
        alternativeToggleArea.style.cursor = 'pointer';
        alternativeToggleArea.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        alternativeToggleArea.innerHTML = document.documentElement.classList.contains('dark-theme') ?
                                        '<span style="font-size:24px">☀️</span>' : 
                                        '<span style="font-size:24px">🌙</span>';
        
        // Añadir un listener de clic para cambiar el tema directamente
        ['click', 'touchstart'].forEach(function(eventType) {
            alternativeToggleArea.addEventListener(eventType, function(event) {
                event.preventDefault();
                event.stopPropagation();
                window.toggleTheme();
            }, { passive: false });
        });
        
        document.body.appendChild(alternativeToggleArea);
        console.log("Botón alternativo de cambio de tema creado");
    } catch (error) {
        console.error("Error creando botón alternativo:", error);
    }
}

// Crear botón simple de depuración
function createDebugButton() {
    try {
        // Comprobar si ya existe
        if (document.getElementById('debug-button')) {
            return;
        }
        
        const debugButton = document.createElement('div');
        debugButton.id = 'debug-button';
        debugButton.style.position = 'fixed';
        debugButton.style.bottom = '80px';
        debugButton.style.right = '20px';
        debugButton.style.width = '50px';
        debugButton.style.height = '50px';
        debugButton.style.borderRadius = '50%';
        debugButton.style.backgroundColor = 'rgba(255,0,0,0.2)';
        debugButton.style.display = 'flex';
        debugButton.style.alignItems = 'center';
        debugButton.style.justifyContent = 'center';
        debugButton.style.zIndex = '999';
        debugButton.style.cursor = 'pointer';
        debugButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        debugButton.innerHTML = '<span style="font-size:24px">🔍</span>';
        
        debugButton.addEventListener('click', function() {
            const themeToggleButton = document.getElementById('theme-toggle-button');
            const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
            const userDropdown = document.getElementById('user-dropdown');
            
            let info = "Debug info:\n";
            info += "Theme toggle button: " + (themeToggleButton ? "encontrado" : "NO ENCONTRADO") + "\n";
            info += "Theme toggle dropdown: " + (themeToggleDropdown ? "encontrado" : "NO ENCONTRADO") + "\n";
            info += "User dropdown: " + (userDropdown ? "encontrado" : "NO ENCONTRADO") + "\n";
            info += "Tema actual: " + (document.documentElement.classList.contains('dark-theme') ? "oscuro" : "claro") + "\n";
            
            alert(info);
            
            // Intento de forzar el toggle del menú
            if (userDropdown) {
                if (userDropdown.style.display === 'none' || userDropdown.classList.contains('hidden')) {
                    userDropdown.classList.remove('hidden');
                    userDropdown.style.display = 'block';
                    alert("Menú desplegado forzadamente");
                } else {
                    userDropdown.classList.add('hidden');
                    userDropdown.style.display = 'none';
                    alert("Menú ocultado forzadamente");
                }
            }
        });
        
        document.body.appendChild(debugButton);
        console.log("Botón de depuración creado");
    } catch (error) {
        console.error("Error creando botón de depuración:", error);
    }
}

// Crear y agregar un detector de clics en toda la página para depuración
function setupClickDetector() {
    document.addEventListener('click', function(event) {
        console.log("Clic detectado en:", event.target);
        
        // Verificar clics en botones específicos
        if (event.target.id === 'theme-toggle-button' || event.target.closest('#theme-toggle-button')) {
            console.log("CLIC DETECTADO EN BOTÓN PRINCIPAL");
        }
        
        if (event.target.id === 'theme-toggle-dropdown' || event.target.closest('#theme-toggle-dropdown')) {
            console.log("CLIC DETECTADO EN ENLACE DEL MENÚ");
        }
    });
}

// Función principal de inicialización
function initThemeSwitcher() {
    console.log("Inicializando theme-switcher.js");
    try {
        applyInitialTheme();  // Aplicar tema inicial
        setupThemeToggle();   // Configurar toggles
        createAlternativeButton();  // Crear botón alternativo
        createDebugButton();  // Crear botón de depuración
        setupClickDetector(); // Configurar detector de clics
        
        console.log("Inicialización de theme-switcher.js completada");
    } catch (error) {
        console.error("Error en initThemeSwitcher:", error);
        alert("Error inicializando el cambiador de tema: " + error.message);
    }
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("Evento DOMContentLoaded disparado en theme-switcher.js");
    
    // Pequeño retraso para asegurar que el DOM está completamente cargado
    setTimeout(function() {
        initThemeSwitcher();
    }, 100);
});

// También ejecutar en window.onload para mayor compatibilidad
window.onload = function() {
    console.log("Window onload disparado en theme-switcher.js");
    
    // Reintentar inicialización
    setTimeout(function() {
        // Verificar que los elementos existan
        const themeToggleButton = document.getElementById('theme-toggle-button');
        const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
        const userDropdown = document.getElementById('user-dropdown');
        
        console.log("Verificando elementos en window.onload:");
        console.log("- Botón:", themeToggleButton ? "encontrado" : "NO ENCONTRADO");
        console.log("- Enlace:", themeToggleDropdown ? "encontrado" : "NO ENCONTRADO");
        console.log("- Menú:", userDropdown ? "encontrado" : "NO ENCONTRADO");
        
        // Si los elementos existen pero los listeners no se configuraron correctamente, intentar configurarlos de nuevo
        initThemeSwitcher();
    }, 300);
};

// Definir una función de depuración global para poder llamarla desde la consola
window.debugThemeSwitcher = function() {
    try {
        const themeToggleButton = document.getElementById('theme-toggle-button');
        const themeToggleDropdown = document.getElementById('theme-toggle-dropdown');
        const userDropdown = document.getElementById('user-dropdown');
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        
        // Forzar mostrar el menú para depuración
        if (userDropdown) {
            userDropdown.classList.remove('hidden');
            userDropdown.style.display = 'block';
            console.log("Menú desplegado para depuración");
        }
        
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
    } catch (error) {
        console.error("Error en debugThemeSwitcher:", error);
        return { error: error.message };
    }
};
