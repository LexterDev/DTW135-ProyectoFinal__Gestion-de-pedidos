// Metodos para manejar el inventario de productos por sucursal. usando localStorage para persistir
import storage from './storage.js';

const UMBRAL_BAJO = 5;

function _get() {
    return storage.get(storage.KEYS.INVENTARIO) ?? {};
}
function _save(data) {
    storage.set(storage.KEYS.INVENTARIO, data);
}

// Obtener stock de un producto/talla en una sucursal
function getStock(sucursalId, productoId, talla) {
    const inv = _get();
    return inv[sucursalId]?.[productoId]?.[talla] ?? 0;
}

// Establece el stock exacto de un producto/talla en una sucursal.
function setStock(sucursalId, productoId, talla, cantidad) {
    const inv = _get();
    if (inv[sucursalId] == null) inv[sucursalId] = {};
    if (inv[sucursalId][productoId] == null) inv[sucursalId][productoId] = {};
    inv[sucursalId][productoId][talla] = Math.max(0, cantidad);
    _save(inv);
}

// Suma `cantidad` al stock actual. 
function addStock(sucursalId, productoId, talla, cantidad) {
    const actual = getStock(sucursalId, productoId, talla);
    setStock(sucursalId, productoId, talla, actual + cantidad);
}

// Resta `cantidad` del stock
function decrementStock(sucursalId, productoId, talla, cantidad) {
    const actual = getStock(sucursalId, productoId, talla);
    if (actual < cantidad) return false;
    setStock(sucursalId, productoId, talla, actual - cantidad);
    return true;
}

// obtener inventario por sucursal
function getInventarioBySucursal(sucursalId) {
    return _get()[sucursalId] ?? {};
}

// Obtener stock total de un producto sumando todas las sucursales.
function getStockTotalByProducto(productoId) {
    const inv = _get();
    const total = {};
    for (const sucursal of Object.values(inv)) {
        const porTalla = sucursal[productoId] ?? {};
        for (const [talla, qty] of Object.entries(porTalla)) {
            total[talla] = (total[talla] ?? 0) + qty;
        }
    }
    return total;
}

// Buscar ID de sucursales que tengan stock suficiente
function sucursalesConStock(productoId, talla, cantidad = 1) {
    const inv = _get();
    return Object.entries(inv)
        .filter(([, productos]) => (productos[productoId]?.[talla] ?? 0) >= cantidad)
        .map(([sucursalId]) => sucursalId);
}

// retorna las entradas con stock por debajo del umbral.
function alertasBajoStock() {
    const inv = _get();
    const alertas = [];
    for (const [sucursalId, productos] of Object.entries(inv)) {
        for (const [productoId, tallas] of Object.entries(productos)) {
            for (const [talla, cantidad] of Object.entries(tallas)) {
                if (cantidad <= UMBRAL_BAJO) {
                    alertas.push({ sucursalId, productoId, talla, cantidad });
                }
            }
        }
    }
    return alertas;
}

export default {
    getStock,
    setStock,
    addStock,
    decrementStock,
    getInventarioBySucursal,
    getStockTotalByProducto,
    sucursalesConStock,
    alertasBajoStock,
    UMBRAL_BAJO,
};
