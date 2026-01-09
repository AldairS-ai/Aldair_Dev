// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const themeToggle = document.getElementById('theme-toggle');

// Cache de elementos del DOM
let cachedHeaderHeight = 0;
let slideWidth = 0;

// Verificar si elementos existen antes de agregar eventos
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        
        // Animar el menú móvil
        if (!isExpanded) {
            mobileMenu.classList.remove('opacity-0', 'invisible', '-translate-y-2');
            mobileMenu.classList.add('opacity-100', 'visible', 'translate-y-0');
            mobileMenuButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Cerrar menú móvil');
        } else {
            mobileMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
            mobileMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
        }
    });
}

// Cerrar menú móvil al hacer clic en un enlace
if (mobileMenu) {
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
            mobileMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
            mobileMenuButton.setAttribute('aria-label', 'Abrir menú móvil');
        });
    });
}

// Toggle del tema
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        // Actualizar también el botón móvil si existe
        if (mobileThemeToggle) {
            const span = mobileThemeToggle.querySelector('span');
            if (span) span.textContent = 'Modo Oscuro';
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-moon text-primary-500 dark:text-primary-400 w-5';
        }
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        // Actualizar también el botón móvil si existe
        if (mobileThemeToggle) {
            const span = mobileThemeToggle.querySelector('span');
            if (span) span.textContent = 'Modo Claro';
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-sun text-primary-500 dark:text-primary-400 w-5';
        }
    }
}

// Asignar eventos de tema
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

// Verificar tema guardado al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        if (mobileThemeToggle) {
            const span = mobileThemeToggle.querySelector('span');
            if (span) span.textContent = 'Modo Claro';
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-sun text-primary-500 dark:text-primary-400 w-5';
        }
    }
});

// Carrusel de proyectos - OPTIMIZADO SIN REFLOWS
const carousel = document.getElementById('project-carousel');
const prevButton = document.getElementById('prev-project');
const nextButton = document.getElementById('next-project');
const indicators = document.querySelectorAll('.project-indicator');

if (carousel && prevButton && nextButton) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let carouselInterval;
    
    // Función para obtener el ancho del slide de forma eficiente
    function getSlideWidth() {
        if (!slideWidth && slides.length > 0) {
            // Usar clientWidth en lugar de getBoundingClientRect
            slideWidth = slides[0].clientWidth;
        }
        return slideWidth;
    }
    
    function updateCarousel() {
        if (!carousel || slides.length === 0) return;
        
        const width = getSlideWidth();
        carousel.style.transform = `translateX(-${currentSlide * width}px)`;
        
        // Actualizar indicadores
        requestAnimationFrame(() => {
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add('bg-primary-500', 'dark:bg-primary-400');
                    indicator.classList.remove('bg-primary-300', 'dark:bg-primary-700');
                    indicator.setAttribute('aria-current', 'true');
                } else {
                    indicator.classList.remove('bg-primary-500', 'dark:bg-primary-400');
                    indicator.classList.add('bg-primary-300', 'dark:bg-primary-700');
                    indicator.setAttribute('aria-current', 'false');
                }
            });
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    // Configurar eventos
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
    
    // Configurar indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
            resetCarouselInterval();
        });
    });
    
    // Auto-avance del carrusel
    function startCarouselInterval() {
        carouselInterval = setInterval(nextSlide, 8000);
    }
    
    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        startCarouselInterval();
    }
    
    function stopCarouselInterval() {
        clearInterval(carouselInterval);
    }
    
    // Pausar carrusel al interactuar
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarouselInterval);
        carousel.addEventListener('mouseleave', startCarouselInterval);
        carousel.addEventListener('touchstart', stopCarouselInterval);
        carousel.addEventListener('touchend', () => {
            setTimeout(startCarouselInterval, 5000);
        });
    }
    
    // Inicializar carrusel
    requestAnimationFrame(() => {
        updateCarousel();
    });
    startCarouselInterval();
    
    // Ajustar carrusel en resize con debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slideWidth = 0;
            requestAnimationFrame(updateCarousel);
        }, 150);
    });
}

// Función para obtener altura del header de forma eficiente
function getHeaderHeight() {
    if (!cachedHeaderHeight) {
        const header = document.querySelector('header');
        if (header) {
            // Usar clientHeight que no causa reflow
            cachedHeaderHeight = header.clientHeight;
        }
    }
    return cachedHeaderHeight;
}

