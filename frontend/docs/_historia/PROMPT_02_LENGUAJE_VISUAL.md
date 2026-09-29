# CondoTrack — Pasada de lenguaje visual

> Pegá esto en Claude Code parado en `E:\- DISEÑO WEB\CondoTrack\condotrack-app`,
> **antes** de seguir con `SUPER_PROMPT_CONDOTRACK.md`. Esto es una pasada de diseño
> sobre lo que ya existe; ese otro prompt agrega pantallas nuevas.

---

## El diagnóstico, en una frase

**Las cards no tienen personalidad. Está todo "diseñado así" — no hay un lenguaje
propio.** Hay un sistema de tokens correcto y aplicado, pero el resultado se lee como
cualquier app: rectángulo blanco, radio, sombra, repetir. Falta que CondoTrack se
vea como CondoTrack y no como un template.

Esta pasada no es agregar decoración. Es **darle una gramática a las superficies**:
que cada tipo de card se distinga de las otras por razones que el usuario entiende,
y que el fondo deje de ser un vacío crema.

**Ojo con el péndulo.** En la pasada anterior se pidió sobriedad y se aplanó todo.
Sobrio no es genérico. La corrección de ahora es hacia **carácter**, no hacia ruido:
el amarillo no vuelve a inundar nada, los degradés no vuelven al fondo de pantalla.
Lo que cambia es el **material** de las superficies y la **tipografía**, no la
cantidad de color.

---

## La referencia que mandaste — qué tomo y qué no

Llegaron dos imágenes de una app de club de tenis, sin texto. Las leo como respuesta
directa a la frase de arriba: eso **sí** tiene lenguaje propio. Vale la pena nombrar
por qué, porque no es el estilo lo que hay que copiar, son tres decisiones
estructurales.

**Lo que hay que tomar:**

1. **La foto _es_ la card, no está dentro de la card.** En la referencia la imagen
   ocupa el bloque entero, con el radio de la card, y el texto va encima con un velo.
   Hoy CondoTrack hace lo contrario: contenedor blanco → padding → foto chica adentro.
   Esa es la razón número uno de que las cards se lean como template. Cambiar esto
   vale más que cualquier ajuste de sombra.

2. **Una tipografía de display con carácter real, contra una de interfaz neutra.**
   La referencia usa una display con personalidad para los títulos y una grotesca
   plana para todo lo demás. El contraste entre las dos ES la identidad. Una sola
   familia en dos pesos nunca va a producir eso.

3. **El botón circular grande como elemento firma.** Íconos en círculos generosos,
   repetidos en toda la app, siempre del mismo tamaño y con el mismo tratamiento.
   Es barato de implementar y es lo que hace que pantallas distintas se sientan de
   la misma app.

**Lo que NO hay que tomar:**

- La tipografía script / manuscrita de la referencia. Es un club deportivo; esto es
  administración de consorcios, con plata y responsabilidades adentro. Una display
  con carácter, sí; una display simpática, no.
- El apilado de cards con gesto. Es lindo y esconde información. Acá la información
  tiene que estar a la vista.
- La saturación de las fotos. Las de CondoTrack van desaturadas, como ya están.

> **Estado:** esto es una **hipótesis de lectura** — las imágenes llegaron sin texto.
> Si la intención era otra (por ejemplo el layout, y no el material), decilo y se
> corrige antes de tocar código.

---

## 1. Tipografía — hay que cambiarla

Inter está haciendo de tipografía neutra y no aporta nada. Cambiala a **Archivo**,
que es Google Fonts, es una grotesca de linaje suizo, y tiene una variante ancha que
le da carácter real a los titulares sin perder neutralidad en el cuerpo.

```
Display / titulares grandes / números:  Archivo Expanded, 600–700
Interfaz / cuerpo / metadatos:          Archivo, 400 / 500 / 600
```

- Cargá ambas desde Google Fonts en `app/layout.tsx`.
- En `app/globals.css`, `--ff-ui` pasa a `Archivo` y sumá `--ff-display` con
  `Archivo Expanded`. Que **todo** salga de esos dos tokens: cambiar la tipografía
  del archivo entero tiene que seguir siendo una línea.
- Aplicá display en: el importe de la expensa, el "02" de visitas, los titulares de
  pantalla y los números del calendario. El resto va en Archivo normal.
- Actualizá `design/tokens.json` para que no se separe del código.

**Rothek no se usa en interfaz**: la familia está incompleta. Queda solo en el
wordmark, que ya es imagen vectorizada.

