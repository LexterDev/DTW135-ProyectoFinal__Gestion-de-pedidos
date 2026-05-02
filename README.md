## Materia

**Universidad de El Salvador**
Facultad de Ingeniería y Arquitectura
Materia: Desarrollo de Técnicas Web (DTW2026)
Ciclo: I - 2026

# SoxLab - Tienda de Calcetines Temáticos

Tienda en línea de calcetines temáticos y personalizables con operación multi-sucursal
y sistema de autenticación basado en roles (cliente / admin). Permite configurar diseños
únicos, gestionar pedidos y asignar sucursales automáticamente según la ubicación del
cliente y el inventario disponible.

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de vistas |
| CSS3 + Tailwind CSS (CDN) | Estilos y diseño responsivo |
| JavaScript Vanilla (ES Modules) | Lógica de negocio |
| Web Crypto API (SHA-256) | Hash de contraseñas en cliente |
| Leaflet.js | Mapas interactivos multi-capa |
| Chart.js | Gráficas y métricas del dashboard |
| LocalStorage / sessionStorage | Persistencia de datos y sesión |

## Geocodificación inversa con Nominatim

Para mejorar la experiencia de usuario en el checkout, la app usa el servicio de geocodificación inversa de OpenStreetMap: Nominatim.

Cuando el cliente solicita la detección de ubicación, la aplicación consulta el endpoint `https://nominatim.openstreetmap.org/reverse` para convertir latitud y longitud en una descripción legible de la zona.

La documentación técnica adicional se encuentra en `docs/nominatim-api.md`.

## Integrantes


|     NOMBRES           |APELLIDOS                |CARNET                         |
|----------------|-------------------------------|-----------------------------|
|Josué Israel    |Colocho López                  |CL22006            |
|Walter Alexander|Galicia Gertrudis              |GG14054            |
|Erick Israel    |Iraheta Contreras              |IC23005|
|David Enrique   |Sixco Ramos                    |SR23002|


## Número de Grupo y tema

Grupo #10
Gestión de Pedidos.