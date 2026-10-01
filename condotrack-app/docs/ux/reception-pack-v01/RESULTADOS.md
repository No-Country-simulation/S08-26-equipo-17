# Recepción · Correction Pack v01 · resultados

30/09/2026 · Claude Code · checkout `_github-sync/condotrack-app` (rama UxUi).
Autoridad: `CondoTrack_Reception_Correction_Pack_v01/RECEPTION_CORRECTIONS.md`.
Sin commit, push, deploy ni Figma. **Pendiente de aprobación visual de Felipe.**
El CSS nuevo está acotado a `.recepcion`; lo compartido con Administración
(`FolderGlassCard`, `ct-pop`, `Cabecera`) no cambia de comportamiento.

## Sistemas

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| REC-SYS-01 | DONE | Vidrio con gradiente, desenfoque 28 px y filo en cards, popovers (overlay más denso), Agenda, Actividad y Unidades; claro y oscuro | `app/recepcion.css` |
| REC-SYS-02 | DONE | Elipse (no círculo) que nace abajo a la izquierda, detrás de las cards, hasta ~la mitad del bloque; degradé suave, sin tapar nada | `app/recepcion.css` |
| REC-SYS-03 | DONE | Inicio / Agenda / Unidades / Actividad como botones separados con aire; el activo es el indicador carbón que se desliza (0 → 193 px en ~250 ms) | `app/recepcion.css` |
| REC-SYS-04 | DONE | Sin versalitas técnicas: rótulos, encabezados de tabla, secciones de Unidades, tipo de evento, perfil | `app/recepcion.css` |
| REC-SYS-05 | DONE | Cards del Home: elevación al hover/foco, press; reducido sin transición | `app/recepcion.css` |
| REC-SYS-06 | DONE | Popovers: horas de 19 px, tipo como etiqueta amarilla, íconos en cifras e incidencias, separación, jerarquía título > dato > metadata > estado | `P01.tsx`, `app/recepcion.css` |

## Home

| Ticket | Estado | Qué se hizo |
|---|---|---|
| REC-HOME-01 | DONE | Vidrio + motion en Accesos de hoy, Movimientos, Entregas |
| REC-HOME-02 | DONE | "Movimientos de hoy" como título; "00 registrados" debajo; sin la solapa "ACTIVIDAD" |
| REC-HOME-03 | DONE | "Entregas" como título; "03 sin retirar" debajo |
| REC-HOME-04 | DONE | Cifras de 44 px bold, rótulo de 15 px regular debajo, alineados |
| REC-HOME-05…09 | DONE | Agenda de hoy, Resumen, Ver incidencias, Escanear, Registrar entrega y Reportar: vidrio, horas/cifras, íconos, gravedad con color y forma, CTA intactos (el escáner sigue amarillo) |
| REC-HOME-10 | DONE | La aleta queda como forma, sin texto adentro |
| REC-HOME-11 | DONE | Sin "Recepción opera un solo edificio por turno."; ícono amarillo, nombre 20 px, localidad |
| REC-HOME-12 | DONE | Perfil y menú: vidrio, títulos sin versalitas, filas de 46 px |
| REC-HOME-13 | DONE | Quick actions de 68–92 px (escala de la referencia) dentro del mismo panel que el reloj, separados por un filo; el escáner carbón con ícono amarillo, como en la referencia. Se abren en ~215 ms desde su lado; reducido instantáneo. A 1024 entran sin romper |

Archivos: `components/recepcion/P01.tsx`, `ContextualActions.tsx`, `ReceptionHeader.tsx`, `app/recepcion.css`.

## Agenda · Unidades · Actividad

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| REC-AGENDA-01 | DONE | Próximo como bloque carbón compacto: etiqueta amarilla, hora 22 px, evento, tipo y lugar, flecha | `P08.tsx`, css |
| REC-AGENDA-02 | DONE | Eventos en gris oscuro con texto claro; tipo como etiqueta con ícono; el próximo con filo amarillo; hechos más apagados | css |
| REC-AGENDA-03 | DONE | Filtros en una fila horizontal debajo del título, con conteo; seleccionado inequívoco | `P08.tsx`, css |
| REC-AGENDA-04 | DONE | Calendario como módulo propio | idem |
| REC-AGENDA-05 | DONE | Debajo, "Resumen del día": hechos / por venir y los tipos con su conteo (filtran al tocarlos) — sólo datos de la agenda | idem |
| REC-UNITS-01/02/03 | DONE | "Directorio" como título de 22 px con el ícono de recepción (carbón y amarillo) a la izquierda; secciones sin versalitas | `P02.tsx`, css |
| REC-ACT-01 | DONE | "Recorrido del turno" → "Movimientos de hoy"; vacío centrado con ícono, texto y "Ver todo el registro" como botón | `P09.tsx`, css |
| REC-ACT-02 | DONE | Carriles con ícono y conteo, filas alternadas, guías, fechas con día; eventos en cards oscuras de 150–230 px con hora amarilla | idem |
| REC-ACT-03 | DONE | Ningún evento desborda: cada card se ancla según su posición (izquierda al principio, derecha al final). Medido en "Todo": 0 desbordes | `P09.tsx`, css |
| REC-ACT-04 | DONE | Cada evento se abre (detalle completo, contexto, quién, "Ver en la bitácora"), 240 ms; reducido instantáneo. Sin barras de duración | idem |
| REC-ACT-05 | DONE | Filtros y búsqueda en vidrio con contraste | css |
| REC-ACT-06 | DONE | Bitácora: encabezado en banda, día con filo fuerte y conteo en pastilla, quién en color de texto | css |

## QA

- `npx tsc --noEmit` limpio; build de producción a `.next/qa-prod`.
- 1440×900 claro y oscuro; 1024×768 sin scroll horizontal.
- Teclado: Tab recorre nav y rieles con foco visible; Enter abre la carpeta; Escape la cierra y devuelve el foco al control.
- Reducido: carpetas, detalle de actividad y cards sin animación.

## Para aprobar

1. La escala de los quick actions y el filo que los integra al panel.
2. La elipse (tamaño e intensidad).
3. Los eventos oscuros de Agenda y Actividad.
4. El "Resumen del día" en el espacio que liberaron los filtros.
