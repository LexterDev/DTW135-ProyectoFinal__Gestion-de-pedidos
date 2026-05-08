import auth from './auth.js';
import storage from './storage.js';
import pedidosCrud from './pedidosCrud.js';
import pedidoModel from './pedidoModel.js';
import sucursalesCrud from './sucursalesCrud.js';
import sucursalAssigner from './sucursalAssigner.js';
import geolocation from './geolocation.js';
import geoUtils from './geoUtils.js';
import validator from './validator.js';
import notifier from './notifier.js';
import utils from './utils.js';

let _carrito = [];
let _sucursalId = null;
let _userLat = null;
let _userLng = null;
let _sucursales = [];

/** Carrito de compras */

function _getCarrito() { return storage.sessionGet(storage.KEYS.CARRITO) ?? []; }
function _saveCarrito(c) { storage.sessionSet(storage.KEYS.CARRITO, c); }
function _clearCarrito() { storage.sessionRemove(storage.KEYS.CARRITO); }

function _cartToItems() {
    return _carrito.map(i => ({
        productoId: i.productoId,
        nombre: i.nombre,
        talla: i.talla,
        cantidad: i.cantidad,
        precioUnit: i.precio,
        disenoId: i.disenoId ?? null,
    }));
}

function _updateCarrito(newCarrito) {
    _carrito = newCarrito.filter(i => i.cantidad > 0);
    _saveCarrito(_carrito);
    _renderCartItems();
    _updateTotal();
    _refreshBranchOptions();
}

/** Renderizado del carrito */

