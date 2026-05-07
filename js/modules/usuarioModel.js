/* 
* Definición del modelo de Usuario. 
* Gestiona roles de acceso, genera IDs únicos y normaliza datos de registro.
*/

const ROLES = {
  ADMIN:   'admin',
  CLIENTE: 'cliente',
};

function create({ nombre, email, passwordHash, rol = ROLES.CLIENTE }) {
  return {
    id:             crypto.randomUUID(),
    nombre:         nombre.trim(),
    email:          email.trim().toLowerCase(),
    passwordHash,
    rol,
    activo:         true,
    fechaRegistro: new Date().toISOString(),
  };
}

export default { ROLES, create };
