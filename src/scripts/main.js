// ===== ARCHIVO PRINCIPAL DE INICIALIZACIÓN =====
import { CONFIG, SELECTORS } from './config.js';
import { getState } from './state.js';
import { PerformanceOptimizer } from './modules/performance.js';
import { Utilities } from './modules/utilities.js';
import { Accessibility } from './modules/accessibility.js';
import { Animations } from './modules/animations.js';
import { Navigation } from './modules/navigation.js';
import { Carousel } from './modules/carousel.js';
import { ContactForm } from './modules/form.js';
import { ToastSystem } from './modules/toast.js';

// ===== APLICACIÓN PRINCIPAL =====
class PortfolioApp {
    constructor() {
        this.init();
    }
    
    init() {
        // Configurar año actual
        this.setCurrentYear();
        
        // Inicializar módulos
        this.initModules();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        // Inicializar polyfills
        this.initPolyfills();
    }
    
    setCurrentYear() {
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }
    
    initModules() {
        // Orden de inicialización importante
        Accessibility.init();
        ToastSystem.init();
        Animations.init();
        Navigation.init();
        Carousel.init();
        ContactForm.init();
        
        // Inicializar descarga del CV
        this.initCVDownload();
    }
    
    initCVDownload() {
        const downloadBtn = document.getElementById('download-cv');
        const downloadText = document.getElementById('download-cv-text');
        
        if (!downloadBtn || !downloadText) return;
        
        downloadBtn.addEventListener('click', (e) => {
            if (downloadBtn.classList.contains('downloading')) {
                e.preventDefault();
                return;
            }
            
            const originalText = downloadText.textContent;
            const icon = downloadBtn.querySelector('i');
            const originalIconClass = icon.className;
            
            // Cambiar estado a "descargando"
            downloadBtn.classList.add('downloading');
            downloadText.textContent = 'Descargando...';
            icon.className = 'icon-spinner fa-spin ml-2';
            
            // Simular tiempo de descarga
            setTimeout(() => {
                // Restaurar estado original
                downloadBtn.classList.remove('downloading');
                downloadText.textContent = originalText;
                icon.className = originalIconClass;
                
                // Mostrar notificación de éxito
                ToastSystem.success('CV descargado exitosamente', 3000);
            }, 1500);
        });
    }
    
    setupGlobalEvents() {
        // Detectar conexión
        window.addEventListener('online', () => {
            PerformanceOptimizer.batchWrites(() => {
                document.body.classList.remove('offline');
            });
            ToastSystem.show('Conexión restablecida', 'success', 3000);
        });
        
        window.addEventListener('offline', () => {
            PerformanceOptimizer.batchWrites(() => {
                document.body.classList.add('offline');
            });
            ToastSystem.show('Estás sin conexión a internet', 'warning', 5000);
        });
        
        // Prevenir clics rápidos dobles en botones
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
                
                if (button.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                // Deshabilitar temporalmente para prevenir doble clic
                if (button.type === 'submit' || button.getAttribute('type') === 'submit') {
                    setTimeout(() => {
                        button.disabled = false;
                    }, 1000);
                }
            }
        }, true);
        
        // Mejorar accesibilidad del foco
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                PerformanceOptimizer.batchWrites(() => {
                    document.body.classList.add(CONFIG.accessibility.focusVisibleClass);
                });
            }
        });
        
        document.addEventListener('click', function() {
            PerformanceOptimizer.batchWrites(() => {
                document.body.classList.remove(CONFIG.accessibility.focusVisibleClass);
            });
        });
        
        // Preloader
        window.addEventListener('load', function() {
            setTimeout(() => {
                PerformanceOptimizer.batchWrites(() => {
                    document.documentElement.classList.add('loaded');
                });
            }, 500);
        });
        
        // Manejar cambios de tamaño de ventana optimizado
        window.addEventListener('resize', PerformanceOptimizer.debounce(() => {
            // Recalcular ancho de slides si es necesario
            if (Carousel.DOM.projectsTrack && getState().currentProjectIndex !== undefined) {
                Carousel.measureSlides();
            }
        }, 250));
    }
    
    initPolyfills() {
        // Detectar características modernas
        if (!window.IntersectionObserver) {
            console.warn('IntersectionObserver no soportado, cargando polyfill...');
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
            document.head.appendChild(script);
        }
    }
}

// ===== EXPORTAR FUNCIONES PARA USO GLOBAL =====
window.portfolioApp = {
    goToSlide: (index) => Carousel.goToSlideExternal(index),
    showToast: (message, type, duration) => ToastSystem.show(message, type, duration),
    getState: () => getState(),
    toggleMenu: () => {
        if (Navigation.DOM.mobileMenuToggle) {
            Navigation.toggleMobileMenu();
        }
    },
    toggleTheme: () => Navigation.toggleTheme()
};

// ===== INICIALIZAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new PortfolioApp();
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.error);
    
    // Mostrar error amigable al usuario si es crítico
    if (e.error.message && e.error.message.includes('crítico')) {
        ToastSystem.show('Ocurrió un error inesperado. Por favor, recarga la página.', 'error', 0);
    }
});