# CondoTrack · Corrección final v04 (30/09/2026)

**Fuente:** el prompt "corrección incremental final", más la imagen de referencia de Lavandería y la captura del panel de Recepción ("este tamaño de los botones y la división estaban bien"). También las cuatro grabaciones nuevas de Felipe posteriores a la entrega v03 (`ScreenSketch/Recordings/20260930-2033…2049`):

| Grabación | Duración | Rol |
|---|---|---|
| 2033 | 3:41 | Residente |
| 2038 | 2:40 | Recepción |
| 2044 | 3:14 | Administración |
| 2049 | 3:30 | Administración |

Las vi cuadro por cuadro, cada 4 s, en Chrome headless. No hay ffmpeg ni Whisper en la máquina, así que el audio no se transcribió. Las observaciones habladas son las que trae el prompt; los cuadros muestran qué señala o selecciona Felipe en cada momento.

**Referencias abiertas antes de tocar cada módulo:** `refs/user/U02_volvo_modular_dashboard.png` y `refs/user/U01_planner_clock_calendar.png`.

**Servidor:** producción en **http://localhost:3004** (`CT_DIST_DIR=.next/qa-prod`). El :3003 es de Felipe y no se tocó.

**Sin commit, sin push, sin deploy.**

## Residente

| Ticket | Estado | Qué cambió |
|---|---|---|
| A1 · stack | **DONE** | Ahora es un mazo. Una card dominante adelante; las siguientes quedan laminadas debajo (asoman 12 px, más chicas y en grafito). Al scrollear, la de adelante sube y se desvanece mientras la de abajo ocupa su lugar: 96 px de scroll por card, y la rueda cae en una card entera. Mientras se reparte el mazo, toda la escena (campo + mazo) queda trabada, así nunca aparece el hueco blanco del video (0:32 y 3:36). Verificado a 700, 844 y 932 px de alto. |
| A1 · card de entrega | **DONE** | Foto a sangre con un panel de vidrio que muestra el remitente ("Correo Argentino"), el estado en pastilla ("Para retirar", punto amarillo) y la acción amarilla "Ver entrega". Las cuatro cards usan el mismo patrón. |
| A2 · degradé | **DONE** | Sin shader ni degradé amarillo: fondo limpio con una luz neutra mínima. |
| A2 · panel y selector | **DONE** | Un solo panel de vidrio (Planet). El selector va en un riel hundido y el elegido es una superficie elevada, sin bordes negros ni blancos. El calendario va sobre una superficie elevada: mes a la izquierda y flechas a la derecha, días limpios sin cajitas, elegido en carbón suave y tu reserva con borde amarillo. La pista va centrada dentro del panel. |
| A2 · Explorar espacios | **DONE** | Cards rehechas: foto arriba con "Ver espacio" en vidrio, y abajo nombre, piso y capacidad. También muestran la **disponibilidad de hoy** con semáforo; si el día ya cerró, dice "Mañana: N libres". La ficha del espacio (R13) muestra la disponibilidad de la semana como riel, con barra de lo tomado, "Cerró" en vez de "sin lugar", y lleva a reservar. |
| A2 · Lavandería | **DONE** | Foto propia (`public/img/esp_lavanderia.jpg` y `mini_lavanderia.jpg`), sacada de la referencia: el interior sin el marco de la puerta y un leve ajuste de color. Deja de ser la card carbón con ícono. |
| A2 · éxito | **DONE** | La composición va compacta en una superficie de vidrio centrada. Las acciones quedan más abajo, centradas, sin ocupar todo el ancho y en carbón suave (#2A302C), no negro. Aplica a todos los éxitos protagonistas. |
| A3 · Visitas | **DONE** | Card redondeada sin talón ni troquel (ni línea punteada ni muescas). La fecha grande queda como ficha dentro de la card. |
| A3 · Mis reservas | **DONE** | Riel de pestañas con más contraste, elegida elevada y un escalón más de peso (aplica a todas las pestañas del Residente). |
| A3 · Entregas | **DONE** | Una sola card de vidrio claro que se toca entera. Remitente, tipo y hora; estado en pastilla; recorrido limpio; la acción como pastilla en su esquina (antes era una barra negra aparte). Sin la línea chica "en recepción desde las…". |
| A3 · Historial | **DONE** | Íconos con tinte amarillo siempre (lleno al pasar o filtrar), marca un poco más grande y ritmo parejo. Estructura igual. |
| A3 · ancho y feedback | **KEEP** | Ningún filtro ni pestaña rompe el ancho (360/390/320, verificado). El aviso flotante de descarga sigue igual. |
| A4 · Onboarding | **DONE** | El bloque de títulos se apoya abajo, cerca de los puntos y del botón, con aire entre título y texto. No queda colgado arriba de su caja cuando el texto es corto. El fundido se mantiene. |

## Recepción

| Ticket | Estado | Qué cambió |
|---|---|---|
| B1 · rieles | **DONE** | Siguiendo la captura de Felipe, los botones laterales vuelven al tamaño anterior (≈76 px a 1440) con su columna y la división. El escáner sigue destacado, sin anillo. |
| B1 · botones centrales | **DONE** | Como el U02 (Rent · Buy · Sell): pastillas separadas de vidrio claro, más altas (50 px); la elegida es un gris hundido con texto fuerte, no un bloque negro. |
| B1 · elipse | **DONE** | Una gran masa suave que nace abajo a la izquierda y pasa por detrás de las cards: forma legible, borde suave y un filo cálido apenas amarillo. Tiene versiones para oscuro y luz nocturna, y el parallax se mantiene. |
| B1 · cards inferiores | **DONE** | Vidrio frosted real: más translúcidas, desenfoque de 34 px, filo de luz y sombra contenida. La elipse se ve a través. |
| B2 · Agenda | **DONE** | La lista por categoría del resumen repetía los filtros de arriba. Ahora hay una barra de avance de la jornada y "Lo que sigue": los próximos tres eventos, cada uno abre su detalle. |
| B3 · Unidades | **DONE** | Hover y foco sutiles. Al filtrar, la lista ya no se apaga al 25 % (ahora 72 %, 2 px). La elegida lleva un tinte amarillo leve. El directorio está más presente: título de 26 px, cifra de 64 px e ícono de 52 px. La base no se tocó. |
| B4 · Actividad | **DONE** | El foco realza sin apagar a los demás (0,78 en vez de 0,5); el evento con foco sube 2 px, con transición de 280 ms. |
| B5 · avisos y estados | **DONE** | Al pasar o enfocar un aviso, su ícono toma el amarillo; aplica también a Administración. Las pastillas Recibido, Avisado y OK tienen más contraste interno. Luz nocturna sin cambios (**KEEP**). |

## Administración

| Ticket | Estado | Qué cambió |
|---|---|---|
| C1 · sidebar | **DONE** | El botón de colapsar vive dentro del menú, ya no sobre el borde. Los rótulos no se quiebran durante la animación: sin cortes de línea y un fundido al abrir (en el video 0:04 se deformaban). En modo mini quedan la marca e íconos. Familias de 15 px / 750, destinos de 14,5 px y una sola flecha consistente. |
| C1 · copy | **DONE** | Se quitó "Lo que espera una decisión… ordenado por urgencia". Sólo aparece "Nada espera una decisión" cuando está vacío. |
| C1 · semáforo y lengüetas | **DONE** | Lo crítico ya no pinta el bloque: lleva un filo rojo fino, la pastilla "Crítica" y el ícono en rojo. "Sin responsable" es una pastilla amarilla de atención. Las lengüetas laterales siguen fuera. |
| C1 · vidrio | **DONE** | El área de trabajo tiene una masa suave desde abajo a la izquierda (queda fija mientras se scrollea) y paneles más translúcidos con desenfoque de 30 px. |
| C2 · pill de tiempo | **DONE** | "En X min" / "En seis horas" es una pastilla amarilla clara en el Próximo. |
| C2 · Reservas | **DONE** | El riel de días se arrastra con mouse y dedo, se mueve con la rueda y desliza suave. Muestra seis semanas; las flechas corren una semana. |
| C2 · día vacío | **DONE** | Ahora es una fila compacta, y debajo aparece "Lo que viene" (las próximas cuatro reservas, cada una lleva a su día). |
| C2 · calendario | **DONE** | El calendario desplegado es más compacto: celdas bajas y sin cajas pesadas. |
| C3 · Edificios y listados | **DONE** | Las cifras llevan rótulos con mayúscula inicial. Las filas tienen más aire y textos que no se quiebran feo; los pendientes no se parten. |
| C4 · Economía | **KEEP** | La estructura no se rehízo. |
| C4 · ajustes puntuales | **DONE** | "En preparación" es una pastilla corta (antes era una banda a todo lo ancho del detalle). Las flechas de los desplegables quedaron iguales en todos los `select` y no desaparecen al enfocar. En "Unidades con saldo", nombre y estado van juntos (el estado baja si falta lugar), la deuda va a la derecha sin cortes y la acción se acorta con el detalle abierto. Conciliar, rechazar y recordatorio, con sus avisos, se mantienen (**KEEP**). |

## Sistema (D)

- **Colores.** Las superficies nuevas usan blanco cálido. Las acciones y lo elegido van en carbón suave (#2A302C / #1E2421), no en negro. El amarillo queda para acción, atención y foco.
- **Tipografía.** Sin versalitas nuevas. Los días de la semana y los rótulos están en minúscula con inicial, con más peso donde faltaba.
- **Motion.** Las transiciones duran entre 200 y 300 ms con curvas suaves. Con movimiento reducido, el mazo es una lista quieta y no hay fundidos en el menú.
- **Vidrio.** Fondo, masa o elipse detrás, superficies translúcidas con desenfoque, filo de luz y sombra contenida.

## QA

- `tsc --noEmit` sin errores. `next build` compila (en `.next/qa-prod`); el tsconfig volvió a HEAD.
- **Barrido de producción:** 384 mediciones (3 roles × claro/oscuro × 1440/1280/1024/768/390/360). Sin scroll horizontal de página, imágenes rotas ni fuentes fuera de Satoshi. Lo que sobresale son rieles horizontales intencionales (filtros de Agenda, subnav de Entregas, riel de disponibilidad) y fotos decorativas recortadas.
- **Zoom:** 200 % de escritorio (720×450) en P01, P08, A01, A10 y A17 sin desbordes. Residente a 320 px de ancho: R01, R05, R06, R08 y G15 limpios.
- **Mazo medido** a 390×700, 390×844 y 390×932: pantalla siempre llena; al final sólo queda el cierre "Nada más para mostrar".

## Hojas antes/después (en esta carpeta)

`A1_inicio_mazo`, `A2_reservar`, `A3_visitas_entregas_reservas`, `A4_onboarding_historial`, `B1_recepcion_inicio`, `B1_elipse_vidrio`, `B2_agenda`, `B3_B4_unidades_actividad`, `C1_admin_inicio`, `C1_sidebar` (antes = cuadro 0:04 del video), `C2_reservas`, `C3_edificios_unidades`, `C4_cobranza_expensas`.

## Limitaciones reales

- **Foto de Lavandería.** Es la imagen de referencia recortada y ajustada, no una imagen nueva generada. Para una variante propia hace falta un servicio de generación de imágenes, que no usé sin pedirlo.
- **Audio de los videos.** No se pudo transcribir (no hay ffmpeg ni Whisper en la máquina). Se trabajó con las observaciones del prompt más los cuadros.
- **Luz nocturna.** Sigue disponible sólo en Recepción y Administración, desde el menú de perfil; `?tema=noche` en la URL no la activa.
- **Mazo del Inicio.** Mientras se reparte, el Inicio no se desplaza (se mueven las cards). Es deliberado para no dejar huecos; al terminar, la página sigue normal.

## Archivos tocados

**Residente**
- `components/ui/PilaVivas.tsx` (reescrito: mazo)
- `components/screens/R01.tsx`
- `components/ui/EspacioCard.tsx`
- `components/screens/R05.tsx`
- `components/screens/R13.tsx`
- `components/paneles/PanelEntrega.tsx`
- `lib/data.ts`
- `lib/reservas.ts`
- `public/img/esp_lavanderia.jpg` (nuevo)
- `public/img/mini_lavanderia.jpg` (nuevo)
- `app/globals.css` (bloque "v04 · CORRECCIÓN FINAL · RESIDENTE" al final)

**Recepción**
- `components/recepcion/P08.tsx`
- `app/recepcion.css` (bloque v04 al final)

**Administración**
- `components/admin/A01.tsx`
- `components/admin/Reservas.tsx`
- `components/admin/Economia.tsx`
- `app/admin.css` (bloque v04 al final)
