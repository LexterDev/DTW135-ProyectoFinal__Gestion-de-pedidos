/* 
* Módulo de validación.
* Enfocado en la integridad de datos para email, contraseñas y teléfonos.
* Se agrega la lógica de negocio para pedidos y personalización (coordenadas, colores).
*/

const isRequired = (v) => v !== null && v !== undefined && String(v).trim() !== '';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const minLength = (min) => (v) => String(v).trim().length >= min;

const maxLength = (max) => (v) => String(v).trim().length <= max;

const isNumeric = (v) => !isNaN(v) && !isNaN(parseFloat(v));

const isPositive = (v) => isNumeric(v) && parseFloat(v) > 0;

const isNonNegative = (v) => isNumeric(v) && parseFloat(v) >= 0;

const inRange = (min, max) => (v) => {
  const n = parseFloat(v);
  return isNumeric(v) && n >= min && n <= max;
};

const isLatitude  = inRange(-90, 90);
const isLongitude = inRange(-180, 180);
const isCoordinate = (lat, lng) => isLatitude(lat) && isLongitude(lng);

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
  isPositive,
  isNonNegative,
  inRange,
  isLatitude,
  isLongitude,
  isCoordinate,
  validate,
  showErrors,
  clearErrors,
};
