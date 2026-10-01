# CondoTrack · Micro-ronda de pulido v05 (30/09–01/10/2026)

**Fuentes:**
- El prompt de la micro-ronda.
- La imagen del fondo oscuro, que Felipe pasó.
- La grabación nueva `DESCARGAS/ultimos cambios_compressed.mp4` (9:42), vista cuadro por cuadro cada 4 s. Su dictado aparece transcripto al final (9:40, ventana de ChatGPT): *"el scroll sigue siendo muy tosco… habíamos visto algo en Framer… parallax scroll… conciliado es muy rápida la animación… alguna card de algo de CondoTrack"*.

**Referencia de fondo:** `docs/ux/visual-targets/CondoTrack_HOME_Recepcion_Target_R14.png`. Se tomó sólo el lenguaje, no el screenshot.

**Servidor de revisión:** producción en `http://localhost:3004` (`.next/qa-prod`). El :3003 es de Felipe y no se tocó. **Sin commit, sin push, sin deploy.**

## General

| Punto | Estado | Qué cambió |
|---|---|---|
| Fondo claro/oscuro | **DONE** | El claro sigue siendo el abstracto aprobado: el lenguaje del R14, con geometrías grandes, suaves, cálidas y de bajo contraste. El oscuro ahora es su par real (`public/recepcion/abstract-dark.webp`, la imagen de Felipe), no el claro tapado con un velo al 95 %. Aplica a Recepción y Administración. |
| Smooth scroll "tipo Framer" | **DONE** | `components/sistema/ScrollSuave.tsx`, montado una vez en el prototipo. La rueda fija un objetivo y el contenedor lo persigue con lerp 0,1 (como Lenis) en las tres apps. El dedo, el teclado y la barra siguen nativos; respeta paneles internos y rieles horizontales; con movimiento reducido es nativo. También publica `--sy` para parallax leves: la foto de portada de Administración y el campo del Inicio del residente. |

## Residente

| Punto | Estado | Qué cambió |
|---|---|---|
| Mazo del Inicio | **DONE** | Se mantiene, con movimiento continuo: sin saltos de a una card ni imanes, sigue al scroll ya suavizado. La siguiente asoma abajo (un filo) y **sube por encima** de la dominante, que se va atrás laminada (se achica, se apaga y queda como filo arriba). El campo acompaña con un parallax leve y un indicador de puntos dice en qué card vas. Así se lee como una sección trabada controlada, no como un scroll secuestrado. |
| Copys vacíos | **DONE** | En el Inicio, "Nada pendiente", "Sin movimientos" y el cierre "Nada más para mostrar" pasan a "Todo en orden". |
| Card de expensas | **DONE** | Sin la pastilla roja "Vencida · 20 sep"; queda una línea callada, "Venció el 20 sep". El monto está centrado de verdad: el ojo va aparte, a 14 px. |
| Card de entrega | **DONE** | Recompuesta: el estado ("Para retirar") arriba en su línea, el remitente grande, debajo "Sobre · hace 9 h" y la acción a la derecha, centrada en el panel. |
| Despliegues | **DONE** | Las pestañas del campo tienen alto fijo (no saltan) y un fundido de 420 ms. Las hojas suben con una curva larga. |
| Reservas | **DONE** | "Tus reservas tienen el borde amarillo" pasa a "Tus reservas están destacadas", resaltado en amarillo en su propia línea y centrado. El calendario no se tocó. |
| Notificaciones | **DONE** | Las nuevas usan la lógica de "En tu edificio": foto del lugar, el aviso en un panel de vidrio con ícono amarillo, "Nueva · hace…" y "Marcar como leída" como chips en las esquinas. Lo leído va en un panel de filas, como "Tu unidad". |
| Onboarding (opcional) | **DONE** | El círculo amarillo de cada foto se funde con el siguiente con un desenfoque cruzado de 1,1 s: pasa de lugar en lugar sin salto. |

## Recepción

