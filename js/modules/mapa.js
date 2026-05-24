import authGuard from './authGuard.js';


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
}

export default { initMapa };
