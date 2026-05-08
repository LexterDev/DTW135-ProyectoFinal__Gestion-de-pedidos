/* 
* Módulo de administración de usuarios. 
* Permite gestionar perfiles, roles y estados de cuenta, protegiendo campos 
* sensibles como correos y contraseñas mediante filtrado de cambios.
*/

import storage      from './storage.js';
import usuarioModel from './usuarioModel.js';

function _getAll() {
  return storage.get(storage.KEYS.USUARIOS) ?? [];
}

function _save(usuarios) {
  storage.set(storage.KEYS.USUARIOS, usuarios);
}

function getAll() {
  return _getAll();
}

function getById(id) {
  return _getAll().find(u => u.id === id) ?? null;
}

function getByEmail(email) {
  return _getAll().find(u => u.email === email.trim().toLowerCase()) ?? null;
}

function getByRol(rol) {
  return _getAll().filter(u => u.rol === rol);
}

function update(id, changes) {
  const { email, passwordHash, ...safeChanges } = changes;
  const usuarios = _getAll();
  const idx      = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return null;
  usuarios[idx] = { ...usuarios[idx], ...safeChanges };
  _save(usuarios);
  return usuarios[idx];
}

function cambiarRol(id, nuevoRol) {
  if (!Object.values(usuarioModel.ROLES).includes(nuevoRol)) return null;
  return update(id, { rol: nuevoRol });
}

function toggleActivo(id) {
  const u = getById(id);
  if (!u) return null;
  return update(id, { activo: !u.activo });
}

function remove(id) {
  _save(_getAll().filter(u => u.id !== id));
}

export default {
  getAll,
  getById,
  getByEmail,
  getByRol,
  update,
  cambiarRol,
  toggleActivo,
  remove,
};
