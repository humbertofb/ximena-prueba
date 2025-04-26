// auth.js - Sistema de autenticación con Firebase

// Referencias a elementos del DOM (estos se usarán en la página de login)
let loginForm, registerForm, logoutBtn, userDisplay;

// Inicializar los elementos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Buscar los elementos en el DOM
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    logoutBtn = document.getElementById('logout-btn');
    userDisplay = document.getElementById('user-display');
    
    // Configurar los event listeners si los elementos existen
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Verificar estado de autenticación
    checkAuthState();
});

// Verificar el estado de autenticación del usuario
function checkAuthState() {
    // Verificar si el usuario ya está autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario está autenticado
            console.log('Usuario autenticado:', user.email);
            updateUIForLoggedInUser(user);
            
            // Guardar token en localStorage para acceso rápido
            user.getIdToken().then(function(token) {
                localStorage.setItem('authToken', token);
            });
        } else {
            // Usuario no está autenticado
            console.log('Usuario no autenticado');
            updateUIForLoggedOutUser();
            localStorage.removeItem('authToken');
            
            // Si estamos en una página protegida, redirigir al inicio
            if (isProtectedPage() && !isLoginPage()) {
                redirectToLogin();
            }
        }
    });
}

// Manejar el inicio de sesión
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
