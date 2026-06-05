/**
 * Módulo para manejar la navegación en la interfaz de administración, incluyendo el menú móvil.
*/

export function initAdminNav() {
  const btn   = document.getElementById('btn-mobile-menu');
  const menu  = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!open));
  });

  // Cierra el menú al hacer clic en cualquier enlace dentro
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) menu.classList.add('hidden');
  });
}
