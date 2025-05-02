// auth.js

document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
        } else {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
        }
    });

    // Cambio entre formularios login/registro
    document.getElementById('show-register').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Inicio de sesión
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('auth-error');

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                errorElement.textContent = '';
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

                errorElement.textContent = errorMessage;
            });
    });

    // Registro de usuario
    document.getElementById('register-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorElement = document.getElementById('auth-error');

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

    // Manejar botón de usuario y menú desplegable
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', function () {
            userDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', function (e) {
            if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Cierre de sesión
    const logoutButton = document.getElementById('logout-button-dropdown');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            e.preventDefault();

            firebase.auth().signOut().then(() => {
                console.log("Sesión cerrada correctamente.");
            }).catch((error) => {
                console.error("Error al cerrar sesión:", error);
            });
        });
    }
});
