/* 
* Interfaz de administración para el catálogo de sucursales y gestión de existencias.
* Controla el renderizado de la tabla de tiendas, la edición de coordenadas geográficas,
* y la carga/guardado de matrices de inventario multi-producto segmentadas por talla.
*/

import authGuard      from './authGuard.js';
import sucursalesCrud from './sucursalesCrud.js';
import productosCrud  from './productosCrud.js';
import productoModel  from './productoModel.js';
import inventory      from './inventory.js';
import validator      from './validator.js';
import notifier       from './notifier.js';
import utils          from './utils.js';

let _editingId        = null;
let _inventarioSucId  = null;

function _renderTable() {
  const tbody = document.getElementById('tbody-sucursales');
  if (!tbody) return;

  const rows = sucursalesCrud.getAll();
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400 text-sm">Sin sucursales.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(s => `
    <tr class="border-b border-gray-100 hover:bg-gray-50" data-id="${s.id}">
      <td class="py-2 px-3 text-sm font-medium text-gray-800">${utils.escapeHtml(s.nombre)}</td>
      <td class="py-2 px-3 text-sm text-gray-500">${utils.escapeHtml(s.direccion)}</td>
      <td class="py-2 px-3 text-sm text-gray-400">${s.telefono ?? '–'}</td>
      <td class="py-2 px-3 text-xs text-gray-400">${s.lat?.toFixed(4)}, ${s.lng?.toFixed(4)}</td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium
          ${s.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">
          ${s.activa ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td class="py-2 px-3">
        <div class="flex gap-2">
          <button data-action="edit"      data-id="${s.id}"
                  class="text-xs text-indigo-600 hover:underline">Editar</button>
          <button data-action="inventario" data-id="${s.id}"
                  class="text-xs text-purple-600 hover:underline">Inventario</button>
          <button data-action="toggle"    data-id="${s.id}"
                  class="text-xs ${s.activa ? 'text-yellow-600' : 'text-green-600'} hover:underline">
            ${s.activa ? 'Desactivar' : 'Activar'}
          </button>
          <button data-action="delete"    data-id="${s.id}"
                  class="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function _openModal(sucursal = null) {
  _editingId = sucursal?.id ?? null;
  const modal = document.getElementById('modal-sucursal');
  const title = document.getElementById('modal-suc-title');
  const form  = document.getElementById('form-sucursal');
  if (!modal || !form) return;

  title.textContent = sucursal ? 'Editar sucursal' : 'Nueva sucursal';
  validator.clearErrors(form);

  form['suc-nombre'].value    = sucursal?.nombre    ?? '';
  form['suc-direccion'].value = sucursal?.direccion ?? '';
  form['suc-telefono'].value  = sucursal?.telefono  ?? '';
  form['suc-lat'].value       = sucursal?.lat       ?? '';
  form['suc-lng'].value       = sucursal?.lng       ?? '';
  modal.classList.remove('hidden');
}

function _closeModal() {
  document.getElementById('modal-sucursal')?.classList.add('hidden');
  _editingId = null;
}

function _handleSave() {
  const form = document.getElementById('form-sucursal');
  if (!form) return;

  const nombre    = form['suc-nombre'].value.trim();
  const direccion = form['suc-direccion'].value.trim();
  const telefono  = form['suc-telefono'].value.trim();
  const lat       = form['suc-lat'].value.trim();
  const lng       = form['suc-lng'].value.trim();

  const errors = validator.validate({
    nombre:    [{ fn: validator.isRequired,  message: 'El nombre es obligatorio.' }],
    direccion: [{ fn: validator.isRequired,  message: 'La dirección es obligatoria.' }],
    lat:       [{ fn: validator.isRequired,  message: 'La latitud es obligatoria.' },
                { fn: validator.isLatitude,  message: 'Latitud inválida (-90 a 90).' }],
    lng:       [{ fn: validator.isRequired,  message: 'La longitud es obligatoria.' },
                { fn: validator.isLongitude, message: 'Longitud inválida (-180 a 180).' }],
  }, { nombre, direccion, lat, lng });

  if (Object.keys(errors).length > 0) { validator.showErrors(errors, form); return; }
  validator.clearErrors(form);

  const data = { nombre, direccion, telefono: telefono || null, lat: parseFloat(lat), lng: parseFloat(lng) };

  if (_editingId) {
    sucursalesCrud.update(_editingId, data);
    notifier.success('Sucursal actualizada.');
  } else {
    sucursalesCrud.create(data);
    notifier.success('Sucursal creada.');
  }

  _closeModal();
  _renderTable();
}

function _openInventario(sucursalId) {
  _inventarioSucId = sucursalId;
  const panel    = document.getElementById('inventario-panel');
  const title    = document.getElementById('inventario-title');
  const sucursal = sucursalesCrud.getById(sucursalId);
  if (!panel) return;

  title.textContent = `Inventario: ${sucursal?.nombre ?? sucursalId}`;

  const productos = productosCrud.getActivos();
  const grid      = document.getElementById('inventario-grid');
  if (!grid) return;

  grid.innerHTML = productos.map(p => `
    <div class="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
      <p class="text-sm font-medium text-gray-800">${utils.escapeHtml(p.nombre)}</p>
      <div class="flex flex-wrap gap-2">
        ${(p.tallas ?? productoModel.TALLAS).map(t => {
          const stock = inventory.getStock(sucursalId, p.id, t);
          return `
            <label class="flex flex-col items-center gap-0.5">
              <span class="text-xs text-gray-400">${t}</span>
              <input type="number" min="0"
                     data-prod="${p.id}" data-talla="${t}"
                     value="${stock}"
                     class="w-14 text-center rounded-lg border border-gray-300 px-1 py-1 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function _handleSaveInventario() {
  if (!_inventarioSucId) return;
  const inputs = document.querySelectorAll('#inventario-grid [data-prod]');
  inputs.forEach(input => {
    const { prod, talla } = input.dataset;
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val >= 0) {
      inventory.setStock(_inventarioSucId, prod, talla, val);
    }
  });
  notifier.success('Inventario guardado.');
}

function _handleTableAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'edit')       _openModal(sucursalesCrud.getById(id));
  if (action === 'inventario') _openInventario(id);
  if (action === 'toggle') {
    sucursalesCrud.toggleActiva(id);
    _renderTable();
    notifier.info('Estado actualizado.');
  }
  if (action === 'delete') {
    if (!confirm('¿Eliminar esta sucursal?')) return;
    sucursalesCrud.remove(id);
    _renderTable();
    notifier.success('Sucursal eliminada.');
  }
}

function initSucursales() {
  if (!authGuard.guard(['admin'])) return;

  _renderTable();

  document.getElementById('tbody-sucursales')
    ?.addEventListener('click', _handleTableAction);

  document.getElementById('btn-nueva-sucursal')
    ?.addEventListener('click', () => _openModal());

  document.getElementById('btn-modal-suc-cerrar')
    ?.addEventListener('click', _closeModal);

  document.getElementById('btn-modal-suc-guardar')
    ?.addEventListener('click', _handleSave);

  document.getElementById('modal-sucursal')
    ?.addEventListener('click', e => { if (e.target === e.currentTarget) _closeModal(); });

  document.getElementById('btn-guardar-inventario')
    ?.addEventListener('click', _handleSaveInventario);

  document.getElementById('btn-cerrar-inventario')
    ?.addEventListener('click', () => {
      document.getElementById('inventario-panel')?.classList.add('hidden');
      _inventarioSucId = null;
    });
}

export default { initSucursales };
