/**
 * Utilidades de geolocalización como calculo y formateo de distancias.
 */

const EARTH_RADIUS_KM = 6371;

/** Convierte grados a radianes. */
function _toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos usando el metodo Haversine.
 */
function haversine(lat1, lng1, lat2, lng2) {
    const dLat = _toRad(lat2 - lat1);
    const dLng = _toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(_toRad(lat1)) * Math.cos(_toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Ordena un array por distancia ascendente desde un punto.
 */
function sortByDistance(items, userLat, userLng, getCoords = i => i) {
    return items
        .map(item => {
            const { lat, lng } = getCoords(item);
            return { ...item, distanciaKm: haversine(userLat, userLng, lat, lng) };
        })
        .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/**
 * Formatea una distancia en km a texto legible. Ej: "450 m" | "2.3 km"
 */
function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

export default { haversine, sortByDistance, formatDistance };
