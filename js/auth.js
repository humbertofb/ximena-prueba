// Verificar si hay una sesión activa al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario autenticado
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
        } else {
            // No hay usuario autenticado
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
        }
    });

    // Configurar cambio entre formularios de login y registro
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Manejar formulario de inicio de sesión
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('auth-error');
        
        // Intenta iniciar sesión con Firebase
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Inicio de sesión exitoso
                errorElement.textContent = '';
            })
            .catch((error) => {
                // Error de inicio de sesión
                console.error("Error de inicio de sesión:", error);
                let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
                
                // Mensajes personalizados según el código de error
                switch(error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'El formato del correo electrónico no es válido.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Esta cuenta ha sido deshabilitada.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No existe una cuenta con este correo electrónico.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Contraseña incorrecta.';
                        break;
                }
                
                errorElement.textContent = errorMessage;
            });
    });

    // Manejar formulario de registro
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorElement = document.getElementById('auth-error');
        
        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            errorElement.textContent = 'Las contraseñas no coinciden.';
            return;
        }
        
        // Validar longitud mínima de contraseña
        if (password.length < 6) {
            errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }
        
        // Intenta crear una cuenta con Firebase
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Registro exitoso
                errorElement.textContent = '';
            })
            .catch((error) => {
                // Error de registro
                console.error("Error de registro:", error);
                let errorMessage = 'Error al crear la cuenta. Por favor, intenta de nuevo.';
                
                // Mensajes personalizados según el código de error
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Este correo electrónico ya está en uso.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'El formato del correo electrónico no es válido.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'La contraseña es demasiado débil.';
                        break;
                }
                
                errorElement.textContent = errorMessage;
            });
    });

    // Manejar menú de usuario
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuButton) {
        userMenuButton.addEventListener('click', function() {
            userDropdown.classList.toggle('hidden');
        });
        
        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Manejar cierre de sesión
    document.getElementById('logout-button-dropdown').addEventListener('click', function(e) {
        e.preventDefault();
        
        firebase.auth().signOut().then(() => {
            // Cierre de sesión exitoso
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
    });
    
    // Cambiar tema desde el dropdown - CORREGIDO
    document.getElementById('theme-toggle-dropdown').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Ahora llamamos a la función global definida en theme-switcher.js
        if (typeof window.toggleTheme === 'function') {
            window.toggleTheme();
        } else {
            console.error("La función toggleTheme no está definida. Asegúrate de que theme-switcher.js se carga antes que auth.js");
            
            // Implementación alternativa en caso de que no esté disponible la función
            if (document.documentElement.classList.contains('dark-theme')) {
                document.documentElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            }
            
            // Cerrar el dropdown después de cambiar el tema
            userDropdown.classList.add('hidden');
        }
    });
});
