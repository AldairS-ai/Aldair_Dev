import { PerformanceOptimizer } from './performance.js';
import { Utilities } from './utilities.js';
import { Accessibility } from './accessibility.js';
import { getState, updateState } from '../state.js';
import { CONFIG, SELECTORS } from '../config.js';
import { ToastSystem } from './toast.js';

// ===== FORMULARIO DE CONTACTO =====
export class ContactForm {
    static DOM = {};
    static validationTimeout = null;
    
    static init() {
        this.cacheDOM();
        
        if (!this.DOM.contactForm) return;
        
        this.initValidation();
        this.initSubmission();
        this.initFormStates();
    }
    
    static cacheDOM() {
        this.DOM = {
            contactForm: document.querySelector(SELECTORS.contactForm),
            submitBtn: document.querySelector(SELECTORS.submitBtn),
            submitText: document.querySelector(SELECTORS.submitText),
            submitSpinner: document.querySelector(SELECTORS.submitSpinner)
        };
    }
    
    static initFormStates() {
        // Almacenar el texto original del botón
        if (this.DOM.submitText) {
            this.DOM.submitBtn.dataset.originalText = this.DOM.submitText.textContent;
        }
    }
    
    static initValidation() {
        const inputs = this.DOM.contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Validar solo cuando el usuario sale del campo (blur)
            input.addEventListener('blur', (e) => this.validateField(e));
            
            // Limpiar errores y estados mientras el usuario escribe
            input.addEventListener('input', (e) => {
                const field = e.target;
                const fieldError = field.nextElementSibling;
                
                // Limpiar timeout de validación previo si existe
                clearTimeout(this.validationTimeout);
                
                // Solo limpiar si existe un error visible
                if (fieldError && fieldError.classList.contains('field-error')) {
                    this.clearFieldError(field);
                }
                
                // Remover estados de validación visual mientras se escribe
                Utilities.removeClass(field, 'invalid', 'valid');
            });
        });
    }
    
    static validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        // Limpiar error previo si existe
        this.clearFieldError(field);
        
        // Validaciones específicas
        let error = '';
        
        if (field.required && !value) {
            error = 'Este campo es obligatorio';
        } else if (field.type === 'email' && value) {
            if (!Utilities.validateEmail(value)) {
                error = 'Por favor, ingresa un email válido';
            }
        } else if (field.id === 'nombre' && value.length < 2) {
            error = 'El nombre debe tener al menos 2 caracteres';
        } else if (field.id === 'mensaje' && value.length < 10) {
            error = 'El mensaje debe tener al menos 10 caracteres';
        }
        
        // Mostrar error si existe
        if (error) {
            this.showFieldError(field, error);
            return false;
        }
        
        // Marcar como válido solo si hay contenido
        if (value) {
            Utilities.removeClass(field, 'invalid');
            Utilities.addClass(field, 'valid');
        }
        
        return true;
    }
    
    static showFieldError(field, message) {
        return new Promise(resolve => {
            PerformanceOptimizer.batchWrites(() => {
                // Verificar si ya existe un mensaje de error para este campo
                const existingError = field.nextElementSibling;
                if (existingError && existingError.classList.contains('field-error')) {
                    // Actualizar el mensaje existente
                    existingError.textContent = message;
                } else {
                    // Crear nuevo elemento de error
                    const errorElement = Utilities.createElement('div', {
                        class: 'field-error',
                        role: 'alert',
                        'aria-live': 'polite'
                    }, message);
                    
                    field.parentNode.insertBefore(errorElement, field.nextSibling);
                }
                
                Utilities.addClass(field, 'invalid');
                Utilities.removeClass(field, 'valid');
                
                // Anunciar error para lectores de pantalla
                setTimeout(() => {
                    Accessibility.announce(`Error: ${message}`, 'assertive');
                }, 100);
                
                resolve();
            });
        });
    }
    
    static clearFieldError(field) {
        return new Promise(resolve => {
            const fieldError = field.nextElementSibling;
            
            if (fieldError && fieldError.classList.contains('field-error')) {
                PerformanceOptimizer.batchWrites(() => {
                    fieldError.remove();
                    Utilities.removeClass(field, 'invalid');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
    
    static initSubmission() {
        this.DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Prevenir doble clic en botón de submit
        this.DOM.submitBtn.addEventListener('click', (e) => {
            if (getState().isFormSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    }
    
    static async handleSubmit(e) {
        e.preventDefault();
        
        if (getState().isFormSubmitting) {
            return;
        }
        
        // Limpiar todos los errores antes de la validación completa
        const inputs = this.DOM.contactForm.querySelectorAll('input, textarea');
        await Promise.all(
            Array.from(inputs).map(input => this.clearFieldError(input))
        );
        
        // Validar todos los campos
        let isValid = true;
        let firstInvalidField = null;
        
        for (const input of inputs) {
            // Validar directamente sin simular eventos
            const value = input.value.trim();
            let error = '';
            
            if (input.required && !value) {
                error = 'Este campo es obligatorio';
            } else if (input.type === 'email' && value) {
                if (!Utilities.validateEmail(value)) {
                    error = 'Por favor, ingresa un email válido';
                }
            } else if (input.id === 'nombre' && value.length < 2) {
                error = 'El nombre debe tener al menos 2 caracteres';
            } else if (input.id === 'mensaje' && value.length < 10) {
                error = 'El mensaje debe tener al menos 10 caracteres';
            }
            
            if (error) {
                isValid = false;
                await this.showFieldError(input, error);
                if (!firstInvalidField) {
                    firstInvalidField = input;
                }
            }
        }
        
        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
                // Anunciar error general para accesibilidad
                setTimeout(() => {
                    Accessibility.announce('El formulario tiene errores. Por favor, revisa los campos marcados.', 'assertive');
                }, 150);
            }
            return;
        }
        
        // Cambiar estado a enviando
        updateState('isFormSubmitting', true);
        this.setSubmittingState(true, 'Enviando...');
        
        try {
            const formData = new FormData(this.DOM.contactForm);
            
            const response = await fetch(this.DOM.contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Éxito - solo cambiar estado del botón
                this.setSubmittingState(true, '¡Enviado!', 'success');
                
                // MOSTRAR TOAST DE ÉXITO
                ToastSystem.success(CONFIG.form.successMessage, 5000);
                
                // Anunciar éxito para accesibilidad
                setTimeout(() => {
                    Accessibility.announce('Mensaje enviado con éxito', 'polite');
                }, 100);
                
                // Resetear formulario después de éxito
                setTimeout(() => {
                    this.resetForm();
                    this.setSubmittingState(false);
                }, 2000);
                
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            
            // Error - mostrar solo en el botón
            this.setSubmittingState(true, 'Error al enviar', 'error');
            
            // Anunciar error para accesibilidad
            setTimeout(() => {
                Accessibility.announce('Error al enviar el mensaje. Por favor, intenta nuevamente.', 'assertive');
            }, 100);
            
            // Restaurar después de 2 segundos
            setTimeout(() => {
                this.setSubmittingState(false);
            }, 2000);
        } finally {
            // Restablecer estado después de un tiempo
            setTimeout(() => {
                updateState('isFormSubmitting', false);
            }, 3000);
        }
    }
    
    static setSubmittingState(isSubmitting, customText = null, state = 'submitting') {
        return new Promise(resolve => {
            PerformanceOptimizer.batchWrites(() => {
                if (this.DOM.submitBtn) {
                    this.DOM.submitBtn.disabled = isSubmitting;
                    this.DOM.submitBtn.dataset.state = state;
                    
                    if (isSubmitting) {
                        Utilities.addClass(this.DOM.submitBtn, 'submitting');
                    } else {
                        Utilities.removeClass(this.DOM.submitBtn, 'submitting');
                        this.DOM.submitBtn.removeAttribute('data-state');
                    }
                }
                
                if (this.DOM.submitText) {
                    if (customText) {
                        this.DOM.submitText.textContent = customText;
                    } else if (isSubmitting) {
                        this.DOM.submitText.textContent = 'Enviando...';
                    } else {
                        this.DOM.submitText.textContent = this.DOM.submitBtn.dataset.originalText || 'Enviar Mensaje';
                    }
                }
                
                if (this.DOM.submitSpinner) {
                    isSubmitting ? 
                        Utilities.removeClass(this.DOM.submitSpinner, 'hidden') :
                        Utilities.addClass(this.DOM.submitSpinner, 'hidden');
                }
                
                resolve();
            });
        });
    }
    
    static resetForm() {
        return new Promise(resolve => {
            PerformanceOptimizer.batchWrites(() => {
                this.DOM.contactForm.reset();
                
                // Restablecer estados de validación
                const inputs = this.DOM.contactForm.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    Utilities.removeClass(input, 'valid', 'invalid');
                    this.clearFieldError(input);
                });
                
                resolve();
            });
        });
    }
}