// ===== OPTIMIZACIONES PARA REDUCCIÓN DE REFLOWS =====
export class PerformanceOptimizer {
    static rafQueue = [];
    static pendingRafs = false;
    
    static batchReads(callback) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                callback();
                resolve();
            });
        });
    }
    
    static batchWrites(callback) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                callback();
                requestAnimationFrame(() => resolve());
            });
        });
    }
    
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static scheduleTask(task) {
        if ('scheduler' in window && window.scheduler.postTask) {
            return scheduler.postTask(task, { priority: 'user-visible' });
        } else {
            return new Promise(resolve => setTimeout(() => {
                task();
                resolve();
            }, 0));
        }
    }
}