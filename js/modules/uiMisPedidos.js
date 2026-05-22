/*
* Interfaz de usuario para el historial de pedidos del cliente.
* Filtra y renderiza las compras del usuario autenticado, permite visualizar 
* detalles de artículos, sucursales de retiro y la gestión de cancelaciones activas.
*/

import authGuard      from './authGuard.js';
import auth           from './auth.js';
import pedidosCrud    from './pedidosCrud.js';
import pedidoModel    from './pedidoModel.js';
import sucursalesCrud from './sucursalesCrud.js';
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

function _renderPedidos(pedidos) {
  const container = document.getElementById('pedidos-list');
  const empty     = document.getElementById('empty-state');
  if (!container) return;

  if (pedidos.length === 0) {
    container.classList.add('hidden');
    empty?.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  empty?.classList.add('hidden');

  container.innerHTML = pedidos.map(p => {
    const sucursal = sucursalesCrud.getById(p.sucursalId);
    const canCancel = ![pedidoModel.ESTADOS.ENTREGADO, pedidoModel.ESTADOS.CANCELADO]
      .includes(p.estado);
    return `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
           data-id="${p.id}">

        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-mono text-gray-400">Pedido #${p.id.slice(0,8).toUpperCase()}</p>
            <p class="text-xs text-gray-400 mt-0.5">${utils.formatDate(p.fechaCreacion)}</p>
          </div>
          <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ''}">
            ${utils.capitalize(p.estado)}
          </span>
        </div>

        <ul class="flex flex-col gap-1">
          ${p.items.map(i => `
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-700">
                ${utils.escapeHtml(i.nombre)}
                <span class="text-gray-400 text-xs">Talla ${i.talla} × ${i.cantidad}</span>
              </span>
              <span class="font-medium text-gray-800">${utils.formatCurrency(i.precioUnit * i.cantidad)}</span>
            </li>
          `).join('')}
        </ul>

        <div class="flex items-end justify-between border-t border-gray-100 pt-3">
          <div class="text-xs text-gray-500">
            <p class="font-medium text-gray-700">Retiro en:</p>
            <p>${utils.escapeHtml(sucursal?.nombre ?? 'Sucursal no disponible')}</p>
            ${sucursal?.direccion ? `<p class="text-gray-400">${utils.escapeHtml(sucursal.direccion)}</p>` : ''}
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-400">Total</p>
            <p class="text-lg font-bold text-indigo-600">${utils.formatCurrency(p.total)}</p>
          </div>
        </div>

        ${canCancel ? `
          <button data-action="cancelar" data-id="${p.id}"
                  class="self-start text-xs text-red-500 hover:underline">
            Cancelar pedido
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

function initMisPedidos() {
  if (!authGuard.guard(['cliente', 'admin'])) return;

  const session = auth.getSession();
  const pedidos = session
    ? pedidosCrud.getByClienteId(session.userId)
    : [];

  const nameEl = document.getElementById('cliente-nombre');
  if (nameEl && session) nameEl.textContent = session.nombre;

  _renderPedidos(pedidos);

  document.getElementById('pedidos-list')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="cancelar"]');
    if (!btn) return;
    if (!confirm('¿Cancelar este pedido? Se restaurará el stock.')) return;
    const res = pedidosCrud.cancelar(btn.dataset.id);
    if (!res.ok) { notifier.error(res.error); return; }
    notifier.success('Pedido cancelado.');
    const pedidosActualizados = session ? pedidosCrud.getByClienteId(session.userId) : [];
    _renderPedidos(pedidosActualizados);
  });
}

export default { initMisPedidos };
