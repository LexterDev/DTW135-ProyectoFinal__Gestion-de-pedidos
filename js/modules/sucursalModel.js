/**
 * @module sucursalModel
 * @description Define la estructura del modelo de datos Sucursal.
 * Las coordenadas (lat/lng) son requeridas para el mapa y para
 * la asignación automática de sucursal más cercana al cliente.
 */

/**
 * Crea un nuevo objeto Sucursal.
 *
 * @param {{
 *   nombre:        string,
 *   direccion:     string,
 *   telefono?:     string,
 *   lat:           number,   — latitud WGS-84
 *   lng:           number,   — longitud WGS-84
 *   imagenBase64?: string|null
 * }} params
 * @returns {Object}
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
