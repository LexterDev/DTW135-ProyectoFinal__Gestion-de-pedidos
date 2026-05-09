# Guía de Referencia de Diseño Visual

Este documento centraliza las definiciones visuales y la identidad gráfica de las pantallas del proyecto. Aquí se detallan los estilos, la paleta de colores y las directrices tipográficas para mantener la consistencia en el desarrollo del dashboard y los mockups.

## Estilo General
El diseño está inspirado en interfaces financieras modernas y minimalistas (al estilo de **Stripe**, **Linear** o **Approx**). Se busca una experiencia de usuario fluida con una jerarquía visual clara.

* **Navegación:** Sidebar lateral oscuro con iconos intuitivos.
* **Contenido:** Áreas de trabajo claras para reducir la fatiga visual.
* **Componentes:** Uso de tarjetas (cards) blancas con sombras sutiles para agrupar información.
* **Feedback:** Uso semántico de colores para indicar estados (aceptado/rechazado).

## Paleta de Colores

| Elemento | Código Hex | Aplicación |
| :--- | :--- | :--- |
| **Sidebar BG** | `#0f172a` | Fondo de navegación lateral |
| **Sidebar Texto** | `#94a3b8` | Íconos y etiquetas inactivas |
| **Sidebar Activo** | `#6366f1` | Color de énfasis para la sección actual |
| **Contenido BG** | `#f8fafc` | Fondo principal de la aplicación |
| **Card BG** | `#ffffff` | Superficie de los contenedores de datos |
| **Acento Primario**| `#6366f1` | Botones principales y acciones |
| **Éxito** | `#10b981` | Estados aceptados / positivos |
| **Peligro** | `#f43f5e` | Alertas / estados rechazados |
| **Texto Principal** | `#1e293b` | Títulos y cuerpo de texto |
| **Texto Secundario**| `#64748b` | Subtítulos y descripciones |
| **Bordes** | `#e2e8f0` | Líneas divisorias y contornos |

## Tipografía y Estilos
Para la implementación con Tailwind CSS o CSS puro, se recomiendan las siguientes reglas:

* **Números y Resultados:** `text-3xl font-bold` (Destacar KPIs y métricas).
* **Etiquetas (Labels):** `text-xs uppercase tracking-wide text-slate-500` (Para encabezados de tablas o tarjetas).
* **Cuerpo de Texto:** Tipografía limpia y legible (Sans-serif).

## Estructura de Vistas y Mockups
El diseño de la plataforma se divide en tres flujos principales para cubrir toda la experiencia del usuario y las operaciones del negocio. Los mockups correspondientes están estructurados de la siguiente manera:

### 1. Autenticación y Acceso
* **Login:** Interfaz de inicio de sesión para usuarios existentes.
* **Registro:** Flujo de creación de cuenta para nuevos clientes.

### 2. Experiencia del Cliente (Tienda y Personalización)
* **Catálogo:** Vista exploratoria de los diseños y bases de medias disponibles.
* **Configurador:** Interfaz interactiva donde el usuario puede personalizar su producto.
* **Checkout:** Pantalla de resumen de carrito, recolección de datos de envío y pasarela de pago.

### 3. Panel de Administración (SoxLab Admin)
* **Dashboard:** Resumen general del sistema, KPIs financieros y operativos, y gráficos de rendimiento.
* **Productos:** Gestión del inventario, con capacidades para crear, editar, desactivar y eliminar productos.
* **Mapa:** Vista de geolocalización para el seguimiento de operaciones, sucursales y estados de pedidos en tiempo real.

## Enlaces de Interés
* **Figma:** [Acceder al prototipo aquí](https://www.figma.com/design/TsKNpbF0tpIGLAryOXxcZF/SoxLab?node-id=0-1&t=8n7QOCLxS2R9wk3r-1)
