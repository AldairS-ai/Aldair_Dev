// ===== FUNCIONES AUXILIARES =====
import { PerformanceOptimizer } from './performance.js';

export class Utilities {
    static announceToScreenReader(message, priority = 'polite') {
        const announcement = document.getElementById('live-region');
        if (announcement) {
            announcement.setAttribute('aria-live', priority);
            announcement.textContent = message;
            
            // Limpiar después de un tiempo
            setTimeout(() => {
                announcement.textContent = '';
            }, 1000);
        }
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static formatPhoneNumber(phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    static getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset
        };
    }
    
    static isElementInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                          (rect.top + rect.height >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                         (rect.left + rect.width >= windowWidth * threshold);
        
        return vertInView && horInView;
    }
    
    static addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            PerformanceOptimizer.batchWrites(() => {
                element.classList.add(className);
            });
        }
    }
    
    static removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            PerformanceOptimizer.batchWrites(() => {
                element.classList.remove(className);
            });
        }
    }
    
    static toggleClass(element, className) {
        if (element) {
            PerformanceOptimizer.batchWrites(() => {
                element.classList.toggle(className);
            });
        }
    }
    
    static setAttributes(element, attributes) {
        if (element) {
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }
    }
    
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        if (attributes) {
            this.setAttributes(element, attributes);
        }
        
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof Node) {
                element.appendChild(content);
            }
        }
        
        return element;
    }
    
    static measureElement(element) {
        return PerformanceOptimizer.batchReads(() => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight,
                top: element.offsetTop,
                left: element.offsetLeft
            };
        });
    }
}