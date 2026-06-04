const KEY = 'soxlab_dark';

function _apply(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.querySelectorAll('.btn-dark-toggle').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title       = dark ? 'Modo claro'  : 'Modo oscuro';
    btn.setAttribute('aria-label', dark ? 'Modo claro' : 'Modo oscuro');
  });
}

function init() {
  const saved = localStorage.getItem(KEY);
  const dark  = saved !== null
    ? saved === '1'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  _apply(dark);

  document.addEventListener('click', e => {
    if (!e.target.closest('.btn-dark-toggle')) return;
    const isDark = !document.documentElement.classList.contains('dark');
    localStorage.setItem(KEY, isDark ? '1' : '0');
    _apply(isDark);
  });
}

export default { init };
