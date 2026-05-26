/* 
* Interfaz de administración para el catálogo de productos.
* Controla el renderizado de la tabla de inventario, los filtros de búsqueda por texto,
* la apertura de modales para creación o edición y el procesamiento base64 de imágenes.
*/

import authGuard       from './authGuard.js';
import productosCrud   from './productosCrud.js';
import productoModel   from './productoModel.js';
import imageProcessor  from './imageProcessor.js';
import validator       from './validator.js';
import notifier        from './notifier.js';
import utils           from './utils.js';

let _editingId   = null;
let _pendingImg  = null; 

function _renderTable(query = '') {
  const tbody = document.getElementById('tbody-productos');
  if (!tbody) return;

  const rows = query
    ? productosCrud.buscar(query, false)
    : productosCrud.getAll();

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400 text-sm">Sin productos.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => `
    <tr class="border-b border-gray-100 hover:bg-gray-50" data-id="${p.id}">
      <td class="py-2 px-3">
        ${p.imagen
          ? `<img src="${p.imagen}" class="w-10 h-10 rounded-lg object-cover" alt="" />`
          : `<div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🧦</div>`}
      </td>
      <td class="py-2 px-3 text-sm font-medium text-gray-800">${utils.escapeHtml(p.nombre)}</td>
      <td class="py-2 px-3 text-sm text-gray-500">${utils.capitalize(p.categoria)}</td>
      <td class="py-2 px-3 text-sm font-semibold text-gray-800">${utils.formatCurrency(p.precio)}</td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium
          ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">
          ${p.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="py-2 px-3">
        <div class="flex gap-2">
          <button data-action="edit"   data-id="${p.id}"
                  class="text-xs text-indigo-600 hover:underline">Editar</button>
          <button data-action="toggle" data-id="${p.id}"
                  class="text-xs ${p.activo ? 'text-yellow-600' : 'text-green-600'} hover:underline">
            ${p.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button data-action="delete" data-id="${p.id}"
                  class="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function _openModal(producto = null) {
  _editingId  = producto?.id ?? null;
  _pendingImg = null;

  const modal = document.getElementById('modal-producto');
  const title = document.getElementById('modal-title');
  const form  = document.getElementById('form-producto');
  if (!modal || !form) return;

  title.textContent = producto ? 'Editar producto' : 'Nuevo producto';
  validator.clearErrors(form);

  form['prod-nombre'].value      = producto?.nombre    ?? '';
  form['prod-descripcion'].value = producto?.descripcion ?? '';
  form['prod-precio'].value      = producto?.precio    ?? '';
  form['prod-categoria'].value = producto?.categoria ?? '';

  const tallasWrap = document.getElementById('tallas-wrap');
  tallasWrap.innerHTML = productoModel.TALLAS.map(t => `
    <label class="flex items-center gap-1 text-sm cursor-pointer">
      <input type="checkbox" name="talla" value="${t}"
             ${producto?.tallas?.includes(t) ? 'checked' : ''} />
      ${t}
    </label>
  `).join('');

  const preview = document.getElementById('img-preview');
  if (preview) {
    preview.src = producto?.imagen ?? '';
    preview.classList.toggle('hidden', !producto?.imagen);
  }

  modal.classList.remove('hidden');
}

function _closeModal() {
  document.getElementById('modal-producto')?.classList.add('hidden');
  _editingId  = null;
  _pendingImg = null;
}

async function _handleSave() {
  const form = document.getElementById('form-producto');
  if (!form) return;

  const nombre      = form['prod-nombre'].value.trim();
  const descripcion = form['prod-descripcion'].value.trim();
  const precio      = form['prod-precio'].value.trim();
  const categoria   = form['prod-categoria'].value;
  const tallas      = [...form.querySelectorAll('[name="talla"]:checked')].map(cb => cb.value);

  const errors = validator.validate({
    nombre:    [{ fn: validator.isRequired,    message: 'El nombre es obligatorio.' },
                { fn: validator.minLength(2),  message: 'Mínimo 2 caracteres.' }],
    precio:    [{ fn: validator.isRequired,    message: 'El precio es obligatorio.' },
                { fn: validator.isNumeric,     message: 'Debe ser un número.' },
                { fn: validator.isPositive,    message: 'Debe ser mayor a 0.' }],
    categoria: [{ fn: validator.isRequired,    message: 'Selecciona una categoría.' }],
  }, { nombre, precio, categoria });

  if (tallas.length === 0) errors.tallas = 'Selecciona al menos una talla.';

  if (Object.keys(errors).length > 0) {
    validator.showErrors(errors, form);
    return;
  }
  validator.clearErrors(form);

  const imgFileInput = document.getElementById('prod-imagen');
  let imagen = _pendingImg;
  if (!imagen && _editingId) {
    imagen = productosCrud.getById(_editingId)?.imagen ?? null;
  }
  if (imgFileInput?.files[0] && !_pendingImg) {
    try {
      imagen = await imageProcessor.processFile(imgFileInput.files[0]);
    } catch (e) { notifier.warning(e.message); }
  }

  const data = { nombre, descripcion, precio: parseFloat(precio), categoria, tallas, imagen };

  if (_editingId) {
    productosCrud.update(_editingId, data);
    notifier.success('Producto actualizado.');
  } else {
    productosCrud.create(data);
    notifier.success('Producto creado.');
  }

  _closeModal();
  _renderTable(document.getElementById('search-productos')?.value.trim());
}

function _handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageProcessor.processFile(file).then(base64 => {
    _pendingImg = base64;
    const preview = document.getElementById('img-preview');
    if (preview) { preview.src = base64; preview.classList.remove('hidden'); }
  }).catch(err => notifier.warning(err.message));
}

function _handleTableAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'edit') {
    _openModal(productosCrud.getById(id));
  }
  if (action === 'toggle') {
    productosCrud.toggleActivo(id);
    _renderTable(document.getElementById('search-productos')?.value.trim());
    notifier.info('Estado actualizado.');
  }
  if (action === 'delete') {
    if (!confirm('¿Eliminar este producto? La acción no se puede deshacer.')) return;
    productosCrud.remove(id);
    _renderTable(document.getElementById('search-productos')?.value.trim());
    notifier.success('Producto eliminado.');
  }
}

function initProductos() {
  if (!authGuard.guard(['admin'])) return;

  _renderTable();

  document.getElementById('tbody-productos')
    ?.addEventListener('click', _handleTableAction);

  document.getElementById('btn-nuevo-producto')
    ?.addEventListener('click', () => _openModal());

  document.getElementById('btn-modal-cerrar')
    ?.addEventListener('click', _closeModal);

  document.getElementById('btn-modal-guardar')
    ?.addEventListener('click', _handleSave);

  document.getElementById('modal-producto')
    ?.addEventListener('click', e => {
      if (e.target === e.currentTarget) _closeModal();
    });

  document.getElementById('prod-imagen')
    ?.addEventListener('change', _handleImageChange);

  document.getElementById('search-productos')
    ?.addEventListener('input', utils.debounce(e => _renderTable(e.target.value.trim()), 250));
}

export default { initProductos };
