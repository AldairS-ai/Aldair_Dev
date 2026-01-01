// ===== CONFIGURACIÓN GLOBAL =====
export const CONFIG = {
    carousel: {
        autoplay: true,
        autoplayDelay: 5000,
        transitionDuration: 500,
        dragThreshold: 50
    },
    form: {
        successMessage: '¡Mensaje enviado con éxito! Me pondré en contacto contigo pronto.',
        errorMessage: 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.'
    },
    accessibility: {
        minTouchSize: 44,
        focusVisibleClass: 'focus-visible',
        skipLinkFocusClass: 'skip-link-focused'
    },
    animations: {
        scrollThreshold: 0.1,
        scrollRootMargin: '0px 0px -50px 0px'
    }
};

// Configuración por defecto de selectores del DOM
export const SELECTORS = {
    projectsTrack: '#projects-track',
    carouselPrev: '#carousel-prev',
    carouselNext: '#carousel-next',
    carouselIndicators: '#carousel-indicators',
    mobileMenuToggle: '#mobile-menu-toggle',
    mobileMenu: '#mobile-menu',
    contactForm: '#contact-form',
    submitBtn: '#submit-btn',
    submitText: '#submit-text',
    submitSpinner: '#submit-spinner',
    typewriterText: '#typewriter-text',
    typewriterCursor: '#typewriter-cursor',
    currentYear: '#current-year',
    themeToggle: '#theme-toggle-lg, #theme-toggle-mobile',
    backToTop: '#back-to-top',
    skipLink: '.skip-link',
    progressBars: '.progress-bar',
    navLinks: 'nav a'
};