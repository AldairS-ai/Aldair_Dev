
import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';
import { CONFIG } from '../config.js';
import { getState } from '../state.js';

// ===== ANIMACIONES Y EFECTOS =====
export class Animations {
    static init() {
        this.initTypewriter();
        this.initProgressBars();
        this.initIntersectionObserver();
        this.initLazyLoading();
        this.initScrollAnimations();
    }
    
    static initTypewriter() {
        const typewriterText = document.getElementById('typewriter-text');
        const typewriterCursor = document.getElementById('typewriter-cursor');
        
        if (!typewriterText || !typewriterCursor) return;
        
        const phrases = [
            'Desarrollador Frontend',
            'Especialista en React',
            'Enfocado en Accesibilidad',
            'Creador de Experiencias Web'
        ];
        
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let isPaused = false;
        
        function typeWriter() {
            if (isPaused) return;
            
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (!isDeleting && currentCharIndex <= currentPhrase.length) {
                // Escribiendo
                PerformanceOptimizer.batchWrites(() => {
                    typewriterText.textContent = currentPhrase.substring(0, currentCharIndex);
                });
                currentCharIndex++;
                setTimeout(typeWriter, 100);
            } else if (isDeleting && currentCharIndex >= 0) {
                // Borrando
                PerformanceOptimizer.batchWrites(() => {
                    typewriterText.textContent = currentPhrase.substring(0, currentCharIndex);
                });
                currentCharIndex--;
                setTimeout(typeWriter, 50);
            } else {
                // Cambiar entre escribir y borrar
                isDeleting = !isDeleting;
                
                if (!isDeleting) {
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                }
                
                // Pausa antes de empezar de nuevo
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    typeWriter();
                }, 1500);
            }
        }
        
        // Iniciar typewriter después de un breve retraso
        setTimeout(typeWriter, 1000);
    }
    
    static initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        PerformanceOptimizer.batchWrites(() => {
                            const progressBar = entry.target;
                            const width = progressBar.style.width;
                            
                            // Reiniciar y animar
                            progressBar.style.width = '0%';
                            
                            setTimeout(() => {
                                PerformanceOptimizer.batchWrites(() => {
                                    progressBar.style.width = width;
                                    progressBar.classList.add('animated');
                                });
                            }, 100);
                            
                            observer.unobserve(progressBar);
                        });
                    }
                });
            }, {
                threshold: 0.5
            });
            
            progressBars.forEach(bar => observer.observe(bar));
        } else {
            // Fallback para navegadores sin IntersectionObserver
            setTimeout(() => {
                PerformanceOptimizer.batchWrites(() => {
                    progressBars.forEach(bar => {
                        bar.classList.add('animated');
                    });
                });
            }, 500);
        }
    }
    
    static initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const sections = document.querySelectorAll('.section-transition');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    PerformanceOptimizer.batchWrites(() => {
                        entry.target.classList.add('visible');
                    });
                }
            });
        }, {
            threshold: CONFIG.animations.scrollThreshold,
            rootMargin: CONFIG.animations.scrollRootMargin
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    static initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        PerformanceOptimizer.batchWrites(() => {
                            const img = entry.target;
                            img.classList.add('loaded');
                            
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                delete img.dataset.src;
                            }
                            
                            observer.unobserve(img);
                        });
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    static initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const animation = element.dataset.animate || 'fadeIn';
                        
                        PerformanceOptimizer.batchWrites(() => {
                            element.classList.add(`animate-${animation}`);
                            element.classList.add('animated');
                        });
                        
                        observer.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -20px 0px'
            });
            
            animatedElements.forEach(element => observer.observe(element));
        }
    }
    
    static fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            PerformanceOptimizer.batchWrites(() => {
                element.style.opacity = 0;
                element.style.display = 'block';
                
                setTimeout(() => {
                    PerformanceOptimizer.batchWrites(() => {
                        element.style.opacity = 1;
                        element.style.transition = `opacity ${duration}ms ease`;
                    });
                }, 10);
                
                setTimeout(resolve, duration + 10);
            });
        });
    }
    
    static fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            PerformanceOptimizer.batchWrites(() => {
                element.style.opacity = 1;
                element.style.transition = `opacity ${duration}ms ease`;
                
                setTimeout(() => {
                    PerformanceOptimizer.batchWrites(() => {
                        element.style.opacity = 0;
                    });
                }, 10);
                
                setTimeout(() => {
                    PerformanceOptimizer.batchWrites(() => {
                        element.style.display = 'none';
                        element.style.transition = '';
                    });
                    resolve();
                }, duration + 10);
            });
        });
    }
}
