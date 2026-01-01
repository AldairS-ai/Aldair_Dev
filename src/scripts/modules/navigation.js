// ===== NAVEGACIÓN Y MENÚ MÓVIL =====
import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';
import { Accessibility } from './accessibility.js';

export class Navigation {
    static DOM = {};
    
    static init() {
        this.cacheDOM();
        this.initNavigation();
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initActiveNavLink();
        this.initBackToTopButton();
        this.initThemeToggle();
    }
    
    static cacheDOM() {
        this.DOM = {
            navLinks: document.querySelectorAll('nav a'),
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            mobileMenu: document.getElementById('mobile-menu'),
            themeToggle: document.querySelectorAll('#theme-toggle-lg, #theme-toggle-mobile'),
            skipLink: document.querySelector('.skip-link')
        };
    }
    
    static initNavigation() {
        // Navegación suave para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Cerrar menú móvil si está abierto
                    if (Navigation.DOM.mobileMenu && Navigation.DOM.mobileMenu.classList.contains('open')) {
                        Navigation.toggleMobileMenu();
                    }
                    
                    // Scroll suave
                    Navigation.scrollToElement(targetElement);
                    
                    // Actualizar URL sin recargar
                    history.pushState(null, null, href);
                    
                    // Enfocar el elemento objetivo para accesibilidad
                    setTimeout(() => {
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();
                        targetElement.removeAttribute('tabindex');
                    }, 500);
                }
            });
        });
    }
    
    static scrollToElement(element) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        const targetPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
    
    static initActiveNavLink() {
        const updateActiveNavLink = PerformanceOptimizer.throttle(() => {
            PerformanceOptimizer.batchReads(() => {
                const scrollPosition = window.scrollY + 100;
                
                document.querySelectorAll('section[id]').forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    const sectionId = section.getAttribute('id');
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        PerformanceOptimizer.batchWrites(() => {
                            // Remover activo de todos los enlaces
                            Navigation.DOM.navLinks?.forEach(link => {
                                link.removeAttribute('aria-current');
                            });
                            
                            // Agregar activo al enlace correspondiente
                            const correspondingLink = document.querySelector(`a[href="#${sectionId}"]`);
                            if (correspondingLink) {
                                correspondingLink.setAttribute('aria-current', 'page');
                            }
                        });
                    }
                });
            });
        }, 100);
        
        window.addEventListener('scroll', updateActiveNavLink, { passive: true });
        updateActiveNavLink(); // Ejecutar inicialmente
    }
    
    static initMobileMenu() {
        if (!Navigation.DOM.mobileMenuToggle || !Navigation.DOM.mobileMenu) return;
        
        Navigation.DOM.mobileMenuToggle.addEventListener('click', () => Navigation.toggleMobileMenu());
        Navigation.DOM.mobileMenuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                Navigation.toggleMobileMenu();
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        const mobileLinks = Navigation.DOM.mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (Navigation.DOM.mobileMenu.classList.contains('open')) {
                    Navigation.toggleMobileMenu();
                }
            });
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && Navigation.DOM.mobileMenu.classList.contains('open')) {
                Navigation.toggleMobileMenu();
                Navigation.DOM.mobileMenuToggle.focus();
            }
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (Navigation.DOM.mobileMenu.classList.contains('open') && 
                !Navigation.DOM.mobileMenu.contains(e.target) && 
                !Navigation.DOM.mobileMenuToggle.contains(e.target)) {
                Navigation.toggleMobileMenu();
            }
        });
        
        // Asegurar accesibilidad del menú
        Accessibility.trapFocus(Navigation.DOM.mobileMenu);
    }
    
    static toggleMobileMenu() {
        const isMenuOpen = !Navigation.DOM.mobileMenu.classList.contains('open');
        
        PerformanceOptimizer.batchWrites(() => {
            Navigation.DOM.mobileMenu.classList.toggle('open', isMenuOpen);
            Navigation.DOM.mobileMenuToggle.setAttribute('aria-expanded', isMenuOpen.toString());
            
            // Cambiar ícono
            const icon = Navigation.DOM.mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = isMenuOpen ? 'icon-cancel text-xl' : 'icon-menu text-xl';
            }
            
            // Prevenir scroll cuando el menú está abierto
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        });
        
        // Enfocar el primer enlace del menú si se abre
        if (isMenuOpen) {
            setTimeout(() => {
                const firstLink = Navigation.DOM.mobileMenu.querySelector('a');
                if (firstLink) firstLink.focus();
            }, 100);
        }
    }
    
    static initSmoothScroll() {
        // Polyfill para scroll-behavior: smooth
        if (!('scrollBehavior' in document.documentElement.style)) {
            const smoothScroll = function(target) {
                const startPosition = window.pageYOffset;
                const targetPosition = target.offsetTop;
                const distance = targetPosition - startPosition;
                const duration = 500;
                let start = null;
                
                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = ease(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }
                
                function ease(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t + b;
                    t--;
                    return -c / 2 * (t * (t - 2) - 1) + b;
                }
                
                requestAnimationFrame(animation);
            };
            
            // Sobrescribir el comportamiento por defecto
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    const targetElement = document.getElementById(href.substring(1));
                    if (targetElement) {
                        e.preventDefault();
                        smoothScroll(targetElement);
                    }
                });
            });
        }
    }
    
    static initBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top') || 
                           Navigation.createBackToTopButton();
        
        // Controlar visibilidad del botón optimizado
        const updateBackToTopVisibility = PerformanceOptimizer.throttle(() => {
            PerformanceOptimizer.batchWrites(() => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.remove('back-to-top-hidden');
                    backToTopBtn.classList.add('back-to-top-visible');
                    backToTopBtn.style.visibility = 'visible';
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.pointerEvents = 'auto';
                    backToTopBtn.removeAttribute('tabindex');
                } else {
                    backToTopBtn.classList.remove('back-to-top-visible');
                    backToTopBtn.classList.add('back-to-top-hidden');
                    backToTopBtn.style.visibility = 'hidden';
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.pointerEvents = 'none';
                    backToTopBtn.setAttribute('tabindex', '-1');
                }
            });
        }, 100);
        
        window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
        
        // Evento para volver al inicio
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Mover foco al skip link para mejor accesibilidad
            if (Navigation.DOM.skipLink) {
                setTimeout(() => Navigation.DOM.skipLink.focus(), 500);
            }
            
            // Anunciar acción para lectores de pantalla
            Accessibility.announce('Volviendo al inicio de la página');
        });
        
        // Manejar navegación por teclado
        backToTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                backToTopBtn.click();
            }
        });
        
        // Inicializar visibilidad
        updateBackToTopVisibility();
        
        return backToTopBtn;
    }
    
    static createBackToTopButton() {
        const backToTopBtn = Utilities.createElement('button', {
            id: 'back-to-top',
            class: 'back-to-top-btn back-to-top-hidden',
            'aria-label': 'Volver al inicio de la página'
        }, '<i class="icon-up-open" aria-hidden="true"></i>');
        
        document.body.appendChild(backToTopBtn);
        return backToTopBtn;
    }
    
    static initThemeToggle() {
        if (!Navigation.DOM.themeToggle || Navigation.DOM.themeToggle.length === 0) return;
        
        // Agregar eventos a todos los botones de tema
        Navigation.DOM.themeToggle.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                Navigation.toggleTheme();
            });
            
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    Navigation.toggleTheme();
                }
            });
        });
        
        Navigation.updateThemeButtons();
    }
    
    static toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Actualizar todos los botones
        Navigation.updateThemeButtons();
        
        // Cerrar menú móvil si está abierto
        if (Navigation.DOM.mobileMenu?.classList.contains('open')) {
            Navigation.toggleMobileMenu();
        }
        
        // Anunciar cambio para accesibilidad
        Accessibility.announce(`Modo ${isDark ? 'oscuro' : 'claro'} activado`);
        
        return isDark;
    }
    
    static updateThemeButtons() {
        if (!Navigation.DOM.themeToggle || Navigation.DOM.themeToggle.length === 0) return;
        
        PerformanceOptimizer.batchReads(() => {
            const isDark = document.documentElement.classList.contains('dark');
            
            // Actualizar todos los botones
            Navigation.DOM.themeToggle.forEach(button => {
                PerformanceOptimizer.batchWrites(() => {
                    button.setAttribute('aria-pressed', isDark.toString());
                    
                    // Actualizar íconos en cada botón
                    const moonIcon = button.querySelector('.icon-moon');
                    const sunIcon = button.querySelector('.icon-sun');
                    
                    if (moonIcon && sunIcon) {
                        if (isDark) {
                            moonIcon.classList.add('hidden');
                            sunIcon.classList.remove('hidden');
                        } else {
                            moonIcon.classList.remove('hidden');
                            sunIcon.classList.add('hidden');
                        }
                    }
                });
            });
        });
    }
}