/*
* Recuperación y filtrado del catálogo de estampados desde localStorage.
*/

import storage from './storage.js';

function getAll() {
  return storage.get(storage.KEYS.ESTAMPADOS) ?? [];
}

function getActivos() {
  return getAll().filter(e => e.activo !== false);
}

function getById(id) {
  return getAll().find(e => e.id === id) ?? null;
}

export default { getAll, getActivos, getById };
