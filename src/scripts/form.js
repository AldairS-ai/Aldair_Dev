class SimpleContactForm {
    constructor() {
        // Evitar inicialización duplicada
        if (window.__CONTACT_FORM_INITIALIZED__) {
            return window.contactForm;
        }
        
        this.form = document.getElementById('contact-form');
        if (!this.form) {
            console.warn('Formulario de contacto no encontrado');
            return;
        }
        
        this.submitBtn = document.getElementById('submit-btn');
        this.submitText = document.getElementById('submit-text');
        this.submitSpinner = document.getElementById('submit-spinner');
        
        this.isSubmitting = false;
        this.showedToast = false; 
        
        this.init();
        
        // Marcar como inicializado
        window.__CONTACT_FORM_INITIALIZED__ = true;
        window.contactForm = this;
    }
    
    init() {
        // Guardar texto original del botón
        if (this.submitText) {
            this.originalText = this.submitText.textContent;
        }
        
        // Configurar validación en tiempo real
        this.setupRealTimeValidation();
        
        // Configurar evento de envío
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Configurar eventos de entrada
        this.setupInputEvents();
        
        // Configurar contador de caracteres
        this.setupCharacterCounter();
    }
    
    setupRealTimeValidation() {
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        
        fields.forEach(field => {
            // Validar al perder el foco
            field.addEventListener('blur', () => {
                this.validateField(field, true);
            });
            
            // Limpiar errores al escribir
            field.addEventListener('input', () => {
                this.clearFieldError(field);
                field.classList.remove('border-red-500', 'border-green-500', 'dark:border-red-500', 'dark:border-green-500');
                field.classList.add('border-gray-300', 'dark:border-gray-600');
            });
        });
    }
    
    setupInputEvents() {
        // Validación especial para email
        const emailField = this.form.querySelector('#email');
        if (emailField) {
            emailField.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value && this.isValidEmail(value)) {
                    e.target.classList.remove('border-red-500', 'dark:border-red-500');
                    e.target.classList.add('border-green-500', 'dark:border-green-500');
                } else if (value) {
                    e.target.classList.remove('border-green-500', 'dark:border-green-500');
                    e.target.classList.add('border-red-500', 'dark:border-red-500');
                } else {
                    e.target.classList.remove('border-red-500', 'border-green-500', 'dark:border-red-500', 'dark:border-green-500');
                    e.target.classList.add('border-gray-300', 'dark:border-gray-600');
                }
            });
        }
    }
    
    setupCharacterCounter() {
        const messageField = this.form.querySelector('#mensaje');
        if (messageField) {
            // Crear contador si no existe
            if (!document.getElementById('message-counter')) {
                const counter = document.createElement('div');
                counter.id = 'message-counter';
                counter.className = 'text-sm text-gray-500 dark:text-gray-400 mt-1 text-right';
                counter.textContent = '0/500';
                messageField.parentNode.appendChild(counter);
            }
            
            messageField.addEventListener('input', (e) => {
                const length = e.target.value.length;
                const counter = document.getElementById('message-counter');
                
                if (counter) {
                    counter.textContent = `${length}/500`;
                    
                    // Cambiar color según longitud
                    if (length > 500) {
                        counter.classList.remove('text-gray-500', 'dark:text-gray-400', 'text-yellow-600', 'dark:text-yellow-400');
                        counter.classList.add('text-red-600', 'dark:text-red-400');
                    } else if (length > 450) {
                        counter.classList.remove('text-gray-500', 'dark:text-gray-400', 'text-red-600', 'dark:text-red-400');
                        counter.classList.add('text-yellow-600', 'dark:text-yellow-400');
                    } else {
                        counter.classList.remove('text-red-600', 'dark:text-red-400', 'text-yellow-600', 'dark:text-yellow-400');
                        counter.classList.add('text-gray-500', 'dark:text-gray-400');
                    }
                }
                
                // Validar en tiempo real
                if (length < 10 && length > 0) {
                    this.showFieldError(messageField, 'El mensaje debe tener al menos 10 caracteres', false);
                } else if (length > 500) {
                    this.showFieldError(messageField, 'El mensaje no puede exceder 500 caracteres', false);
                } else if (length >= 10) {
                    this.clearFieldError(messageField);
                    messageField.classList.remove('border-red-500', 'dark:border-red-500');
                    messageField.classList.add('border-green-500', 'dark:border-green-500');
                } else {
                    this.clearFieldError(messageField);
                    messageField.classList.remove('border-red-500', 'border-green-500', 'dark:border-red-500', 'dark:border-green-500');
                    messageField.classList.add('border-gray-300', 'dark:border-gray-600');
                }
            });
            
            // También validar al perder foco
            messageField.addEventListener('blur', () => {
                this.validateField(messageField, true);
            });
        }
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validateField(field, showError = false) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validaciones específicas
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Por favor, ingresa un email válido';
        } else if (field.id === 'nombre' && value.length < 2) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 2 caracteres';
        } else if (field.id === 'asunto' && value.length < 3) {
            isValid = false;
            errorMessage = 'El asunto debe tener al menos 3 caracteres';
        } else if (field.id === 'mensaje' && value.length < 10) {
            isValid = false;
            errorMessage = 'El mensaje debe tener al menos 10 caracteres';
        } else if (field.id === 'mensaje' && value.length > 500) {
            isValid = false;
            errorMessage = 'El mensaje no puede exceder 500 caracteres';
        }
        
        // Validación especial para checkbox de privacidad
        if (field.type === 'checkbox' && field.required && !field.checked) {
            isValid = false;
            errorMessage = 'Debes aceptar la política de privacidad';
        }
        
        // Mostrar/ocultar error
        if (!isValid && showError) {
            this.showFieldError(field, errorMessage);
        } else if (isValid && value) {
            if (field.type !== 'checkbox') {
                field.classList.remove('border-red-500', 'dark:border-red-500');
                field.classList.add('border-green-500', 'dark:border-green-500');
            }
            this.clearFieldError(field);
        } else if (!value && field.type !== 'checkbox') {
            field.classList.remove('border-red-500', 'border-green-500', 'dark:border-red-500', 'dark:border-green-500');
            field.classList.add('border-gray-300', 'dark:border-gray-600');
        }
        
        return isValid;
    }
    
    showFieldError(field, message, focusField = true) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-600 dark:text-red-400 text-sm mt-1';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.id = `${field.id}-error`;
        
        // Para checkbox, insertar después del label
        if (field.type === 'checkbox') {
            const label = field.closest('div').querySelector('label');
            if (label) {
                label.parentNode.insertBefore(errorElement, label.nextSibling);
            }
        } else {
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        if (field.type !== 'checkbox') {
            field.classList.add('border-red-500', 'dark:border-red-500');
            field.classList.remove('border-green-500', 'dark:border-green-500');
        }
        
        if (focusField) {
            field.focus();
        }
    }
    
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    validateAllFields() {
        let isValid = true;
        let firstInvalidField = null;
        
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        
        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });
        
        // Validar checkbox de privacidad
        const privacyCheckbox = document.getElementById('privacidad');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            isValid = false;
            this.showFieldError(privacyCheckbox, 'Debes aceptar la política de privacidad');
            if (!firstInvalidField) {
                firstInvalidField = privacyCheckbox;
            }
        }
        
        // Enfocar el primer campo inválido
        if (firstInvalidField) {
            setTimeout(() => {
                firstInvalidField.focus();
                if (firstInvalidField.type === 'checkbox') {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        // Validar todos los campos
        if (!this.validateAllFields()) {
            // Mostrar toast de error de validación
            if (typeof window.showToast === 'function') {
                window.showToast('Por favor, corrige los errores en el formulario', 'error', 4000);
            }
            return;
        }
        
        // Cambiar estado a "enviando"
        this.isSubmitting = true;
        this.showedToast = false;
        this.setSubmittingState(true);
        
        try {
            // Verificar conexión a internet
            if (!navigator.onLine) {
                throw new Error('Sin conexión a internet');
            }
            
            const formData = new FormData(this.form);
            
            // Mostrar mensaje de "enviando"
            if (typeof window.showToast === 'function') {
                window.showToast('Enviando mensaje...', 'info', 2000);
            }
            
            // Enviar a Formspree
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Éxito
                this.showSuccess();
                this.form.reset();
                
                // Limpiar contador
                const counter = document.getElementById('message-counter');
                if (counter) counter.textContent = '0/500';
                
                // Limpiar estilos de validación
                this.form.querySelectorAll('input, textarea').forEach(field => {
                    field.classList.remove('border-red-500', 'border-green-500', 'dark:border-red-500', 'dark:border-green-500');
                    field.classList.add('border-gray-300', 'dark:border-gray-600');
                    this.clearFieldError(field);
                });
                
                // Resetear checkbox
                const privacyCheckbox = document.getElementById('privacidad');
                if (privacyCheckbox) privacyCheckbox.checked = false;
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error en el servidor. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            
            // Solo mostrar toast si no se ha mostrado ya
            if (!this.showedToast) {
                // Mostrar mensaje de error específico
                let errorMessage = 'Error al enviar el mensaje. Intenta nuevamente.';
                if (error.message === 'Sin conexión a internet') {
                    errorMessage = 'Sin conexión a internet. No se pudo enviar el mensaje.';
                } else if (error.message.includes('servidor')) {
                    errorMessage = error.message;
                }
                
                this.showError(errorMessage);
                this.showedToast = true;
            }
        } finally {
            // Restaurar estado después de 2 segundos
            setTimeout(() => {
                this.setSubmittingState(false);
                this.isSubmitting = false;
                this.showedToast = false;
            }, 2000);
        }
    }
    
    setSubmittingState(isSubmitting) {
        if (this.submitBtn) {
            this.submitBtn.disabled = isSubmitting;
            this.submitBtn.classList.toggle('opacity-75', isSubmitting);
            this.submitBtn.classList.toggle('cursor-not-allowed', isSubmitting);
            this.submitBtn.classList.toggle('cursor-pointer', !isSubmitting);
        }
        
        if (this.submitText) {
            this.submitText.textContent = isSubmitting ? 'Enviando...' : this.originalText;
        }
        
        if (this.submitSpinner) {
            if (isSubmitting) {
                this.submitSpinner.classList.remove('hidden');
            } else {
                this.submitSpinner.classList.add('hidden');
            }
        }
    }
    
    showSuccess() {
        // Marcar que ya mostramos un toast
        this.showedToast = true;
        
        this.setSubmittingState(true);
        if (this.submitText) {
            this.submitText.textContent = '¡Enviado!';
        }
        
        // Mostrar toast de éxito
        if (typeof window.showToast === 'function') {
            window.showToast('Mensaje enviado con éxito. ¡Gracias! Te responderé pronto.', 'success', 5000);
        }
        
        // Anunciar para accesibilidad
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader('Mensaje enviado con éxito');
        }
    }
    
    showError(message = 'Error al enviar el mensaje. Intenta nuevamente.') {
        // Marcar que ya mostramos un toast
        this.showedToast = true;
        
        this.setSubmittingState(true);
        if (this.submitText) {
            this.submitText.textContent = 'Error';
        }
        
        // Mostrar toast de error
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error', 5000);
        }
        
        // Anunciar para accesibilidad
        if (typeof window.announceToScreenReader === 'function') {
            window.announceToScreenReader(message);
        }
        
        // Restaurar texto después de 2 segundos
        setTimeout(() => {
            if (this.submitText) {
                this.submitText.textContent = this.originalText;
            }
            this.setSubmittingState(false);
        }, 2000);
    }
}


if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('contact-form');
        if (form && !window.contactForm) {
            try {
                window.contactForm = new SimpleContactForm();
                console.log('Formulario de contacto inicializado correctamente');
            } catch (error) {
                console.error('Error al inicializar el formulario:', error);
            }
        }
    });
}