import authGuard from './authGuard.js';
import sucursalesCrud from './sucursalesCrud.js';
import pedidosCrud from './pedidosCrud.js';
import pedidoModel from './pedidoModel.js';
import geolocation from './geolocation.js';
import notifier from './notifier.js';
import utils from './utils.js';


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

    L.control.layers({}, {
        'Sucursales': sucLayer,
    }, { collapsed: false }).addTo(_map);

    sucLayer.addTo(_map);
}

export default { initMapa };
