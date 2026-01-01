'use strict';

// Funcionalidad crítica que DEBE funcionar siempre
document.addEventListener('DOMContentLoaded', function() {
    // 1. Año actual
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // 2. Tema básico
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    
    // 3. Navegación básica
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView();
            }
        });
    });
    
    console.log('Portafolio básico cargado para navegador antiguo');
});