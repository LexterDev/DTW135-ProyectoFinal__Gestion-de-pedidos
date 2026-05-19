// Metodos para manejar toast en la UI.

const DURATION = 3500;
const FADE_MS = 300;

const TYPE_STYLES = {
    success: { bar: 'bg-green-600', icon: '✓' },
    error: { bar: 'bg-red-600', icon: '✕' },
    warning: { bar: 'bg-yellow-500', icon: '⚠' },
    info: { bar: 'bg-blue-600', icon: 'ℹ' },
};

function getContainer() {
    let el = document.getElementById('soxlab-notifier');
    if (!el) {
        el = document.createElement('div');
        el.id = 'soxlab-notifier';
        el.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none';
        document.body.appendChild(el);
    }
    return el;
}

// Metodo para mostrar un toast.
function show(message, type = 'info') {
    const { bar, icon } = TYPE_STYLES[type] ?? TYPE_STYLES.info;
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = [
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'text-white text-sm min-w-[220px] max-w-xs',
        'opacity-0 translate-x-4 transition-all duration-300',
        bar,
    ].join(' ');

    toast.innerHTML = `<span class="font-bold text-base leading-none">${icon}</span>
    <span>${message}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-4');
    });
    setTimeout(() => dismiss(toast), DURATION);
}

function dismiss(toast) {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), FADE_MS);
}

export default {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
    info: (msg) => show(msg, 'info'),
};
