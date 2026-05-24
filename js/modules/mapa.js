import authGuard from './authGuard.js';
import sucursalesCrud from './sucursalesCrud.js';
import pedidosCrud from './pedidosCrud.js';
import pedidoModel from './pedidoModel.js';
import geolocation from './geolocation.js';
import notifier from './notifier.js';
import utils from './utils.js';

let _map = null;
let _layerSuc = null;
let _layerPedidos = null;
let _layerUsuario = null;
let _userMarker = null;

const ESTADO_COLOR = {
    [pedidoModel.ESTADOS.PENDIENTE]: '#f59e0b',
    [pedidoModel.ESTADOS.CONFIRMADO]: '#3b82f6',
    [pedidoModel.ESTADOS.EN_PROCESO]: '#8b5cf6',
    [pedidoModel.ESTADOS.LISTO]: '#10b981',
    [pedidoModel.ESTADOS.ENTREGADO]: '#6b7280',
    [pedidoModel.ESTADOS.CANCELADO]: '#ef4444',
};

function _circleIcon(color) {
    return L.divIcon({
        className: '',
        html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function _buildSucursalesLayer() {
    if (_layerSuc) _layerSuc.clearLayers();
    else _layerSuc = L.layerGroup();

    sucursalesCrud.getActivas().forEach(s => {
        if (s.lat == null || s.lng == null) return;

        const marker = L.marker([s.lat, s.lng], {
            icon: L.divIcon({
                className: '',
                html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:#4f46e5;border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,.3);
          display:flex;align-items:center;justify-content:center;
          font-size:13px">🧦</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            }),
        });

        const pedidos = pedidosCrud.getBySucursalId(s.id)
            .filter(p => p.estado !== pedidoModel.ESTADOS.ENTREGADO
                && p.estado !== pedidoModel.ESTADOS.CANCELADO);

        marker.bindPopup(`
      <div style="min-width:180px">
        <p style="font-weight:600;margin-bottom:4px">${utils.escapeHtml(s.nombre)}</p>
        <p style="font-size:12px;color:#6b7280">${utils.escapeHtml(s.direccion)}</p>
        ${s.telefono ? `<p style="font-size:12px;color:#6b7280">📞 ${s.telefono}</p>` : ''}
        <p style="font-size:12px;margin-top:6px">
          Pedidos activos: <strong>${pedidos.length}</strong>
        </p>
      </div>
    `);
        _layerSuc.addLayer(marker);
    });

    return _layerSuc;
}

function _buildPedidosLayer() {
    if (_layerPedidos) _layerPedidos.clearLayers();
    else _layerPedidos = L.layerGroup();

    const estadosActivos = [
        pedidoModel.ESTADOS.PENDIENTE,
        pedidoModel.ESTADOS.CONFIRMADO,
        pedidoModel.ESTADOS.EN_PROCESO,
        pedidoModel.ESTADOS.LISTO,
    ];

    pedidosCrud.getAll()
        .filter(p => estadosActivos.includes(p.estado))
        .forEach(p => {
            const suc = sucursalesCrud.getById(p.sucursalId);
            if (!suc?.lat || !suc?.lng) return;

            const lat = suc.lat + (Math.random() - 0.5) * 0.002;
            const lng = suc.lng + (Math.random() - 0.5) * 0.002;

            const marker = L.marker([lat, lng], {
                icon: _circleIcon(ESTADO_COLOR[p.estado] ?? '#9ca3af'),
            });
            marker.bindPopup(`
        <div style="min-width:160px">
          <p style="font-weight:600;font-size:12px;font-family:monospace">
            #${p.id.slice(0, 8).toUpperCase()}
          </p>
          <p style="font-size:12px">${utils.escapeHtml(p.clienteNombre)}</p>
          <p style="font-size:12px;color:${ESTADO_COLOR[p.estado]};font-weight:600">
            ${utils.capitalize(p.estado)}
          </p>
          <p style="font-size:12px">${utils.formatCurrency(p.total)}</p>
        </div>
      `);
            _layerPedidos.addLayer(marker);
        });

    return _layerPedidos;
}

function _setUserLayer(lat, lng) {
    if (!_layerUsuario) _layerUsuario = L.layerGroup().addTo(_map);
    _layerUsuario.clearLayers();

    _userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: '',
            html: `<div style="
        width:18px;height:18px;border-radius:50%;
        background:#ef4444;border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        }),
    }).bindPopup('Tu ubicación');

    _layerUsuario.addLayer(_userMarker);
    _map.setView([lat, lng], 14);
}

function _addLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
        const div = L.DomUtil.create('div');
        div.style.cssText = 'background:white;padding:10px 14px;border-radius:12px;' +
            'box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:12px;min-width:140px;line-height:1.6';
        div.innerHTML = `
      <p style="font-weight:600;margin-bottom:6px">Estados</p>
      ${Object.entries(ESTADO_COLOR).map(([estado, color]) => `
        <div style="display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:10px;height:10px;
                       border-radius:50%;background:${color}"></span>
          ${utils.capitalize(estado)}
        </div>
      `).join('')}
      <div style="margin-top:8px;border-top:1px solid #e5e7eb;padding-top:6px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444"></span>
        Tu ubicación
      </div>
    `;
        return div;
    };
    legend.addTo(_map);
}

function initMapa() {
    if (!authGuard.guard(['admin'])) return;

    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') {
        console.error('[mapa] Leaflet no disponible o #map no encontrado.');
        return;
    }

    // Centrar en El Salvador
    _map = L.map('map').setView([13.7942, -88.8965], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(_map);

    const sucLayer = _buildSucursalesLayer();
    const pedidosLayer = _buildPedidosLayer();
    _layerUsuario = L.layerGroup();

    L.control.layers({}, {
        'Sucursales': sucLayer,
        'Pedidos activos': pedidosLayer,
        'Mi ubicación': _layerUsuario,
    }, { collapsed: false }).addTo(_map);

    sucLayer.addTo(_map);
    pedidosLayer.addTo(_map);
    _layerUsuario.addTo(_map);

    _addLegend();

    document.getElementById('btn-map-locate')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-map-locate');
        btn.disabled = true;
        btn.textContent = 'Detectando...';
        try {
            const pos = await geolocation.getCurrentPosition();
            _setUserLayer(pos.lat, pos.lng);
            notifier.success('Ubicación detectada.');
        } catch (err) {
            notifier.warning(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '📍 Mi ubicación';
        }
    });

    document.getElementById('btn-map-refresh')?.addEventListener('click', () => {
        _buildPedidosLayer();
        notifier.info('Capa de pedidos actualizada.');
    });
}

export default { initMapa };