**Sobre cuánto carácter darle a la display.** Archivo Expanded es la opción segura:
ancha, suiza, se banca números grandes. Pero es la misma familia que el cuerpo, y por
eso el contraste que tiene la referencia no va a aparecer solo. Dos caminos, elegí
uno y dejalo escrito:

| | Display | Interfaz | Qué produce |
|---|---|---|---|
| **A — seguro** | Archivo Expanded 600–700 | Archivo 400–600 | Suizo, ordenado, poca personalidad |
| **B — con carácter** | Instrument Serif / Fraunces (Google Fonts) | Archivo 400–600 | Contraste real serif/grotesca, más cerca de la referencia |

Si vas por **B**, la serif se usa **solo** en titulares de pantalla y en el importe
de la expensa. Nunca en metadatos, nunca en botones, nunca en tablas. Un mal uso de
una serif de display arruina más de lo que una grotesca aburrida puede arruinar.

**Implementá A.** B queda como decisión abierta para Felipe: el cambio son dos líneas
si los tokens `--ff-ui` / `--ff-display` están bien hechos, y esa es justamente la
razón de hacerlos bien.

---

## 2. El material de las superficies — el corazón de esta pasada

Definí **tres materiales** y usalos por rol, no por costumbre. Que se distingan entre
sí a simple vista, sin leer el contenido.

**Vidrio** — para las cards de contenido vivo: expensa, visitas, reservas.
Superficie translúcida real con `backdrop-filter: blur()`, borde de 1px con un
gradiente sutil de claro arriba a transparente abajo (no un borde blanco plano), y
un brillo especular interno finito en el borde superior. Tiene que verse que hay algo
detrás: por eso el fondo de la pantalla importa (punto 3).

**Sólido carbón** — para lo que es dato duro y jerárquico: la tarjeta de visitas,
el pase. Fondo carbón, tipografía clara, y un solo acento.

**Plano** — para filas de lista y menús. Sin sombra, separadas por una línea de 1px.
La mayoría de la interfaz es esto, y está bien que lo sea.

**Foto** — para todo lo que representa un **lugar**: los espacios reservables, el
edificio, las amenities. Acá va la lección de la referencia: la foto ocupa la card
entera con el radio de la card, y el texto va **encima**, sobre un degradado de negro
a transparente que arranca abajo. Nada de foto chica adentro de un contenedor blanco.
Este material no se usa nunca para datos —solo para lugares.

**La regla:** si tres elementos seguidos usan el mismo material, algo está mal
jerarquizado. El material comunica qué tipo de cosa es.

**Un elemento firma: el botón circular.** Definí un solo `.circulo` —48px, borde de
1px, ícono centrado, sin relleno— y usalo para toda acción secundaria en toda la app:
volver, cerrar, compartir, filtrar, el perfil en el header. Mismo tamaño siempre.
Es lo más barato que podés hacer para que pantallas distintas se lean como la misma
app, y es la mitad de por qué la referencia se siente coherente.

---

## 3. El fondo tiene que ser interesante

Hoy el fondo es crema plano. Eso es lo que hace que el vidrio no se lea como vidrio:
no hay nada que refractar.

Construí un fondo con **profundidad pero sin color**: una malla de grises muy cercanos
al fondo, con una diagonal o una geometría arquitectónica apenas perceptible que
remita al lenguaje del isotipo y de las fotos del edificio. Contraste bajísimo —
tiene que notarse cuando lo mirás, no cuando lo escaneás.

**No vuelvas al amarillo de fondo.** Eso ya se sacó y se saca por una razón: confundía
qué era botón y qué no.

En modo oscuro, el mismo fondo pero con la profundidad hecha con negros, no con grises
levantados.

---

## 4. R01 Home — formato sándwich

El orden actual está aprobado en `referencias/R01_LAYOUT_APROBADO.png`, pero hay que
reorganizar la jerarquía según esto: **primero lo que el usuario hace, después la
decoración.**

**Estructura sándwich:** una franja superior con más peso visual —color, material o
ambos— que contiene el saludo, el contexto de la unidad y el perfil. Ahí también va
**el isotipo de CondoTrack**: el símbolo solo alcanza, no hace falta el lockup entero.
El cuerpo respira claro. El pie es la pill nav, que ya está.

**Orden del contenido, de arriba hacia abajo:**

1. Header con color — saludo, edificio · unidad, isotipo, perfil
2. **Expensa del mes** — es lo primero. Importe grande en display, período,
   vencimiento, estado. Con íconos por rubro que anticipen el desglose, y acceso
   directo al detalle de gastos.
