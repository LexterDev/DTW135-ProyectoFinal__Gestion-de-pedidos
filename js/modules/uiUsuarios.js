/*
* Gestión de usuarios desde el panel de administración.
* Se incluye validación de seguridad para evitar que un admin modifique o elimine su propia cuenta. 
*/

import authGuard    from './authGuard.js';
import auth         from './auth.js';
import usuariosCrud from './usuariosCrud.js';
import usuarioModel from './usuarioModel.js';
import notifier     from './notifier.js';
import utils        from './utils.js';

function _renderTable(query = '') {
  const tbody = document.getElementById('tbody-usuarios');
  if (!tbody) return;

  let rows = usuariosCrud.getAll();
  if (query) {
    const q = query.toLowerCase();
    rows = rows.filter(u =>
      u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"
      class="text-center py-10 text-gray-400 text-sm">Sin usuarios.</td></tr>`;
    return;
  }

  const session = auth.getSession();

  tbody.innerHTML = rows.map(u => {
    const esMismo = session?.userId === u.id;
    return `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="py-2 px-3 text-sm font-medium text-gray-800">
        ${utils.escapeHtml(u.nombre)}
        ${esMismo ? '<span class="text-xs text-indigo-400 ml-1">(tú)</span>' : ''}
      </td>
      <td class="py-2 px-3 text-sm text-gray-500">${utils.escapeHtml(u.email)}</td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium
          ${u.rol === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}">
          ${u.rol}
        </span>
      </td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium
          ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}">
          ${u.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="py-2 px-3 text-xs text-gray-400">${utils.formatDate(u.fechaRegistro)}</td>
      <td class="py-2 px-3">
        ${esMismo ? '<span class="text-xs text-gray-300">—</span>' : `
        <div class="flex gap-2">
          <button data-action="toggle-rol"   data-id="${u.id}" data-rol="${u.rol}"
                  class="text-xs text-indigo-600 hover:underline">
            ${u.rol === 'admin' ? 'Hacer cliente' : 'Hacer admin'}
          </button>
          <button data-action="toggle-activo" data-id="${u.id}"
                  class="text-xs ${u.activo ? 'text-yellow-600' : 'text-green-600'} hover:underline">
            ${u.activo ? 'Bloquear' : 'Activar'}
          </button>
          <button data-action="delete"        data-id="${u.id}"
                  class="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>`}
      </td>
    </tr>
  `;
  }).join('');
}

function _handleAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, rol } = btn.dataset;

  const session = auth.getSession();
  if (id === session?.userId) {
    notifier.error('Acción denegada: No puedes modificar tu propia cuenta.');
    return;
  }

  if (action === 'toggle-rol') {
    const nuevoRol = rol === usuarioModel.ROLES.ADMIN
      ? usuarioModel.ROLES.CLIENTE
      : usuarioModel.ROLES.ADMIN;
    usuariosCrud.cambiarRol(id, nuevoRol);
    notifier.success(`Rol actualizado a "${nuevoRol}".`);
    _renderTable(document.getElementById('search-usuarios')?.value.trim());
  }

  if (action === 'toggle-activo') {
    usuariosCrud.toggleActivo(id);
    notifier.info('Estado de cuenta actualizado.');
    _renderTable(document.getElementById('search-usuarios')?.value.trim());
  }

  if (action === 'delete') {
    if (!confirm('¿Eliminar este usuario permanentemente? Sus pedidos quedarán sin referencia.')) return;
    usuariosCrud.remove(id);
    notifier.success('Usuario eliminado.');
    _renderTable(document.getElementById('search-usuarios')?.value.trim());
  }
}

function initUsuarios() {
  if (!authGuard.guard(['admin'])) return;

  _renderTable();

  document.getElementById('tbody-usuarios')
    ?.addEventListener('click', _handleAction);

  document.getElementById('search-usuarios')
    ?.addEventListener('input', utils.debounce(e =>
      _renderTable(e.target.value.trim()), 250));
}

export default { initUsuarios };