| Punto | Estado | Qué cambió |
|---|---|---|
| Vidrio | **DONE** | Más frosted y más sutil (desenfoque de 40 px, saturación 1,8). Las cards son menos grises: la elipse de atrás baja de tono. |
| Bloque central | **DONE** | Dos piezas que cierran. A la izquierda, título y la pieza de la hora, con un leve crecimiento al pasar. A la derecha, **"Lo que sigue"** ocupa el sector que quedaba en blanco: los próximos eventos del día y, si hoy ya no queda nada, los de mañana. Cada uno abre su detalle en Agenda, y la tarjeta crece levemente con hover y foco. |
| Fitting de "Lo que sigue" | **DONE** | Los títulos largos ("Cierre de terraza y control de luces") entran en dos líneas, en la Agenda y en el Inicio. |
| Agenda | **DONE** | Los eventos tienen ancho fit-content dentro de su carril, con un mínimo y padding razonable. La pastilla del detalle ya no es una banda a todo lo ancho. |
| Resumen del día | **DONE** | Mini gráfico de la jornada (eventos por hora de 07 a 23): lo pasado en carbón, lo que viene claro y la hora actual en amarillo. "Por venir" ya no cuenta lo que quedó atrás. |
| Actividad | **DONE** | "Movimientos de hoy" queda más claro, sin el gris de las bandas. Los filtros (Todo, Accesos, Entregas, Incidencias · Hoy, 7 días, Todo) usan el mismo lenguaje que los tabs de arriba: pastillas separadas de vidrio y la elegida en gris hundido. |

## Administración

| Punto | Estado | Qué cambió |
|---|---|---|
| Refuerzo visual en Inicio | **DONE** | Card "CondoTrack · este mes" con la cobranza del período: % de unidades al día, barra, con deuda y pagos por conciliar, y "Ver cobranza". Es carbón con la geometría del símbolo y un brillo amarillo, y llena el lateral también con los paneles plegados. |
| Motion y scroll | **DONE** | Scroll suave global y un parallax leve en la foto de portada. |
| Expensas | **DONE** | Misma estructura, más riqueza: la geometría de la marca en la card amarilla y barras que crecen al entrar, escalonadas, igual que la mezcla de rubros. |
| Cobranza | **DONE** | Conciliar o rechazar ya no es instantáneo. La fila toma el estado nuevo (verde o rojo) y el detalle dice "Pago conciliado" durante 900 ms; después se pliega en 350 ms y recién ahí sale de la lista y aparece el aviso. Con movimiento reducido es inmediato. |

## QA

- `tsc --noEmit` sin errores. `next build` en `.next/qa-prod` compila; el tsconfig volvió a HEAD.
- Scroll suave medido: en el Inicio del residente, un golpe de 200 px llega en unos 700 ms con desaceleración (69 → 104 → 144 → … → 198). En Administración, `--sy` acompaña cada cuadro.
- Barrido en producción: 384 mediciones (3 roles × claro/oscuro × 1440/1280/1024/768/390/360). Sin scroll horizontal de página, imágenes rotas ni fuentes fuera de Satoshi. Lo que sobresale son rieles horizontales intencionales.
- Hojas antes/después en esta carpeta: `R_inicio_mazo`, `R_inicio_oscuro`, `R_notificaciones_reservas`, `R_onboarding`, `P_inicio`, `P_fondo_oscuro`, `P_agenda`, `P_actividad`, `A_inicio`, `A_oscuro_expensas`, `A_cobranza`.

## Limitaciones reales

- El mazo del Inicio sigue trabando la escena mientras se reparten las cards (es lo que evita los huecos). Ahora se mueve continuo, con parallax e indicador de progreso, pero sigue siendo una sección sticky: si a Felipe le sigue pareciendo un scroll secuestrado, la alternativa es soltar el campo y trabar sólo el mazo.
- El scroll suave aplica a la rueda del mouse y al trackpad que emite eventos de rueda. En celular el dedo ya tiene su inercia nativa y no se toca.
- El fondo oscuro es la imagen de Felipe tal cual (1672×941, se ajusta con `cover`).

## Archivos tocados

**Sistema**
- `components/sistema/ScrollSuave.tsx` (nuevo)
- `components/Prototipo.tsx`
- `public/recepcion/abstract-dark.webp` (nuevo)

**Residente**
- `components/ui/PilaVivas.tsx`
- `components/screens/R01.tsx`
- `components/screens/R03.tsx`
- `components/screens/R05.tsx`
- `app/globals.css` (bloque v05 al final)

**Recepción**
- `components/recepcion/P01.tsx`
- `components/recepcion/P08.tsx`
- `app/recepcion.css` (bloque v05 al final)

**Administración**
- `components/admin/A01.tsx`
- `components/admin/Economia.tsx`
- `components/admin/ListaDetalle.tsx`
- `app/admin.css` (bloque v05 al final)
