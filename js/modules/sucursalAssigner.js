/**
 * Asigna de forma automatica la sucursal óptima (más cercana con stock) 
 * a un pedido según la ubicación del cliente y el inventario disponible.
 */

import inventory from './inventory.js';

/**
 * Comprueba si una sucursal tiene stock suficiente para todos los ítems del carrito.
 */
function _tieneStock(sucursalId, items) {
    return items.every(item =>
        inventory.getStock(sucursalId, item.productoId, item.talla) >= item.cantidad
    );
}