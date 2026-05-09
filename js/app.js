/*
* Inicialización de la aplicación, carga de iniacial de datos desde los seeds y gestión de inventario.
*/ 

import auth      from './modules/auth.js';
import storage   from './modules/storage.js';
import inventory from './modules/inventory.js';

console.log('[App] Inicializando SoxLab...');

const SEED_PRODUCTOS = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
    nombre: 'Calcetines Clásicos Blancos',
    descripcion: 'Calcetines de algodón suave en blanco clásico, perfectos para el uso diario. Ajuste cómodo y duradero.',
    precio: 3.99, tallas: ['S','M','L','XL'], categoria: 'clásico',
    colores: ['#FFFFFF','#F5F5F5','#E0E0E0'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
    nombre: 'Calcetines Rayas Marineras',
    descripcion: 'Diseño clásico de rayas horizontales en azul marino y blanco. Estilo náutico atemporal.',
    precio: 4.50, tallas: ['S','M','L','XL'], categoria: 'clásico',
    colores: ['#1B3A6B','#FFFFFF','#C0392B'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:05:00.000Z',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003',
    nombre: 'Calcetines Gatos Kawaii',
    descripcion: 'Adorables caras de gato kawaii distribuidas por todo el calcetín. Ideales para los amantes de los felinos.',
    precio: 6.99, tallas: ['XS','S','M','L'], categoria: 'temático',
    colores: ['#F8C8D4','#D7A0C8','#FFFFFF'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:10:00.000Z',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
    nombre: 'Calcetines Pizza Love',
    descripcion: 'Para los amantes de la pizza. Rebanadas coloridas sobre fondo rojo tomate. ¡Únicos en su tipo!',
    precio: 7.50, tallas: ['S','M','L','XL'], categoria: 'temático',
    colores: ['#C0392B','#F39C12','#FDEBD0'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:15:00.000Z',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
    nombre: 'Calcetines Galaxia',
    descripcion: 'Diseño de nebulosa y estrellas en tonos morados y azules profundos. Para explorar el universo con estilo.',
    precio: 8.99, tallas: ['S','M','L','XL','XXL'], categoria: 'temático',
    colores: ['#1A0533','#2E0854','#6C3483','#1A5276'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:20:00.000Z',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000006',
    nombre: 'Base Personalizable',
    descripcion: 'Calcetín en blanco listo para ser diseñado desde el configurador. Elige colores por zonas y agrega tu estampado favorito.',
    precio: 9.99, tallas: ['XS','S','M','L','XL','XXL'], categoria: 'personalizado',
    colores: ['#FFFFFF'], imagenBase64: null, activo: true,
    fechaCreacion: '2026-01-10T08:25:00.000Z',
  },
];

const SEED_SUCURSALES = [
  {
    id: 'b1c2d3e4-f5a6-4b7c-8d9e-000000000001',
    nombre: 'SoxLab San Salvador',
    direccion: 'Blvd. de los Héroes, C.C. Metrocentro, Local 214, San Salvador',
    telefono: '2222-1001', lat: 13.7033, lng: -89.2182,
    imagenBase64: null, activa: true, fechaCreacion: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'b1c2d3e4-f5a6-4b7c-8d9e-000000000002',
    nombre: 'SoxLab Santa Ana',
    direccion: '4a Calle Poniente y Av. Independencia, C.C. Metrocentro Santa Ana, Local 08',
    telefono: '2441-2002', lat: 13.9942, lng: -89.5597,
    imagenBase64: null, activa: true, fechaCreacion: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'b1c2d3e4-f5a6-4b7c-8d9e-000000000003',
    nombre: 'SoxLab San Miguel',
    direccion: 'Av. Roosevelt Sur, C.C. Metrocentro San Miguel, Local 32, San Miguel',
    telefono: '2661-3003', lat: 13.4793, lng: -88.1777,
    imagenBase64: null, activa: true, fechaCreacion: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'b1c2d3e4-f5a6-4b7c-8d9e-000000000004',
    nombre: 'SoxLab Santa Tecla',
    direccion: '2a Calle Poniente, Plaza Merliot, Local 5, Santa Tecla, La Libertad',
    telefono: '2228-4004', lat: 13.6756, lng: -89.2797,
    imagenBase64: null, activa: true, fechaCreacion: '2026-01-10T08:00:00.000Z',
  },
];

const SEED_ESTAMPADOS = [
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000001', nombre: 'Corazón',  categoria: 'romántico',  imagenBase64: null, activo: true },
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000002', nombre: 'Calavera', categoria: 'gótico',     imagenBase64: null, activo: true },
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000003', nombre: 'Estrella', categoria: 'clásico',    imagenBase64: null, activo: true },
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000004', nombre: 'Cactus',   categoria: 'naturaleza', imagenBase64: null, activo: true },
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000005', nombre: 'Rayo',     categoria: 'deportivo',  imagenBase64: null, activo: true },
  { id: 'c1d2e3f4-a5b6-4c7d-8e9f-000000000006', nombre: 'Luna',     categoria: 'nocturno',   imagenBase64: null, activo: true },
];

function seedColeccion(key, data) {
  if ((storage.get(key) ?? []).length > 0) return; // ya sembrado
  storage.set(key, data);
  console.log(`[App] Seed cargado: ${key} (${data.length} registros)`);
}

function seedInventario() {
  if (storage.get(storage.KEYS.INVENTARIO)) return;
  const productos  = storage.get(storage.KEYS.PRODUCTOS)  ?? [];
  const sucursales = storage.get(storage.KEYS.SUCURSALES) ?? [];
  for (const sucursal of sucursales)
    for (const producto of productos)
      for (const talla of producto.tallas)
        inventory.setStock(sucursal.id, producto.id, talla, 20);
  console.log('[App] Inventario inicial sembrado.');
}

(async () => {
  try {
    await auth.seedIfEmpty();
    seedColeccion(storage.KEYS.PRODUCTOS,  SEED_PRODUCTOS);
    seedColeccion(storage.KEYS.SUCURSALES, SEED_SUCURSALES);
    seedColeccion(storage.KEYS.ESTAMPADOS, SEED_ESTAMPADOS);
    seedInventario();
    console.log('[App] Listo.');
  } catch (err) {
    console.error('[App] Error en bootstrap:', err);
  } finally {
    window.__soxlab_ready = true;
    window.dispatchEvent(new CustomEvent('soxlab:ready'));
  }
})();
