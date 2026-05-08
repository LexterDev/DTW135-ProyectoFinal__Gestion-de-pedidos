
/** 
 * Funcion auxiliar para verificar si el navegador soporta geolocalización. 
 */
function isAvailable() {
  return 'geolocation' in navigator;
}

/**
 * Obtiene la posición actual del usuario.
 */
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isAvailable()) {
      reject(new Error('Tu navegador no soporta geolocalización.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        const MESSAGES = {
          1: 'Permiso de ubicación denegado. Selecciona la sucursal manualmente.',
          2: 'No se pudo determinar tu ubicación. Intenta de nuevo.',
          3: 'La solicitud de ubicación tardó demasiado.',
        };
        reject(new Error(MESSAGES[err.code] ?? 'Error de geolocalización desconocido.'));
      },
      { timeout: 10_000, maximumAge: 60_000, ...options }
    );
  });
}

export default { isAvailable, getCurrentPosition };
