/**
 * @module uiCatalogo
 * @description Renderiza el catálogo público con filtros, búsqueda y carrito.
 * Adapta la navegación según si el usuario tiene sesión activa o es invitado.
 */

import auth          from './auth.js';
import productosCrud from './productosCrud.js';
import storage       from './storage.js';
import notifier      from './notifier.js';
import utils         from './utils.js';

// ── Carrito (mini-gestión local) ──────────────────────────────────────────────

function _getCarrito() {
  return storage.sessionGet(storage.KEYS.CARRITO) ?? [];
}

function _saveCarrito(items) {
  storage.sessionSet(storage.KEYS.CARRITO, items);
}

function _cartCount() {
  return _getCarrito().reduce((acc, i) => acc + i.cantidad, 0);
}

function _updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const n = _cartCount();
  badge.textContent = n;
  badge.classList.toggle('hidden', n === 0);
}

function _addToCarrito(producto, talla) {
  const carrito = _getCarrito();
  const idx     = carrito.findIndex(i => i.productoId === producto.id && i.talla === talla);
  if (idx >= 0) {
    carrito[idx].cantidad += 1;
  } else {
    carrito.push({
      productoId: producto.id,
      nombre:     producto.nombre,
      precio:     producto.precio,
      talla,
      cantidad:   1,
    });
  }
  _saveCarrito(carrito);
  _updateCartBadge();
  notifier.success(`"${producto.nombre}" (${talla}) añadido al carrito.`);
}

// ── Renderizado de tarjetas ───────────────────────────────────────────────────

const CATEGORIA_STYLE = {
  'clásico':       'bg-gray-100 text-gray-700',
  'temático':      'bg-purple-100 text-purple-700',
  'personalizado': 'bg-orange-100 text-orange-700',
};

function _renderCard(producto) {
  const badgeClass   = CATEGORIA_STYLE[producto.categoria] ?? 'bg-gray-100 text-gray-700';
  const tallaOptions = producto.tallas
    .map(t => `<option value="${t}">${t}</option>`)
    .join('');
  const imagenHTML   = producto.imagenBase64
    ? `<img src="${producto.imagenBase64}" alt="${utils.escapeHtml(producto.nombre)}"
           class="w-full h-full object-cover" />`
    : `<span class="text-6xl select-none" aria-hidden="true">🧦</span>`;

  const card = document.createElement('article');
  card.className = [
    'bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden',
    'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  ].join(' ');

  card.innerHTML = `
    <div class="h-44 bg-gray-50 flex items-center justify-center">
      ${imagenHTML}
    </div>

    <div class="flex flex-col gap-3 p-4 flex-1">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold text-gray-800 text-sm leading-snug">
          ${utils.escapeHtml(producto.nombre)}
        </h3>
        <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}">
          ${utils.capitalize(producto.categoria)}
        </span>
      </div>

      <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">
        ${utils.escapeHtml(producto.descripcion)}
      </p>

      <p class="text-lg font-bold text-indigo-600">${utils.formatCurrency(producto.precio)}</p>

      <div class="flex gap-2 mt-auto">
        <select
          class="select-talla w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          ${tallaOptions}
        </select>
        <button
          class="btn-agregar flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors">
          Agregar 🛒
        </button>
      </div>

      ${producto.categoria === 'personalizado' ? `
        <a href="configurador.html"
           class="text-center text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
          ✏️ Diseñar en el configurador
        </a>` : ''}
    </div>
  `;

  card.querySelector('.btn-agregar').addEventListener('click', () => {
    const talla = card.querySelector('.select-talla').value;
    _addToCarrito(producto, talla);
  });

  return card;
}

// ── Filtrado y búsqueda ───────────────────────────────────────────────────────

let _productos       = [];
let _categoriaActiva = '';
let _query           = '';

function _aplicarFiltros() {
  let lista = _productos;

  if (_categoriaActiva) {
    lista = lista.filter(p => p.categoria === _categoriaActiva);
  }
  if (_query.trim()) {
    const q = _query.toLowerCase();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q)
    );
  }

  const grid  = document.getElementById('catalogo-grid');
  const empty = document.getElementById('empty-state');
  grid.innerHTML = '';

  if (lista.length === 0) {
    empty?.classList.remove('hidden');
  } else {
    empty?.classList.add('hidden');
    lista.forEach(p => grid.appendChild(_renderCard(p)));
  }
}

function _initFiltros() {
  document.querySelectorAll('[data-categoria]').forEach(btn => {
    btn.addEventListener('click', () => {
      _categoriaActiva = btn.dataset.categoria;

      document.querySelectorAll('[data-categoria]').forEach(b => {
        const active = b === btn;
        b.classList.toggle('bg-indigo-600',   active);
        b.classList.toggle('text-white',      active);
        b.classList.toggle('border-indigo-600', active);
        b.classList.toggle('text-gray-600',   !active);
        b.classList.toggle('border-gray-300', !active);
      });

      _aplicarFiltros();
    });
  });
}

// ── Navegación según sesión ───────────────────────────────────────────────────

function _initNav() {
  const session  = auth.getSession();
  const navGuest = document.getElementById('nav-guest');
  const navUser  = document.getElementById('nav-user');

  if (session) {
    navGuest?.classList.add('hidden');
    navUser?.classList.remove('hidden');
    navUser?.classList.add('flex');

    const nameEl = document.getElementById('nav-user-name');
    if (nameEl) nameEl.textContent = session.nombre.split(' ')[0];

    if (session.rol === 'admin') {
      document.getElementById('nav-admin-link')?.classList.remove('hidden');
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      auth.logout();
      window.location.reload();
    });
  } else {
    navGuest?.classList.remove('hidden');
    navUser?.classList.add('hidden');
  }
}

// ── Punto de entrada ──────────────────────────────────────────────────────────

function initCatalogo() {
  _productos = productosCrud.getActivos();

  _initNav();
  _initFiltros();
  _updateCartBadge();

  const searchInput = document.getElementById('search-input');
  const clearBtn    = document.getElementById('btn-search-clear');

  searchInput?.addEventListener(
    'input',
    utils.debounce(e => {
      _query = e.target.value;
      clearBtn?.classList.toggle('hidden', !_query.trim());
      _aplicarFiltros();
    }, 300)
  );

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    _query = '';
    clearBtn.classList.add('hidden');
    _aplicarFiltros();
  });

  _aplicarFiltros();
}

export default { initCatalogo };
