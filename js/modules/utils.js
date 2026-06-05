/**
 * Módulo de utilidades generales.
 * Funciones para generación de IDs, formateo de fechas y monedas,
 * clonación de objetos, debounce, selección DOM y escape de HTML.
*/

/** Generamos un UUID v4 usando la API nativa del navegador. */
function generateId() {
  return crypto.randomUUID();
}

/**
 * Formateamos una fecha ISO a cadena legible en español (El Salvador).
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

/**
 * Formateamos un número como moneda USD.
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Clonamos en profundidad un objeto serializable (sin funciones ni referencias circulares).
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Retarda la ejecución de una función hasta que deje de llamarse por `delay` ms.
 * Útil para campos de búsqueda en tiempo real.
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Alias corto de document.querySelector. */
function $(selector, context = document) {
  return context.querySelector(selector);
}

/** Alias corto de document.querySelectorAll — devuelve Array, no NodeList. */
function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

/**
 * Escapamos caracteres HTML para evitar XSS al insertar texto en el DOM.
 * Usar siempre que se muestre contenido proveniente del usuario.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Capitalizamos la primera letra de una cadena.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default {
  generateId,
  formatDate,
  formatCurrency,
  deepClone,
  debounce,
  $,
  $$,
  escapeHtml,
  capitalize,
};
