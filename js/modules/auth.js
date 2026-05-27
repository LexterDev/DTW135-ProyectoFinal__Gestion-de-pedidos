/**
 * Módulo de autenticación y gestión de usuarios.
 * - Almacena usuarios en localStorage con un esquema simple.
 * - Hashea contraseñas con SHA-256 usando la Web Crypto API nativa.
 */

import storage      from './storage.js';
import usuarioModel from './usuarioModel.js';

/* Helpers internos  */

function _getUsers() {
  return storage.get(storage.KEYS.USUARIOS) ?? [];
}

function _saveUsers(users) {
  storage.set(storage.KEYS.USUARIOS, users);
}

function _createSession(user) {
  storage.set(storage.KEYS.SESSION, {
    userId: user.id,
    nombre: user.nombre,
    email:  user.email,
    rol:    user.rol,
  });
}


/**
 * Hasheamos una contraseña con SHA-256 usando la Web Crypto API nativa.
 * 
 */
async function hashPassword(password) {
  const data   = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Cargamos los usuarios de prueba si localStorage está vacío.
 * Debe llamarse una sola vez al arrancar la aplicación (en app.js).
 */
async function seedIfEmpty() {
  if (_getUsers().length > 0) return;

  const [adminHash, clienteHash] = await Promise.all([
    hashPassword('admin12345'),
    hashPassword('cliente123'),
  ]);

  _saveUsers([
    usuarioModel.create({
      nombre:       'Admin SoxLab',
      email:        'admin@soxlab.com',
      passwordHash: adminHash,
      rol:          usuarioModel.ROLES.ADMIN,
    }),
    usuarioModel.create({
      nombre:       'Cliente Demo',
      email:        'cliente@correo.com',
      passwordHash: clienteHash,
      rol:          usuarioModel.ROLES.CLIENTE,
    }),
  ]);
}

/**
 * Registramos un nuevo usuario con rol cliente.
 * 
 */
async function register(nombre, email, password) {
  const users     = _getUsers();
  const emailNorm = email.trim().toLowerCase();

  if (users.find(u => u.email === emailNorm)) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
  }

  const passwordHash = await hashPassword(password);
  const user         = usuarioModel.create({ nombre, email: emailNorm, passwordHash });

  _saveUsers([...users, user]);
  _createSession(user);

  return { ok: true, user };
}

/**
 * Iniciamos sesión buscando el usuario por email y comparando el hash de la contraseña.
 * Si el email no existe, la contraseña es incorrecta o la cuenta está desactivada, se devuelve un error genérico.
 * Esto evita revelar información sobre qué parte fue incorrecta.
 */
async function login(email, password) {
  const emailNorm = email.trim().toLowerCase();
  const user      = _getUsers().find(u => u.email === emailNorm);

  if (!user)        return { ok: false, error: 'Correo o contraseña incorrectos.' };
  if (!user.activo) return { ok: false, error: 'Esta cuenta está desactivada.' };

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }

  _createSession(user);
  return { ok: true, user };
}

/** Cerramos la sesión activa eliminando la clave de sesión. */
function logout() {
  storage.remove(storage.KEYS.SESSION);
}

/** Obtenemos los datos de la sesión activa. */
function getSession() {
  return storage.get(storage.KEYS.SESSION);
}

/** Obtenemos el usuario actual de la sesión activa. */
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return _getUsers().find(u => u.id === session.userId) ?? null;
}

/** Verificamos si el usuario está logueado o no. */
function isLoggedIn() {
  return getSession() !== null;
}

export default {
  hashPassword,
  seedIfEmpty,
  register,
  login,
  logout,
  getSession,
  getCurrentUser,
  isLoggedIn,
};
