// Renderizador del calcetín (280x340).
// Pinta colores por zona y monta el estampado.
/**
 * @module sockRenderer
 * @description Dibuja un calcetín estilizado (vista lateral) en un <canvas>.
 * Aplica colores por zona y opcionalmente superpone un estampado.
 *
 * Coordenadas diseñadas para un canvas de 280 × 340.
 */

export const CANVAS_W = 280;
export const CANVAS_H = 340;

// ── Silueta base ─────────────────────────────────

// Arma el path del contorno. Lo usamos como máscara (clip) para no salirnos.
function _sockOutline(ctx) {
  ctx.beginPath();
  ctx.moveTo(68, 18);            // arriba izq del borde
  ctx.lineTo(188, 18);           // arriba der
  ctx.lineTo(188, 218);          // bajando por la pierna
  ctx.bezierCurveTo(188, 236, 206, 238, 218, 232); // curva del tobillo
  ctx.lineTo(246, 232);          // empeine
  ctx.bezierCurveTo(268, 232, 268, 262, 246, 262); // punta redondeada
  ctx.lineTo(104, 262);          // planta del pie
  ctx.bezierCurveTo(68, 262, 68, 232, 68, 218);    // curva del talon
  ctx.closePath();               // subiendo de regreso
}

// ── Zonas de color ──────────────────────────────────────

const ZONES = {
  // borde elastico arriba
  borde:  (ctx) => { ctx.fillRect(68, 18, 120, 38); },
  // tubo / caña principal
  cana:   (ctx) => { ctx.fillRect(68, 56, 120, 162); },
  // el talon
  talon:  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(68, 190);
    ctx.lineTo(130, 190);
    ctx.lineTo(130, 262);
    ctx.lineTo(104, 262);
    ctx.bezierCurveTo(68, 262, 68, 232, 68, 218);
    ctx.closePath();
    ctx.fill();
  },
  // base / planta del pie
  base:   (ctx) => { ctx.fillRect(104, 218, 142, 44); },
  // punta de los dedos
  punta:  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(220, 232);
    ctx.lineTo(246, 232);
    ctx.bezierCurveTo(268, 232, 268, 262, 246, 262);
    ctx.lineTo(220, 262);
    ctx.closePath();
    ctx.fill();
  },
};

// ── Estampados ───────────────────────────────────────────────────────

function _drawStamp(ctx, estampado, pos = null) {
  if (!estampado?.imagenBase64) return;

  const x      = pos?.x     ?? 128;
  const y      = pos?.y     ?? 130;
  const escala = pos?.escala ?? 1;

  const img = new Image();
  img.onload = () => {
    const size = 40 * escala;
    // Asumimos que la máscara (clip) ya está puesta antes de llamar esto
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  };
  img.src = estampado.imagenBase64;
}

// ── Función principal ─────────────────────────────────────────────────────────

// Renderiza todo el calcetín en el canvas
function render(canvas, colores, estampado = null, estampadoPos = null) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Pintamos cada zona respetando el contorno
  for (const [zona, drawFn] of Object.entries(ZONES)) {
    ctx.save();
    _sockOutline(ctx);
    ctx.clip();
    ctx.fillStyle = colores[zona] ?? '#ffffff';
    drawFn(ctx);
    ctx.restore();
  }

  // Montamos el estampado
  if (estampado?.imagenBase64) {
    ctx.save();
    _sockOutline(ctx);
    ctx.clip();
    _drawStamp(ctx, estampado, estampadoPos);
    ctx.restore();
  } else if (estampado?.nombre) {
    // Si no hay img, nomás ponemos el texto por el empeine
    ctx.save();
    _sockOutline(ctx);
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.font      = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pos = estampadoPos ?? { x: 165, y: 245 };
    ctx.fillText(estampado.nombre, pos.x, pos.y);
    ctx.restore();
  }

  // Borde exterior para que resalte
  ctx.save();
  _sockOutline(ctx);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.stroke();
  ctx.restore();

  // Líneas tenues para separar las zonas
  ctx.save();
  _sockOutline(ctx);
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth   = 1.5;

  // borde / cana
  ctx.beginPath(); ctx.moveTo(68, 56); ctx.lineTo(188, 56); ctx.stroke();
  // cana / talon + base
  ctx.beginPath(); ctx.moveTo(68, 218); ctx.lineTo(188, 218); ctx.stroke();
  // talon / base division vertical
  ctx.beginPath(); ctx.moveTo(130, 218); ctx.lineTo(130, 262); ctx.stroke();
  // base / punta
  ctx.beginPath(); ctx.moveTo(220, 232); ctx.lineTo(220, 262); ctx.stroke();

  ctx.restore();
}

/**
 * Exporta el canvas como data URL base64.
 * @param {HTMLCanvasElement} canvas
 * @returns {string}
 */
function toDataURL(canvas) {
  return canvas.toDataURL('image/jpeg', 0.85);
}

export default { render, toDataURL, CANVAS_W, CANVAS_H };
