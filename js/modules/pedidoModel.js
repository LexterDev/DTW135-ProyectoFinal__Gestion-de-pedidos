//En este archivo definimos la estrcutura para los pedidos

const ESTADOS = {
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    EN_PROCESO: 'en_proceso',
    LISTO: 'listo',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado',
};

//-- funcion para crear un nuevo pedido
function create({ clienteId = null, clienteNombre, clienteEmail, items, sucursalId, total }) {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        clienteId,          // null = invitado
        clienteNombre: clienteNombre.trim(),
        clienteEmail: clienteEmail.trim().toLowerCase(),
        items,              // [{ productoId, nombre, talla, cantidad, precioUnit, disenoId }]
        sucursalId,
        total: parseFloat(total),
        estado: ESTADOS.PENDIENTE,
        fechaCreacion: now,
        fechaActualizacion: now,
    };
}

// actualizmos el estado del pedido y la fecha de actualización
function actualizarEstado(pedido, nuevoEstado) {
    return {
        ...pedido,
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString(),
    };
}

// calculamos el total de un pedido 
function calcularTotal(items) {
    return items.reduce((acc, item) => acc + item.precioUnit * item.cantidad, 0);
}

export default { ESTADOS, create, actualizarEstado, calcularTotal };
