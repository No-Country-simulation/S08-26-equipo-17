# 02 · Decision log

Formato: **ID · decisión · tipo · qué deroga**.
Tipos: `REQUISITO` (lo pidió Felipe) · `DISEÑO` (decisión tomada al implementar) ·
`HIPÓTESIS` (todavía sin validar).

---

## Vigentes

### D-01 · Satoshi es la tipografía de producto · REQUISITO
Fontshare / Indian Type Foundry, por CDN mientras dure el prototipo.
Pesos por rol: **400** cuerpo y metadatos · **500** labels, navegación, filtros,
ítems de lista · **700** botones, titulares, datos importantes · **900** importes
y cifras grandes.
Satoshi no tiene 600 ni 800, y no tiene eje de ancho.

**Deroga:** el uso de Archivo con `--display-ancho: 118%`, y la propuesta de
Instrument Serif / Fraunces como display, ambos en `LENGUAJE_VISUAL.md`.
**Deroga:** el punto 12 de `source/01_RESEARCH_PROFESIONAL.md` y el punto 1 de la
Fase 0 de `source/04_PROMPT_CLAUDE_CODE_IMPLEMENTACION.md`, que piden cargar Rothek.

### D-02 · Rothek sale de la interfaz · REQUISITO
Motivo técnico, no estético. El paquete `Rothek Font Family.zip` son 22 archivos
**trial**: 66 glifos cada uno, sin acentos (`á é í ó ú ñ`), sin `¿ ¡ ü`, sin
`: ; ( ) % $ /`, y con el campo de licencia en "TRIAL VERSION". En una app en
español eso rompe la pantalla, no la afea.
Los únicos Rothek licenciados —ExtraLight 200 y Bold Italic 700— no incluyen peso
de cuerpo, así que no pueden sostener una interfaz.
Rothek queda solo en el wordmark, que ya es vectorial.

**Pendiente:** borrar `public/fonts/rothek-*.otf`. Están desenlazados del CSS pero
siguen siendo descargables desde el deploy, lo cual incumple la cláusula 2a del
Web Font EULA de Fontspring. Los `.woff` pueden quedarse.

### D-03 · Fuera las diagonales del fondo · REQUISITO
`app/globals.css` líneas 247 y 261: `repeating-linear-gradient(121deg, …)`.
En su lugar, un **campo tonal ambiental** anclado arriba, que se disuelve hacia
el fondo cálido antes de la mitad de la pantalla. En oscuro, hecho con negros.
El amarillo `#F5E500` no vuelve a ser fondo.

