# R1.6 · Recepción · implementación y revisión

Fecha: 24/09/2026. Branch: `UxUi`. Sin commit ni push. Pendiente de aprobación visual de Felipe.

## Alcance y preservación

Home, shell, búsqueda, perfil, Accesos, Entregas, Unidades, Agenda, Incidencias y Actividad. Se conservan routing, reducer, entidades demo, acciones operativas y separación verificar/registrar. No se rediseñaron Resident ni Administración.

Fuente ejecutable: [handoff íntegro](r16/CONDOTRACK_R16_SINGLE_HANDOFF.txt). PDF inspeccionado: `E:/DESCARGAS/CondoTrack_R16_FINAL_Approved_References (1).pdf`, idéntico al original aprobado (SHA256 `AA17CDE5361E7CBE00787C669C112F7AC20ACD850CD475F6CDE81989EAC1B0ED`). No se agregaron referencias externas.

## Cambios

- Home: escala controlada, rails simétricos 3+3, reloj legible en ambos temas, módulos inferiores y superficies glass sobre el abstracto aprobado. Logo con los assets existentes `CT_LOGO_LIGHT_V2.png` y `CT_LOGO_DARK_V2.png`, sin redibujar geometría. Loading usa la misma marca.
- Header: búsqueda integrada que ocupa espacio hacia la izquierda y reorganiza navegación/utilidades. Resultados agrupados, flechas/Enter, Escape y retorno de foco. Perfil con datos, cambio de rol mediante el callback existente, tema y salida.
- Agenda: calendario de contexto y eje horario real; los eventos se posicionan por hora y reservas conservan su fin. Solapamientos distribuidos por grupo; próximo evento, indicador horario actual y detalle contextual con foco/Escape. Mudanza 8A visible como **Aprobada**, sin botones de aprobación o creación.
- Accesos: resultado junto al registro, identidad antes de la acción, AUTORIZADO / VENCIDO / NO ENCONTRADO. Editar el código limpia el resultado anterior para impedir operar con una identidad desactualizada.
- Entregas: Recibido/Avisado/Retirado; metadato opcional `avisadoEl` para el registro local, retiro con confirmación en panel lateral de escritorio. Cancelar el formulario conserva borrador.
- Unidades: filtros por piso, filtros removibles, columnas consistentes y detalle lateral que conserva lista/búsqueda. Sin cuenta, saldo, deuda ni m². En móvil, abrir detalle lleva al contexto seleccionado.
- Incidencias: gravedad antes del título, workflow separado, detalle/historial desplegable y formulario lateral cancelable.
- Actividad: eje cronológico, grupos diarios, filtros removibles, búsqueda compartida y responsable/fecha completa mediante disclosure.
- Tokens exclusivos de Recepción para fondo, superficie, elevado, inset, glass, texto, borde, hover, foco, sombra y estados. Tema oscuro explícito y seguimiento del sistema si no hay preferencia.

## Referencias aplicadas

Todas las imágenes se encuentran en `visual-targets/condotrack_visual_target_pack_v05/refs/user/`.

| Referencia exacta | Propiedad aplicada |
| --- | --- |
| U02_volvo_modular_dashboard.png | Composición Home, header aireado, centro dominante y rails simétricos |
| U01_planner_clock_calendar.png | Reloj, calendario de contexto y contraste entre superficies elevadas/hundidas |
| U04_glass_photography_cards.png | Translucidez y profundidad sólo en Home/contextos con fondo significativo |
| U05_management_modular_dashboard.png | Proporciones de módulos inferiores, controles compactos, formularios e internas coherentes |
| U06_security_dashboard.png | Lectura inmediata de autorización y separación gravedad/workflow |
| U07_timepiece_editorial_grid.png | Divisiones, alineación de columnas, números y jerarquía temporal |
| U08_timeline_calendar_modal.png | Calendario más timeline y detalle contextual del evento |
| U09_timeline_journey.png | Eje temporal, agrupación por día y disclosure |
| U10_workflow_timeline.png | Verificación/registro como pasos separados e historial de movimientos |
| U11_mobile_search_bottom_nav.png | Economía de búsqueda y reorganización responsive, sin importar navegación ajena |

U03 se inspeccionó pero no se trasladó a Recepción: sigue reservada principalmente para Administración. El target R14 queda como contexto subordinado a los locks escritos. No se trasladaron branding, paletas, fuentes, fotografía, navegación amarilla ni componentes ajenos.

