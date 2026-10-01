# QA_RESULTS

Resultados **ejecutados** en la sesión 2 (29/09/2026). Los PASS de rondas
anteriores son históricos y no se reutilizan. La sesión 1 (Cowork) sólo corrió
`tsc` y dejó el build sin completar; su tabla de pendientes quedó cubierta abajo.

## Build y entorno

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | limpio después de cada fase |
| `next build` (producción, `CT_DIST_DIR=.next/qa-prod`) | OK · `/` 92,2 kB · First Load 179 kB |
| Servidor de QA | `next start` en **:3003** sobre esa build |
| Desarrollo para iterar | `next dev` en :3002 (`.next/qa-dev`) |
| Herramienta | Chrome headless por DevTools (`scratchpad/qa/cdp.mjs`), mediciones por `requestAnimationFrame` y evaluación del DOM |
| Build de Felipe | `.next` en :3001 (se recompila al cierre de la sesión) |

## Barrido responsive (build :3003)

Tres roles × claro/oscuro × 1440/1280/1024/768/390/360 (Residente a 390 y 360;
a más ancho se ve en su marco de teléfono). **384 mediciones.**

| Chequeo | Resultado |
|---|---|
| Scroll horizontal del documento | 0 |
| Elementos fuera del viewport | 0 funcionales. Quedan recortadas dentro de su contenedor tres piezas decorativas preexistentes de Residente (foto del campo, isotipo de la zona de contexto, un trazo en R09) que no generan scroll |
| Imágenes rotas | 0 |
| Fuentes | sólo Satoshi |
| Pesos inexistentes | 0 (se encontró y corrigió un 600 propio en "Qué cambió") |

Primera pasada: 40 hallazgos → dos defectos propios corregidos (peso 600 y
rótulo del riel derecho fuera del viewport a ≤768 px); el resto eran las piezas
decorativas recortadas. Segunda pasada sobre la build corregida: 0.

## Motion medido (build :3003, cuatro combinaciones de preferencia)

| Patrón | Declarado | SO reducido + `motionreduce=0` | SO normal sin override | `motionreduce=1` | SO reducido sin override |
|---|---|---|---|---|---|
| Búsqueda ADM abre (MOT-004) | 260 ms E1 | 44→432 px, 98 % a 181 ms | igual | instantáneo | instantáneo |
| Búsqueda ADM cierra | 180 ms E2 | 432→44 px, a 199 ms | igual | instantáneo | instantáneo |
| Plegar "Qué cambió" (MOT-010) | 240 ms E1 | 295→0 px, 98 % a 153 ms | igual | instantáneo | instantáneo |
| Desplegar | 240 ms E1 | 0→295 px, 98 % a 165 ms | igual | instantáneo | instantáneo |
| Selector Home RES (MOT-001) | 160 ms E1, escala 1.03 | 3→143 px a 92 ms, `scale(1.03)` | igual | sin traslado, `scale(1)` | sin traslado, `scale(1)` |
| Conteo ADM (MOT-009) | 180 ms sólo si cambia | al entrar: sin animación | igual | — | — |

"98 % a X ms" es cuando la medida quedó a menos de 2 % del final: con E1 la
curva llega rápido y el resto es asentamiento. Los tiempos del resto del sistema
(press 120, hover 140, foco 160, detalle 280, página 300/130, novedad en dos
pulsos) vienen de R1.7 y ahora son tokens únicos en `app/sistema.css`.

## Teclado (build :3003)

PASS: búsqueda (foco al abrir, flechas por resultados, Enter abre, Escape vuelve
a la lupa); perfil y avisos (Escape devuelve el foco); rieles de Recepción
(Enter abre la carpeta, Escape cierra y vuelve al control); panel de incidencia y
detalle de Administración (Escape vuelve a la fila); segmentados (flechas); hoja
de entrega (foco adentro y retorno); **familias del menú ADM (Enter y Espacio
pliegan sin navegar)**; **plegar Pendientes con el foco adentro (el foco pasa al
trigger y el cuerpo queda `inert`)**; **hoja de períodos (Enter abre con foco
adentro, Escape vuelve al selector)**; **ojo de importes (`aria-pressed`,
"Mostrar importes")**; selector del Home y segmentado de Autorizar visita
(flechas, en dev :3002).

## Funcional entre roles (build :3003, una sola carga, cambio de rol dentro de la app)

| QA ID | Pasos | Resultado |
|---|---|---|
| QA-11 | RES: Pagar → Ya pagué → Informar el pago → Inicio. ADM: cola → Conciliar el pago. RES otra vez | PASS · Inicio RES "Pago informado · a confirmar" sin botón Pagar; cola ADM con "Pago informado · Unidad 7D"; tras conciliar, Inicio RES "Pagada" |
| QA-06 | RES: Ver pase → Dar de baja. REC: Validar acceso con CT 7D 4821 | PASS · "ANULADO", "El residente dio de baja este pase…", sin registro posible |
| QA-07 | REC: verificar un pase | PASS · verificar no registra; registrar es el paso 3 |
| QA-12 | ADM: cargar gasto vacío → errores; "Vidriería Norte · $ 125.000" | PASS · errores con ícono; fila nueva primera; "21 gastos · $ 9.837.400" y mensaje con el total nuevo (dev :3002) |
| QA-17 | ADM: Críticas → Limpiar | PASS · "1 de 8 · 1 crítica" → "8 en total" |
| QA-18 | ADM: "Sin responsable" → plegar → reabrir | PASS · cerrada muestra "2 de 8 · 1 crítica" y el punto crítico; reabre con el mismo filtro y 2 filas |
| QA-01 | RES: selector con tap, flechas y swipe | PASS (dev :3002) |
| QA-02 | RES: ocultar importe | PASS · Inicio, Más y Notificaciones sin "184.250"; lector: "Importe oculto" (dev :3002) |
| QA-05 | RES: compartir sin Web Share | PASS · "copiamos el pase para que lo pegues". Con Web Share real el resultado depende del dispositivo: no se probó en teléfono |
| QA-09 | RES: revalidación al confirmar reserva | Implementada; no se pudo provocar el conflicto desde otro actor en una sola sesión |
| QA-24 | KEEP contra la línea de base | PASS · Reclamo (F02) y Personas (A06) sin cambios; Home RES y Home REC sólo con las diferencias enumeradas (ver `qa-v02/antes-despues-*`) |

## Contraste (chequeos puntuales)

- Foco: anillo 2 px carbón (claro) u hueso/blanco (oscuro y campos oscuros) +
  halo amarillo; el amarillo solo (≈1,2:1 sobre claro) ya no es el indicador.
- Votaciones sobre carbón: cuerpo `rgba(255,255,255,.84)`, metadatos `.74`–`.82`.
- Etiqueta de estado sobre el campo oscuro del Home: blanco pleno; punto
  "Vencida" #F29A92.
- QR: #111614 sobre blanco ≈ 18:1.

No se corrió una auditoría automática de contraste de todas las vistas: son
chequeos puntuales, no una declaración de conformidad AA.

## No ejecutado o limitado

- Escaneo real del QR (la matriz es de demostración).
- Web Share real en teléfono.
- Zoom del navegador al 200 % (se probó 360 px de ancho, no el zoom).
- Persistencia tras recargar: el estado vive en memoria (límite de prototipo).
- Cambiar de edificio operativo en ADM (hay un solo edificio con datos).

## Evidencia

`docs/ux/final/qa-v02/`: antes/después de las pantallas tocadas, finales en
oscuro y móvil, capturas de QA-06/11 y de cada requisito visual, y los cuadros
del video para DEC-004.
