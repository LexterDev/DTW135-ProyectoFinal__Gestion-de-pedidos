/* 
* Módulo de gestión de productos para el catálogo. 
* Administra la persistencia de calcetines, permitiendo búsquedas por texto, 
* filtrado por categorías y bajas lógicas para mantener la integridad de los pedidos.
*/

import storage       from './storage.js';
import productoModel from './productoModel.js';

function _getAll() {
  return storage.get(storage.KEYS.PRODUCTOS) ?? [];
}

function _save(productos) {
  storage.set(storage.KEYS.PRODUCTOS, productos);
}

function getAll() {
  return _getAll();
}

function getActivos() {
  return _getAll().filter(p => p.activo);
}

function getById(id) {
  return _getAll().find(p => p.id === id) ?? null;
}

function buscar(query, soloActivos = true) {
  const q    = query.toLowerCase().trim();
  const base = soloActivos ? getActivos() : _getAll();
  if (!q) return base;
  return base.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.descripcion.toLowerCase().includes(q)
  );
}

function filtrarPorCategoria(categoria, soloActivos = true) {
  const base = soloActivos ? getActivos() : _getAll();
  return base.filter(p => p.categoria === categoria);
}

function create(data) {
  const producto  = productoModel.create(data);
  _save([..._getAll(), producto]);
  return producto;
}

function update(id, changes) {
  const productos = _getAll();
  const idx       = productos.findIndex(p => p.id === id);
  if (idx === -1) return null;
  productos[idx] = { ...productos[idx], ...changes };
  _save(productos);
  return productos[idx];
}

function remove(id) {
  return update(id, { activo: false });
}

function toggleActivo(id) {
  const p = getById(id);
  if (!p) return null;
  return update(id, { activo: !p.activo });
}

export default {
  getAll,
  getActivos,
  getById,
  buscar,
  filtrarPorCategoria,
  create,
  update,
  remove,
  toggleActivo,
};
