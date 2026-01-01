import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';
import { Accessibility } from './accessibility.js';
import { getState, updateState } from '../state.js';
import { CONFIG, SELECTORS } from '../config.js';

// ===== CARRUSEL OPTIMIZADO =====
export class Carousel {
    static DOM = {};
    static autoplayInterval = null;
    static isHorizontalDrag = false; // Variable añadida para control de arrastre
    
    static init() {
        this.cacheDOM();
        
        if (!this.DOM.projectsTrack || !this.DOM.carouselIndicators) return;
        
        const slides = this.DOM.projectsTrack.querySelectorAll('.carousel-slide');
        updateState('totalProjects', slides.length);
        
        if (getState().totalProjects === 0) return;
        
        // Medir ancho de slide
        this.measureSlides();
        this.createIndicators();
        this.initNavigation();
        this.initDragAndTouch();
        this.initResizeObserver();
        this.initAutoplay();
        this.goToSlide(0);
    }
    
    static cacheDOM() {
        this.DOM = {
            projectsTrack: document.querySelector(SELECTORS.projectsTrack),
            carouselPrev: document.querySelector(SELECTORS.carouselPrev),
            carouselNext: document.querySelector(SELECTORS.carouselNext),
            carouselIndicators: document.querySelector(SELECTORS.carouselIndicators)
        };
    }
    
    static measureSlides() {
        return PerformanceOptimizer.batchReads(() => {
            const slides = this.DOM.projectsTrack.querySelectorAll('.carousel-slide');
            if (slides.length > 0) {
                updateState('carouselSlideWidth', slides[0].offsetWidth);
            }
        });
    }
    
