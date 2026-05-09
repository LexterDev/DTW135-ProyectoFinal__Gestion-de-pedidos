/*
* Modelo de personalización de diseños de calcetines. 
* Define la configuración visual de los calcetines: zonas de color (base, punta, talón, caña, borde), 
* estampados con su posición en el canvas y la previsualización del diseño.
*/
const ZONAS = {
  BASE:     'base',
  PUNTA:    'punta',
  TALON:    'talon',
  CANA:     'cana',
  BORDE:    'borde',
};

function create({
  nombre,
  colores,
  estampadoId       = null,
  estampadoPos      = null,
  imagenPreviewBase64 = null,
  autorId           = null,
}) {
  return {
    id:                 crypto.randomUUID(),
    nombre:             nombre.trim(),
    colores,
    estampadoId,
    estampadoPos,
    imagenPreviewBase64,
    autorId,
    fechaCreacion:      new Date().toISOString(),
  };
}

export default { ZONAS, create };
