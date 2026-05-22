/*
* Controlador de persistencia para diseños de calcetines.
* Gestiona el almacenamiento en localStorage para usuarios registrados y el manejo 
* temporal para invitados. Incluye funciones de búsqueda por autor y actualización de diseños.
*/

import storage    from './storage.js';
import disenoModel from './disenoModel.js';

function _getAll() {
  return storage.get(storage.KEYS.DISENOS) ?? [];
}

function _save(disenos) {
  storage.set(storage.KEYS.DISENOS, disenos);
}

function getAll() {
  return _getAll();
}

/** @returns {Object|null} */
function getById(id) {
  return _getAll().find(d => d.id === id) ?? null;
}

function getByAutorId(autorId) {
  return _getAll().filter(d => d.autorId === autorId);
}

function create(data) {
  const diseno = disenoModel.create(data);
  if (diseno.autorId !== null) {
    _save([..._getAll(), diseno]);
    return { persistido: true, diseno };
  }
  return { persistido: false, diseno };
}

function update(id, changes) {
  const disenos = _getAll();
  const idx     = disenos.findIndex(d => d.id === id);
  if (idx === -1) return null;
  disenos[idx] = { ...disenos[idx], ...changes };
  _save(disenos);
  return disenos[idx];
}

function remove(id) {
  _save(_getAll().filter(d => d.id !== id));
}

export default {
  getAll,
  getById,
  getByAutorId,
  create,
  update,
  remove,
};
