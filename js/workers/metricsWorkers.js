/* 
* Web Worker para el cálculo de métricas de pedidos en segundo plano.
* Evita el bloqueo del hilo principal durante el procesamiento de KPIs.
*/

self.onmessage = function (e) {
  const { pedidos, estados } = e.data;
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

  self.postMessage({
    total: pedidos.length,
    porEstado,
    ingresoTotal,
    pedidosHoy,
  });
};
