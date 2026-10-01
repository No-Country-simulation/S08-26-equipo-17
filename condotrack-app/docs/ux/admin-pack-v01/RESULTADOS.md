# Administración · Correction Pack v01 · resultados

30/09/2026 · Claude Code · checkout `_github-sync/condotrack-app` (rama UxUi).
Autoridad: `CondoTrack_Admin_Correction_Pack_v01/ADMIN_CORRECTIONS.md`.
Sin commit, push, deploy ni Figma. **Pendiente de aprobación visual de Felipe.**
Todo el CSS nuevo está acotado a `.ad-shell`: Recepción comparte primitivas
(`ct-status`, `ct-tabla-cab`, `ct-label`) y no cambia.

## Sistemas globales

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| SYS-MOTION-THEME-001 | DONE | El cambio claro ↔ oscuro es un fundido de la página entera (View Transitions, 420 ms E1), sin destello ni rebote; reducido = instantáneo. Sin theme provider nuevo: los dos controles existentes llaman a `cambiarTema` | `lib/movimiento.ts`, `components/ui/TemaToggle.tsx`, `components/sistema/Cabecera.tsx`, `app/sistema.css` |
| SYS-TYPE-ADMIN-001 | DONE | Familias del menú, encabezados de tabla y rótulos de sección sin versalitas: 13–13,5 px, peso 600–700, sin tracking | `app/admin.css` |
| SYS-GLASS-ADMIN-001 | DONE | Vidrio con gradiente translúcido, desenfoque 26 px y filo con gradiente para los módulos que sobresalen (listas, cola, Qué cambió, fichas, hero); bandas integradas más livianas; detalle como overlay. Claro y oscuro | `app/admin.css` |
| SYS-ADMIN-STATUS-001 | DONE | Estados como pastilla con marca de forma propia: amarillo = espera decisión, carbón = en curso, filo = cerrado/neutro, verde/rojo sólo bien/mal. Gravedad: pastilla con barras cuya fuerza sube con la gravedad | `app/admin.css` |
| SYS-ADMIN-KPI-001 | DONE | Banda de métricas con celdas iguales, contenido centrado, cifra de 36 px arriba y rótulo semibold abajo. "Adentro ahora" → "Dentro del edificio" | `app/admin.css`, `components/admin/Operacion.tsx` |
| SYS-ADMIN-TABLE-001 | DONE | Encabezado en banda hundida con acento amarillo a la izquierda, filas de 64 px, selección con barra y tinte amarillo | `app/admin.css` |
| SYS-MOTION-CARDS-001 | DONE | Hover/press/focus en cards (A01, A10, A15), plegado con altura y fundido | `app/admin.css` |

