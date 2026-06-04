/**
 * @module uiConfigurador
 * @description Configurador visual de calcetines personalizados.
 * Gestiona la interacción del usuario para elegir colores por zona,
 * aplicar estampados y guardar el diseño final.
 */

import auth        from './auth.js';
import disenoModel from './disenoModel.js';
import disenosCrud from './disenosCrud.js';
import estampados  from './estampados.js';
import sockRenderer from './sockRenderer.js';
import notifier    from './notifier.js';
import utils       from './utils.js';

// ── Estado local (almacena la configuración actual del usuario) ───────────────

const DEFAULT_COLORS = {
  [disenoModel.ZONAS.BASE]:   '#4f46e5',
  [disenoModel.ZONAS.PUNTA]:  '#818cf8',
  [disenoModel.ZONAS.TALON]:  '#818cf8',
  [disenoModel.ZONAS.CANA]:   '#6366f1',
  [disenoModel.ZONAS.BORDE]:  '#312e81',
};

let _colores         = { ...DEFAULT_COLORS };
let _estampadoId     = null;
let _estampadoPos    = { x: 165, y: 130, escala: 1 };
let _canvas          = null;

// ── Funciones auxiliares (obtención de datos y renderizado) ───────────────────

function _getEstampado() {
  return _estampadoId ? estampados.getById(_estampadoId) : null;
}

function _redraw() {
  if (!_canvas) return;
  sockRenderer.render(_canvas, _colores, _getEstampado(), _estampadoPos);
}

// ── Selectores de color (mapeo de zonas y actualización visual) ───────────────

function _initColorPickers() {
  const LABELS = {
    [disenoModel.ZONAS.BORDE]: 'Ribete / elástico',
    [disenoModel.ZONAS.CANA]:  'Caña (pierna)',
    [disenoModel.ZONAS.BASE]:  'Base (planta)',
    [disenoModel.ZONAS.TALON]: 'Talón',
    [disenoModel.ZONAS.PUNTA]: 'Puntera',
  };

  const wrap = document.getElementById('color-pickers');
  if (!wrap) return;

  wrap.innerHTML = Object.entries(LABELS).map(([zona, label]) => `
    <div class="flex items-center justify-between gap-3">
      <label for="color-${zona}" class="text-sm text-gray-700 font-medium">${label}</label>
      <input id="color-${zona}" type="color" value="${_colores[zona]}"
             data-zona="${zona}"
             class="w-10 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
    </div>
  `).join('');

  wrap.addEventListener('input', e => {
    const { zona } = e.target.dataset;
    if (zona && e.target.type === 'color') {
      _colores[zona] = e.target.value;
      _redraw();
    }
  });
}

// ── Selector de estampados (lista desplegable de opciones activas) ────────────

function _initEstampadoSelector() {
  const select = document.getElementById('select-estampado');
  if (!select) return;

  const lista = estampados.getActivos();
  select.innerHTML = '<option value="">— Sin estampado —</option>' +
    lista.map(e => `<option value="${e.id}">${utils.escapeHtml(e.nombre)}
      (${utils.escapeHtml(e.categoria)})</option>`).join('');

  select.addEventListener('change', e => {
    _estampadoId = e.target.value || null;
    _redraw();
  });
}

// ── Controles de posición y escala del estampado ──────────────────────────────

function _initStampPosition() {
  const xInput = document.getElementById('stamp-x');
  const yInput = document.getElementById('stamp-y');
  const sInput = document.getElementById('stamp-escala');

  if (xInput) {
    xInput.value = _estampadoPos.x;
    xInput.addEventListener('input', () => {
      _estampadoPos.x = parseInt(xInput.value, 10);
      _redraw();
    });
  }
  if (yInput) {
    yInput.value = _estampadoPos.y;
    yInput.addEventListener('input', () => {
      _estampadoPos.y = parseInt(yInput.value, 10);
      _redraw();
    });
  }
  if (sInput) {
    sInput.value = _estampadoPos.escala;
    sInput.addEventListener('input', () => {
      _estampadoPos.escala = parseFloat(sInput.value);
      _redraw();
    });
  }
}