    static createIndicators() {
        if (!this.DOM.carouselIndicators) return;
        
        this.DOM.carouselIndicators.innerHTML = '';
        const total = getState().totalProjects;
        
        for (let i = 0; i < total; i++) {
            const indicator = Utilities.createElement('button', {
                class: `carousel-indicator ${i === getState().currentProjectIndex ? 'active' : ''}`,
                'aria-label': `Ver proyecto ${i + 1}`,
                'role': 'tab',
                'aria-selected': i === getState().currentProjectIndex ? 'true' : 'false',
                'aria-controls': `slide-${i}`,
                id: `indicator-${i}`,
                'data-index': i,
                tabindex: i === getState().currentProjectIndex ? '0' : '-1'
            });
            
            indicator.innerHTML = `<span class="sr-only">Proyecto ${i + 1}</span>`;
            
            indicator.addEventListener('click', () => this.goToSlide(i));
            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(i);
                }
            });
            
            this.DOM.carouselIndicators.appendChild(indicator);
        }
    }
    
    static goToSlide(index) {
        let newIndex = index;
        
        if (newIndex < 0) newIndex = getState().totalProjects - 1;
        if (newIndex >= getState().totalProjects) newIndex = 0;
        
        updateState('currentProjectIndex', newIndex);
        
        // Calcular desplazamiento
        const offset = -newIndex * getState().carouselSlideWidth;
        
        // Aplicar transformación con RAF para batch
        PerformanceOptimizer.batchWrites(() => {
            this.DOM.projectsTrack.style.transform = `translateX(${offset}px)`;
        }).then(() => {
            // Actualizar indicadores
            return PerformanceOptimizer.batchWrites(() => {
                const indicators = this.DOM.carouselIndicators.querySelectorAll('.carousel-indicator');
                indicators.forEach((indicator, i) => {
                    const isActive = i === newIndex;
                    indicator.classList.toggle('active', isActive);
                    indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    indicator.tabIndex = isActive ? '0' : '-1';
                });
            });
        }).then(() => {
            // Actualizar accesibilidad de slides
            return PerformanceOptimizer.batchReads(() => {
                const slides = this.DOM.projectsTrack.querySelectorAll('.carousel-slide');
                slides.forEach((slide, i) => {
                    const isActive = i === newIndex;
                    slide.setAttribute('aria-hidden', !isActive ? 'true' : 'false');
                    
                    // Controlar navegación por teclado
                    this.updateSlideAccessibility(slide, isActive);
                    
                    slide.id = `slide-${i}`;
                    slide.setAttribute('role', 'tabpanel');
                    slide.setAttribute('aria-labelledby', `indicator-${i}`);
                });
            });
        });
        
        return newIndex;
    }
    
    static updateSlideAccessibility(slide, isActive) {
        const focusableElements = slide.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(el => {
            if (!isActive) {
                if (!el.hasAttribute('data-original-tabindex')) {
                    el.setAttribute('data-original-tabindex', el.tabIndex);
                }
                el.tabIndex = -1;
                Utilities.addClass(el, 'inactive-slide-element');
            } else {
                const originalTabIndex = el.getAttribute('data-original-tabindex');
                if (originalTabIndex !== null) {
                    el.tabIndex = originalTabIndex;
                    el.removeAttribute('data-original-tabindex');
                } else {
                    el.tabIndex = 0;
                }
                Utilities.removeClass(el, 'inactive-slide-element');
            }
        });
    }
    
    static nextSlide() {
        return this.goToSlide(getState().currentProjectIndex + 1);
    }
    
    static prevSlide() {
        return this.goToSlide(getState().currentProjectIndex - 1);
    }
    
    static initNavigation() {
        // Botones anterior/siguiente
        if (this.DOM.carouselPrev) {
            this.DOM.carouselPrev.addEventListener('click', () => this.prevSlide());
            this.DOM.carouselPrev.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.prevSlide();
                }
            });
        }
        
        if (this.DOM.carouselNext) {
            this.DOM.carouselNext.addEventListener('click', () => this.nextSlide());
            this.DOM.carouselNext.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.nextSlide();
                }
            });
        }
        
        // Navegación por teclado
        document.addEventListener('keydown', PerformanceOptimizer.throttle((e) => {
            if (e.target.closest('#proyectos')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            }
        }, 300));
    }
    
    static initDragAndTouch() {
        let startX = 0;
        let currentX = 0;
        
        const handleDragStart = (e) => {
            // Solo iniciar arrastre si es un solo toque/clic
            if (e.type === 'touchstart' && e.touches.length > 1) return;
            
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            currentX = startX;
            
            // Reiniciar flags de arrastre
            updateState('isDragging', true);
            this.isHorizontalDrag = false;
            
            PerformanceOptimizer.batchWrites(() => {
                this.DOM.projectsTrack.style.cursor = 'grabbing';
                Utilities.addClass(this.DOM.projectsTrack, 'grabbing');
            });
        };
        
        const handleDragMove = PerformanceOptimizer.throttle((e) => {
            if (!getState().isDragging) return;
            
            // Para touch, verificar que solo hay un toque
            if (e.type === 'touchmove' && e.touches.length > 1) return;
            
            currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const diffX = currentX - startX;
            const diffY = e.type.includes('mouse') ? 
                Math.abs(e.movementY) : 
                Math.abs(e.touches[0].pageY - startX);
            
            // Determinar si es un arrastre horizontal significativo (más de 10px en X y más X que Y)
            if (!this.isHorizontalDrag && Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) {
                this.isHorizontalDrag = true;
            }
            
            // Si es un arrastre horizontal, aplicar transformación
            if (this.isHorizontalDrag) {
                // Solo prevenir comportamiento por defecto si es cancelable
                if (e.cancelable) {
                    e.preventDefault();
                }
                
                // Aplicar transformación temporal
                PerformanceOptimizer.batchWrites(() => {
                    const baseOffset = -getState().currentProjectIndex * getState().carouselSlideWidth;
                    this.DOM.projectsTrack.style.transform = `translateX(${baseOffset + diffX}px)`;
                });
            }
        }, 16);
        
        const handleDragEnd = (e) => {
            if (!getState().isDragging) return;
            
            PerformanceOptimizer.batchWrites(() => {
                this.DOM.projectsTrack.style.cursor = '';
                Utilities.removeClass(this.DOM.projectsTrack, 'grabbing');
            });
            
            updateState('isDragging', false);
            
            const diff = currentX - startX;
            
            // Solo cambiar slide si fue un arrastre horizontal significativo
            if (this.isHorizontalDrag && Math.abs(diff) > getState().carouselSlideWidth * 0.3) {
                if (diff > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            } else {
                // Volver a la posición actual
                this.goToSlide(getState().currentProjectIndex);
            }
            
            // Reiniciar flag
            this.isHorizontalDrag = false;
        };
        
        // Eventos de mouse
        this.DOM.projectsTrack.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        
        // Eventos de touch optimizados
        // Para touchstart, usar passive: true ya que no usamos preventDefault aquí
        this.DOM.projectsTrack.addEventListener('touchstart', handleDragStart, { 
            passive: true 
        });
        
        // Para touchmove, necesitamos passive: false solo cuando realmente usamos preventDefault
        // Pero mejor manejar dinámicamente
        const handleTouchMoveWrapper = (e) => {
            // Pasar el evento a handleDragMove
            handleDragMove(e);
        };
        
        document.addEventListener('touchmove', handleTouchMoveWrapper, { 
            passive: false 
        });
        
        document.addEventListener('touchend', handleDragEnd);
        document.addEventListener('touchcancel', handleDragEnd);
        
        // Prevenir comportamiento por defecto del navegador en el carrusel
        this.DOM.projectsTrack.addEventListener('touchstart', (e) => {
            // Si hay un solo toque en el carrusel, permitir arrastre
            if (e.touches.length === 1) {
                // No prevenir aquí, solo marcar que estamos en el carrusel
            }
        }, { passive: true });
        
        // También prevenir arrastre de imágenes dentro del carrusel
        const images = this.DOM.projectsTrack.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        });
    }
    
    static initResizeObserver() {
        if (!('ResizeObserver' in window) || !this.DOM.projectsTrack) return;
        
        const currentObserver = getState().resizeObserver;
        if (currentObserver) {
            currentObserver.disconnect();
        }
        
        const resizeObserver = new ResizeObserver(PerformanceOptimizer.debounce((entries) => {
            PerformanceOptimizer.batchReads(() => {
                const slides = this.DOM.projectsTrack.querySelectorAll('.carousel-slide');
                if (slides.length > 0) {
                    updateState('carouselSlideWidth', slides[0].offsetWidth);
                    const offset = -getState().currentProjectIndex * getState().carouselSlideWidth;
                    
                    PerformanceOptimizer.batchWrites(() => {
                        this.DOM.projectsTrack.style.transform = `translateX(${offset}px)`;
                    });
                }
            });
        }, 250));
        
        updateState('resizeObserver', resizeObserver);
        resizeObserver.observe(this.DOM.projectsTrack);
    }
    
    static initAutoplay() {
        if (CONFIG.carousel.autoplay) {
            this.startAutoplay();
            
            // Pausar autoplay en hover/focus
            this.DOM.projectsTrack.addEventListener('mouseenter', () => this.stopAutoplay());
            this.DOM.projectsTrack.addEventListener('mouseleave', () => this.startAutoplay());
            
            // Pausar autoplay en focus
            this.DOM.projectsTrack.addEventListener('focusin', () => this.stopAutoplay());
            this.DOM.projectsTrack.addEventListener('focusout', () => this.startAutoplay());
        }
    }
    
    static startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, CONFIG.carousel.autoplayDelay);
    }
    
    static stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    // Método público para control externo
    static goToSlideExternal(index) {
        if (typeof index === 'number' && this.DOM.projectsTrack) {
            const slides = this.DOM.projectsTrack.querySelectorAll('.carousel-slide').length;
            if (index >= 0 && index < slides) {
                return this.goToSlide(index);
            }
        }
        return getState().currentProjectIndex;
    }
}