// Navegación suave mejorada - COMPLETAMENTE OPTIMIZADA
document.addEventListener('DOMContentLoaded', () => {
    // Cachear altura del header una vez al cargar
    cachedHeaderHeight = getHeaderHeight();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const headerHeight = cachedHeaderHeight;
                
                // Calcular posición sin causar reflow
                const targetRect = targetElement.getBoundingClientRect();
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = currentScroll + targetRect.top - headerHeight;
                
                requestAnimationFrame(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                });
                
                if (href !== window.location.hash) {
                    requestAnimationFrame(() => {
                        history.pushState(null, null, href);
                    });
                }
            }
        });
    });
    
    // Actualizar cache en resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cachedHeaderHeight = 0;
            getHeaderHeight();
        }, 250);
    });
});

// Animaciones al hacer scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            });
        }
    });
}, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
});

// Observar elementos que queremos animar al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        document.querySelectorAll('.skill-card, .card-hover, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    });
});

// SEO: Cambiar título cuando la pestaña no está activa
let originalTitle = document.title;

window.addEventListener('blur', () => {
    document.title = '¡Vuelve! Tu aventura digital te espera';
});

window.addEventListener('focus', () => {
    document.title = originalTitle;
});

// Preload de imágenes críticas
window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        document.querySelectorAll('img').forEach(img => {
            img.classList.add('loaded');
        });
    });
});

// Sistema de Toast Notifications
window.toastQueue = [];
window.isShowingToast = false;

window.showToast = function(message, type = 'info', duration = 5000) {
    window.toastQueue.push({
        message,
        type,
        duration,
        id: Date.now()
    });
    processToastQueue();
};

function processToastQueue() {
    if (window.isShowingToast || window.toastQueue.length === 0) return;
    
    window.isShowingToast = true;
    const toast = window.toastQueue.shift();
    createToastElement(toast);
}

function createToastElement(toast) {
    requestAnimationFrame(() => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('role', 'region');
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${toast.type}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        let icon = 'info-circle';
        if (toast.type === 'success') icon = 'check-circle';
        if (toast.type === 'error') icon = 'exclamation-circle';
        
        toastElement.innerHTML = `
            <i class="fas fa-${icon}" aria-hidden="true"></i>
            <span class="toast-message">${toast.message}</span>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;
        
        container.appendChild(toastElement);
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                toastElement.classList.add('toast-visible');
            });
        }, 10);
        
        const closeBtn = toastElement.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toastElement));
        
        const autoRemove = setTimeout(() => removeToast(toastElement), toast.duration);
        
        toastElement.addEventListener('mouseenter', () => clearTimeout(autoRemove));
        toastElement.addEventListener('mouseleave', () => {
            setTimeout(() => removeToast(toastElement), toast.duration);
        });
    });
}

function removeToast(toastElement) {
    if (!toastElement) return;
    
    requestAnimationFrame(() => {
        toastElement.classList.remove('toast-visible');
        toastElement.classList.add('toast-exiting');
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                window.isShowingToast = false;
                processToastQueue();
            });
        }, 300);
    });
}

// Función para anunciar a screen readers
window.announceToScreenReader = function(message, priority = 'polite') {
    requestAnimationFrame(() => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                document.body.removeChild(announcement);
            });
        }, 1000);
    });
};

// Manejo de descarga de CV
document.addEventListener('DOMContentLoaded', () => {
    const cvLink = document.querySelector('a[href*="CV_Aldair_Sarmiento.pdf"]');
    
    if (cvLink) {
        cvLink.addEventListener('click', function(e) {
            setTimeout(() => {
                if (typeof window.showToast === 'function') {
                    window.showToast('CV descargado exitosamente', 'success', 3000);
                }
                
                if (typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader('Currículum descargado exitosamente');
                }
            }, 500);
        });
    }
});

// Efecto de scroll para botón de WhatsApp
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('inicio');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    if (!hero || !whatsappBtn) return;
    
    const observer = new IntersectionObserver(
        ([entry]) => {
            requestAnimationFrame(() => {
                if (!entry.isIntersecting) {
                    whatsappBtn.classList.remove('opacity-0', 'invisible');
                    whatsappBtn.classList.add('opacity-100');
                } else {
                    whatsappBtn.classList.add('opacity-0', 'invisible');
                    whatsappBtn.classList.remove('opacity-100');
                }
            });
        },
        { threshold: 0.1 }
    );

    observer.observe(hero);
});