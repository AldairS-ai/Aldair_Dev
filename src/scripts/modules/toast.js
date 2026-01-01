import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';

// ===== SISTEMA DE NOTIFICACIONES TOAST =====
export class ToastSystem {
    static container = null;
    static queue = [];
    static isShowing = false;
    
    static init() {
        this.createContainer();
    }
    
    static createContainer() {
        this.container = Utilities.createElement('div', {
            class: 'toast-container',
            'role': 'alert',
            'aria-live': 'assertive',
            'aria-label': 'Notificaciones del sistema'
        });
        
        document.body.appendChild(this.container);
    }
    
    static show(message, type = 'info', duration = 5000) {
        const toast = {
            message,
            type,
            duration,
            timestamp: Date.now()
        };
        
        this.queue.push(toast);
        this.processQueue();
        
        return toast;
    }
    
    static processQueue() {
        if (this.isShowing || this.queue.length === 0) return;
        
        this.isShowing = true;
        const toast = this.queue.shift();
        this.createToast(toast);
    }
    
    static createToast(toast) {
        const toastElement = Utilities.createElement('div', {
            class: `toast toast-${toast.type}`,
            role: 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        });
        
        // Ícono según tipo
        let icon = 'info';
        let iconClass = '';
        
        switch (toast.type) {
            case 'success': 
                icon = 'ok';
                iconClass = 'text-green-100';
                break;
            case 'error': 
                icon = 'error';  
                iconClass = 'text-red-100';
                break;
            case 'warning': 
                icon = 'attention'; 
                iconClass = 'text-yellow-100';
                break;
            case 'info': 
                icon = 'info'; 
                iconClass = 'text-blue-100';
                break;
        }
        
        // ¡IMPORTANTE: Quita "fas fa-" y usa solo "icon-"
        toastElement.innerHTML = `
            <i class="icon-${icon} ${iconClass}" aria-hidden="true"></i>
            <span class="toast-message">${toast.message}</span>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i class="icon-cancel" aria-hidden="true"></i>
            </button>
        `;
        
        this.container.appendChild(toastElement);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            toastElement.classList.add('toast-visible');
        });
        
        // Botón de cierre
        const closeBtn = toastElement.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toastElement));
        
        // Auto-dismiss si duration > 0
        if (toast.duration > 0) {
            setTimeout(() => this.dismiss(toastElement), toast.duration);
        }
        
        // Cuando la notificación termine, procesar siguiente
        toastElement.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' && toastElement.classList.contains('toast-exiting')) {
                toastElement.remove();
                this.isShowing = false;
                this.processQueue();
            }
        });
        
        return toastElement;
    }
    
    static dismiss(toastElement) {
        if (!toastElement || toastElement.classList.contains('toast-exiting')) return;
        
        toastElement.classList.remove('toast-visible');
        toastElement.classList.add('toast-exiting');
    }
    
    static success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }
    
    static error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }
    
    static warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }
    
    static info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}