/**
 * Módulo para monitorear el uso del almacenamiento local y alertar al usuario.
 * Proporciona funciones para verificar el porcentaje de uso y emitir alertas
 * cuando se superan ciertos umbrales definidos.
 */


/*
* Importamos el módulo de almacenamiento para acceder a la función de cálculo de uso.
* Importamos el módulo de notificaciones para mostrar alertas al usuario.
*/
import storage from './storage.js';
import notifier from './notifier.js';


/*
* Definimos los umbrales de advertencia y peligro en porcentaje.
*/
const WARN_THRESHOLD = 70; // %
const DANGER_THRESHOLD = 90; // %

/**
 * Verifica el porcentaje de uso del almacenamiento y emite alertas si se superan los umbrales.
 */
function checkAndAlert() {
    const pct = storage.usagePercent();
    if (pct >= DANGER_THRESHOLD) {
        notifier.error(`Almacenamiento crítico: ${pct}% usado. Exporta y limpia datos.`);
    } else if (pct >= WARN_THRESHOLD) {
        notifier.warning(`Almacenamiento al ${pct}%. Considera exportar datos pronto.`);
    }
    return pct; // Devuelve el porcentaje
}

/**
 * Función para obtener un reporte del uso del almacenamiento, incluyendo el porcentaje y el nivel de alerta.
 */
function getReport() {
    const pct = storage.usagePercent();
    const nivel = pct >= DANGER_THRESHOLD ? 'crítico'
        : pct >= WARN_THRESHOLD ? 'advertencia'
            : 'normal';
    return { porcentaje: pct, nivel };
}

/*
* Exportamos las funciones y constantes para su uso en otros módulos.
*/
export default {
    checkAndAlert,
    getReport,
    WARN_THRESHOLD,
    DANGER_THRESHOLD
};
