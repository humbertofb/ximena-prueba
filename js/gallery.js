// Script para la galería de imágenes
document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la galería
    const galleryConfig = {
        images: [
            { src: 'images/gallery/gallery1.jpg', alt: 'Recuerdo especial 1' },
            { src: 'images/gallery/gallery2.jpg', alt: 'Recuerdo especial 2' },
            { src: 'images/gallery/gallery3.jpg', alt: 'Recuerdo especial 3' },
            { src: 'images/gallery/gallery4.jpg', alt: 'Recuerdo especial 4' },
            { src: 'images/gallery/gallery5.jpg', alt: 'Recuerdo especial 5' }
        ],
        // Si no hay imágenes reales todavía, usa imágenes de placeholder
        placeholders: [
            { color: '#FFD6E0', text: 'Aquí va una foto especial' },
            { color: '#C5DFF8', text: 'Otro recuerdo' },
            { color: '#F0FFC2', text: 'Momento mágico' },
            { color: '#D7C5F8', text: 'Día especial' },
            { color: '#FFE9AE', text: 'Sonrisas juntos' }
        ],
        autoplaySpeed: 3000, // Intervalo de reproducción automática en ms
    };

    // Función para inicializar la galería
    function initGallery() {
        const galleryContainer = document.querySelector('.gallery-slides');
        if (!galleryContainer) return;

        // Primero intentamos cargar las imágenes reales
        if (galleryConfig.images && galleryConfig.images.length > 0) {
            loadRealImages(galleryContainer);
        } else {
            // Si no hay imágenes, cargamos los placeholders
            loadPlaceholderImages(galleryContainer);
        }

        // Iniciar reproducción automática
        startAutoplay();
    }

    // Cargar imágenes reales
    function loadRealImages(container) {
        galleryConfig.images.forEach((image, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'gallery-slide' + (index === 0 ? ' active' : '');
            
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            imgElement.loading = 'lazy'; // Carga perezosa para mejor rendimiento
            
            slideElement.appendChild(imgElement);
            container.appendChild(slideElement);
        });
    }

    // Cargar imágenes de placeholder
    function loadPlaceholderImages(container) {
        galleryConfig.placeholders.forEach((placeholder, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'gallery-slide' + (index === 0 ? ' active' : '');
            slideElement.style.backgroundColor = placeholder.color;
            
            const textElement = document.createElement('p');
            textElement.textContent = placeholder.text;
            textElement.className = 'placeholder-text';
            
            slideElement.appendChild(textElement);
            container.appendChild(slideElement);
        });
    }

    // Función para pasar a la siguiente imagen
    function nextGallerySlide() {
        const slides = document.querySelectorAll('.gallery-slide');
        if (!slides.length) return;

        let activeIndex = -1;
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].classList.contains('active')) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex !== -1) {
            slides[activeIndex].classList.remove('active');
            const nextIndex = (activeIndex + 1) % slides.length;
            slides[nextIndex].classList.add('active');
        }
    }

    // Iniciar reproducción automática
    let autoplayInterval;
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextGallerySlide, galleryConfig.autoplaySpeed);
    }

    // Detener reproducción automática
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    // Pausar reproducción automática al pasar el mouse por encima
    const galleryElement = document.querySelector('.gallery-container');
    if (galleryElement) {
        galleryElement.addEventListener('mouseenter', stopAutoplay);
        galleryElement.addEventListener('mouseleave', startAutoplay);
    }

    // Inicializar galería
    initGallery();
});
