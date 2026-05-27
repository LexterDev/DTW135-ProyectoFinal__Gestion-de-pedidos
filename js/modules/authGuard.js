/**
 * Módulo de protección de rutas basado en la sesión activa y el rol del usuario.
 */

import auth from './auth.js';

const ROUTES = {
  LOGIN:     'login.html',
  CATALOGO:  'catalogo.html',
  DASHBOARD: 'index.html',
};

/**
 * Protegemos una vista exigiendo sesión activa y rol permitido.
 * Llamamos esto al inicio del script de cada página protegida .
 *
 * Por ejemplo:
 * // En la página index.html (solo admin):
 * if (!authGuard.guard(['admin'])) return;
 */
function guard(allowedRoles = []) {
  const session = auth.getSession();

  if (!session) {
    window.location.replace(ROUTES.LOGIN);
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.rol)) {
    // El usuario está logueado pero su rol no tiene acceso a esta vista.
    window.location.replace(
      session.rol === 'admin' ? ROUTES.DASHBOARD : ROUTES.CATALOGO
    );
    return false;
  }

  return true;
}

/**
 * En páginas públicas de autenticación (login, registro):
 * redirige automáticamente si el usuario ya tiene sesión activa.
 */
function redirectIfLoggedIn() {
  const session = auth.getSession();
  if (!session) return;
  window.location.replace(
    session.rol === 'admin' ? ROUTES.DASHBOARD : ROUTES.CATALOGO
  );
}

export default {
    guard,
    redirectIfLoggedIn,
    ROUTES
};