**Deroga:** el punto 3 de `docs/_historia/PROMPT_02_LENGUAJE_VISUAL.md` ("geometría arquitectónica
apenas perceptible") y la sección "El fondo" de `LENGUAJE_VISUAL.md`, que describe
la trama de hairlines a 31° como si fuera correcta.

### D-04 · Barra inferior de cinco destinos con acción central · REQUISITO
`Inicio · Mi edificio · [ACCESO/QR] · Reservas · Más`
La barra flota: no llega a los bordes, tiene radio propio, y es más baja que la
actual. La acción central es un squircle más ancho que alto, no un círculo.
Patrón: *bottom app bar with docked FAB*.

**Deroga:** los cuatro destinos fijados en `source/00_MASTER_UI_SYSTEM_LOCK.md`
y el arreglo actual de `components/ui/PillNav.tsx`.
**Cambia la IA aprobada.**

### D-05 · El amarillo no marca la navegación activa · REQUISITO
Amarillo en: acción primaria, elemento seleccionado, fecha seleccionada.
El destino activo de la barra se marca con **peso tipográfico y color sólido**.

**Deroga:** el punto 1 de la sección "El amarillo" de `LENGUAJE_VISUAL.md`
("el destino activo de la nav") y la propuesta de amarillo para navegación activa
de `source/01_RESEARCH_PROFESIONAL.md`.

### D-06 · El botón firma es el glass con flecha, no el círculo vacío · REQUISITO
El botón con flecha de "Visitas hoy" es el que funciona. Se promueve a componente
y se usa en: Autorizar visita, Hacer reclamo, Reservar espacio, Administración,
Recepción y el botón de volver.

**Deroga:** la sección "El botón circular" de `LENGUAJE_VISUAL.md`, que define
`.circulo` de 48px sin relleno como elemento firma. La clase `.circulo` **existe y
se queda** para acciones secundarias; lo que cambia es cuál de los dos es la firma.

### D-07 · "Mi edificio" con navegación secundaria · DISEÑO
El destino se llama **Mi edificio** y adentro tiene `Unidad | Edificio | Documentos`.
Absorbe R07/G15.
Razón de que no sea una fusión plana: unidad y consorcio son ámbitos de permisos
distintos. Se gana el nombre sin perder la separación.

**Deroga:** el destino "Mi unidad" de `PillNav.tsx`.
**Deroga parcialmente:** `source/05_INFORMATION_ARCHITECTURE.md`, que los tiene
como destinos separados.

### D-08 · El calendario de R05 es grilla de mes · REQUISITO
Grilla de mes completa, día seleccionado en círculo sólido, navegación de mes con
flechas, y **puntitos** bajo los días con disponibilidad.
Antes de elegir día: una caja con borde marcado que dice
*"Elegí un día del calendario para ver los horarios disponibles."*
Los horarios aparecen recién después.
Los espacios van abajo del calendario, con foto a sangre.

**Deroga:** la tira horizontal de 14 días implementada hoy en `R05.tsx` (`.tira`),
y los textos "hay lugar / quedan pocos / sin lugar", que salen: los reemplazan
los puntos.
**Deroga:** `docs/_historia/PROMPT_FASE_RESERVAS.md` completo.

### D-09 · El apilado es solo entre objetos equivalentes · REQUISITO
Apilan: Visitas hoy, Próxima reserva, Paquete para retirar, Estado del edificio.
No apilan nunca: expensas, botones, contactos, categorías distintas.
Desfase vertical corto: la card de abajo asoma 20–30 px. No se presiona para
seleccionar.

### D-10 · El gesto irreversible va al final · REQUISITO
"Crear nueva visita" es un botón. El slide aparece solo en "Autorizar y emitir el
pase", que es el acto irreversible.

**Deroga:** el `SwipeButton` como control de entrada en R06.

### D-11 · La foto es la card · REQUISITO
Cuando una card representa un **lugar**, la imagen ocupa el bloque entero con el
radio de la card y el texto va encima sobre un degradado. Nunca foto chica dentro
de un contenedor blanco.
Las clases `.mat-foto` y `.mat-carbon` ya existen en `globals.css` y ya se usan en
G15, R05, R13, R06 y R07: falta **terminar de adoptarlas**, sobre todo en R01.

### D-12 · Categoría de reclamo: opcional al crear, obligatoria al cerrar · DISEÑO
El residente no carga fricción; administración no pierde la trazabilidad que el
brief pide como objetivo.

### D-13 · Búsqueda: stub sin motor · DISEÑO
Entrada compacta en el header que abre una pantalla con cinco acciones frecuentes
fijas. No se construye índice.
**Recorta** la propuesta de búsqueda global como centro de comandos de
`source/01_RESEARCH_PROFESIONAL.md` §5.

### D-14 · El home no se reordena solo · DISEÑO
Orden fijo que ya prioriza lo urgente. Cada módulo aparece solo si tiene contenido.
El reordenamiento dinámico queda documentado y postergado: con datos mockeados no
se puede validar qué gana cuando pasan dos cosas a la vez.
**Recorta** la sección 26 de la especificación de arquitectura.

### D-15 · Los títulos de pantalla bajan de escala · REQUISITO
El home no empieza con un saludo grande: empieza con contexto silencioso
(`Aráoz 1280 · Unidad 7D`) y entra directo al contenido útil.

### D-16 · El módulo de expensas es una expansión de alcance · REQUISITO
No existe en ningún documento original del proyecto. Se registra acá para que
quede claro que es alcance agregado, no alcance heredado.
Pantallas afectadas: R20, R21, R22, R23, F03.

### D-17 · Eventos registrados vs. declarados · HIPÓTESIS · **fuera de MVP**
El historial dice "Egreso registrado" pero si el residente abre la puerta desde su
casa nadie registra ese egreso: el sistema asume que todo pasa por recepción.
Hay que separar eventos **registrados** (los captura un sistema) de **declarados**
(los afirma una persona), o el historial miente.
No se toca en esta pasada. Queda documentado porque es un hueco real del modelo,
no un bug de interfaz.

### D-18 · `BotonGlass` tiene dos tonos · DISEÑO
El botón firma aprobado es blanco translúcido al 12% con filo blanco, y eso
funciona **porque abajo hay una foto oscura**. Sobre el fondo claro de la app
ese mismo botón no se ve. El componente tiene dos tonos: `claro` para foto y
carbón, `sobrio` para el resto, con el filo de gradiente del vidrio.
Además tiene modo **decorativo**: cuando la card entera es el control, la
flecha se dibuja como `span`. Dos botones anidados no son HTML válido y el
área táctil tiene que ser la card, no la flechita.

### D-19 · La navegación no usa amarillo en ningún nivel · DISEÑO
D-05 sacó el amarillo del destino activo de la barra. Por el mismo criterio,
`SubNav` y los tabs del widget marcan lo activo con peso y color sólido. El
amarillo queda para acción primaria, selección y fecha elegida.

### D-20 · Las cards de la pila miden todas lo mismo · DISEÑO
150 px. Con alturas distintas el alto del bloque salta en cada giro y la pila
deja de leerse como pila: se lee como un error de maquetación.

### D-21 · Los filtros de más de tres opciones van a una hoja · DISEÑO
El historial tenía cinco pastillas amarillas peleando con el contenido. Ahora
una línea dice qué estás mirando y cuánto hay, y la hoja muestra las opciones
**con el conteo de cada una**, que antes no estaba. Mismo patrón que el
selector de período de R21. Dos o tres opciones siguen yendo en `SubNav`.

### D-22 · El formulario de reclamo empieza por lo que pasó · DISEÑO
Orden: qué pasa (obligatorio) → ubicación → categoría (opcional) → foto. Antes
abría pidiendo clasificar algo que el residente todavía no había contado.

### D-23 · La disponibilidad de un espacio se cuenta del día que estás mirando · DISEÑO
Las cards de espacios decían siempre "hoy". A las siete de la tarde las cuatro
decían "sin lugar hoy" mientras el calendario, arriba, mostraba otro día con
lugar de sobra. Ahora siguen al día elegido y, si está lleno, dicen cuándo sí.

### D-24 · Los teléfonos de la unidad se muestran rotulados · DISEÑO
Cierra MOD-02. Lo que R02 mostraba no eran documentos: eran teléfonos sin
rótulo, y un número suelto se lee como un DNI. Ahora dicen "Teléfono" y el
panel abre diciendo quién ve qué. El documento sigue apareciendo sólo donde
hace falta para identificar a alguien: la autorización de una visita y la
pantalla de recepción.

---

## Ronda visual 01 · 18/09/2026

### D-25 · El centro de la barra es dinámico · REQUISITO (ronda visual 01, §3)
Lo eligió Felipe entre cinco opciones. El centro no es un destino: es la acción
que más conviene ahora, por un orden de prioridad fijo y escrito en `PillNav.tsx`:

1. la expensa vence en 5 días o menos, o ya venció, y no está paga → **Pagar**
2. hay un pase vigente → **Pase**
3. hay algo para retirar en recepción → **Retirar**
4. hay una reserva hoy → **Reserva**
5. nada de lo anterior → **Acceso**

El orden es una **hipótesis de producto**: no hay datos de uso. El dinero con fecha
va primero porque es lo único con consecuencia si se pasa. El centro es una acción
y no se marca activo.
**Deroga:** el centro fijo en Acceso de D-04. Los cinco lugares de la barra siguen.
**Consecuencia:** `r07` y `f01` pasan a colgar de Mi edificio en el mapa `PADRE`.

### D-26 · Los filtros no marcan con amarillo · DISEÑO
`Chips` marca lo elegido con el sólido del texto. Con el primario ya amarillo, un
filtro amarillo al lado no dejaba claro cuál era el botón (§1.2, §15).
**Recorta:** D-05, que permitía amarillo en "elemento seleccionado". Queda para la
acción primaria, la fecha elegida y la señal del día (el pase vigente).

### D-27 · El home es un campo oscuro, en los dos temas · DISEÑO
La parte de arriba del home es una sola superficie carbón con luz cálida y el
isotipo V2 como marca de agua: contiene el header, el estado y los accesos (§1.1,
§4). Es oscura también en tema claro porque el carbón es color de marca y así el
home se lee por bloques antes de leer texto. Referencia: la que mandó Felipe con
la ronda.

### D-28 · Un matiz de ambiente por ámbito de la IA · DISEÑO
El campo atmosférico se tiñe según dónde estás: piedra cálida (Mi edificio),
pizarra (Expensas), atardecer (Reservas), carbón (Acceso), neutro el resto. Son
cuatro ámbitos fijos en tokens, no un color por ruta (§1.2, §1.4, §17).
**Deroga:** el campo tonal único de D-03, que era un solo `linear-gradient`.

### D-29 · `ZonaContexto`: la zona de arriba te dice dónde estás · DISEÑO
Foto del lugar a sangre, o el campo del ámbito con el isotipo casi invisible, con
el volver flotando en vidrio. Reemplaza a `TopBar` + título en Mi edificio (las
tres pestañas) y Expensas. Es la sexta pieza del sistema.
**Recorta:** "cinco componentes, y ninguno más" de `04_COMPONENT_SYSTEM`.

### D-30 · Paleta de data-viz propia, que no es de marca · DISEÑO
Ocho tonos (`--dv-1…8`) de saturación media, separados en matiz. Sólo en
gráficos y leyendas. En la torta, elegir un rubro lo saca del anillo y apaga los
demás; ya no lo pinta de amarillo (§5.6).
**Deroga:** la escala de grises de los rubros.

### D-31 · Botones en tres niveles · DISEÑO
Primario amarillo sólido (`.entrar`), secundario sólido o vidrio sobre foto
(`.btn-sec`), terciario texto subrayado (`.btn-ter`). Una sola acción primaria por
pantalla (§15).
**Deroga:** `.entrar` como contorno.

### D-32 · Glass sólo cuando hay algo detrás · DISEÑO
Sobre foto, sobre el campo oscuro del home, en la barra y en las hojas (§1.5).
**Deroga:** el tono `sobrio` de `BotonGlass` sobre el crema (D-18) y parte de D-06:
Administración y Recepción dejan de llevar el botón firma y pasan a ser un acceso
más, "Contactar" (§2).

### D-33 · Calendario: carrusel de meses, marca chica · REQUISITO (ronda visual 01, §9)
Lo eligió Felipe: la grilla de mes queda (D-08), sin la caja. Los meses se deslizan
con scroll nativo y los vecinos asoman desvanecidos. El día elegido lleva una marca
del tamaño del número, no el círculo que ocupaba la celda. Elegir un día abre una
**hoja** con los horarios y la confirmación: la pantalla ya no crece.
**Revisa:** D-08 ("círculo sólido", "los horarios aparecen después" abajo).

### D-34 · Pagar sale del centro de la barra · REQUISITO (lock V02)
Lo decidió Felipe: la barra no repite una acción que la pantalla ya muestra. El
centro dinámico va por Pase → Retirar → Reserva → Acceso. Pagar vive en el home y
en la expensa como acción de contexto.
**Revisa:** D-25. **Cierra:** Q-06.

### D-35 · Calendario: un mes, flechas y gesto simple · REQUISITO (lock V02)
Sin carrusel ni scroll nativo: se trababa (A2). Grilla limpia, flechas y un
arrastre horizontal que cambia de mes pasados 60 px.
**Revisa:** D-33 (el carrusel). La marca chica y la hoja de horarios siguen.

### D-36 · "Ver composición" abre gráfico + rubros · REQUISITO (lock V02)
La expensa (R20) queda en su primer nivel: monto, vencimiento, estado, Pagar, Ver
composición, Ver movimientos. La composición es R21 con la torta a la vista y cada
rubro como acordeón con el color de su porción; la torta ya no lleva leyenda
propia. Estado de cuenta: el saldo arriba y movimientos en una línea.
**Decisión de diseño:** tu parte (comunes, propios, total y cupón) va al final de
R21. Si Felipe la quiere en la expensa, es una tabla de tres filas.

### D-37 · Reservar en cinco pasos y éxito mínimo · REQUISITO (lock V02)
espacio → día → hoja de horarios → confirmar → éxito → volver. Las cards de
espacios salen de R05 (repetían el selector) y viven en Mi edificio · Espacios.
Confirmar es un botón: la reserva se cancela desde Mis reservas, no es
irreversible (D-10). Las normas van plegadas. El éxito es "Reserva confirmada",
espacio, día y hora, [Listo] y [Ver reserva].

### D-38 · Home: la expensa, tres accesos y lo de hoy · REQUISITO (lock V02)
El widget muestra una sola cara, la expensa: es la situación que no apila (D-09) y
el orden sigue fijo (D-14). Las caras de visitas, entregas y reservas repetían la
pila y salieron. Con una sola cara no hay pestañas. Tres accesos: Autorizar,
Reclamar, Reservar; "Contactar" salió porque los contactos están en Mi edificio.
**Cierra:** Q-07. **Revisa:** el widget de cuatro caras de la ronda visual 01 (§4).

### D-39 · Formularios: lo esencial a la vista, lo opcional plegado · REQUISITO (lock V02)
F01 muestra nombre, día y horario. Documento, tipo, "se repite" y la nota van en
"Más datos", un acordeón que resume lo elegido y se abre solo si hay un error
adentro. El deslizar sigue al final: emitir el pase es lo irreversible (D-10).

### D-40 · Foto sólo donde hay un lugar; la plata en superficie tonal · REQUISITO (lock V02)
Lo pidió Felipe: pulir no es poner foto en todas partes. Foto para el edificio, los
espacios, el hall de visitas y la fachada. Expensa, composición, estado de cuenta,
medios e informar pago van en el campo tonal de su ámbito. La foto de la zona de
contexto lleva un desenfoque moderado (3 px). El sistema completo queda en
`10_VISUAL_LOCK_V02.md`.

---

## Derogadas

| Decisión anterior | Dónde vivía | Qué la reemplaza |
|---|---|---|
| Archivo como tipografía de UI | `LENGUAJE_VISUAL.md` | D-01 |
| Rothek como tipografía de producto | `source/01`, `source/04` | D-01, D-02 |
| Serif de display (Instrument / Fraunces) | `LENGUAJE_VISUAL.md` | D-01 |
| Trama de hairlines a 31° en el fondo | `LENGUAJE_VISUAL.md`, `PROMPT_02` | D-03 |
| Cuatro destinos en la barra | `source/00_MASTER_UI_SYSTEM_LOCK.md` | D-04 |
| Amarillo en navegación activa | `LENGUAJE_VISUAL.md`, `source/01` | D-05 |
| `.circulo` como elemento firma | `LENGUAJE_VISUAL.md` | D-06 |
| Destino "Mi unidad" | `PillNav.tsx` | D-07 |
| Tira de 14 días en R05 | `R05.tsx`, `docs/_historia/PROMPT_FASE_RESERVAS.md` | D-08 |
| Swipe para autorizar visita | `R06.tsx` | D-10 |
| Búsqueda global con índice | `source/01` §5 | D-13 |
| Home que se reordena por contexto | spec de arquitectura §26 | D-14 |
| Centro fijo en Acceso | D-04 | D-25 |
| Amarillo en el filtro elegido | D-05, `Chips` | D-26 |
| Campo tonal de un solo `linear-gradient` | D-03 | D-28 |
| Rubros en escala de grises | `Torta.tsx` | D-30 |
| `.entrar` como contorno | `globals.css` | D-31 |
| `BotonGlass` tono `sobrio` sobre crema; botón firma en Administración y Recepción | D-18, D-06 | D-32 |
| Círculo sólido en el día elegido; horarios abajo del calendario | D-08 | D-33 |
| Pagar en el centro de la barra | D-25 | D-34 |
| Carrusel de meses con scroll nativo | D-33 | D-35 |
| Composición en paneles debajo de la expensa; leyenda de la torta | `R20.tsx`, `Torta.tsx` | D-36 |
| Cards de espacios en Reservas; deslizar para confirmar la reserva | `R05.tsx` | D-37 |
| Widget del home con cuatro caras; acceso "Contactar" | `R01.tsx`, `WidgetPrincipal.tsx` | D-38 |

---

## Preguntas abiertas

**Q-05 · Foto de la lavandería.** No hay una en el repo: `lib/data.ts` le asigna la
del cowork, que es otro lugar. Mientras no llegue, la lavandería va en carbón con
su ícono. **No bloquea.**

**Q-06 · "Pagar" dos veces en el home.** **Cerrada por D-34:** Pagar salió del
centro de la barra.

**Q-07 · El widget y la pila cuentan lo mismo.** **Cerrada por D-38:** el widget quedó con la expensa.

**Q-01 · "El mockup con la cámara".** Felipe marcó que el bloque negro del home es
enorme y agregó "tendríamos que hacer el mockup con la cámara correctamente".
No está claro si se refiere al marco del teléfono del escenario o a algo dentro de
la pantalla. **No bloquea:** la decisión de achicar el bloque (D-15) se aplica igual.

**Q-02 · El gradiente de "vence en 25 días".** Felipe lo describió sin decir si le
gusta. **No bloquea:** queda como está hasta que lo defina.

## Preguntas cerradas durante esta reconciliación

**Q-03 · Qué imagen va en "Visitas hoy" — CERRADA, y era más grande de lo que
parecía.** No era un archivo: eran **ocho**. `visitas_fondo.jpg` tenía el isotipo
blanco quemado, y `hero_araoz.jpg` más las tres fotos de espacios con sus tres
miniaturas tenían la mancha amarilla de marca en el cielo. Los ocho se
reencuadraron desde la toma original, por debajo de la marca, verificando por
píxel que no quedara rastro. El recorte de `hero_lobby.jpg` que proponía esta
misma nota **no servía**: 414 px de ancho para un hueco que pide 700 es estirar
la foto. Salieron todos de `edificio.jpg` y de los `esp_*.jpg`, a resolución
nativa.

Texto original de la nota, para que se entienda de dónde salió:
R01 línea 136 usa `public/img/visitas_fondo.jpg` (780×212), que **tiene el isotipo
de CondoTrack incrustado en la imagen**: esa forma blanca curva atravesando el
render es la marca, quemada en el JPG. Por eso se lee como "una imagen random".
El propio `LENGUAJE_VISUAL.md` ya advertía que los packs de assets "traen la marca
y formas amarillas incrustadas: no sirven como fondo limpio"; se usó uno igual.
**Fix:** recortar `public/img/hero_lobby.jpg` a 780×212 y usar ese. El otro
candidato del repo, `visitas_bg.jpg`, es una textura de follaje desenfocado en
645×546 — relación equivocada y sin relación con visitas.

**Q-04 · Cuál es el logo correcto en R01 — CERRADA por inspección.**
R01 línea 54 usa `/brand/CT_SYMBOL_PRIMARY_TRANSPARENT.svg`, que es el símbolo
**V1**. Los assets aprobados son `CT_LOGO_LIGHT_V2.png` y `CT_LOGO_DARK_V2.png`
(y `CT_APPICON_V2.png` para el ícono). Hay que cambiar la referencia y respetar
el tema.