## Motion y sensor

Búsqueda/reflow 260 ms; paneles 280 ms; resultados 220 ms; módulos Home 220 ms con stagger de 60 ms (340 ms total). Loading con entrada finita. Scroll suave sólo dentro del timeline.

`ReceptionNovelty` vive en el shell. Inicializa IDs conocidos sin pulsar; nuevas visitas, entregas, incidencias o mudanzas del modelo generan novedad. CSS define exactamente dos pulsos de 800 ms, seguidos por contador estático. No vuelve a pulsar al regresar a Home. Revisar actividad marca novedades vistas. No hay backend realtime ni se simula uno.

`prefers-reduced-motion` y `motionreduce=1` quitan animaciones/traslaciones/transiciones y smooth scrolling; no quitan información. El entorno de QA reporta reduced motion activo: se validó la supresión y la transición del estado pulse=true a false con contador persistente. La percepción visual de los dos pulsos en un dispositivo sin reducción **no se pudo verificar**; su duración e iteraciones se revisaron en CSS.

## Validaciones

- TypeScript: `npx tsc --noEmit`, correcto.
- Selectores: `node scripts/check-reception-selectors.cjs`, 12 comprobaciones correctas (incluye mudanza aprobada y duración de reservas).
- Build de producción: `npm run build`, correcto (Next.js 14.2.35; TypeScript y generación de páginas incluidos).
- `git diff --check`: sin errores de whitespace; sólo avisos preexistentes de normalización LF/CRLF.
- Desktop 1440×900: 8 vistas × 2 temas, sin desborde horizontal ni imágenes rotas, Satoshi. [Datos](qa-r16/desktop-checks.json).
- Responsive: 390×844 y 768×1024, 8 vistas × 2 temas × 2 tamaños = 32 comprobaciones, sin desbordes ni imágenes rotas. [Datos](qa-r16/responsive-checks.json). Agenda conserva scroll interno para simultáneos, no desborda el documento.
- Resident: 27 vistas × 2 temas a 390×844 = 54 comprobaciones, sin desborde, imágenes rotas ni tokens de Recepción aplicados a `.device`. [Datos](qa-r16/resident-checks.json).
- Contraste: muestreo calculado de texto operativo visible sobre fondos compuestos en 7 vistas × 2 temas; sin fallas por debajo del umbral AA aplicable. No equivale a una certificación integral de accesibilidad. [Datos](qa-r16/contrast-checks.json).
- Manual: búsqueda con consulta, ArrowDown y Enter; Escape con foco en trigger; perfil/Escape; menú general; panel contextual Home; filtro piso y detalle; mudanza aprobada y Escape; autorizado, ingreso registrado, inexistente y vencido; registro/aviso/retiro de entrega; borrador conservado tras cancelar; crear incidencia y verla en Actividad; sensor estático persistente al navegar y reconocimiento de novedades.

## Archivos principales

`app/globals.css`; `components/Prototipo.tsx`; `components/ShellRecepcion.tsx`; `components/recepcion/ReceptionHeader.tsx`, `ReceptionProfile.tsx`, `ReceptionSearch.tsx`, `ReceptionNovelty.tsx`, `ReceptionLoading.tsx`, `P02.tsx`, `P04.tsx`, `P05.tsx`, `P07.tsx`, `P08.tsx`, `P09.tsx`; `lib/recepcion.ts`; `lib/data.ts`; `scripts/check-reception-selectors.cjs`.

Compartidos reutilizados: `ReceptionPage`, `ReceptionPanel`, `CalendarioMes`, `Hoja`, `Texto`, `Elegir`, `Segmentos`, `Area`, `Adjuntar`, `Icon`, `Linea` y los selectores/estado existentes. `OperationalSearchField` se comparte entre Unidades y Actividad dentro de Recepción. Los componentes UI de Resident no fueron modificados en esta ronda; Hoja se adapta mediante CSS condicionado al shell de Recepción.

## Límites y revisión

- Aprobación visual final pendiente de Felipe.
- Motion sin reducción: falta inspección perceptual en un entorno que lo habilite.
- Escáner y avisos siguen siendo el prototipo local preexistente: no se añadió cámara ni mensajería real.
- Las acciones usadas en QA fueron datos demo en memoria y se descartan al recargar.
- No se instalaron librerías ni se hizo commit, push o deploy.

Claro: http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro

Oscuro: http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=oscuro