function _renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (_carrito.length === 0) {
        container.innerHTML = `
      <p class="text-gray-400 text-sm py-4 text-center">Tu carrito está vacío.</p>`;
        return;
    }

    container.innerHTML = _carrito.map((item, idx) => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${utils.escapeHtml(item.nombre)}</p>
        <p class="text-xs text-gray-400">Talla: ${item.talla}</p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button data-action="dec" data-idx="${idx}"
                class="w-6 h-6 rounded-full border border-gray-300 text-gray-600
                       hover:bg-gray-100 text-sm flex items-center justify-center">−</button>
        <span class="w-6 text-center text-sm font-medium">${item.cantidad}</span>
        <button data-action="inc" data-idx="${idx}"
                class="w-6 h-6 rounded-full border border-gray-300 text-gray-600
                       hover:bg-gray-100 text-sm flex items-center justify-center">+</button>
      </div>
      <span class="text-sm font-semibold text-gray-800 w-16 text-right shrink-0">
        ${utils.formatCurrency(item.precio * item.cantidad)}
      </span>
      <button data-action="remove" data-idx="${idx}"
              class="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none shrink-0">
        ×
      </button>
    </div>
  `).join('');

    container.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx);
        const action = btn.dataset.action;
        const copy = utils.deepClone(_carrito);
        if (action === 'inc') copy[idx].cantidad += 1;
        if (action === 'dec') copy[idx].cantidad -= 1;
        if (action === 'remove') copy.splice(idx, 1);
        _updateCarrito(copy);
    }, { once: true }); // re-registrado en cada render
}

function _updateTotal() {
    const total = _carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const el = document.getElementById('total-display');
    if (el) el.textContent = utils.formatCurrency(total);
}

/** Info del cliente */

function _initCustomerInfo() {
    const session = auth.getSession();
    const formGuest = document.getElementById('form-cliente-guest');
    const infoRegistrado = document.getElementById('info-cliente-registrado');

    if (session) {
        formGuest?.classList.add('hidden');
        infoRegistrado?.classList.remove('hidden');
        const nameEl = document.getElementById('cliente-nombre-display');
        const emailEl = document.getElementById('cliente-email-display');
        if (nameEl) nameEl.textContent = session.nombre;
        if (emailEl) emailEl.textContent = session.email;
    } else {
        formGuest?.classList.remove('hidden');
        infoRegistrado?.classList.add('hidden');
    }
}

function _getClienteData() {
    const session = auth.getSession();
    if (session) {
        return { clienteId: session.userId, nombre: session.nombre, email: session.email, valid: true };
    }
    const nombre = document.getElementById('guest-nombre')?.value.trim() ?? '';
    const email = document.getElementById('guest-email')?.value.trim() ?? '';
    const errors = validator.validate({
        nombre: [{ fn: validator.isRequired, message: 'El nombre es obligatorio.' },
        { fn: validator.minLength(2), message: 'Mínimo 2 caracteres.' }],
        email: [{ fn: validator.isRequired, message: 'El correo es obligatorio.' },
        { fn: validator.isEmail, message: 'Correo inválido.' }],
    }, { nombre, email });

    const form = document.getElementById('form-cliente-guest');
    if (Object.keys(errors).length > 0) {
        validator.showErrors(errors, form);
        return { valid: false };
    }
    validator.clearErrors(form);
    return { clienteId: null, nombre, email, valid: true };
}

/** Sucursales */

function _refreshBranchOptions() {
    const items = _cartToItems();
    _sucursales = sucursalAssigner.rankSucursales(items, _userLat, _userLng);
    _renderBranchSelect();
}

function _renderBranchSelect() {
    const select = document.getElementById('select-sucursal');
    if (!select) return;

    const prevVal = _sucursalId;
    select.innerHTML = '<option value="">— Elige una sucursal —</option>' +
        _sucursales.map(s => {
            const dist = s.distanciaKm !== null
                ? ` (${geoUtils.formatDistance(s.distanciaKm)})`
                : '';
            return `<option value="${s.id}">${utils.escapeHtml(s.nombre)}${dist}</option>`;
        }).join('');

    if (prevVal && _sucursales.find(s => s.id === prevVal)) {
        select.value = prevVal;
    } else {
        _sucursalId = null;
        _renderBranchCard(null);
    }
}

function _renderBranchCard(sucursal) {
    const card = document.getElementById('branch-card');
    if (!card) return;
    if (!sucursal) { card.classList.add('hidden'); return; }

    const dist = sucursal.distanciaKm !== null
        ? `<span class="text-xs text-indigo-600 font-medium">
         ${geoUtils.formatDistance(sucursal.distanciaKm)} de tu ubicación
       </span>`
        : '';

    card.classList.remove('hidden');
    card.innerHTML = `
    <p class="font-semibold text-gray-800">${utils.escapeHtml(sucursal.nombre)}</p>
    <p class="text-xs text-gray-500 mt-0.5">${utils.escapeHtml(sucursal.direccion)}</p>
    ${sucursal.telefono ? `<p class="text-xs text-gray-400 mt-0.5">📞 ${sucursal.telefono}</p>` : ''}
    ${dist}
  `;
}

function _initBranchSelector() {
    _refreshBranchOptions();

    document.getElementById('select-sucursal')?.addEventListener('change', e => {
        _sucursalId = e.target.value || null;
        const s = _sucursales.find(s => s.id === _sucursalId) ?? null;
        _renderBranchCard(s);
    });

    const geoBtn = document.getElementById('btn-geolocate');
    if (!geoBtn) return;

    if (!geolocation.isAvailable()) {
        geoBtn.disabled = true;
        geoBtn.title = 'Geolocalización no disponible';
        return;
    }

    geoBtn.addEventListener('click', async () => {
        geoBtn.disabled = true;
        geoBtn.textContent = 'Detectando...';
        try {
            const pos = await geolocation.getCurrentPosition();
            _userLat = pos.lat;
            _userLng = pos.lng;
            _refreshBranchOptions();

            // Reverse geocoding de Nominatim (OpenStreetMap) — muestra la zona detectada
            const geoLabel = document.getElementById('geo-location-label');
            if (geoLabel) {
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`,
                        { headers: { 'Accept-Language': 'es' } }
                    );
                    const data = await res.json();
                    const addr = data.address ?? {};
                    const zona = addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? '';
                    if (zona) {
                        geoLabel.textContent = `Ubicación detectada: ${zona}`;
                        geoLabel.classList.remove('hidden');
                    }
                } catch {
                    console.warn('No se pudo obtener la dirección desde las coordenadas.');
                }
            }

            const mejor = _sucursales[0];
            if (mejor) {
                _sucursalId = mejor.id;
                document.getElementById('select-sucursal').value = mejor.id;
                _renderBranchCard(mejor);
                notifier.success(`Sucursal más cercana: ${mejor.nombre}`);
            } else {
                notifier.warning('Sin sucursales con stock disponible cerca tuyo.');
            }
        } catch (err) {
            notifier.warning(err.message);
        } finally {
            geoBtn.disabled = false;
            geoBtn.textContent = 'Detectar mi ubicación';
        }
    });
}

