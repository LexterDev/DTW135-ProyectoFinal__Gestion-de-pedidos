/*
* Estructura para los productos del catálogo. 
* Crea objetos de calcetines con ID único, precio numérico y estado activo.
*/

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORIAS = {
  CLASICO:       'clásico',
  TEMATICO:      'temático',
  PERSONALIZADO: 'personalizado',
};

/**
 * Creamos un nuevo objeto Producto.
 *  
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
