/* 
* Módulo de validación.
* Enfocado en la integridad de datos para email, contraseñas y teléfonos.
*/

const isRequired = (v) => v !== null && v !== undefined && String(v).trim() !== '';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const minLength = (min) => (v) => String(v).trim().length >= min;

const maxLength = (max) => (v) => String(v).trim().length <= max;

const isNumeric = (v) => !isNaN(v) && !isNaN(parseFloat(v));

function validate(rules, data) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const { fn, message } of fieldRules) {
      if (!fn(data[field], data)) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

function showErrors(errors, form = document) {
  form.querySelectorAll('[data-error]').forEach(el => {
    const field = el.dataset.error;
    el.textContent = errors[field] ?? '';
    el.classList.toggle('hidden', !errors[field]);
  });
}

function clearErrors(form = document) {
  form.querySelectorAll('[data-error]').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

export default {
  isRequired,
  isEmail,
  minLength,
  maxLength,
  isNumeric,
  validate,
  showErrors,
  clearErrors,
};
