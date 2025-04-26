// Funciones globales y comportamiento general

// Variables globales
let currentUser = null;
let currentSlide = 0;

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrusel
    initCarousel();
    
    // Configurar botón "Estoy pensando en ti"
    setupThinkingButton();
    
    // Verificar si es el día de cumpleaños
    checkBirthdaySection();
});

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

// Configurar botón "Estoy pensando en ti"
function setupThinkingButton() {
    const thinkingButton = document.getElementById('thinking-button');
    if (!thinkingButton) return;
    
    thinkingButton.addEventListener('click', () => {
        // Verificar que hay un usuario autenticado
        if (!auth.currentUser) return;
        
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
        
        // Crear notificación en Firestore
        db.collection('notifications').add({
            senderId: auth.currentUser.uid,
            senderEmail: auth.currentUser.email,
            message: randomMessage,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Mostrar confirmación al usuario
            const originalText = thinkingButton.innerHTML;
            thinkingButton.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
            thinkingButton.disabled = true;
            
            // Restaurar botón después de 3 segundos
            setTimeout(() => {
                thinkingButton.innerHTML = originalText;
                thinkingButton.disabled = false;
            }, 3000);
        })
        .catch(error => {
            console.error("Error al enviar notificación:", error);
        });
    });
}

// Verificar si es el día del cumpleaños
function checkBirthdaySection() {
    // Verificar que hay un usuario autenticado
    if (!auth.currentUser) return;
    
    // Obtener la fecha del cumpleaños desde Firestore
    db.collection('users').doc(auth.currentUser.uid).get()
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
