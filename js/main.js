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

// Agregar a main.js
// Configurar botón "Estoy pensando en ti" con contador
function setupThinkingButton() {
    const thinkingButton = document.getElementById('thinking-button');
    if (!thinkingButton) return;
    
    // Obtener contador desde Firestore
    function updateThinkingCounter() {
        if (!auth.currentUser) return;
        
        db.collection('thinking_counts').doc(auth.currentUser.uid).get()
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
            });
    }
    
    // Ejecutar al cargar
    updateThinkingCounter();
    
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
        
        // Incrementar contador en Firestore
        const userRef = db.collection('thinking_counts').doc(auth.currentUser.uid);
        
        userRef.get().then((doc) => {
            let newCount = 1;
            if (doc.exists) {
                newCount = (doc.data().count || 0) + 1;
            }
            
            // Actualizar contador
            userRef.set({
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                count: newCount,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            // Obtener tokens FCM de la persona destinataria
            db.collection('users').doc(auth.currentUser.partnerUid || 'partnerUid').get()
                .then(doc => {
                    if (doc.exists && doc.data().fcmToken) {
                        // Enviar notificación a través de Cloud Functions (necesitarás configurar esto)
                        const notificationData = {
                            token: doc.data().fcmToken,
                            message: randomMessage,
                            senderId: auth.currentUser.uid,
                            senderEmail: auth.currentUser.email
                        };
                        
                        // Almacenar la notificación en Firestore
                        db.collection('notifications').add({
                            senderId: auth.currentUser.uid,
                            senderEmail: auth.currentUser.email,
                            recipientId: auth.currentUser.partnerUid || 'partnerUid',
                            message: randomMessage,
                            read: false,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        // Actual envío de la notificación (requiere configuración en Firebase Cloud Functions)
                        firebase.functions().httpsCallable('sendNotification')(notificationData);
                    }
                });
            
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
        });
    });
}
