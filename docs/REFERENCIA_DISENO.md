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

## Enlaces de Interés
* **Figma:** [Acceder al prototipo aquí]https://www.figma.com/design/TsKNpbF0tpIGLAryOXxcZF/SoxLab?node-id=0-1&t=8n7QOCLxS2R9wk3r-1
