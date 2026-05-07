/*
* Modelo para las sucursales físicas de la tienda. 
* Almacena ubicación, coordenadas geográficas y datos de contacto.
*/

function create({ nombre, direccion, telefono = '', lat, lng, imagenBase64 = null }) {
  return {
    id:           crypto.randomUUID(),
    nombre:       nombre.trim(),
    direccion:    direccion.trim(),
    telefono:     telefono.trim(),
    lat:          parseFloat(lat),
    lng:          parseFloat(lng),
    imagenBase64,
    activa:       true,
    fechaCreacion: new Date().toISOString(),
  };
}

export default { create };
