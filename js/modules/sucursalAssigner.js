/**
 * Asigna de forma automatica la sucursal óptima (más cercana con stock) 
 * a un pedido según la ubicación del cliente y el inventario disponible.
 */

import sucursalesCrud from './sucursalesCrud.js';
import inventory from './inventory.js';
import geoUtils from './geoUtils.js';

/**
 * Comprueba si una sucursal tiene stock suficiente para todos los ítems del carrito.
 */
function _tieneStock(sucursalId, items) {
    return items.every(item =>
        inventory.getStock(sucursalId, item.productoId, item.talla) >= item.cantidad
    );
}


/**
 * Retorna las sucursales activas que tienen stock suficiente para los ítems del carrito, ordenadas por distancia al usuario si se proporcionan coordenadas.
 * Si no se proporcionan coordenadas, devuelve las sucursales sin ordenar y con `distanciaKm` como null.
 */
function rankSucursales(items, userLat = null, userLng = null) {
    const activas = sucursalesCrud.getActivas();
    const candidatas = activas.filter(s => _tieneStock(s.id, items));

    if (userLat !== null && userLng !== null) {
        return geoUtils.sortByDistance(
            candidatas,
            userLat,
            userLng,
            s => ({ lat: s.lat, lng: s.lng })
        );
    }

    return candidatas.map(s => ({ ...s, distanciaKm: null }));
}

/**
 * Devuelve la sucursal con stock mas cercana al usuario o null si ninguna tiene stock.
 */
function asignar(items, userLat = null, userLng = null) {
    const ranked = rankSucursales(items, userLat, userLng);
    return ranked[0] ?? null;
}

export default { rankSucursales, asignar };