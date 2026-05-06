/**
 * @module usuarioModel
 * @description Define la estructura del modelo de datos Usuario.
 * Campos: id, nombre, email, passwordHash, rol ('admin' | 'cliente'), fechaRegistro.
 */

const ROLES = {
  ADMIN:   'admin',
  CLIENTE: 'cliente',
};

/**
 * Crea un nuevo objeto usuario con todos sus campos inicializados.
 * @param {{ nombre: string, email: string, passwordHash: string, rol?: string }} params
 * @returns {Object} Usuario listo para persistir.
 */
function create({ nombre, email, passwordHash, rol = ROLES.CLIENTE }) {
  return {
    id:            crypto.randomUUID(),
    nombre:        nombre.trim(),
    email:         email.trim().toLowerCase(),
    passwordHash,
    rol,
    activo:        true,
    fechaRegistro: new Date().toISOString(),
  };
}

export default { ROLES, create };
