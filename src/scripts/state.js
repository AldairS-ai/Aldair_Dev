// ===== ESTADO GLOBAL =====
let state = {
    currentProjectIndex: 0,
    totalProjects: 0,
    isDragging: false,
    dragStartX: 0,
    dragDistance: 0,
    isFormSubmitting: false,
    isMenuOpen: false,
    theme: localStorage.getItem('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    carouselSlideWidth: 0,
    resizeObserver: null,
    intersectionObserver: null,
    toastContainer: null
};

// Getters y setters para el estado
export const getState = () => ({ ...state });

export const setState = (newState) => {
    state = { ...state, ...newState };
    return getState();
};

export const updateState = (key, value) => {
    state[key] = value;
    return getState();
};