// ── Lógica para guardar el diseño y generar la vista previa ───────────────────

function _handleSave() {
  const nombreInput = document.getElementById('diseno-nombre');
  const nombre      = nombreInput?.value.trim();
  if (!nombre) {
    notifier.warning('Ponle un nombre a tu diseño.');
    nombreInput?.focus();
    return;
  }

  const session           = auth.getSession();
  const imagenPreviewBase64 = sockRenderer.toDataURL(_canvas);

  const result = disenosCrud.create({
    nombre,
    colores:     { ..._colores },
    estampadoId: _estampadoId,
    estampadoPos: _estampadoId ? { ..._estampadoPos } : null,
    imagenPreviewBase64,
    autorId:     session?.userId ?? null,
  });

  if (result.persistido) {
    notifier.success('Diseño guardado en "Mis diseños".');
  } else {
    notifier.info('Diseño creado (no guardado — inicia sesión para conservarlo).');
  }
}

// ── Restablecer el configurador a sus valores iniciales ───────────────────────

function _handleReset() {
  _colores      = { ...DEFAULT_COLORS };
  _estampadoId  = null;
  _estampadoPos = { x: 165, y: 130, escala: 1 };

  // Restauramos los selectores de color de la interfaz a su estado original
  Object.entries(_colores).forEach(([zona, color]) => {
    const el = document.getElementById(`color-${zona}`);
    if (el) el.value = color;
  });

  const select = document.getElementById('select-estampado');
  if (select) select.value = '';

  _redraw();
}

// ── Punto de entrada: Inicialización del canvas y eventos principales ─────────

function initConfigurador() {
  _canvas = document.getElementById('sock-canvas');
  if (!_canvas) return;

  _canvas.width  = sockRenderer.CANVAS_W;
  _canvas.height = sockRenderer.CANVAS_H;

  _initColorPickers();
  _initEstampadoSelector();
  _initStampPosition();
  _redraw();

  document.getElementById('btn-guardar-diseno')
    ?.addEventListener('click', _handleSave);

  document.getElementById('btn-reset-diseno')
    ?.addEventListener('click', _handleReset);
}

// ── Renderizado de la galería "Mis Diseños" y gestión de eliminaciones ────────

function initMisDisenos() {
  const session   = auth.getSession();
  const container = document.getElementById('disenos-list');
  const empty     = document.getElementById('empty-disenos');
  if (!container) return;

  if (!session) {
    empty?.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  }

  const disenos = disenosCrud.getByAutorId(session.userId);

  if (disenos.length === 0) {
    empty?.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  }

  empty?.classList.add('hidden');
  container.classList.remove('hidden');

  container.innerHTML = disenos.map(d => `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4"
         data-id="${d.id}">
      ${d.imagenPreviewBase64
        ? `<img src="${d.imagenPreviewBase64}" alt="Preview"
               class="w-20 h-24 object-contain rounded-xl border border-gray-100 shrink-0" />`
        : `<div class="w-20 h-24 bg-indigo-50 rounded-xl flex items-center justify-center
                       text-3xl shrink-0">🧦</div>`}
      <div class="flex flex-col gap-1 flex-1 min-w-0">
        <p class="font-semibold text-gray-800">${utils.escapeHtml(d.nombre)}</p>
        <p class="text-xs text-gray-400">${utils.formatDate(d.fechaCreacion)}</p>
        <div class="flex gap-1 mt-1 flex-wrap">
          ${Object.entries(d.colores ?? {}).map(([z, c]) =>
            `<span title="${z}" class="inline-block w-5 h-5 rounded-full border border-white shadow-sm"
                   style="background:${c}"></span>`
          ).join('')}
        </div>
        <div class="flex gap-3 mt-auto pt-2">
          <button data-action="delete" data-id="${d.id}"
                  class="text-xs text-red-500 hover:underline">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'delete') {
      if (!confirm('¿Eliminar este diseño?')) return;
      disenosCrud.remove(btn.dataset.id);
      initMisDisenos(); // Volvemos a renderizar la lista para reflejar la eliminación
    }
  });
}

export default { initConfigurador, initMisDisenos };
