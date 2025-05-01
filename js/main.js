// Funciones globales y comportamiento general - Sin Firebase Messaging

// Variables globales
let currentUser = null;
let currentSlide = 0;

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Firebase Persistencia
    initFirebasePersistence();
    
    // Inicializar carrusel
    initCarousel();
    
    // Verificar si es el día de cumpleaños
    checkBirthdaySection();
    
    // Verificar estado de autenticación
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            onUserSignIn();
        }
    });
});

// Inicializar persistencia de Firestore
function initFirebasePersistence() {
    firebase.firestore().enablePersistence()
        .then(() => {
            console.log("Persistencia offline habilitada");
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("No se pudo habilitar persistencia: múltiples pestañas abiertas");
            } else if (err.code === 'unimplemented') {
                console.warn("Tu navegador no soporta persistencia offline");
            }
        });
}

// Cuando el usuario inicia sesión
function onUserSignIn() {
    // Actualizar UI con información del usuario
    updateUserUI();
    
    // Actualizar contador de "pensando en ti"
    updateThinkingCounter();
}

// Actualizar UI con información del usuario
function updateUserUI() {
    // Implementa según tu diseño
    console.log("Usuario autenticado:", currentUser?.email);
}

// Funciones para el carrusel de frases
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length === 0) return;
    
    // Mostrar la primera diapositiva
    showSlide(0);
    
    // Auto-rotación cada 8 segundos
    setInterval(() => {
        nextSlide();
    }, 8000);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length === 0) return;
    
    // Ocultar todas las diapositivas
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Ajustar índice si está fuera de rango
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }
    
    // Mostrar la diapositiva actual
    slides[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// Configurar botón "Estoy pensando en ti" con contador
function setupThinkingButton() {
    const thinkingButton = document.getElementById('thinking-button');
    if (!thinkingButton) return;
    
    thinkingButton.addEventListener('click', () => {
        // Verificar que hay un usuario autenticado
        if (!firebase.auth().currentUser) {
            alert("Debes iniciar sesión para usar esta función");
            return;
        }
        
        // Mensajes aleatorios
        const messages = [
            "Estoy pensando en ti ahora mismo ❤️",
            "Te extraño mucho 💕",
            "Espero que tengas un día maravilloso ✨",
            "Eres lo mejor que me ha pasado 💫",
            "Recordando tu sonrisa 😊",
            "Contando los días para verte 📆"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Incrementar contador en Firestore
        const userRef = firebase.firestore().collection('thinking_counts').doc(firebase.auth().currentUser.uid);
        
        userRef.get().then((doc) => {
            let newCount = 1;
            if (doc.exists) {
                newCount = (doc.data().count || 0) + 1;
            }
            
            // Actualizar contador
            userRef.set({
                userId: firebase.auth().currentUser.uid,
                userEmail: firebase.auth().currentUser.email,
                count: newCount,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })
            .then(() => {
                // Obtener tokens FCM de la persona destinataria
                return firebase.firestore().collection('users').doc(firebase.auth().currentUser.partnerUid || 'partnerUid').get();
            })
            .then(doc => {
                if (doc.exists) {
                    // Almacenar la notificación en Firestore
                    firebase.firestore().collection('notifications').add({
                        senderId: firebase.auth().currentUser.uid,
                        senderEmail: firebase.auth().currentUser.email,
                        recipientId: firebase.auth().currentUser.partnerUid || 'partnerUid',
                        message: randomMessage,
                        read: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .then(() => {
                // Mostrar confirmación al usuario
                const originalText = thinkingButton.innerHTML;
                thinkingButton.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
                thinkingButton.disabled = true;
                thinkingButton.classList.add('thinking-sent');
                
                // Actualizar el contador en la UI
                updateThinkingCounter();
                
                // Restaurar botón después de 3 segundos
                setTimeout(() => {
                    thinkingButton.innerHTML = originalText;
                    thinkingButton.disabled = false;
                    thinkingButton.classList.remove('thinking-sent');
                }, 3000);
            })
            .catch(error => {
                console.error("Error al actualizar contador:", error);
                alert("Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo más tarde.");
                
                // Restaurar botón
                thinkingButton.disabled = false;
            });
        })
        .catch(error => {
            console.error("Error al obtener contador:", error);
            
            // Manejar caso offline
            if (error.code === 'failed-precondition' || error.code === 'unavailable') {
                alert("Parece que estás offline. Intenta de nuevo cuando tengas conexión.");
            } else {
                alert("Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo más tarde.");
            }
        });
    });
}

// Obtener contador desde Firestore
function updateThinkingCounter() {
    if (!firebase.auth().currentUser) return;
    
    firebase.firestore().collection('thinking_counts').doc(firebase.auth().currentUser.uid).get()
        .then((doc) => {
            const count = doc.exists ? doc.data().count : 0;
            // Actualizar contador en el menú de usuario si existe
            const counterElement = document.getElementById('thinking-counter');
            if (counterElement) {
                counterElement.textContent = count;
            }
        })
        .catch(error => {
            console.error("Error al obtener contador:", error);
            // Manejar caso offline
            if (error.code === 'failed-precondition' || error.code === 'unavailable') {
                console.log("Operando en modo offline");
            }
        });
}

// Verificar si es el día del cumpleaños
function checkBirthdaySection() {
    // Verificar que hay un usuario autenticado
    if (!firebase.auth().currentUser) return;
    
    // Obtener la fecha del cumpleaños desde Firestore
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then(doc => {
            if (doc.exists && doc.data().birthdayDate) {
                const birthdayDate = new Date(doc.data().birthdayDate);
                const today = new Date();
                
                // Comprobar si es el día del cumpleaños (mismo mes y día)
                if (birthdayDate.getDate() === today.getDate() && 
                    birthdayDate.getMonth() === today.getMonth()) {
                    
                    // Si estamos en la página principal, mostrar notificación
                    if (window.location.pathname.includes('index.html') || 
                        window.location.pathname.endsWith('/')) {
                        
                        showBirthdayNotification();
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error al verificar fecha de cumpleaños:", error);
        });
}

// Mostrar notificación de cumpleaños
function showBirthdayNotification() {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'birthday-notification';
    notification.innerHTML = `
        <div class="birthday-content">
            <h3>¡Sorpresa de Cumpleaños Desbloqueada!</h3>
            <p>Hay una sorpresa especial esperándote hoy.</p>
            <a href="pages/cumpleanos.html" class="btn btn-highlight">
                <i class="fas fa-gift"></i> Ver Sorpresa
            </a>
        </div>
    `;
    
    // Añadir a la página
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('active');
    }, 1000);
}

// Funciones para compatibilidad global con navegación
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
