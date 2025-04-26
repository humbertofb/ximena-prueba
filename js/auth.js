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
    switch(errorCode) {
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo electrónico.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta. Inténtalo de nuevo.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Inténtalo más tarde.';
        default:
            return 'Error al iniciar sesión. Inténtalo de nuevo.';
    }
}

// Cargar datos del usuario
function loadUserData() {
    const userId = auth.currentUser.uid;
    
    // Cargar datos personales desde Firestore
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Actualizar contador de días si existe
                if (userData.startDate) {
                    updateDaysCounter(userData.startDate);
                }
                
                // Cargar frases personalizadas si existen
                if (userData.quotes && userData.quotes.length > 0) {
                    updateCarouselQuotes(userData.quotes);
                }
            } else {
                // Si es la primera vez que el usuario inicia sesión, crear su documento
                const defaultData = {
                    startDate: new Date().toISOString(),
                    quotes: [
                        "A veces, pequeños momentos se convierten en los mejores recuerdos.",
                        "La distancia es solo una prueba para saber qué tan lejos puede viajar el amor.",
                        "Cada día te elijo a ti."
                    ],
                    birthdayDate: "" // A configurar por el usuario
                };
                
                db.collection('users').doc(userId).set(defaultData)
                    .then(() => {
                        updateDaysCounter(defaultData.startDate);
                    })
                    .catch(error => {
                        console.error("Error al crear documento de usuario:", error);
                    });
            }
        })
        .catch(error => {
            console.error("Error al cargar datos del usuario:", error);
        });
}

// Actualizar contador de días
function updateDaysCounter(startDateString) {
    const startDate = new Date(startDateString);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const daysCountElement = document.getElementById('days-count');
    if (daysCountElement) {
        daysCountElement.textContent = diffDays;
    }
}

// Actualizar frases del carrusel
function updateCarouselQuotes(quotes) {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    // Limpiar carrusel actual
    carousel.innerHTML = '';
    
    // Añadir nuevas frases
    quotes.forEach((quote, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        const card = document.createElement('div');
        card.className = 'quote-card';
        
        const text = document.createElement('p');
        text.textContent = `"${quote}"`;
        
        card.appendChild(text);
        item.appendChild(card);
        carousel.appendChild(item);
    });
    
    // Añadir controles del carrusel
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `
        <button class="carousel-control" onclick="prevSlide()"><i class="fas fa-chevron-left"></i></button>
        <button class="carousel-control" onclick="nextSlide()"><i class="fas fa-chevron-right"></i></button>
    `;
    
    carousel.appendChild(controls);
}
