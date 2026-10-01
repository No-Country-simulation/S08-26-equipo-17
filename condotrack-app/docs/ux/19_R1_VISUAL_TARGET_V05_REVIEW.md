# R1 · Visual Target Pack V05 — revisión en localhost

Implementación del 22/09/2026. Pendiente de aprobación visual. V05 reemplaza la dirección visual de la pasada V04 rechazada; no declara aprobada la UI anterior ni ésta.

## Alcance y archivos de esta pasada

- `app/globals.css`: reemplazo del bloque visual de Recepción por el sistema V05; responsive y motion reducido.
- `components/ShellRecepcion.tsx`: rail compacto inicial y perfil en navegación.
- `components/recepcion/P01.tsx`: nueva composición modular; preview de tres accesos con cantidad total.
- `ReceptionHeader.tsx`: edificio/contexto/fecha.
- `ReceptionSidebar.tsx`: rail y despliegue lateral.
- `ReceptionProfile.tsx` (nuevo): perfil, turno y salida al pie del rail.
- `ReceptionClock.tsx` (nuevo): reloj analógico/digital y fecha real.
- `ReceptionSearch.tsx`: expansión, reveal, flechas y Escape.
- `ReceptionLoading.tsx`: marca intacta y barras de espera sin progreso ficticio.
- `public/recepcion/reception-office-v05.png`: copia del BG02 aprobado del pack.
- `docs/ux/visual-targets/condotrack_visual_target_pack_v05/`: ZIP extraído, incluidos README, manifiesto, prompt y referencias originales.
- `AGENTS.md`, `docs/ux/ESTADO_IMPLEMENTACION.md` y este informe: continuidad documental.

Las modificaciones anteriores de Prototipo, P04/P05/P07/P08, Icon, estado, recepción y documentación permanecen. No son trabajo nuevo de R1 V05.

## Trazabilidad por módulo

| Módulo | PNG locales inspeccionados y aplicados | Propiedad reproducida / anatomía reemplazada | Interacción |
|---|---|---|---|
| Foundations y composición | U05, U02, U03, U07, pinterest_refs_condotrack_round1 | Rail de 88 px, grilla 1.6/.9/1, encabezado separado, tipografía 40/24/16/14, contraste carbón/blanco. Reemplaza título + búsqueda a todo el ancho + franja horizontal de cinco cifras. | Foco amarillo, navegación activa carbón/blanco. |
| Shell y perfil | U01, U05 | Rail de iconos, grupos separados por regla, perfil inferior. Encabezado de 72 px con contexto del edificio. | Rail se expande superpuesto a 224 px; duración 220 ms. Conserva destinos y cierre de sesión. |
| Puesto y acciones | U02, U03, U04, BG02_reception_office_yellow | Foto arquitectónica como ancla, reloj/fecha sobre vidrio localizado; dos acciones integradas debajo. Reemplaza botones junto al título. | Escanear lleva a P03; registrar entrega abre/focaliza el formulario existente P05. |
| Reloj | U01, U02 | Dial analógico junto a cifras digitales y fecha en un mismo objeto. | Actualiza cada 30 s; ambas representaciones comparten la misma fecha. |
| Hoy | U05 | Una cifra dominante y cuatro datos secundarios en el mismo bloque; sin cinco tarjetas KPI. | Cálculos existentes de visitas, proveedores, entregas, reservas e incidencias. |
| Atención | U03, U05, referencia negro/amarillo | Superficie carbón, título de incidencia dominante, prioridad explícita, responsable, tiempo reportado y acción. Reemplaza aviso estrecho con borde lateral. | Conserva navegación a incidencias y entregas. |
| Search | Geometría Figma Search Flat XL inspeccionada en la pasada previa; Jitter Search Bar Reveal y Animated Search Bar abiertos en V05 | Búsqueda junto al título; ancho 48→60% al foco; lista superpuesta continua. | Reveal 180 ms, expansión 220 ms, flechas para recorrer, Enter nativo, Escape retorna al input y cierra. |
| Próximos accesos | Attio Companies List; U07 para reglas | Superficie continua, columnas hora/persona/estado, fila completa accionable. Preview de 3 con total y vínculo a Agenda. | Filtro Hoy/Todos y destinos originales. |
| Actividad | 021f68ec-76af-43d9-a20a-0c1ba06bf735.png | Columna de horas, conectores verticales e iconos. Conserva preview de tres registros; sin tarjetas individuales. | Estado vacío cuando no hay movimientos reales hoy. No se inventa actividad para llenar la composición. |
| Loading | Jitter Loading Animation Bars; Morph y Loading Spinner Success inspeccionados | Isotipo master central, barras escalonadas y contexto del shell. Reemplaza tres skeletons genéricos. | Entrada de marca 500 ms sin deformación; barras 900 ms alternadas. No hay morph geométrico del logo. Éxito de validación queda fuera de R1. |

Los nombres U01…U07 corresponden a los archivos completos de `refs/user/` del manifiesto. Se inspeccionó también BG01 para comparar el encuadre; se eligió BG02. No se usaron los otros fondos.

## URLs utilizadas

- https://jitter.video/template/animated-search-bar/
- https://jitter.video/template/search-bar-reveal/
- https://jitter.video/template/side-rail-menu/
- https://jitter.video/template/loading-animation-bars/
- https://jitter.video/template/morph-animated-icon/
- https://jitter.video/template/loading-spinner-success-animation/
- https://www.saasframe.io/examples/attio-companies-list
- Figma aprobado, inspección MCP previa: https://www.figma.com/design/CNuuTRQJHtAMwXJpDUQYER?node-id=23204-129953

No se importaron branding, tipografía Inter, paleta violeta/azul/verde, gradientes, forma orgánica del rail Jitter, ni geometría de sus iconos. Tampoco se agregaron dependencias, Tailwind o UI libraries.

## Preservación funcional

Se reutilizan Icon, ReceptionSearch, ReceptionSidebar, ReceptionHeader, ShiftActivity, useApp y las derivaciones de lib/recepcion. Se mantienen estado compartido, datos demo, filtros temporales, navegación, formularios existentes y geometría del isotipo master. Resident y las internas de Recepción no fueron rediseñados en esta pasada.

## Verificación

- `npm run build`: correcto, incluye validación TypeScript y lint.
- Desktop 1440×900 inspeccionado visualmente en claro y oscuro.
- 1280, 1024 y 390 px: sin desborde horizontal en shell y módulos; 390 inspeccionado visualmente.
- Search: resultado real para Martín López, foco con ArrowDown y cierre Escape verificados.
- Rail expandido/compacto y perfil con turno/salida verificados.
- Escanear acceso abre la pantalla existente; registrar entrega focaliza selector del formulario existente.
- Loading desktop inspeccionado. El navegador de QA informa `prefers-reduced-motion: reduce`: barras efectivamente sin animación. La temporización animada normal está definida en CSS, no medida visualmente en este entorno.
- 27 vistas Resident × claro/oscuro a 390×844: 54 verificaciones sin overflow ni imágenes rotas; Satoshi disponible.
- Consola inspeccionada sin errores ni advertencias.
- `git diff --check`: sin errores de whitespace (Git informa advertencias de conversión CRLF y acceso a ignore global).

## Para revisión del dueño del producto

Validar composición, peso de la fotografía y densidad de la primera fila. R1 queda detenido aquí. Sin reordenamiento interactivo de widgets, sin rediseño de internas y sin motion avanzado. No commit ni push.
