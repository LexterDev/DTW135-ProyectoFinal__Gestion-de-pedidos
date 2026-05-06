/**
 * @module productoModel
 * @description Define la estructura del modelo de datos Producto.
 * El stock por sucursal se gestiona en inventory.js, no aquí.
 */

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORIAS = {
  CLASICO:       'clásico',
  TEMATICO:      'temático',
  PERSONALIZADO: 'personalizado',
};

/**
 * Crea un nuevo objeto Producto.
 *
 * @param {{
 *   nombre:        string,
 *   descripcion?:  string,
 *   precio:        number,
 *   tallas:        string[],   — subconjunto de TALLAS
 *   categoria:     string,
 *   colores?:      string[],   — array de hex (colores disponibles de fábrica)
 *   imagenBase64?: string|null
 * }} params
 * @returns {Object}
 */
function create({ nombre, descripcion = '', precio, tallas, categoria, colores = [], imagenBase64 = null }) {
  return {
    id:           crypto.randomUUID(),
    nombre:       nombre.trim(),
    descripcion:  descripcion.trim(),
    precio:       parseFloat(precio),
    tallas,
    categoria,
    colores,
    imagenBase64,
    activo:       true,
    fechaCreacion: new Date().toISOString(),
  };
}

export default { TALLAS, CATEGORIAS, create };
