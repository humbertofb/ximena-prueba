// Funciones de autenticación

// Referencias a elementos DOM
const loginScreen = document.getElementById('login-screen');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');

// Verificar estado de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuario autenticado, mostrar contenido principal
            loginScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Guardar información del usuario actual
            currentUser = user;
            
            // Verificar si es el cumpleaños para desbloquear sección especial
            checkBirthdaySection();
            
            // Cargar los datos iniciales
            loadUserData();
        } else {
            // Usuario no autenticado, mostrar pantalla de login
            loginScreen.classList.remove('hidden');
            mainContent.classList.add('hidden');
        }
    });
});

// Función de inicio de sesión
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Intentar iniciar sesión
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Limpiar formulario y error
            loginForm.reset();
            loginError.textContent = '';
        })
        .catch(error => {
            // Mostrar mensaje de error
            loginError.textContent = getAuthErrorMessage(error.code);
        });
});

// Función de cierre de sesión
logoutButton.addEventListener('click', e => {
    e.preventDefault();
    
    auth.signOut()
        .then(() => {
            // El listener onAuthStateChanged se encargará de mostrar la pantalla de login
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
        });
});

// Mensajes de error de autenticación en español
function getAuthErrorMessage(errorCode) {
