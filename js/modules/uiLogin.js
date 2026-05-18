/**
 * @module uiLogin
 * @description Gestiona la interfaz de las vistas Login y Registro.
 * Maneja formularios, mensajes de error inline y redirección post-autenticación.
 */

import auth      from './auth.js';
import authGuard from './authGuard.js';
import validator from './validator.js';
import notifier  from './notifier.js';

// ── Reglas de validación ──────────────────────────────────────────────────────

const LOGIN_RULES = {
  email: [
    { fn: validator.isRequired, message: 'El correo es obligatorio.' },
    { fn: validator.isEmail,    message: 'Ingresa un correo válido.' },
  ],
  password: [
    { fn: validator.isRequired,    message: 'La contraseña es obligatoria.' },
    { fn: validator.minLength(6),  message: 'Mínimo 6 caracteres.' },
  ],
};

const REGISTRO_RULES = {
  nombre: [
    { fn: validator.isRequired,   message: 'El nombre es obligatorio.' },
    { fn: validator.minLength(2), message: 'Mínimo 2 caracteres.' },
    { fn: validator.maxLength(60),message: 'Máximo 60 caracteres.' },
  ],
  email: [
    { fn: validator.isRequired, message: 'El correo es obligatorio.' },
    { fn: validator.isEmail,    message: 'Ingresa un correo válido.' },
  ],
  password: [
    { fn: validator.isRequired,    message: 'La contraseña es obligatoria.' },
    { fn: validator.minLength(8),  message: 'Mínimo 8 caracteres.' },
    { fn: validator.maxLength(64), message: 'Máximo 64 caracteres.' },
  ],
  confirmar: [
    { fn: validator.isRequired,              message: 'Confirma tu contraseña.' },
    { fn: (v, data) => v === data.password,  message: 'Las contraseñas no coinciden.' },
  ],
};

// ── Helpers internos ──────────────────────────────────────────────────────────

function _setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Espera...' : btn.dataset.label;
}

// ── API pública ───────────────────────────────────────────────────────────────

function initLogin() {
  authGuard.redirectIfLoggedIn();

  const form = document.getElementById('form-login');
  if (!form) return;

  // Guarda el texto original del botón para restaurarlo tras un error.
  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.dataset.label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    validator.clearErrors(form);

    const data = {
      email:    document.getElementById('login-email')?.value.trim()    ?? '',
      password: document.getElementById('login-password')?.value         ?? '',
    };

    const errors = validator.validate(LOGIN_RULES, data);
    if (Object.keys(errors).length > 0) {
      validator.showErrors(errors, form);
      return;
    }

    _setLoading(btn, true);
    const result = await auth.login(data.email, data.password);
    _setLoading(btn, false);

    if (!result.ok) {
      notifier.error(result.error);
      return;
    }

    notifier.success(`¡Bienvenido, ${result.user.nombre}!`);
    setTimeout(() => {
      window.location.href = result.user.rol === 'admin'
        ? authGuard.ROUTES.DASHBOARD
        : authGuard.ROUTES.CATALOGO;
    }, 800);
  });
}


function initRegistro() {
  authGuard.redirectIfLoggedIn();

  const form = document.getElementById('form-registro');
  if (!form) return;

  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.dataset.label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    validator.clearErrors(form);

    const data = {
      nombre:    document.getElementById('reg-nombre')?.value.trim()    ?? '',
      email:     document.getElementById('reg-email')?.value.trim()     ?? '',
      password:  document.getElementById('reg-password')?.value         ?? '',
      confirmar: document.getElementById('reg-confirmar')?.value        ?? '',
    };

    const errors = validator.validate(REGISTRO_RULES, data);
    if (Object.keys(errors).length > 0) {
      validator.showErrors(errors, form);
      return;
    }

    _setLoading(btn, true);
    const result = await auth.register(data.nombre, data.email, data.password);
    _setLoading(btn, false);

    if (!result.ok) {
      notifier.error(result.error);
      return;
    }

    notifier.success('¡Cuenta creada! Redirigiendo...');
    setTimeout(() => {
      window.location.href = authGuard.ROUTES.CATALOGO;
    }, 800);
  });
}

export default { initLogin, initRegistro };
