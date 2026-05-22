/*
* Interfaz de gestión de pedidos para el administrador.
* Controla la visualización en tablas de las órdenes, navegación por pestañas de estado, 
* apertura de detalles en modales y la actualización de estados de pedido en tiempo real.
*/

import authGuard      from './authGuard.js';
import pedidosCrud    from './pedidosCrud.js';
import pedidoModel    from './pedidoModel.js';
import sucursalesCrud from './sucursalesCrud.js';
import exporter       from './exporter.js';
import notifier       from './notifier.js';
import utils          from './utils.js';

const ESTADO_BADGE = {
  [pedidoModel.ESTADOS.PENDIENTE]:  'bg-yellow-100 text-yellow-700',
  [pedidoModel.ESTADOS.CONFIRMADO]: 'bg-blue-100 text-blue-700',
  [pedidoModel.ESTADOS.EN_PROCESO]: 'bg-purple-100 text-purple-700',
  [pedidoModel.ESTADOS.LISTO]:      'bg-emerald-100 text-emerald-700',
  [pedidoModel.ESTADOS.ENTREGADO]:  'bg-gray-100 text-gray-500',
  [pedidoModel.ESTADOS.CANCELADO]:  'bg-red-100 text-red-600',
};

const TAB_LABELS = {
  '':           'Todos',
  'pendiente':  'Pendiente',
  'confirmado': 'Confirmado',
  'en_proceso': 'En proceso',
  'listo':      'Listo',
  'entregado':  'Entregado',
  'cancelado':  'Cancelado',
};

let _filtroEstado = ''; // '' = todos

function _getFiltered() {
  let rows = pedidosCrud.getAll?.() ?? [];
  if (_filtroEstado) rows = rows.filter(p => p.estado === _filtroEstado);
  return rows;
}

function _renderTable() {
  const tbody = document.getElementById('tbody-pedidos');
  if (!tbody) return;

  const rows = _getFiltered()
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"
      class="text-center py-10 text-gray-400 text-sm">Sin pedidos en este estado.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => `
    <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" data-id="${p.id}">
      <td class="py-2 px-3 text-xs font-mono text-gray-500">${p.id.slice(0,8).toUpperCase()}</td>
      <td class="py-2 px-3 text-sm text-gray-700">${utils.escapeHtml(p.clienteNombre)}</td>
      <td class="py-2 px-3 text-xs text-gray-400">${utils.escapeHtml(p.clienteEmail)}</td>
      <td class="py-2 px-3 text-sm font-semibold text-gray-800">${utils.formatCurrency(p.total)}</td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ''}">
          ${utils.capitalize(p.estado)}
        </span>
      </td>
      <td class="py-2 px-3 text-xs text-gray-400">${utils.formatDate(p.fechaCreacion)}</td>
    </tr>
  `).join('');
}

function _updateTabs() {
    document.querySelectorAll('[data-tab]').forEach(btn => {
    const tab    = btn.dataset.tab;
    const active = tab === _filtroEstado;
    const label  = TAB_LABELS[tab] ?? tab;

    btn.classList.toggle('bg-indigo-600',   active);
    btn.classList.toggle('text-white',      active);
    btn.classList.toggle('text-gray-500',   !active);
    btn.classList.toggle('border',          !active);
    btn.classList.toggle('border-gray-200', !active);
    
    btn.textContent = label;
  });
}

