# Resident Correction Pack v01 · resultados

30/09/2026 · Claude Code · checkout `_github-sync/condotrack-app` (rama UxUi).
Autoridad: `CondoTrack_Resident_Correction_Pack_v01/RESIDENT_CORRECTIONS.md`.
Sólo Access/Onboarding + Residente. **No se tocó Recepción ni Administración**
salvo la verificación de que los calendarios que comparten componente siguen iguales.
Sin commit, push, deploy ni Figma. **Pendiente de aprobación visual de Felipe.**

## Hallazgo que explica varios tickets de motion

El sistema operativo de Felipe tiene "reducir movimiento" activado y la app lo
respeta cuando la URL no trae `motionreduce`. En la revisión, el selector, el
onboarding y el resto se veían sin animación. Se agregó a la **barra de la demo**
(no a la app) un control **"Movimiento: sistema / activado / reducido"** que se
recuerda en el navegador; la URL sigue mandando. Para revisar el motion:
**Movimiento: activado**. Requiere aprobación porque no estaba en el paquete.

## Tabla de tickets

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| G01-01 | DONE | Un solo foco: la silueta amarilla del campo. El input interno ya no suma el halo global (era una regresión de la ronda anterior) | `app/globals.css` |
| G01-02 | DONE | Cursor suave de `motion-lab/…/skiper106.tsx` (SmoothInput, único candidato de input): cursor nativo oculto y barra amarilla que se desliza con el mismo resorte (500/30/0,5) reimplementado sin Framer Motion. El correo pasó a `type="text" inputMode="email"` porque `type="email"` no expone la posición del cursor | `components/ui/CursorSuave.tsx` (nuevo), `components/Login.tsx`, `app/globals.css` |
| G01-03 | DONE | Logo 22→30 px, alineado a la izquierda | `app/globals.css` |
| ONB-01 | DONE | Fundido desde abajo con curva larga (máscara en escalones, velo que ya no oscurece el borde): sin banda | `app/globals.css` |
| ONB-02 | DONE | Cambio de slide: fundido 900 ms con la foto asentándose 1,035→1; el texto entra subiendo 8 px. Reducido: fundido de opacidad de 320 ms (el contrato quita movimiento, no la opacidad) | `app/globals.css` |
| ONB-03 | DONE | Titular 31 px Satoshi Black (900); apoyo 15,5 px con aire | `app/globals.css` |
| R01-01 | DONE | Indicador que viaja de opción a opción (ya existía desde la ronda anterior; 160→240 ms para que el traslado se lea) | `app/globals.css`, `components/ui/WidgetPrincipal.tsx` |
| R01-02 | DONE | "En tu edificio" centrado sobre su módulo, 16 px | `app/globals.css` |
| R01-03 | DONE — revisar | Ver sección propia abajo | `components/ui/PilaVivas.tsx`, `app/globals.css` |
| R05-01 | DONE | Salieron el selector rápido SUM/Cowork/Parrilla y la tira de días de arriba | `components/screens/R05.tsx` |
| R05-02 | DONE | Calendario primero, sobre un panel de vidrio | `R05.tsx`, `app/globals.css` |
| R05-03 | DONE — revisar | Luz ambiente sin foto (dos focos cálidos y un toque del amarillo de marca, muy bajos). No se combinó con fotografía | `app/globals.css` |
| R05-04 | DONE | Módulos de espacio en vidrio (card compartida) | `components/ui/EspacioCard.tsx` (nuevo) |
| R05-05 | DONE | Leyenda eliminada | `R05.tsx` |
| R05-06 | DONE | Estados en el calendario: anillo amarillo = tu reserva; barra amarilla corta = quedan pocos; carbón = elegido; atenuado = completo. El día elegido se explica en palabras debajo | `R05.tsx`, `components/ui/CalendarioMes.tsx` (estado `marca` opcional), `app/globals.css` (acotado a `#r05`) |
| R05-07 | DONE | "Explorar espacios" debajo del calendario; la card elige qué espacio muestra el calendario | `R05.tsx`, `EspacioCard.tsx` |
| R05-08 | DONE | Orden: título/contexto → calendario → día elegido → explorar → Mis reservas | `R05.tsx` |
| R04-01 | DONE | Una sola columna: la media query miraba la ventana y no el teléfono | `app/globals.css` |
| R04-02 | DONE | Expensas, Gestiones y Ayuda con la jerarquía de Tu cuenta/Edificio/Preferencias | `app/globals.css` |
| G15-01/02 | DONE | Card de espacio: foto, nombre y "Reservar" al centro, sin fecha ni horarios | `components/screens/G15.tsx`, `EspacioCard.tsx` |
| G15-03 | DONE | Rol del contacto 14 px en color de texto; admite zoom sin recortar (texto que envuelve) | `app/globals.css` |
| R07-01 | DONE | Causa: el párrafo de estado de Compartir llevaba la clase `listo` (la de la pantalla de éxito) y medía 64 px vacío. Ahora el estado va en `data-estado` y el párrafo existe sólo con mensaje; 12 px entre Compartir y Dar de baja | `components/screens/R07.tsx`, `app/globals.css` |
| F01-S01…S04 | DONE | Éxito protagonista: tilde grande al centro, título 30 px, detalle callado, acciones juntas al pie; entra una vez (escala + tilde que se dibuja); reducido: terminado. "Ver el pase" 48 px en píldora. Las otras confirmaciones (Reclamo creado, Pago informado) no cambian | `components/ui/Estados.tsx` (`ExitoProtagonista`), `components/screens/F01.tsx`, `app/globals.css` |
| F01 selección | KEEP | La selección rápida del formulario no se tocó | — |
| G11-01…06 | DONE | Seguimiento: card carbón con remitente, tipo y unidad + glifo del envío, ficha "Para retirar", datos clave, recorrido Recibida → Avisada → Retirada con fechas reales, historial con actores. Mismo panel en la hoja de Entregas | `components/paneles/PanelEntrega.tsx`, `components/screens/G11.tsx`, `app/globals.css` |
| H01-01 | DONE | Filtros visibles con conteo (sin la hoja "¿Qué querés ver?") | `components/screens/R17.tsx`, `app/globals.css` |
| H01-02 | DONE | Grupos por día con peso y línea; título > descripción > actor; más aire; el amarillo marca sólo lo último | `app/globals.css` |
| R18-01 | DONE | Sin el borde amarillo exterior (era la marca de "reserva destacada" de la ronda anterior) | `components/screens/R18.tsx`, `app/globals.css` |
| RES-FIN-01 | DONE | Después de informar el pago, Volver (arriba) y "Volver al inicio" llevan al Inicio con el estado nuevo; el estado de cuenta se abre en lugar del éxito. Antes, desde Expensa, Volver regresaba al formulario | `components/screens/F03.tsx`, `components/ui/TopBar.tsx` (`onVolver`), `components/Prototipo.tsx` + `lib/navegacion.tsx` (`volverHasta`, `reemplazar`) |