## Pantallas

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| A01-01 | DONE | Familias con menos alto y sin versalitas | `admin.css` |
| A01-02 | DONE | Plegado real: los destinos no se desmontan, se cierran con altura y fundido (40→0 px en ~200 ms); el activo queda a la vista; contadores sumados en el encabezado; el indicador se remide al terminar | `AdminMarco.tsx`, `sistema/useIndicador.ts`, `admin.css` |
| A01-03 | DONE | Tus edificios en cards con ícono, unidades y el actual con filo, badge y tilde amarillos | `ShellAdmin.tsx`, `admin.css` |
| A01-04 | DONE | "8 cosas requieren atención." → "7 pendientes" + una línea operativa; cifra real y filtros intactos | `A01.tsx` |
| A01-05 | DONE | Pendientes en cards: tipo y "Crítica" arriba, título protagonista, metadata ordenada, responsable con ícono, acción a mano | `A01.tsx`, `admin.css` |
| A01-06 | DONE | Sin encabezado Qué/Responsable/Acción; "8 en total · 1 crítica" como dos badges | `A01.tsx` |
| A01-07 | DONE | Próximo: chips de hora, tipo y estado; el evento como título; acción "Ver agenda y reservas"; vidrio carbón | `A01.tsx`, `admin.css` |
| A01-08 | DONE | Plegados muestran contexto: badges de conteo/criticidad y el primer pendiente, el próximo evento o la última novedad | `Plegable.tsx` (`cerrado`), `A01.tsx` |
| A01-09 | DONE | Pie del menú: usuario + firma discreta con el símbolo CondoTrack | `AdminMarco.tsx`, `admin.css` |
| A12-01/02/03 | DONE | Estados y gravedad como pastillas; encabezados legibles | sistemas |
| A03-01…04 | DONE | Banda KPI, encabezados, estados (también Presencia), "Autorizado para" en dos líneas: día y franja | `Operacion.tsx`, `admin.css` |
| A10-01 | DONE | Aprobar termina en la pantalla de éxito de Residente (`ExitoProtagonista`): tilde que entra una vez, datos, "Seguir con el próximo pedido" / "Ver la ocupación de ese día" | `admin/Reservas.tsx`, `admin.css` |
| A10-02 | DONE | Arriba los controles, después la navegación temporal horizontal (dos semanas) y el mes a un toque, abajo los resultados; el lateral aparece sólo con algo elegido | `admin/Reservas.tsx` |
| A10-03 | DONE | Calendario con la filosofía de Residente: barra = reservas, filo amarillo = pedido por decidir, clave con las mismas marcas | `admin/Reservas.tsx`, `admin.css` |
| A10-04 | DONE | Por decidir y Ocupación del día como dos controles/cards con su cifra | idem |
| A10-05 | DONE | Vidrio y motion en controles, días y cards | `admin.css` |
| A10-06 | DONE | Vacío diseñado: ilustración sobria (calendario con tilde sobre círculo amarillo), "No hay reservas por revisar", acción a la ocupación de hoy | idem |
| A02-01…04 | DONE | Tabla del sistema, estados, cuenta de casos con acento amarillo si es alta, cabecera con la arquitectura y los totales de la cartera (3 edificios, 70/74, casos abiertos) | `Edificio.tsx`, `admin.css` |
| A05/A06/A13 | DONE | Heredan el mismo sistema de tabla y estados | sistemas |
| A15-01…05 | DONE | Tablero: período en preparación como único acento amarillo (total, variación vs agosto, vencimiento, gastos, Cargar gastos), evolución de los 6 períodos (cada barra elige el período), rubro dominante con la mezcla de rubros; tabla con variación; detalle con estado, total, vencimiento, variación y rubros con barra y % | `Economia.tsx`, `admin.css` |
| Gastos | DONE | Banda de métricas (total, gastos, rubro que más pesa), vidrio, estados | `Economia.tsx` |
| Cobranza | DONE | Banda de métricas, estados, saldos en superficie hundida | `admin.css` |

Arreglo visto de paso en Entregas: la custodia daba horas negativas cuando la entrega
se cargó con una hora posterior a la actual; ahora nunca baja de 0.

## Motion medido (dev, `motionreduce=0`)

- Tema: `startViewTransition` activo ~560 ms (clase `tema-cambia`); reducido: sin transición.
- Menú: destino plegado 40 → 12 → 3 → 0 px entre 0 y ~200 ms con opacidad 1 → 0.
- Pendientes: 430 → 133 → 31 → 0 px en ~215 ms.
- Éxito de reserva: tilde de escala + trazo una sola vez (mismo CSS que Residente).

## QA

- `npx tsc --noEmit` limpio. Build de producción a `.next/qa-prod`.
- 1440×900 claro y oscuro; 1024×768 (A01, A10, A15) sin scroll horizontal.
- Teclado: foco visible (contorno + halo amarillo) en menú, controles y días de A10.
- Reducido: plegados y transiciones instantáneos; el éxito aparece terminado.

## Para aprobar

1. La intensidad del vidrio en claro.
2. A10: la tira de dos semanas + mes plegable y las cards con Aprobar/Rechazar en la card.
3. A15: el gradiente amarillo del período y el gráfico de evolución.
4. La cabecera de Edificios.
