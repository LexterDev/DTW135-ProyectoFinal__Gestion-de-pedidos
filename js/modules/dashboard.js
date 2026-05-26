import authGuard      from './authGuard.js';
import pedidosCrud    from './pedidosCrud.js';
import productosCrud  from './productosCrud.js';
import sucursalesCrud from './sucursalesCrud.js';
import usuariosCrud   from './usuariosCrud.js';
import pedidoModel    from './pedidoModel.js';
import utils          from './utils.js';

const ESTADO_COLOR = {
  [pedidoModel.ESTADOS.PENDIENTE]:   '#f59e0b',
  [pedidoModel.ESTADOS.CONFIRMADO]:  '#3b82f6',
  [pedidoModel.ESTADOS.EN_PROCESO]:  '#8b5cf6',
  [pedidoModel.ESTADOS.LISTO]:       '#10b981',
  [pedidoModel.ESTADOS.ENTREGADO]:   '#6b7280',
  [pedidoModel.ESTADOS.CANCELADO]:   '#ef4444',
};

function _renderMetrics(metricas) {
  const defs = [
    { id: 'metric-total',    value: metricas.total,        label: 'Pedidos totales'  },
    { id: 'metric-hoy',      value: metricas.pedidosHoy,    label: 'Pedidos hoy'      },
    { id: 'metric-ingresos', value: utils.formatCurrency(metricas.ingresoTotal), label: 'Ingresos totales' },
    { id: 'metric-productos',value: productosCrud.getActivos().length,            label: 'Productos activos' },
    { id: 'metric-sucursales',value: sucursalesCrud.getActivas().length,          label: 'Sucursales activas' },
    { id: 'metric-usuarios', value: usuariosCrud.getAll().length,                 label: 'Usuarios registrados' },
  ];
  for (const def of defs) {
    const el = document.getElementById(def.id);
    if (el) el.textContent = def.value;
  }
}

function _renderRecentOrders() {
  const tbody = document.getElementById('tbody-recientes');
  if (!tbody) return;

  const pedidos = (pedidosCrud.getAll?.() ?? [])
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 8);

  if (pedidos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-400 text-sm">Sin pedidos aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = pedidos.map(p => `
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="py-2 px-3 text-xs font-mono text-gray-600">${p.id.slice(0, 8).toUpperCase()}</td>
      <td class="py-2 px-3 text-sm text-gray-700">${utils.escapeHtml(p.clienteNombre)}</td>
      <td class="py-2 px-3 text-sm font-medium text-gray-800">${utils.formatCurrency(p.total)}</td>
      <td class="py-2 px-3">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style="background:${ESTADO_COLOR[p.estado]}22;color:${ESTADO_COLOR[p.estado]}">
          ${utils.capitalize(p.estado)}
        </span>
      </td>
      <td class="py-2 px-3 text-xs text-gray-400">${utils.formatDate(p.fechaCreacion)}</td>
    </tr>
  `).join('');
}

function initDashboard() {
  if (!authGuard.guard(['admin'])) return;

  _renderRecentOrders();

  const workerUrl = new URL('../workers/metricsWorker.js', import.meta.url);
  const worker    = new Worker(workerUrl);

  worker.onmessage = (e) => {
    _renderMetrics(e.data);
    worker.terminate();
  };

  worker.onerror = () => {
    const metricas = pedidosCrud.getMetricas();
    _renderMetrics(metricas);
    worker.terminate();
  };

  worker.postMessage({
    pedidos:    pedidosCrud.getAll(),
    estados:    Object.values(pedidoModel.ESTADOS),
  });
}

export default { initDashboard };
