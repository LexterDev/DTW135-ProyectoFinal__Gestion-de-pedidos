/*
* Módulo para trabajar con el almacenamiento local del navegador (localStorage).
* Proporciona funciones para guardar, recuperar y eliminar datos de localStorage.
*/

const KEYS = {
    USUARIOS: 'soxlab_usuarios',
    PRODUCTOS: 'soxlab_productos',
    SUCURSALES: 'soxlab_sucursales',
    PEDIDOS: 'soxlab_pedidos',
    DISENOS: 'soxlab_disenos',
    ESTAMPADOS: 'soxlab_estampados',
    INVENTARIO: 'soxlab_inventario',
    CARRITO: 'soxlab_carrito',
    SESSION: 'soxlab_session',
};


/*
* Función para serializar y guarda un valor en localStorage.
* Se lanza un error si el almacenamiento - 5MB, está lleno para que el usuario pueda liberar espacio.
*/
function set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            throw new Error('Almacenamiento lleno. Libera espacio antes de continuar.');
        }
        throw e;
    }
}


/*
* Funcion para eliminar un valor del localStorage
*/
function remove(key) {
    localStorage.removeItem(key);
}


/*
* Función que se encarga de eliminar únicamente las claves propias de nuestra aplicación.
*/
function clear() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}


/*
* Función que lee y parsea un valor de sessionStorage.
*/
function sessionGet(key) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}


/*
* Función que serializa y guarda un valor en sessionStorage.
* Se lanza un error si el almacenamiento de sesión está lleno.
*/
function sessionSet(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            throw new Error('Almacenamiento de sesión lleno.');
        }
        throw e;
    }
}


/*
* Función para eliminar un valor del sessionStorage
*/
function sessionRemove(key) {
    sessionStorage.removeItem(key);
}


/*
* Función que evuelve el porcentaje aproximado de uso de localStorage (sobre 5 MB).
*/
function usagePercent() {
    const used = Object.keys(localStorage).reduce((acc, k) => {
        return acc + (localStorage.getItem(k) || '').length;
    }, 0);
    return Math.round((used / (5 * 1024 * 1024)) * 100);
}

/*
* Exportamos las funciones y constantes para su uso en otros módulos.
*/
export default {
    KEYS,
    set,
    remove,
    clear,
    sessionGet,
    sessionSet,
    sessionRemove,
    usagePercent,
};