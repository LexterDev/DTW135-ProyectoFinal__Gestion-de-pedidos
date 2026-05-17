// archivo para manejar CRUD de pedidos

import storage from './storage.js';
import pedidoModel from './pedidoModel.js';
import inventory from './inventory.js';

function _getAll() {
    return storage.get(storage.KEYS.PEDIDOS) ?? [];
}

function _save(pedidos) {
    storage.set(storage.KEYS.PEDIDOS, pedidos);
}

function getAll() {
    return _getAll();
}

function getById(id) {
    return _getAll().find(p => p.id === id) ?? null;
}

function getByClienteId(clienteId) {
    return _getAll()
        .filter(p => p.clienteId === clienteId)
        .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
}

function getBySucursalId(sucursalId) {
    return _getAll().filter(p => p.sucursalId === sucursalId);
}

function getByEstado(estado) {
    return _getAll().filter(p => p.estado === estado);
}

// Creacion de un pedido: Se verifica disponibilidad, se descuenta el stock y se guarda el pedido
function create(data) {
    // Verificar stock 
    for (const item of data.items) {
        const disponible = inventory.getStock(data.sucursalId, item.productoId, item.talla);
        if (disponible < item.cantidad) {
            return {
                ok: false,
                error: `Stock insuficiente para "${item.nombre}" talla ${item.talla} ` +
                    `(disponible: ${disponible}, solicitado: ${item.cantidad}).`,
            };
        }
    }

    // Descontar stock
    for (const item of data.items) {
        inventory.decrementStock(data.sucursalId, item.productoId, item.talla, item.cantidad);
    }

    // Crear pedido
    const pedido = pedidoModel.create(data);
    _save([..._getAll(), pedido]);
    return { ok: true, pedido };
}

// Cambia el estado de un pedido
function cambiarEstado(id, nuevoEstado) {
    const pedidos = _getAll();
    const idx = pedidos.findIndex(p => p.id === id);
    if (idx === -1) return null;
    pedidos[idx] = pedidoModel.actualizarEstado(pedidos[idx], nuevoEstado);
    _save(pedidos);
    return pedidos[idx];
}

// Cancelar un pedido y restaurar el stock descontado.
function cancelar(id) {
    const pedido = getById(id);
    if (!pedido) return { ok: false, error: 'Pedido no encontrado.' };

    if (pedido.estado === pedidoModel.ESTADOS.ENTREGADO) {
        return { ok: false, error: 'No se puede cancelar un pedido ya entregado.' };
    }
    if (pedido.estado === pedidoModel.ESTADOS.CANCELADO) {
        return { ok: false, error: 'El pedido ya está cancelado.' };
    }

    for (const item of pedido.items) {
        inventory.addStock(pedido.sucursalId, item.productoId, item.talla, item.cantidad);
    }

    const actualizado = cambiarEstado(id, pedidoModel.ESTADOS.CANCELADO);
    return { ok: true, pedido: actualizado };
}

// obtener metricas de pedidos para el dashboard
function getMetricas() {
    const pedidos = _getAll();
    const hoyStr = new Date().toDateString();

    const porEstado = Object.values(pedidoModel.ESTADOS).reduce((acc, estado) => {
        acc[estado] = pedidos.filter(p => p.estado === estado).length;
        return acc;
    }, {});

    const ingresoTotal = pedidos
        .filter(p => p.estado !== pedidoModel.ESTADOS.CANCELADO)
        .reduce((acc, p) => acc + p.total, 0);

    const pedidosHoy = pedidos.filter(
        p => new Date(p.fechaCreacion).toDateString() === hoyStr
    ).length;

    return { total: pedidos.length, porEstado, ingresoTotal, pedidosHoy };
}

export default {
    getAll,
    getById,
    getByClienteId,
    getBySucursalId,
    getByEstado,
    create,
    cambiarEstado,
    cancelar,
    getMetricas,
};