## R01-03 · la pila (el ticket principal)

**Diagnóstico medido.** La pila empezaba en y=576 del contenido y el scroll
máximo era 630: la card 0 se fijaba recién a los 562 px de scroll y la card 1
necesitaba 754 (imposible). Se veía una sola superposición y la página terminaba.

**Fuente.** `motion-lab/…/skiper16.tsx` (StickyCard_001): cards `sticky` con un
corrimiento corto por card y las de atrás que se achican desde arriba.
Reimplementado sin Framer Motion ni Lenis.

**Calibración.**
- La pila se arma abajo, apoyada donde termina el contenido: el solapamiento
  empieza a los ~30 px de scroll.
- 36 px de scroll entre card y card (antes ~190).
- Cada card de atrás asoma 56 px: se leen "Hoy", "Hoy, en casa" y "Próxima
  reserva"; se achican 4 % y se oscurecen por cada card encima.
- Desplazamiento compensatorio: en reposo las cards se ven separadas (nada
  tapado); desde el primer píxel se acercan con curva suave y se posan con
  velocidad cero.
- "En tu edificio" viaja pegado a su pila; el grupo termina justo con la página.
- Con movimiento reducido: lista quieta.

**Límite geométrico (para aprobar).** Una pila fijada al final de una página
deja libre exactamente lo que se scrolleó con ella fijada (3 × 36 px): al final
queda una banda de **108 px** entre el campo oscuro y "En tu edificio".
Achicarla más exige que las cards corran bastante más rápido que el dedo.

## Evidencia

Antes/después a 390×844 en esta carpeta:
`01_G01_login.png` · `02_ONB_onboarding.png` · `03_R01_home_arriba.png` ·
`04_R01_pila_secuencia.png` (antes ×2, después a 0/100/200/final y oscuro) ·
`05_R05_reservar.png` · `06_R04_mas.png` · `07_G15_mi_edificio.png` ·
`08_R07_pase.png` · `09_F01_visita_autorizada.png` · `10_G11_entrega.png` ·
`11_H01_historial.png` · `12_R18_mis_reservas.png`.

## Motion medido (dev :3002, `motionreduce=0` salvo indicación)

| Ticket | Medición |
|---|---|
| G01-02 cursor | 48 → 135 px al tipear, 98 % a ~235 ms; cursor nativo transparente |
| R01-01 indicador | 3 → 219 px, 98 % a ~190 ms (240 ms E1) |
| R01-03 pila | cuadros a 0/50/100/150/200/272 px de scroll; posiciones finales 384/440/496/552 px |
| F01-S02 éxito | tilde de opacidad 0 y escala 0,72 → 1 en ~250 ms; trazo 40 → 0 entre ~870 y ~1070 ms; una vez. Reducido: `opacity 1`, sin transformar, trazo completo al aparecer |
| ONB-02 | fundido de ~600 ms, foto 1,035 → 1 en ~900 ms. Reducido: fundido lineal de 320 ms |

## Verificación

- `npx tsc --noEmit`: limpio.
- `next build` (producción, `.next/qa-prod`): OK.
- Barrido en producción (:3003), tres roles, claro y oscuro, a 1440/390/360: 246
  mediciones, sin scroll horizontal, sin imágenes rotas, sólo Satoshi, sin pesos
  inexistentes. Único aviso: la fila de filtros del Historial se desplaza en
  horizontal a propósito.
- Calendarios de Recepción (P08) y Administración (A10), que comparten
  `CalendarioMes`: sin cambios visibles (los estilos nuevos están acotados a `#r05`).
- RES-FIN-01 repetido en producción: Volver → Inicio con "Pago informado · a confirmar".

## KEEP

Home RES (bloque de expensas, Vencida, Pagar, Composición/Movimientos,
Autorizar/Reclamar/Reservar, fotos de las cards y franja "Pase activo"),
confirmación "Reclamo creado", "Pago informado", selección rápida de Autorizar
visita, lógica del calendario y navegación por meses, Recepción y Administración.

## Para aprobar

1. La pila (R01-03), incluida la banda de 108 px del final.
2. La luz ambiente de Reservar (R05-03).
3. La card de espacio compartida (G15 y "Explorar espacios").
4. El control "Movimiento" de la barra de demo.
5. El éxito de visita (proporción del botón "Ver el pase").
