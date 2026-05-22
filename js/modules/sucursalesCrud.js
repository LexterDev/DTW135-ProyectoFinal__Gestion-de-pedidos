/* 
* Módulo de gestión de sucursales. 
* Administra la ubicación y disponibilidad de las sedes físicas, permitiendo 
* bajas lógicas para proteger el historial de pedidos e inventario.
*/

import storage       from './storage.js';
import sucursalModel from './sucursalModel.js';

function _getAll() {
  return storage.get(storage.KEYS.SUCURSALES) ?? [];
}

function _save(sucursales) {
  storage.set(storage.KEYS.SUCURSALES, sucursales);
}

function getAll() {
  return _getAll();
}

function getActivas() {
  return _getAll().filter(s => s.activa);
}

function getById(id) {
  return _getAll().find(s => s.id === id) ?? null;
}

function create(data) {
  const sucursal = sucursalModel.create(data);
  _save([..._getAll(), sucursal]);
  return sucursal;
}

function update(id, changes) {
  const sucursales = _getAll();
  const idx        = sucursales.findIndex(s => s.id === id);
  if (idx === -1) return null;
  sucursales[idx] = { ...sucursales[idx], ...changes };
  _save(sucursales);
  return sucursales[idx];
}

function remove(id) {
  return update(id, { activa: false });
}

function toggleActiva(id) {
  const s = getById(id);
  if (!s) return null;
  return update(id, { activa: !s.activa });
}

export default {
  getAll,
  getActivas,
  getById,
  create,
  update,
  remove,
  toggleActiva,
};
