/*
* Web Worker para el cálculo de métricas avanzadas de pedidos en segundo plano.
* Evita el bloqueo del hilo principal durante el procesamiento de KPIs.
* Consolida estados, ingresos totales, ventas por sucursal y el top 5 de productos más vendidos.
*/

self.onmessage = function (e) {
  const { pedidos, estados, sucursales = [] } = e.data;
  const hoyStr = new Date().toDateString();

  const porEstado = estados.reduce((acc, estado) => {
    acc[estado] = pedidos.filter(p => p.estado === estado).length;
    return acc;
  }, {});

  const activos = pedidos.filter(p => p.estado !== 'cancelado');
  const ingresoTotal = activos.reduce((acc, p) => acc + (p.total || 0), 0);

  const pedidosHoy = pedidos.filter(
    p => new Date(p.fechaCreacion).toDateString() === hoyStr
  ).length;

  const ticketPromedio = activos.length > 0 ? (ingresoTotal / activos.length) : 0;

  const ventasPorSucursal = {};
  activos.forEach(p => {
    const suc    = sucursales.find(s => s.id === p.sucursalId);
    const nombre = suc?.nombre ?? p.sucursalId;
    ventasPorSucursal[nombre] = (ventasPorSucursal[nombre] ?? 0) + (p.total || 0);
  });

  const conteo = {};
  activos.forEach(p => {
    (p.items ?? []).forEach(item => {
      conteo[item.nombre] = (conteo[item.nombre] ?? 0) + item.cantidad;
    });
  });
  
  const topProductos = Object.entries(conteo)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));

  self.postMessage({
    total: pedidos.length,
    porEstado,
    ingresoTotal,
    pedidosHoy,
    ventasPorSucursal,
    topProductos,
    ticketPromedio
  });
};
