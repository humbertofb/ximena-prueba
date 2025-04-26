// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos
    const frontCover = document.querySelector('.front-cover');
    const celebrateBtn = document.getElementById('celebrate-btn');
    const confettiContainer = document.getElementById('confetti-container');
    const giftItems = document.querySelectorAll('.gift-item');
    const slides = document.querySelectorAll('.memory-slide');
    
    // Fecha de cumpleaños - Puedes modificarla según corresponda
    // Formato: Año, Mes (0-11), Día
    const birthdayDate = new Date(2025, 5, 15); // 15 de junio de 2025
    
    // Función para actualizar la cuenta regresiva
    function updateCountdown() {
        const currentDate = new Date();
        const difference = birthdayDate - currentDate;
        
        // Si ya pasó el cumpleaños de este año, calcular para el próximo año
        if (difference < 0) {
            birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
            return updateCountdown();
        }
        
        // Calcular días, horas, minutos y segundos
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Actualizar los elementos en el DOM
        document.getElementById('countdown-days').textContent = days;
        document.getElementById('countdown-hours').textContent = hours;
        document.getElementById('countdown-minutes').textContent = minutes;
        document.getElementById('countdown-seconds').textContent = seconds;
        
        // Si es el día del cumpleaños, mostrar algo especial
        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
            birthdaySpecial();
        }
    }
    
    // Función para crear confeti
    function createConfetti() {
        confettiContainer.classList.add('active');
        
        // Crear 100 piezas de confeti
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            // Estilos aleatorios para cada pieza de confeti
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 5 + 's';
            confetti.style.backgroundColor = getRandomColor();
            
            confettiContainer.appendChild(confetti);
            
            // Eliminar después de la animación
            setTimeout(() => {
                confetti.remove();
            }, 6000);
        }
        
        // Ocultar el contenedor de confeti después de 6 segundos
        setTimeout(() => {
            confettiContainer.classList.remove('active');
            confettiContainer.innerHTML = '';
        }, 6000);
    }
    
    // Función para obtener un color aleatorio
    function getRandomColor() {
        const colors = ['#ff577f', '#ff884b', '#ffd384', '#fff9b0', '#a3ddcb', '#7fc8f8', '#c1a1d3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Función para mostrar algo especial en el día del cumpleaños
    function birthdaySpecial() {
        // Reproducir música de cumpleaños
        const audio = new Audio('../assets/sounds/birthday-song.mp3');
        audio.play();
        
        // Mostrar confeti
        createConfetti();
        
        // Aplicar estilos especiales
        document.body.classList.add('birthday-mode');
    }
    
    // Evento para abrir la tarjeta
    frontCover.addEventListener('click', function() {
        this.classList.add('open');
    });
    
    // Evento para el botón de celebración
    celebrateBtn.addEventListener('click', function() {
        createConfetti();
        
        // Reproducir sonido de celebración
        const audio = new Audio('../assets/sounds/celebration.mp3');
        audio.play();
    });
    
    // Eventos para los regalos
    giftItems.forEach(gift => {
        gift.addEventListener('click', function() {
            const giftType = this.getAttribute('data-gift');
            showGift(giftType);
        });
    });
    
    // Función para mostrar el regalo seleccionado
    function showGift(giftType) {
        let message = '';
        
        switch(giftType) {
            case 'message':
                message = `
                    <h3>Mi Mensaje Para Ti</h3>
                    <p>En este día tan especial, quiero decirte que eres la persona más importante en mi vida. 
                    Cada día a tu lado es un regalo que valoro profundamente. 
                    Te amo más de lo que las palabras pueden expresar, y estoy agradecido/a por compartir mi vida contigo.</p>
                `;
                break;
            case 'playlist':
                message = `
                    <h3>Nuestra Playlist</h3>
                    <ul>
                        <li>"Perfect" - Ed Sheeran</li>
                        <li>"All of Me" - John Legend</li>
                        <li>"Just the Way You Are" - Bruno Mars</li>
                        <li>"A Thousand Years" - Christina Perri</li>
                        <li>"Can't Help Falling in Love" - Elvis Presley</li>
                    </ul>
                    <p>Estas canciones me recuerdan a ti y a nuestros momentos juntos.</p>
                `;
                break;
            case 'poem':
                message = `
                    <h3>Para Ti</h3>
                    <p style="font-style: italic; line-height: 1.8;">
                    En este día especial,<br>
                    Quiero decirte sin igual,<br>
                    Que eres mi sol, mi luna y más,<br>
                    El amor que en mi corazón siempre vivirá.<br><br>
                    
                    Tus ojos brillan como estrellas,<br>
                    Tu sonrisa ilumina mis días,<br>
                    Eres mi presente y mi futuro,<br>
                    Mi amor, mi guía.<br><br>
                    
                    Feliz cumpleaños, mi amor verdadero,<br>
                    Celebro tu vida y todo lo que eres,<br>
                    Mi corazón es tuyo, entero,<br>
                    Hoy y siempre, sin pareceres.
                    </p>
                `;
                break;
            case 'date':
                message = `
                    <h3>Nuestra Cita Virtual</h3>
                    <p>Te invito a una cita especial este fin de semana. Podemos:</p>
                    <ul>
                        <li>Ver juntos nuestra película favorita</li>
                        <li>Preparar una cena virtual juntos</li>
                        <li>Jugar algunos juegos en línea</li>
                        <li>O simplemente charlar durante horas como nos gusta hacer</li>
                    </ul>
                    <p>¿Qué te parece? Será un momento solo para nosotros.</p>
                `;
                break;
        }
        
        // Crear un modal para mostrar el regalo
        const modal = document.createElement('div');
        modal.classList.add('gift-modal');
        modal.innerHTML = `
            <div class="gift-modal-content">
                <span class="close-gift">&times;</span>
                <div class="gift-modal-body">
                    ${message}
                </div>
            </div>
        `;
        
        // Agregar el modal al body
        document.body.appendChild(modal);
        
        // Evento para cerrar el modal
        const closeBtn = modal.querySelector('.close-gift');
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
        
        // También cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Función para el slideshow de recuerdos
    function startSlideshow() {
        let currentSlide = 0;
        
        setInterval(() => {
            // Ocultar la diapositiva actual
            slides[currentSlide].classList.remove('active');
            
            // Avanzar a la siguiente diapositiva o volver al principio
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Mostrar la nueva diapositiva actual
            slides[currentSlide].classList.add('active');
        }, 5000); // Cambiar cada 5 segundos
    }
    
    // Verificar si el usuario está autenticado
    checkAuth();
    
    // Iniciar la cuenta regresiva
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Iniciar el slideshow
    startSlideshow();
});

// Función para verificar la autenticación
function checkAuth() {
    // Esta función será implementada en auth.js
    // Por ahora, simplemente comprobamos si hay un token almacenado
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // Redirigir al usuario a la página de inicio de sesión
        // window.location.href = '../index.html';
        
        // Por ahora, solo mostramos un mensaje de consola para desarrollo
        console.log('Usuario no autenticado, pero permitimos acceso para desarrollo');
    }
}

// Estilos adicionales para el modal de regalo
const style = document.createElement('style');
style.textContent = `
    .gift-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    .gift-modal-content {
        background-color: white;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        position: relative;
        padding: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    }
    
    .close-gift {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1.5rem;
        cursor: pointer;
        color: #555;
    }
    
    .gift-modal-body {
        margin-top: 10px;
    }
    
    .gift-modal-body h3 {
        color: var(--primary-color);
        margin-bottom: 15px;
    }
    
    .gift-modal-body p, .gift-modal-body ul {
        margin-bottom: 15px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        animation: confetti-fall 6s linear forwards;
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;

document.head.appendChild(style);
