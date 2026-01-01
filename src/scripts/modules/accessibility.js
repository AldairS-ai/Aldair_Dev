// ===== FUNCIONALIDAD DE ACCESIBILIDAD =====
import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';

export class Accessibility {
    static init() {
        this.initFocusVisiblePolyfill();
        this.initSkipLink();
        this.initAriaLiveRegions();
        this.initHighContrastMode();
        this.initReducedMotion();
    }
    
    static initFocusVisiblePolyfill() {
        if (!CSS.supports('selector(:focus-visible)')) {
            document.addEventListener('keydown', function() {
                document.documentElement.classList.add('focus-visible');
            });
            
            document.addEventListener('mousedown', function() {
                document.documentElement.classList.remove('focus-visible');
            });
        }
    }
    
    static initSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('focus', () => {
                Utilities.addClass(skipLink, 'skip-link-focused');
            });
            
            skipLink.addEventListener('blur', () => {
                Utilities.removeClass(skipLink, 'skip-link-focused');
            });
        }
    }
    
    static initAriaLiveRegions() {
        // Crear región ARIA para anuncios dinámicos
        const liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            const region = Utilities.createElement('div', {
                id: 'live-region',
                'aria-live': 'polite',
                'aria-atomic': 'true',
                class: 'sr-only'
            });
            document.body.appendChild(region);
        }
    }
    
    static initHighContrastMode() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            Utilities.addClass(document.documentElement, 'high-contrast');
        }
        
        prefersHighContrast.addEventListener('change', (e) => {
            if (e.matches) {
                Utilities.addClass(document.documentElement, 'high-contrast');
            } else {
                Utilities.removeClass(document.documentElement, 'high-contrast');
            }
        });
    }
    
    static initReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            Utilities.addClass(document.documentElement, 'reduce-motion');
        }
        
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                Utilities.addClass(document.documentElement, 'reduce-motion');
            } else {
                Utilities.removeClass(document.documentElement, 'reduce-motion');
            }
        });
    }
    
    static trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }
    
    static makeFocusable(element, focusable = true) {
        if (element) {
            element.tabIndex = focusable ? 0 : -1;
        }
    }
    
    static announce(message, priority = 'polite') {
        Utilities.announceToScreenReader(message, priority);
    }
}