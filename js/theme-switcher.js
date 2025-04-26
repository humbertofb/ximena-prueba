// Cambio de tema claro/oscuro

// Referencias a elementos DOM
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// Verificar preferencia guardada o establecer según la hora
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Aplicar tema guardado
        applyTheme(savedTheme);
    } else {
        // Aplicar tema según la hora del día
        applyAutoTheme();
    }
});

// Cambiar tema al hacer clic en el botón
themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Comprobar tema actual
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    // Cambiar al tema opuesto
    const newTheme = isDarkTheme ? 'light' : 'dark';
    applyTheme(newTheme);
    
    // Guardar preferencia
    localStorage.setItem('theme', newTheme);
});

// Aplicar tema automático según la hora
function applyAutoTheme() {
    const currentHour = new Date().getHours();
    
    // Modo oscuro de 19:00 a 7:00
    if (currentHour >= 19 || currentHour < 7) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

// Aplicar tema específico
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Actualizar tema automáticamente al cambiar de hora
function updateAutoThemeInterval() {
    // Solo actualizar si no hay preferencia guardada
    if (!localStorage.getItem('theme')) {
        applyAutoTheme();
    }
}

// Comprobar cambio de hora cada minuto
setInterval(updateAutoThemeInterval, 60000);