3. **Accesos rápidos** — autorizar visita, reclamo, reservar. Son lo que el usuario
   hace: van arriba, no abajo.
4. **Visitas de hoy** — la tarjeta carbón. El "1 pase vigente" de abajo **hoy no
   funciona**: es una barra amarilla pegada que no se entiende si es parte de la card
   o un botón aparte. Resolvelo: o se integra dentro de la tarjeta como una fila con
   su propio contorno, o desaparece y el pase vive en Mi unidad.
5. **Todo en orden / hero** — baja de posición. Es contexto, no acción.
6. Para hoy: próxima reserva y paquete para retirar.

### Bug
**La imagen de la primera card no carga bien.** Revisá el `object-fit`, el
`object-position` y el tamaño real del archivo contra el contenedor.

---

## 5. Paneles que suben desde abajo — el patrón que falta

Mucho de lo que hoy es una pantalla entera no necesita serlo. Creá un componente
**`Hoja`** (bottom sheet): un panel que sube desde abajo, con el fondo detrás
atenuado, que se cierra deslizando hacia abajo o tocando afuera.

**Va en hoja:** medios de pago, informar un pago, ver el detalle de un rubro, elegir
período, confirmar una reserva, ver quién tiene permiso de entrar, detalle de una
entrega.

**No va en hoja:** el calendario, la lista de visitas, el detalle de reclamo, nada
que tenga navegación adentro.

Requisitos: bloquear el scroll del fondo, cerrar con Escape, foco atrapado adentro
mientras está abierta, y animación de entrada y salida. Sin librerías.

**Auditá y simplificá** todo lo que hoy es una pantalla y debería ser una hoja.
Menos pantallas, menos navegación, menos vuelta.

---

## 6. Reservas — el calendario es la pantalla

Hoy el calendario es una tira chica perdida entre otras cosas. Invertilo.

**El calendario ocupa la parte superior de la pantalla y es lo primero que ves.**
Grande, cómodo para el dedo. Vista de mes o de dos semanas, deslizable
horizontalmente con animación real, con los días marcados según disponibilidad.

**Los horarios aparecen después de elegir el día**, no antes. Hoy están siempre
visibles y por eso todo se siente chico y apretado. Elegís el día → los horarios
entran con una transición → elegís la franja → sube la hoja de confirmación.

**Cada reserva dice quién la reservó.** Unidad y nombre. Es un edificio: saber que
el SUM lo tiene la unidad 2A el sábado es información, no ruido.

**Los botones de SUM, Cowork y Parrilla están toscos y sin diseño.** Rehacelos con
el material **Foto** del punto 2: la imagen ocupa la card completa, y encima van el
nombre, el piso y la disponibilidad de hoy sobre el degradado. Sin contenedor blanco,
sin padding alrededor de la imagen. Van **abajo del calendario**, como exploración,
no como paso obligatorio.

Mantené el modelo `Espacio → Recurso → Franja` y las reglas que ya están en
`lib/reservas.ts`. La lavandería reserva máquina.

---

## 7. Onboarding — un ajuste

**El modo claro tiene demasiado fade.** La foto se desvanece antes de tiempo y queda
lavada. Subí el punto donde arranca el degradado y bajá la opacidad del velo. En
oscuro está bien.

---

## 8. Notificaciones y Más

- **La expensa del mes también aparece en notificaciones** cuando se emite y cuando
  está por vencer.
- En **Más**, sumá **Estado de cuenta**.

---

## Restricciones

- **Ninguna librería nueva.** Ni de animación, ni de UI, ni de fechas. Todo con CSS
  y JavaScript propio.
- **No rompas el build.** Corré `npm run build` antes de terminar.
- **Modo oscuro tiene que seguir funcionando** en todo lo que toques. Cada color sale
  de un token, nunca de un literal que solo sirve en un tema.
- **Accesibilidad:** foco visible, navegación por teclado, `prefers-reduced-motion`
  respetado —pero que apague lo decorativo, no el feedback funcional como el relleno
  del swipe.
- **Español rioplatense**, voseo.
- El layout aprobado de `referencias/R01_LAYOUT_APROBADO.png` sigue siendo la
  referencia de **orden y proporción**. Lo que cambia en esta pasada es el material,
  la tipografía y la jerarquía — no la estructura.

## Entrega

Un commit por sección. Al final: qué cambió, en qué URL se ve cada cosa, y las
decisiones que tomaste separadas en **requisito confirmado / decisión de diseño /
hipótesis / pregunta abierta**.

Si algo de acá contradice un documento del proyecto o el layout aprobado, **decilo**
en vez de resolverlo en silencio.
