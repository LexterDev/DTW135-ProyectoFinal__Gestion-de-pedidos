/**
 * Módulo para procesar imágenes: redimensionar y convertir a data URL base64.
 * Utiliza canvas para redimensionar y FileReader para leer el archivo.
 * Permite configurar el tamaño máximo, la calidad y el formato MIME.
 * También incluye una función para estimar el tamaño en bytes de un data URL.
 */

const MAX_SIZE = 400; // px (mayor dimensión)
const QUALITY = 0.8;
const MIME = 'image/jpeg';

/**
 * Leemos un File y devolvems una URL base64 con el archivo redimensionado.
 */
function processFile(file, maxSize = MAX_SIZE, quality = QUALITY) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('El archivo no es una imagen válida.'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
        reader.onload = e => {
            const img = new Image();
            img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
            img.onload = () => {
                const { width, height } = _calcDimensions(img.naturalWidth, img.naturalHeight, maxSize);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(MIME, quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/*
* Calculamos las dimensiones redimensionadas manteniendo la proporción.
* Si la imagen ya es menor que el tamaño máximo, se devuelve sin cambios.
*/

function _calcDimensions(w, h, max) {
    if (w <= max && h <= max) return { width: w, height: h };
    const ratio = w > h ? max / w : max / h;
    return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

/** 
 * Estima el tamaño en bytes de un data URL base64.
 * 
*/
function estimateSize(dataUrl) {
    const base64 = dataUrl.split(',')[1] ?? '';
    return Math.round((base64.length * 3) / 4);
}

export default {
    processFile,
    estimateSize,
    MAX_SIZE, QUALITY
};