/** Confirmación de pedido */

function _showConfirmation(pedido) {
  document.getElementById('checkout-form')?.classList.add('hidden');

  const panel = document.getElementById('confirmacion');
  if (!panel) return;
  panel.classList.remove('hidden');

  const sucursal  = _sucursales.find(s => s.id === pedido.sucursalId);
  const session   = auth.getSession();

  panel.innerHTML = `
    <div class="text-center mb-6">
      <span class="text-5xl">🎉</span>
      <h2 class="text-xl font-bold text-gray-800 mt-3">¡Pedido confirmado!</h2>
      <p class="text-sm text-gray-500 mt-1">
        Número de pedido: <span class="font-mono font-semibold text-gray-700">
          ${pedido.id.slice(0, 8).toUpperCase()}
        </span>
      </p>
    </div>
    <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 flex flex-col gap-1 mb-6">
      <p><span class="font-medium">Total:</span> ${utils.formatCurrency(pedido.total)}</p>
      <p><span class="font-medium">Sucursal de retiro:</span> ${utils.escapeHtml(sucursal?.nombre ?? '')}</p>
      <p class="text-xs text-gray-400">${utils.escapeHtml(sucursal?.direccion ?? '')}</p>
      <p><span class="font-medium">Estado:</span>
         <span class="text-yellow-600 font-medium">${utils.capitalize(pedido.estado)}</span></p>
    </div>
    <div class="flex flex-col gap-2">
      ${session ? `<a href="mis-pedidos.html"
           class="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
                  rounded-lg py-2.5 transition-colors">
           Ver mis pedidos
         </a>` : ''}
      <a href="catalogo.html"
         class="block text-center border border-gray-300 text-gray-700 hover:bg-gray-50
                font-medium rounded-lg py-2.5 transition-colors">
         Seguir comprando
      </a>
    </div>
  `;
}

function _initSubmit() {
  const btn = document.getElementById('btn-confirmar');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (_carrito.length === 0) {
      notifier.warning('Tu carrito está vacío.');
      return;
    }
    if (!_sucursalId) {
      notifier.warning('Selecciona una sucursal de retiro.');
      return;
    }

    const cliente = _getClienteData();
    if (!cliente.valid) return;

    btn.disabled    = true;
    btn.textContent = 'Procesando...';

    const total    = _carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const resultado = pedidosCrud.create({
      clienteId:     cliente.clienteId,
      clienteNombre: cliente.nombre,
      clienteEmail:  cliente.email,
      items:         _cartToItems(),
      sucursalId:    _sucursalId,
      total,
    });

    if (!resultado.ok) {
      notifier.error(resultado.error);
      btn.disabled    = false;
      btn.textContent = 'Confirmar pedido';
      return;
    }

    _clearCarrito();
    _showConfirmation(resultado.pedido);
  });
}

function initCheckout() {
  _carrito    = _getCarrito();
  _sucursales = sucursalesCrud.getActivas();

  const emptyState = document.getElementById('empty-state');
  const form       = document.getElementById('checkout-form');

  if (_carrito.length === 0) {
    emptyState?.classList.remove('hidden');
    form?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  form?.classList.remove('hidden');

  _renderCartItems();
  _updateTotal();
  _initCustomerInfo();
  _initBranchSelector();
  _initSubmit();
}

export default { initCheckout };