function _openDetail(id) {
  const pedido   = (pedidosCrud.getAll?.() ?? []).find(p => p.id === id);
  if (!pedido) return;

  const sucursal = sucursalesCrud.getById(pedido.sucursalId);
  const modal    = document.getElementById('modal-pedido');
  const body     = document.getElementById('modal-pedido-body');
  if (!modal || !body) return;

  const siguientes = _siguientesEstados(pedido.estado);

  body.innerHTML = `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="font-mono text-sm font-semibold text-gray-600">
          Pedido #${pedido.id.slice(0,8).toUpperCase()}
        </h3>
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[pedido.estado] ?? ''}">
          ${utils.capitalize(pedido.estado)}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div><p class="text-xs text-gray-400">Cliente</p>
             <p class="font-medium text-gray-800">${utils.escapeHtml(pedido.clienteNombre)}</p></div>
        <div><p class="text-xs text-gray-400">Correo</p>
             <p class="text-gray-600">${utils.escapeHtml(pedido.clienteEmail)}</p></div>
        <div><p class="text-xs text-gray-400">Sucursal</p>
             <p class="text-gray-700">${utils.escapeHtml(sucursal?.nombre ?? '–')}</p></div>
        <div><p class="text-xs text-gray-400">Fecha</p>
             <p class="text-gray-700">${utils.formatDate(pedido.fechaCreacion)}</p></div>
      </div>

      <table class="w-full text-sm border-t border-gray-100 pt-2">
        <thead><tr class="text-xs text-gray-400">
          <th class="text-left py-1">Producto</th>
          <th class="text-left py-1">Talla</th>
          <th class="text-right py-1">Cant.</th>
          <th class="text-right py-1">Subtotal</th>
        </tr></thead>
        <tbody>
          ${pedido.items.map(i => `
            <tr class="border-t border-gray-50">
              <td class="py-1">${utils.escapeHtml(i.nombre)}</td>
              <td class="py-1">${i.talla}</td>
              <td class="py-1 text-right">${i.cantidad}</td>
              <td class="py-1 text-right font-medium">${utils.formatCurrency(i.precioUnit * i.cantidad)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-200">
            <td colspan="3" class="py-2 text-sm font-semibold text-gray-700">Total</td>
            <td class="py-2 text-right font-bold text-indigo-600">${utils.formatCurrency(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>

      ${siguientes.length > 0 ? `
        <div class="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <p class="text-xs text-gray-400 font-medium">Cambiar estado a:</p>
          <div class="flex flex-wrap gap-2">
            ${siguientes.map(e => `
              <button data-next-estado="${e}" data-pedido-id="${pedido.id}"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200
                             hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                ${utils.capitalize(e)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  body.querySelectorAll('[data-next-estado]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextEstado = btn.dataset.nextEstado;
      const pedidoId   = btn.dataset.pedidoId;

      if (nextEstado === pedidoModel.ESTADOS.CANCELADO) {
        const res = pedidosCrud.cancelar(pedidoId);
        if (!res.ok) { notifier.error(res.error); return; }
      } else {
        const updated = pedidosCrud.cambiarEstado(pedidoId, nextEstado);
        if (!updated) { notifier.error('No se pudo actualizar el pedido.'); return; }
      }

      notifier.success(`Estado actualizado a "${nextEstado}".`);
      _closeModal();
      _renderTable();
    });
  });

  modal.classList.remove('hidden');
}

function _siguientesEstados(actual) {
  const E = pedidoModel.ESTADOS;
  const MAP = {
    [E.PENDIENTE]:  [E.CONFIRMADO, E.CANCELADO],
    [E.CONFIRMADO]: [E.EN_PROCESO, E.CANCELADO],
    [E.EN_PROCESO]: [E.LISTO],
    [E.LISTO]:      [E.ENTREGADO],
    [E.ENTREGADO]:  [],
    [E.CANCELADO]:  [],
  };
  return MAP[actual] ?? [];
}

function _closeModal() {
  document.getElementById('modal-pedido')?.classList.add('hidden');
}

function initPedidos() {
  if (!authGuard.guard(['admin'])) return;

  _updateTabs();
  _renderTable();

  document.getElementById('tabs-estado')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    _filtroEstado = btn.dataset.tab;
    _updateTabs();
    _renderTable();
  });

  document.getElementById('tbody-pedidos')?.addEventListener('click', e => {
    const row = e.target.closest('[data-id]');
    if (row) _openDetail(row.dataset.id);
  });

  document.getElementById('btn-modal-pedido-cerrar')?.addEventListener('click', _closeModal);
  document.getElementById('modal-pedido')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) _closeModal();
  });

  document.getElementById('btn-exportar-pedidos')?.addEventListener('click', () => {
    const rows = (pedidosCrud.getAll?.() ?? []).map(p => ({
      id:             p.id,
      cliente:        p.clienteNombre,
      email:          p.clienteEmail,
      total:          p.total,
      estado:         p.estado,
      sucursalId:     p.sucursalId,
      fechaCreacion:  p.fechaCreacion,
    }));
    exporter.toCSV(rows, 'pedidos-soxlab');
    notifier.success('CSV descargado.');
  });
}

export default { initPedidos };
