# CondoTrack — Lenguaje visual

Qué es cada superficie y por qué. Si algo de acá no coincide con
`app/globals.css`, gana el CSS: esa hoja es la fuente de verdad.

> **Reconciliado el 17/09/2026.** Este documento tenía cinco puntos vencidos.
> La autoridad es `docs/ux/02_DECISION_LOG.md`; empezá por
> `docs/ux/00_CONTEXT_INDEX.md`.

---

## Tipografía · D-01

Una sola familia: **Satoshi** (Fontshare / Indian Type Foundry), por CDN mientras
dure el prototipo.

| Peso | Dónde |
|---|---|
| 400 | cuerpo, metadatos, texto secundario |
| 500 | labels, navegación, filtros, ítems de lista |
| 700 | botones, titulares, datos importantes |
| 900 | importes y cifras grandes |

**Satoshi no tiene 600 ni 800.** Si escribís uno, el navegador lo resuelve a 700 y
la jerarquía se rompe. Tampoco tiene eje de ancho: `--display-ancho` es `normal` y
`font-stretch` no hace nada.

Una única regla en `globals.css` reparte la display; cambiar la tipografía del
proyecto entero sigue siendo dos líneas.

Rothek está **retirada de la interfaz** (D-02): el paquete recibido son archivos
trial de 66 glifos, sin acentos ni dos puntos, y los dos pesos licenciados
—ExtraLight y Bold Italic— no incluyen peso de cuerpo. Queda en el wordmark, que
ya es vectorial.

~~Archivo con `--display-ancho: 118%`~~ · ~~Instrument Serif / Fraunces como
display~~ — derogados por D-01.

---

## Los cuatro materiales

La superficie se elige por lo que la cosa **es**, no por costumbre. Si tres
elementos seguidos usan el mismo material, algo está mal jerarquizado.

### Vidrio — contenido vivo
Expensa, próxima reserva, paquete, reserva, chips, paneles, perfil, reclamo.

Translúcido con `backdrop-filter`. El filo **no es un borde plano**: es un
gradiente de 1px dibujado con máscara (`--vidrio-filo`), claro arriba y nada
abajo, más un brillo especular finito en el canto superior. Eso es lo que hace
que se lea como material y no como caja con borde.

### Carbón — dato duro y jerárquico
Visitas de hoy, el pase QR, la tarjeta de visita vigente. Clase `.mat-carbon`.
Fondo carbón, tipografía clara, **un solo acento**.

### Plano — filas de lista y menús
Menús, notificaciones, tablas, accesos rápidos. Bloque único, sin sombra,
separadores de 1px. Es la mayoría de la interfaz y está bien que lo sea.

### Foto — lugares, y nunca datos
Espacios reservables, edificio, amenities. Clase `.mat-foto`.

**La foto es la card**: ocupa el bloque entero con el radio del bloque y el
texto va encima, sobre un degradado que arranca abajo. Nada de contenedor
blanco con una foto chica adentro — esa era la razón número uno de que las
cards se leyeran como template.

---

## El botón firma · D-06

El **botón glass con flecha** —el de "Visitas hoy"— es el elemento firma. Se usa en
toda acción de peso: Autorizar visita, Hacer reclamo, Reservar espacio,
Administración, Recepción y el botón de volver.

`.circulo` **se queda** para acciones secundarias: 48 px, filo de 1px, ícono
centrado, sin relleno. Volver, cerrar, compartir, filtrar, el perfil del header.
- `.circulo.claro` — sobre foto o sobre carbón.
- `.circulo.lleno` — amarillo. La única acción principal de la pantalla.
- `.flech` — misma familia, más chica, para el fin de una fila.

Conviven: no cumplen el mismo rol. Lo que cambió es cuál de los dos es la firma.

---

## El amarillo

Acento, no ambiente. Aparece en:

1. la acción primaria,
2. el elemento seleccionado, incluida la fecha seleccionada,
3. una sola señal por pantalla.

**No marca el destino activo de la navegación** (D-05): eso va con peso
tipográfico y color sólido.

En ningún otro lado. En particular **no vuelve al fondo de pantalla**: se sacó
porque confundía qué era botón y qué no.

---

## El fondo · D-03

**Campo tonal ambiental**, anclado arriba: color suave en la zona del header que se
disuelve hacia el fondo cálido antes de la mitad de la pantalla. En oscuro, la
profundidad se hace con negros.

El amarillo `#F5E500` no vuelve a ser fondo.

~~Dos planos arquitectónicos cortados en diagonal~~ · ~~trama de hairlines a 31°~~
— **derogados y borrados** en la fase 0. Hoy el campo son tres tokens
(`--campo-alto`, `--campo-medio`, `--campo-bajo`) resueltos en los tres estados
de tema: muere en transparente al 47% de la pantalla, y al 37% en escritorio.

---

## La hoja

Panel que sube desde abajo (`components/ui/Hoja.tsx`). Reemplaza pantallas
enteras donde alcanzaba un panel.

**Va en hoja:** medios de pago, informar un pago, detalle de un rubro, elegir
período, confirmar una reserva, detalle de una entrega, revocar un permiso,
**hacer un reclamo**, los documentos de la expensa y el filtro del historial.

**No va en hoja:** el calendario, la lista de visitas, el detalle de reclamo.
Nada que tenga navegación adentro.

Hace lo que tiene que hacer una hoja: bloquea el scroll del fondo, cierra con
Escape / tocando afuera / arrastrando hacia abajo, atrapa el foco y lo devuelve,
anima entrada y salida, y respeta `prefers-reduced-motion`.

Las vistas que además tienen enlace directo (R22 medios de pago, G11 entrega,
F02 reclamo) comparten el mismo componente de contenido que la hoja: no hay dos
versiones del mismo CBU ni dos formularios de reclamo que validen distinto.

---

## Imágenes

Los derivados de `public/img/` están recortados a la relación y al tamaño del
hueco donde entran, a 2× o 2,5×. Servir una foto de 900 px para un hueco de
124 px es tirar cuarenta veces los píxeles que hacen falta; servir una de
414 px para un hueco que pide 442 px reales la estira y se ve mal.

| Archivo | Tamaño | Para |
|---|---|---|
| `hero_araoz.jpg` | 700×428 | Card del estado del día |
| `visitas_fondo.jpg` | 700×212 | Card de visitas de hoy |
| `esp_*.jpg` | 900×342 | Espacios, a sangre |
| `mini_*.jpg` | 320×201 | Miniatura de próxima reserva |

Los packs `CondoTrack_Visual_Asset_System_20_PNG` y
`CONDOTRACK_ASSETS_UI_MAPPING_V1` traen la marca y formas amarillas
incrustadas: **no sirven como fondo limpio**.

> Esa advertencia se había incumplido en **ocho archivos**, no en uno.
> `visitas_fondo.jpg` tenía el isotipo blanco quemado; `hero_araoz.jpg` y las tres
> fotos de espacios con sus tres miniaturas tenían la mancha amarilla de marca en
> el cielo. Los ocho se reencuadraron en la fase 3, por debajo de la marca,
> verificando por píxel que no quedara nada. **Antes de usar un asset de los packs,
> miralo**: la marca está adentro del JPG, no al lado.

---

## Modo oscuro

Cada color sale de un token. Las únicas excepciones son deliberadas y valen en
los dos temas: los gradientes del material Carbón, el velo del material Foto y
el blanco translúcido de `.circulo.claro`, que siempre van sobre superficies
oscuras.
