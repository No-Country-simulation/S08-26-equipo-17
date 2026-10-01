# DECISIONS_IMPLEMENTED

Decisiones del master v02 §2 llevadas a código. Una fila por decisión, con el archivo
real y el criterio que se aplicó cuando el encargo dejaba margen.

| DEC | Estado | Archivos | Decisión de implementación y por qué |
|---|---|---|---|
| **DEC-002** Archivadas fuera | DONE | `components/screens/R03.tsx`, `lib/data.ts` | El aviso archivado pasa a `leida`, no se borra: el flag era preferencia personal, así que el registro sobrevive en la lista general con su lectura y su orden. Se le dio destino `r14` para que siga siendo alcanzable. Los documentos *Archivados* de ADM (`Edificio.tsx`) **no** entran: son ciclo de vida de documento, no archivo de notificaciones |
| **DEC-002** vacío dependiente | DONE | `components/screens/R03.tsx` | Con *No leídas* y nada sin leer caía el vacío aprobado *Sin notificaciones*, que afirmaba algo falso. Se separó: el aprobado queda para sin datos, y el de filtro dice *Estás al día* y ofrece **Ver todas** |
| **DEC-003** Pendiente como metadata | DONE | `WidgetPrincipal.tsx`, `R01.tsx`, `globals.css` | La etiqueta ya no simulaba CTA; eso se conservó. Se corrigió que se renderizara a 12 px dentro de un contexto de 13,5 px, que *Vencida* y *Pendiente* compartieran el mismo punto amarillo, y el contraste sobre el campo oscuro |
| **DEC-005** barra de tareas | DONE | `admin/Plegable.tsx` (nuevo), `admin/A01.tsx`, `admin.css`, `sistema.css` | La barra de tareas del Home es **Pendientes**, la cola de lo que espera decisión. El segmentado de cortes es un filtro, no una barra. Un solo control, sin acordeones anidados |
| **DEC-005** conservar estado | DONE | `admin/Plegable.tsx` | El cuerpo se oculta, no se desmonta. Es lo que hace que filtro, selección, borrador y scroll vuelvan como estaban |
| **DEC-005** criticidad visible | DONE | `admin.css` | Cerrada, *Pendientes* muestra cuántas críticas y un punto rojo: plegar no puede esconder algo crítico |
| **DEC-005** motion | DONE | `sistema.css` | Token nuevo `--dur-panel: 240ms` (MOT-010). Reducido, instantáneo, por los dos caminos que ya usa el repo |
| **DEC-001** gastos | DONE (sesión 2) | `admin/Economia.tsx`, `admin.css` | Ver ADM-021 abajo. Sin motor de liquidación ni prorrateo |
| **DEC-004** tres controles | DONE (sesión 2) | `R21.tsx`, `R03.tsx`, `admin/A01.tsx` | Identificados reproduciendo el video en Chrome. Ver abajo |

## Lo que se decidió NO hacer

- No migrar la tipografía. El código dice Satoshi y el master ordena preservar la
  fuente vigente en vez de migrar por memoria histórica.
- No tocar los 160 archivos sucios de `backend/`.
- No tocar `condotrack-app` (el hermano) ni `condotrack-motion-lab` (sólo lectura).
- No convertir *Archivados* de documentos ADM en parte de DEC-002.
- No agregar dependencias. Todo con CSS y React del stack actual: el plegado usa
  `grid-template-rows: 0fr→1fr`, que anima una altura desconocida sin medir en JS.


---

# Sesión 2 · 29/09/2026 (Claude Code)

## Reparación de la sesión 1

| Decisión | Archivos | Por qué |
|---|---|---|
| Flecha del plegado: cerrado ›, abierto ⌄ | `admin.css` | El ícono base apunta a la derecha; la sesión 1 lo invertía |
| Región cerrada no se estira | `admin.css` | En la grilla, la card cerrada quedaba del alto de su vecina y vacía |
| `h2 > button` en vez de `button > h2` | `Plegable.tsx` | Un encabezado dentro de un botón deja de ser encabezado |
| **Estado de expensa derivado en un solo lugar** (`estadoDe`) | `lib/expensas.ts` | Nadie asignaba `vencida`: el aviso calculaba por fecha y el Inicio leía el dato guardado. Hoy "pagada" es un hecho registrado (o un pago confirmado por Administración) y "vencida" = sin pagar con vencimiento pasado. No se escribió "Vencida" a mano para la fixture |

## DEC-004 · identificación

| Tramo | Target | Evidencia | Cambio |
|---|---|---|---|
| 02:25–03:00 | Selector de período de Gastos RES | Puntero sobre "Septiembre de 2026 ⌄" 02:41–02:44, abre la hoja | Control legible (rótulo + valor + flecha, 44 px) y hoja rehecha (RES-014) |
| 04:10–04:35 | "Marcar todo como leído" | Al pie y tapado por la barra; los puntos desaparecen a las 04:29 | Sube junto al filtro con el conteo |
| 20:35–21:00 | Título "Qué cambió" del Home ADM | Puntero sobre el título 20:36–20:57; no era un control | Es disclosure (DEC-005) y "Ver N más" despliega la historia |

Capturas en `docs/ux/final/qa-v02/dec004*.png`.

## Criterios elegidos donde el master dejaba margen

- **Privacidad de importes (RES-003).** QA-02 admite leerse como "oculto por
  defecto". Se eligió: sin preferencia guardada, el importe se ve, porque el
  Home con el importe es la composición aprobada (KEEP). La preferencia
  explícita se recuerda por usuario y sólo guarda sí/no.
- **Barra de tareas = Pendientes** (se mantiene el criterio de la sesión 1).
- **"Shell compacto" (ADM-001)** se resolvió con el plegado por familia y filas
  de 42 px; no se agregó un modo de sólo íconos, que no está en las referencias.
- **Hero ADM (ADM-007/AST-001):** `fachada.jpg` existente en vez de generar una
  imagen: cumple la descripción del asset y ya es el edificio del producto.
- **Arco de Recepción (REC-002/AST-004):** CSS, semicírculo neutro; se subió a
  9 % en claro porque al 6–7 % no se distinguía del fondo.
- **Rieles (REC-003):** 48 px y centrados en vertical respecto del centro
  operativo, como los rieles simétricos de U02.
- **REC-004:** "Ver incidencias" con ícono lista y "Reportar incidencia" con +;
  "Resumen de hoy" pasa a reloj para no repetir el ícono de lista.
- **REC-005:** se quitó el texto de la solapa sólo en Accesos (la redundancia
  "ACCESOS / Accesos de hoy"); Actividad y Entregas no repetían.
- **Un solo "elegido" por pantalla de reservas:** el día del calendario pasó
  de amarillo a carbón como la tira y la leyenda.
- **Votaciones:** sin verde/rojo; el resultado y el voto propio se dicen con
  texto.
- **Pago informado ≠ pagado:** el Inicio no ofrece Pagar otra vez mientras hay
  un pago informado sin decidir; cuando Administración lo concilia, la expensa
  queda Pagada en Residente.

## Lo que se decidió NO hacer (sesión 2)

- No reconstruir pantallas KEEP (Home RES, Reclamo creado, Personas, Agenda REC).
- No crear un modo de edificio operativo múltiple: no hay datos de otros
  edificios (ADM-003 queda como límite de datos).
- No borrar assets sin uso: se listan en `ASSET_MANIFEST_ACTUAL.md`.
- No instalar librerías: indicador, desborde, conteo y compartir con React/CSS
  del stack.
