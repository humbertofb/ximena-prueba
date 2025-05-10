// auth.js

document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Usuario autenticado
            const loginScreen = document.getElementById('login-screen');
            const mainContent = document.getElementById('main-content');
            
            if (loginScreen && mainContent) {
                loginScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
            }
        } else {
            // Usuario no autenticado
            const loginScreen = document.getElementById('login-screen');
            const mainContent = document.getElementById('main-content');
            
            if (loginScreen && mainContent) {
                loginScreen.classList.remove('hidden');
                mainContent.classList.add('hidden');
            }
        }
    });

    // Cambio entre formularios login/registro
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (showRegister) {
        showRegister.addEventListener('click', function (e) {
            e.preventDefault();
            if (loginForm && registerForm) {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function (e) {
            e.preventDefault();
            if (loginForm && registerForm) {
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            }
        });
    }

    // Inicio de sesión
    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('auth-error');

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    if (errorElement) errorElement.textContent = '';
                })
                .catch((error) => {
                    console.error("Error de inicio de sesión:", error);
                    let errorMessage = 'Error al iniciar sesión.';

                    switch (error.code) {
                        case 'auth/invalid-email':
                            errorMessage = 'Correo electrónico no válido.';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = 'Esta cuenta ha sido deshabilitada.';
                            break;
                        case 'auth/user-not-found':
                            errorMessage = 'No existe una cuenta con este correo.';
                            break;
                        case 'auth/wrong-password':
                            errorMessage = 'Contraseña incorrecta.';
                            break;
                    }

                    if (errorElement) errorElement.textContent = errorMessage;
                });
        });
    }

    // Registro de usuario
    const registerFormElement = document.getElementById('register-form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const errorElement = document.getElementById('auth-error');

            if (!errorElement) return;

            if (password !== confirmPassword) {
                errorElement.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            if (password.length < 6) {
                errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                return;
            }

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(() => {
                    errorElement.textContent = '';
                })
                .catch((error) => {
                    console.error("Error de registro:", error);
                    let errorMessage = 'Error al crear la cuenta.';

                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = 'Este correo ya está en uso.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Correo electrónico no válido.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'Contraseña demasiado débil.';
                            break;
                    }

                    errorElement.textContent = errorMessage;
                });
        });
    }

    // Cierre de sesión
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            e.preventDefault();
            
            firebase.auth().signOut()
                .then(() => {
                    // Redirigir a la pantalla de login
                    const loginScreen = document.getElementById('login-screen');
                    const mainContent = document.getElementById('main-content');
                    
                    if (loginScreen && mainContent) {
                        loginScreen.classList.remove('hidden');
                        mainContent.classList.add('hidden');
                    }
                })
                .catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                });
        });
    }
});
