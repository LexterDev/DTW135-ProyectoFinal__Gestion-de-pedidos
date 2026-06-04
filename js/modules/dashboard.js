/* 
* Interfaz principal del Panel de Administración.
* Renderiza las métricas base.
* Carga los datos necesarios para las gráficas y delega su procesamiento a un Web Worker.
* Renderiza las tablas de pedidos recientes y alertas de stock bajo.
*/

import authGuard      from './authGuard.js';
import pedidosCrud    from './pedidosCrud.js';
import productosCrud  from './productosCrud.js';
import sucursalesCrud from './sucursalesCrud.js';
import usuariosCrud   from './usuariosCrud.js';
import inventory      from './inventory.js';
import pedidoModel    from './pedidoModel.js';
import utils          from './utils.js';
import storageMonitor from './storageMonitor.js';

const ESTADO_COLOR = {
  [pedidoModel.ESTADOS.PENDIENTE]:   '#f59e0b',
  [pedidoModel.ESTADOS.CONFIRMADO]:  '#3b82f6',
  [pedidoModel.ESTADOS.EN_PROCESO]:  '#8b5cf6',
  [pedidoModel.ESTADOS.LISTO]:       '#10b981',
  [pedidoModel.ESTADOS.ENTREGADO]:   '#6b7280',
  [pedidoModel.ESTADOS.CANCELADO]:   '#ef4444',
};

function _renderMetrics(metricas) {
  const ingresosText = metricas.ticketPromedio !== undefined
    ? `${utils.formatCurrency(metricas.ingresoTotal)} (Prom: ${utils.formatCurrency(metricas.ticketPromedio)})`
    : utils.formatCurrency(metricas.ingresoTotal);

  const defs = [
    { id: 'metric-total',    value: metricas.total,        label: 'Pedidos totales'  },
    { id: 'metric-hoy',      value: metricas.pedidosHoy,    label: 'Pedidos hoy'      },
    { id: 'metric-ingresos', value: ingresosText,           label: 'Ingresos totales' },
    { id: 'metric-productos',value: productosCrud.getActivos().length,            label: 'Productos activos' },
    { id: 'metric-sucursales',value: sucursalesCrud.getActivas().length,          label: 'Sucursales activas' },
    { id: 'metric-usuarios', value: usuariosCrud.getAll().length,                 label: 'Usuarios registrados' },
  ];
  for (const def of defs) {
    const el = document.getElementById(def.id);
    if (el) el.textContent = def.value;
  }
}

let _chartEstados      = null;
let _chartSucursales   = null;
let _chartTopProductos = null;

function _renderChart(porEstado) {
  const canvas = document.getElementById('chart-estados');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = Object.keys(porEstado).map(e => utils.capitalize(e));
  const data   = Object.values(porEstado);
  const colors = Object.keys(porEstado).map(e => ESTADO_COLOR[e] ?? '#9ca3af');

  if (_chartEstados) _chartEstados.destroy();
  _chartEstados = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
      },
    },
  });
}

function _renderChartSucursales(ventasPorSucursal) {
  const canvas = document.getElementById('chart-sucursales');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = Object.keys(ventasPorSucursal);
  const data   = Object.values(ventasPorSucursal);

  if (_chartSucursales) _chartSucursales.destroy();
  _chartSucursales = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Ingresos (USD)',
        data,
        backgroundColor: '#6366f1',
        borderRadius:    4,
      }],
    },
    options: {
      indexAxis:           'y',
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { callback: v => `$${v.toFixed(0)}` },
          grid:  { color: '#f3f4f6' },
        },
        y: { grid: { display: false } },
      },
    },
  });
}

function _renderChartTopProductos(topProductos) {
  const canvas = document.getElementById('chart-top-productos');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = topProductos.map(p => p.nombre);
  const data   = topProductos.map(p => p.cantidad);

  if (_chartTopProductos) _chartTopProductos.destroy();
  _chartTopProductos = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Unidades',
        data,
        backgroundColor: '#10b981',
        borderRadius:    4,
      }],
    },
    options: {
      indexAxis:           'y',
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { stepSize: 1 },
          grid:  { color: '#f3f4f6' },
        },
        y: { grid: { display: false } },
      },
    },
  });
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

function _renderStockAlerts() {
  const container = document.getElementById('stock-alerts');
  if (!container) return;

  const alertas = inventory.alertasBajoStock();
  if (alertas.length === 0) {
    container.innerHTML = `<p class="text-sm text-green-600">✓ Sin alertas de stock bajo.</p>`;
    return;
  }

  const sucursales = sucursalesCrud.getAll();
  const productos  = productosCrud.getAll();

  container.innerHTML = alertas.slice(0, 6).map(a => {
    const suc  = sucursales.find(s => s.id === a.sucursalId);
    const prod = productos.find(p  => p.id === a.productoId);
    return `
      <div class="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
        <div class="text-sm text-gray-700">
          <span class="font-medium">${utils.escapeHtml(prod?.nombre ?? a.productoId)}</span>
          <span class="text-gray-400 text-xs ml-1">Talla ${a.talla} · ${utils.escapeHtml(suc?.nombre ?? a.sucursalId)}</span>
        </div>
        <span class="text-xs font-semibold ${a.cantidad === 0 ? 'text-red-600' : 'text-yellow-600'}">
          ${a.cantidad} uds.
        </span>
      </div>
    `;
  }).join('');
}

function _renderStorageBar() {
  const bar   = document.getElementById('storage-bar');
  const label = document.getElementById('storage-label');
  const report = storageMonitor.getReport();
  if (bar)   bar.style.width = `${report.porcentaje}%`;
  if (label) label.textContent = `${report.porcentaje}% usado`;
  if (bar) {
    bar.className = 'h-full rounded-full transition-all ' + (
      report.nivel === 'crítico'      ? 'bg-red-500' :
      report.nivel === 'advertencia'  ? 'bg-yellow-400' : 'bg-indigo-500'
    );
  }
}

function initDashboard() {
  if (!authGuard.guard(['admin'])) return;

  _renderRecentOrders();
  _renderStockAlerts();
  _renderStorageBar();
  storageMonitor.checkAndAlert();

  const workerUrl = new URL('../workers/metricsWorker.js', import.meta.url);
  const worker    = new Worker(workerUrl);

  worker.onmessage = (e) => {
    _renderMetrics(e.data);
    _renderChart(e.data.porEstado);
    _renderChartSucursales(e.data.ventasPorSucursal);
    _renderChartTopProductos(e.data.topProductos);
    document.getElementById('skel-sucursales')?.remove();
    document.getElementById('skel-top-productos')?.remove();
    worker.terminate();
  };

  worker.onerror = () => {
    const metricas = pedidosCrud.getMetricas();
    _renderMetrics(metricas);
    _renderChart(metricas.porEstado);
    worker.terminate();
  };

  worker.postMessage({
    pedidos:    pedidosCrud.getAll(),
    estados:    Object.values(pedidoModel.ESTADOS),
    sucursales: sucursalesCrud.getAll(),
  });
}

export default { initDashboard };
