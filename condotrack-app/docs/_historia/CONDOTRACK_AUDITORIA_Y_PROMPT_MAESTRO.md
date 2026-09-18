# CondoTrack — Auditoría cerrada y prompt maestro de implementación

> **Qué es esto.** El resultado de auditar el repositorio real, los seis documentos del
> research pack, las referencias visuales y todo lo marcado en las rondas anteriores.
> Termina en un prompt maestro (sección H) listo para pegar en Claude Code.
>
> **Yo no ejecuto ese prompt.** Esta pasada es de análisis y no toca más código.
>
> Repo auditado: `E:\- DISEÑO WEB\CondoTrack\condotrack-app` · commit `856dfc7`
> Fecha: 17/09/2026

---

# A. Estado actual real del proyecto

## A.1 Stack

| | |
|---|---|
| Framework | Next.js **14.2.35**, App Router |
| React / TS | 18.3.1 / 5.5.4 |
| Dependencias de runtime | **tres**: next, react, react-dom |
| Tailwind | no existe |
| Librerías de UI, estado, fechas o gráficos | **ninguna** |
| Persistencia | ninguna — todo mock en `lib/` |

Esto es una restricción deliberada y **no se toca**. El gráfico de torta ya está
resuelto a mano en `components/ui/Torta.tsx`; el calendario, a mano en `lib/reservas.ts`.

## A.2 Estructura real

```
app/
  layout.tsx       ← carga de fuentes (hoy Satoshi vía Fontshare)
  page.tsx
  globals.css      1.891 líneas · 120 KB · ÚNICA fuente de verdad visual
components/
  Prototipo.tsx    escenario, deep links (?p= ?v= &tema= &limpio=)
  ShellResidente.tsx / ShellRecepcion.tsx / ShellAdmin.tsx
  Login.tsx  Onboarding.tsx  Carga.tsx  Recuperar.tsx  Pendiente.tsx
  ui/          16 componentes compartidos
  screens/     27 pantallas
  paneles/     2
  recepcion/   7 (P01–P05, P07, P08)
lib/           8 módulos: data, edificio, estado, expensas, formato,
               gestiones, reservas, unidad
public/        brand/ · fonts/ · img/
design/        tokens.json
referencias/   R01_LAYOUT_APROBADO.png
```

## A.3 Componentes compartidos existentes — **reutilizar, no duplicar**

`components/ui/`: **Chips, Descarga, Estados, FinLista, Formulario, Hoja, Icon,
Linea, Panel, PillNav, Sello, SwipeButton, TemaToggle, TopBar, Torta, Vacio**

Los cuatro que importan para esta pasada:

- **`Hoja.tsx`** — el bottom sheet ya existe y funciona. Todo lo que "tiene que
  subir desde abajo" usa este componente. No crear otro.
- **`PillNav.tsx`** — la navegación inferior. Hoy **4 destinos**: Inicio, Mi unidad,
  Reservas, Más. Tiene un mapa `PADRE` que ilumina el destino padre de cada vista de
  segundo nivel. Ese mapa hay que extenderlo, no reemplazarlo.
- **`Torta.tsx`** — el gráfico de torta ya está implementado.
- **`Vacio.tsx`** — estados vacíos ya tienen componente.

## A.4 Sistema visual

- Tokens en `:root` de `globals.css`, con tres estados de tema: claro,
  `@media (prefers-color-scheme: dark)` guardado por `:root:not([data-tema="claro"])`,
  y `:root[data-tema="oscuro"]`.
- Tipografía: **Satoshi** (Fontshare CDN), pesos 400/500/700/900.
  Ya aplicado y verificado. `--ff-ui` y `--ff-display` apuntan a Satoshi.
- Materiales: `.vidrio` y `.humo` con `backdrop-filter`.
- El reparto de la cara display está centralizado en un único bloque de
  `globals.css` (~línea 200): un solo lugar decide qué usa `--ff-display`.

## A.5 Estado tipográfico — cerrado

| | |
|---|---|
| Familia de producto | **Satoshi**, Fontshare / Indian Type Foundry |
| Carga | `<link>` a `api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900` |
| 400 | cuerpo, metadatos, texto secundario |
| 500 | labels, navegación, filtros, ítems de lista |
| 700 | botones, titulares, datos importantes |
| 900 | importes y cifras grandes (5 usos) |
| Rothek | **retirada de la interfaz.** Queda el logo como asset vectorial |
| Archivo | eliminada |

Ya se remapearon las 70 declaraciones en peso 600 —que Satoshi no tiene— a 500 o 700
según rol, y se aflojó 0,01em el tracking de 12 titulares que estaba calibrado para
Archivo estirada al 118%.

**Deuda abierta:** quedan `rothek-extralight.otf` y `rothek-bolditalic.otf` en
`public/fonts/`. Están desenlazados del CSS pero siguen siendo descargables desde el
deploy, lo cual incumple la cláusula 2a del Web Font EULA de Fontspring. **Hay que
borrarlos.**

---

# B. Problemas detectados

Clasificados como pide el pack: **BUG · VISUAL · COMPONENTE COMPARTIDO ·
MODELO/PRODUCTO · FUERA DE MVP**.

## B.1 Bugs

| # | Qué pasa | Dónde | Tipo |
|---|---|---|---|
| **BUG-01** | Elegir el 15/9 en el calendario no habilita nada | R05 | BUG |
| **BUG-02** | Volver desde el historial va a `R07` en vez de a la pantalla anterior | R17 | BUG |
| **BUG-03** | Volver desde Reglamento va al panel central, no a configuración | Más → Reglamento | BUG |
| **BUG-04** | "Espacios del edificio" no abre | Administración | BUG |
| **BUG-05** | Categoría de reclamo es obligatoria y bloquea el envío | Reclamos | BUG |
| **BUG-06** | El logo del banner superior no es el lockup correcto | R01 | BUG |
| **BUG-07** | "Visitas hoy" usa una imagen de fondo que no corresponde | R01 | BUG |
| **BUG-08** | Card "Todo en orden" rota: el velo tiene radio propio que no coincide con el de la card, el texto se desborda sobre la foto y la foto no llega al borde | R01 | BUG |

El pack menciona además que R20 se cuelga al desplegar el detalle de gastos y que el
selector de días de R06 no responde. **No pude reproducirlos** (ver F).

## B.2 Deuda visual

| # | Qué | Tipo |
|---|---|---|
| **VIS-01** | Diagonales de fondo: `repeating-linear-gradient(121deg, …)` en `globals.css` **líneas 247 y 261**. Es la trama de hairlines a 31°. **Fuera.** | VISUAL |
| **VIS-02** | Titulares sobredimensionados en toda la app | VISUAL |
| **VIS-03** | El bloque negro del home es enorme y molesta | VISUAL |
| **VIS-04** | La card de expensa mezcla dos tratamientos tipográficos y no está bien dividida | VISUAL |
| **VIS-05** | "Para hoy · Próxima reserva" ocupa demasiado espacio | VISUAL |
| **VIS-06** | La barra inferior es demasiado alta | VISUAL |
| **VIS-07** | R17: el header de organización es ilegible, los filtros son molestos | VISUAL |
| **VIS-08** | R20 muestra toda la contabilidad de una vez | VISUAL |
| **VIS-09** | Onboarding en modo claro: el fade arranca demasiado arriba y lava la foto | VISUAL |
| **VIS-10** | Las cards no tienen personalidad: la foto está *dentro* del contenedor blanco en vez de *ser* la card | VISUAL |

## B.3 Componentes compartidos a tocar una sola vez

| # | Qué | Archivo |
|---|---|---|
| **COMP-01** | La barra inferior pasa de 4 a 5 destinos con acción central | `ui/PillNav.tsx` |
| **COMP-02** | Botón glass con flecha — hoy solo vive en "Visitas hoy", tiene que ser componente y usarse en todas las acciones secundarias y en volver | nuevo `ui/BotonGlass.tsx` |
| **COMP-03** | Card con foto a sangre + degradado de texto — hoy cada pantalla lo resuelve distinto | nuevo `ui/CardFoto.tsx` |
| **COMP-04** | Primary Context Widget con tabs | nuevo `ui/WidgetPrincipal.tsx` |
| **COMP-05** | Stack de live cards | nuevo `ui/PilaVivas.tsx` |
| **COMP-06** | Todo lo que abre desde abajo tiene que usar `ui/Hoja.tsx` | existente |
| **COMP-07** | Campo de búsqueda compacto, sin motor | nuevo `ui/BuscarEntrada.tsx` |

## B.4 Modelo / producto

| # | Qué | Tipo |
|---|---|---|
| **MOD-01** | El historial dice "Egreso registrado" pero si el residente abre la puerta desde su casa nadie registra ese egreso. El sistema asume que todo pasa por recepción. Hay que separar eventos **registrados** de **declarados** o el historial miente | MODELO |
| **MOD-02** | R02 muestra números de documento sin criterio de permisos | MODELO |
| **MOD-03** | "Mi unidad" y "Edificio" (R02/R07) son ámbitos de permisos distintos y hoy están mezclados en la navegación | MODELO |
| **MOD-04** | El módulo de expensas no existe en ningún documento del proyecto: es una expansión de alcance que debe registrarse en `DECISION_LOG` | MODELO |

## B.5 Fuera de MVP

- Búsqueda global como centro de comandos con índice real.
- Home que se reordena solo según contexto.
- Integración con cámaras del edificio.
- Cobro de amenities en el flujo de reserva.
- Tipos de acceso extra (trabajador, invitado temporal).
- Agregar al calendario del teléfono.

## B.6 Contradicciones detectadas

1. **El pack pide cargar Rothek; la auditoría técnica lo invalidó.** Los 22 archivos de
   `Rothek Font Family.zip` son trial: 66 glifos, sin acentos ni dos puntos, y el campo
   de licencia dice "TRIAL VERSION". Los únicos Rothek licenciados son ExtraLight (200)
   y Bold Italic (700 italic) — no hay peso de cuerpo. **Resuelto: Satoshi.** El punto 12
   de `01_RESEARCH_PROFESIONAL.md` y el punto 1 de la Fase 0 de
   `04_PROMPT_CLAUDE_CODE_IMPLEMENTACION.md` quedan superados.
2. **`PROMPT_02_LENGUAJE_VISUAL.md` pide una "geometría arquitectónica apenas
   perceptible" en el fondo.** Eso produjo las diagonales que hay que sacar. Ese
   documento queda **derogado** por este.
3. **El pack propone fusionar unidad y edificio en "Mi edificio".** La IA aprobada
   (`05_INFORMATION_ARCHITECTURE`) las separa. Resuelto abajo (C.4).
4. **El pack propone amarillo para "navegación activa".** La pasada de sobriedad lo
   sacó justamente de ahí. Resuelto abajo (C.12).
5. **`00_MASTER_UI_SYSTEM_LOCK.md` fija cuatro destinos en la barra.** Pasamos a cinco.
   Es un cambio de IA y va al `DECISION_LOG`.

---

# C. Decisiones UX/UI cerradas

Cada una es **requisito confirmado** salvo donde se indique.

**C.1 · Tipografía.** Satoshi, cuatro pesos por rol. Rothek fuera de la interfaz.
*(cerrado — ver A.5)*

**C.2 · Fondo.** Nada de diagonales ni tramas geométricas. En su lugar, un **campo
tonal ambiental** anclado arriba: color suave en la zona del header que se disuelve
hacia el fondo cálido antes de la mitad de la pantalla. Es lo que hace REF_02 con el
azul y REF_04 con el celeste. En oscuro, el mismo campo hecho con negros.
El amarillo `#F5E500` no vuelve a ser fondo.

**C.3 · Barra inferior: cinco destinos con acción central.**

```
Inicio  ·  Mi edificio  ·  [ ACCESO / QR ]  ·  Reservas  ·  Más
```

De REF_01, tres cosas concretas y solo esas: la barra **flota** —no llega a los bordes,
tiene su propio radio y respira contra el fondo—; la acción central es un **squircle
más ancho que alto**, no un círculo; y los cinco destinos llevan **ícono + label**, con
el activo en sólido oscuro y los inactivos en gris.
El patrón se llama *bottom app bar with docked FAB* (Material 3) o *cradled FAB* (M2).

**C.4 · "Mi edificio" con navegación secundaria.** El destino se llama **Mi edificio**
y adentro tiene `Unidad | Edificio | Documentos`. Se gana el nombre sin perder la
separación de permisos entre lo que es de la unidad y lo que es del consorcio.

**C.5 · Primary Context Widget.** Una card principal en el home con cuatro estados
conmutables por tabs: **Expensas · Visitas · Entregas · Reservas**. Cada estado
responde una sola pregunta. De REF_02: los tabs viven **dentro** del widget, la cifra
grande es la protagonista y no lleva card propia, y debajo van a lo sumo tres datos
chicos en material translúcido.

**C.6 · Apilado de live cards — regla exacta.**
Apilan: **Visitas hoy, Próxima reserva, Paquete para retirar, Estado del edificio.**
No apilan nunca: **expensas, botones, contactos, categorías distintas.**
De REF_04: desfase vertical corto —la card de abajo asoma 20-30px—, no se presiona
para seleccionar, y la animación explica la relación entre objetos equivalentes.

**C.7 · Calendario de R05: grilla de mes, no tira.** Hoy es una tira horizontal de 14
días. Pasa a **grilla de mes completa**, como REF_05: día seleccionado en círculo
sólido, navegación de mes con flechas, y **puntitos bajo los días con disponibilidad**.
Eso reemplaza los textos "hay lugar / quedan pocos / sin lugar", que salen.
Antes de elegir día, una caja con borde marcado:
`Elegí un día del calendario para ver los horarios disponibles.`
Los horarios aparecen recién después. Los espacios (SUM, Cowork, Parrilla, Lavandería)
van **abajo** del calendario, como exploración, con foto a sangre.

**C.8 · Visitas.** "Autorizar visita" deja de ser un deslizador. Es un **botón**:
`Crear nueva visita` → formulario (nombre y apellido, documento, franja horaria) →
revisión → y recién ahí el **slide** para `Autorizar y emitir el pase`. El gesto
irreversible va al final, nunca al principio.

**C.9 · Reclamos.** Categoría **opcional** para el residente al cargar, **obligatoria**
para que administración pueda cerrar el reclamo. El residente no carga fricción y no se
pierde la trazabilidad que el brief pide. El formulario abre desde abajo con `Hoja`.
Falta pantalla de vacío en cerrados y en abiertos.

**C.10 · Búsqueda: stub, sin motor.** Entrada compacta en el header que abre una
pantalla con cinco acciones frecuentes fijas. **No se construye índice.** Se ve, se
entiende, y no se come el sprint.

**C.11 · El home NO se reordena solo.** Orden fijo que ya prioriza lo urgente; cada
módulo aparece únicamente si tiene contenido. El reordenamiento dinámico queda
documentado y postergado: con datos mockeados no se puede validar qué gana cuando pasan
dos cosas a la vez.

**C.12 · Amarillo.** Acción primaria, estado activo y fecha seleccionada. **No** en la
navegación activa: ahí el destino activo se marca con peso tipográfico y color sólido,
como en REF_01.

**C.13 · Glass.** Sí en: navegación, acción central, botón de volver, filtros y
segmented controls, hojas, y algunas live cards. No en: texto largo, historial, listas
densas, ni en todas las cards a la vez.

**C.14 · La foto ES la card.** Cuando una card representa un **lugar** —espacios
reservables, el edificio, amenities— la imagen ocupa el bloque entero con el radio de
la card y el texto va encima sobre un degradado. Nunca foto chica dentro de un
contenedor blanco.

**C.15 · Botón glass firma.** El botón con flecha de "Visitas hoy" se vuelve componente
y se usa en: Autorizar visita, Hacer reclamo, Reservar espacio, Administración,
Recepción y el botón de volver.

**C.16 · Títulos.** Todos los titulares de pantalla bajan de escala. El home no empieza
con un saludo grande: empieza con contexto silencioso (`Aráoz 1280 · Unidad 7D`) y
entra directo al contenido útil.

**C.17 · Desplegables cerrados.** R02 y la card de entregas arrancan colapsados.

## Decisiones abiertas — necesitan a Felipe

| # | Qué falta |
|---|---|
| **OPEN-1** | Qué significó "hacer el mockup con la cámara correctamente" (VIS-03) |
| **OPEN-2** | Si el gradiente de "vence en 25 días" queda, se ajusta o sale |
| **OPEN-3** | Qué imagen va en "Visitas hoy" (BUG-07) |
| **OPEN-4** | Si se borran los `.otf` de Rothek de `public/fonts/` |

---

# D. Arquitectura de componentes recomendada

## D.1 Nuevos componentes compartidos — siete, y ninguno más

```
components/ui/
  BotonGlass.tsx     ← C.15 · una sola definición, tamaño fijo, ícono configurable
  CardFoto.tsx       ← C.14 · foto a sangre + degradado + slot de contenido
  WidgetPrincipal.tsx← C.5  · tabs + panel, crossfade entre estados
  PilaVivas.tsx      ← C.6  · stack de objetos equivalentes
  BuscarEntrada.tsx  ← C.10 · entrada compacta, sin motor
  SubNav.tsx         ← C.4  · navegación secundaria horizontal reutilizable
  CalendarioMes.tsx  ← C.7  · grilla de mes con puntos de disponibilidad
```

`SubNav` se usa en **tres** lugares, y por eso vale la pena: Mi edificio
(`Unidad | Edificio | Documentos`), Reservas (`Espacios | Mis reservas | Historial`) y
Reclamos (`Abiertos | En seguimiento | Cerrados`).

## D.2 Componentes que se modifican

```
ui/PillNav.tsx        → 5 destinos + acción central; extender el mapa PADRE
ui/Hoja.tsx           → sin cambios; pasa a usarse en Reclamos y Medios de pago
components/ShellResidente.tsx → ruteo del nuevo destino Acceso
screens/R01.tsx       → reescritura completa sobre los nuevos componentes
screens/R02.tsx       → absorbe R07 bajo SubNav
screens/R05.tsx       → CalendarioMes + slots + CardFoto para espacios
screens/R06.tsx       → botón en vez de swipe; swipe al final
screens/R17.tsx       → jerarquía y filtros
screens/R20.tsx       → progressive disclosure + Torta bajo demanda
app/globals.css       → tokens de fondo tonal; borrar diagonales (247, 261)
```

## D.3 Jerarquía de toda pantalla — no negociable

```
CONTEXTO → ESTADO / TAREA PRINCIPAL → ACCIONES FRECUENTES
       → CONTENIDO VIVO → DETALLE E HISTORIAL BAJO DEMANDA
```

## D.4 Regla de material

Si tres elementos seguidos usan el mismo material, la jerarquía está mal.
Cuatro materiales, por rol: **vidrio** (contenido vivo), **carbón sólido** (dato duro,
credencial), **foto** (lugares), **plano** (listas y menús — la mayoría de la interfaz).

---

# E. Orden exacto de implementación

Ordenado para minimizar retrabajo: lo que muchos componentes heredan va primero.

| Fase | Qué | Por qué en esta posición |
|---|---|---|
| **0** | Fundaciones: borrar diagonales, campo tonal, bajar escala de títulos, consolidar tokens | Todo lo demás se ve encima de esto |
| **1** | Los 7 componentes compartidos de D.1, **sin cablearlos todavía** | Construirlos después obliga a reescribir pantallas |
| **2** | Shell: PillNav de 5 + acción central Acceso/QR + safe areas + BuscarEntrada | Define el viewport real que tienen las pantallas |
| **3** | Bugs 01 a 08 | Baratos, y sin esto no se puede validar nada visual |
| **4** | R01 home sobre los componentes nuevos | Es la pantalla que más hereda |
| **5** | R05 reservas: CalendarioMes + slots + espacios | La más importante del producto |
| **6** | R06 visitas: botón, formulario, slide final | |
| **7** | R20 expensas: resumen → composición → torta bajo demanda | |
| **8** | R02 Mi edificio con SubNav, absorbiendo R07 | Cambio de IA; conviene con el shell ya estable |
| **9** | R17 historial: jerarquía y filtros | |
| **10** | Estados vacíos, de carga y de error en todo lo tocado | |
| **11** | Motion y pulido | Último: animar algo que todavía se mueve de lugar es tirar trabajo |

**Regla dura:** no se avanza de fase con la anterior rota.

---

# F. Bugs reproducibles

## F.1 Confirmados por recorrido

```
BUG-01 · R05 — la reserva no se completa
  Pasos: abrir ?p=app&v=r05 → elegir espacio → tocar el día 15
  Esperado: se habilitan los horarios y se puede confirmar
  Observado: no pasa nada
  Sospecha: la tira de días deshabilita el botón cuando cupoDelDia()===0,
            y turnos() marca "anticipacion" o "pasada" según la hora del día.
            Revisar lib/reservas.ts línea ~74 y el disabled de la tira en R05.tsx.
  NOTA: esta pantalla se reescribe en la fase 5 — verificar que el bug no
        sobreviva a la reescritura.

BUG-02 · R17 — volver va a R07
  Pasos: R01 → historial de la unidad → botón volver
  Observado: cae en "Edificio Aráoz · unidad 7 · R07"
  Dónde mirar: el prop volverA de ui/TopBar.tsx en R17.tsx, y el mapa PADRE
               de ui/PillNav.tsx

BUG-03 · Más → Reglamento — volver va al panel central
  Mismo patrón que BUG-02: volverA mal seteado

BUG-04 · Administración → "Espacios del edificio" no abre
  Dónde mirar: el handler ir() del ítem en la pantalla de administración

BUG-05 · Reclamos — categoría obligatoria
  Observado: "completar categoría" bloquea el envío
  Fix: opcional al crear (ver C.9)

BUG-06 · R01 — logo incorrecto en el banner
  public/brand/ tiene CT_LOGO_LIGHT_V2.png y CT_LOGO_DARK_V2.png.
  Verificar cuál referencia R01 y si respeta el tema.

BUG-07 · R01 — "Visitas hoy" con imagen equivocada
  BLOQUEADO: falta que Felipe indique cuál corresponde

BUG-08 · R01 — card "Todo en orden" rota
  Tres defectos simultáneos:
   a) el velo blanco tiene radio propio, distinto al de la card → escalera
      blanca en el ángulo inferior izquierdo
   b) el texto desborda el velo: "orden" termina sobre la foto
   c) la foto no llega al borde: margen blanco arriba y a la derecha
  Fix: foto al 100% del bloque con el radio de la card, y degradado en vez
       de velo con borde propio (C.14)
```

## F.2 Reportados en el pack, **no reproducidos**

```
R20 se cuelga al desplegar el detalle de gastos
R06 el selector/carrusel de días no responde
```

No los pude verificar: Chrome no estaba disponible al cerrar esta auditoría.
**Claude Code debe reproducirlos primero y reportar, no asumir que existen.**

---

# G. Acceptance criteria

Adopta los del pack (`05_ACCEPTANCE_CRITERIA.md`) y les suma los que salen de las
decisiones cerradas. Una fase no está terminada si alguno falla.

## Global
- [ ] No queda ninguna diagonal decorativa. `grep -n "repeating-linear-gradient" app/globals.css` no devuelve nada en el fondo global.
- [ ] Satoshi carga de verdad: en DevTools, computed `font-family` de `body` resuelve a Satoshi y **no** hay fallback a system-ui.
- [ ] No queda ningún `font-weight:600` ni `800` en `globals.css` (Satoshi no los tiene).
- [ ] Ningún titular de pantalla domina la interfaz.
- [ ] El fondo usa campo tonal, no gradiente genérico ni amarillo.
- [ ] Glass solo en controles y capas.
- [ ] Ningún estado se comunica solo por color.
- [ ] Sin overflow horizontal a 390px.
- [ ] La barra inferior no tapa contenido: la última card se ve entera.
- [ ] Modo oscuro funciona en todo lo tocado.
- [ ] `npm run build` pasa.

## R01
- [ ] Header compacto; no hay saludo grande.
- [ ] Edificio y unidad visibles sin ocupar un hero.
- [ ] El Primary Context Widget conmuta entre Expensas, Visitas, Entregas y Reservas.
- [ ] Las quick actions se distinguen del resto y usan el botón glass.
- [ ] Las live cards apilan solo objetos equivalentes; expensas NO apila.
- [ ] "Visitas hoy" usa el asset correcto.
- [ ] "Todo en orden" no tiene velos ni radios rotos, y la foto llega a los cuatro bordes.

## R05
- [ ] El calendario es grilla de mes y ocupa la jerarquía principal.
- [ ] La fecha seleccionada es inequívoca.
- [ ] Antes de elegir día no hay información de disponibilidad en texto.
- [ ] Elegir día actualiza los horarios.
- [ ] **Se puede completar una reserva de punta a punta.**
- [ ] Los espacios están abajo, con foto a sangre.

## R06
- [ ] "Crear nueva visita" es un botón convencional.
- [ ] El selector de día funciona.
- [ ] El slide aparece solo en "Autorizar y emitir el pase".

## R20
- [ ] El resumen se lee antes que el detalle.
- [ ] La torta aparece bajo demanda.
- [ ] Medios de pago y documentos salen por `Hoja`, no inflan la vista.
- [ ] No se cuelga al abrir la composición.

## R02
- [ ] Los desplegables arrancan cerrados.
- [ ] Subnav `Unidad | Edificio | Documentos` funciona.
- [ ] Se revisó la exposición de números de documento.

## Navegación inferior
- [ ] Cinco destinos, ni uno más.
- [ ] La acción central destaca sin volver amarilla toda la barra.
- [ ] Targets táctiles ≥ 44px.
- [ ] El destino activo se distingue por peso y color sólido, no por amarillo.

## Motion
- [ ] Toda animación explica jerarquía o relación.
- [ ] `prefers-reduced-motion` apaga lo decorativo y conserva el feedback funcional.

---

# H. Prompt maestro para Claude Code

> Pegá **todo lo que está adentro del bloque** en Claude Code, parado en
> `E:\- DISEÑO WEB\CondoTrack\condotrack-app`.
> Antes: `Ctrl+C` en el dev server, borrar `.next`, `npm run dev`.

```text
CONDOTRACK — IMPLEMENTACIÓN v02

Trabajás sobre un build existente y funcionando. NO rehagas la aplicación.
NO reinterpretes el producto. Las decisiones de producto ya están tomadas y
están abajo; tu trabajo es implementarlas sobre el código real.

════════════════════════════════════════════════════════════════════
0 · ANTES DE ESCRIBIR UNA LÍNEA
════════════════════════════════════════════════════════════════════

Leé, en este orden:
  1. app/globals.css  — es la única fuente de verdad visual (1.891 líneas)
  2. components/ui/   — 16 componentes compartidos YA EXISTEN
  3. components/ShellResidente.tsx y components/ui/PillNav.tsx
  4. lib/data.ts y lib/reservas.ts

Creá ESTADO_IMPLEMENTACION.md en la raíz con las 11 fases de abajo como
checklist. Lo vas actualizando al cerrar cada fase. Si te quedás sin
contexto, ese archivo es de dónde retomás.

Verificá el estado de git antes de empezar. Un commit por fase.

NO DUPLIQUES COMPONENTES. Antes de crear uno, buscá en components/ui/.
Ya existen y se reutilizan: Hoja (bottom sheet), Torta (gráfico de torta),
Vacio (estados vacíos), Formulario, Panel, Chips, TopBar, Icon, Estados,
Linea, Descarga, FinLista, Sello, SwipeButton, TemaToggle, PillNav.

════════════════════════════════════════════════════════════════════
1 · RESTRICCIONES DURAS
════════════════════════════════════════════════════════════════════

- CERO librerías nuevas. Ni de UI, ni de estado, ni de fechas, ni de
  gráficos, ni de animación. Next + React + TypeScript y nada más.
  Las tres dependencias de package.json no se tocan.
- No hay Tailwind. Todo el estilo vive en app/globals.css con tokens.
- Cada color sale de un token. Nunca un literal que solo sirve en un tema.
- Modo oscuro tiene que seguir funcionando en TODO lo que toques. Los tres
  estados son :root, @media (prefers-color-scheme: dark) guardado por
  :root:not([data-tema="claro"]), y :root[data-tema="oscuro"].
- Español rioplatense, voseo, en la interfaz y en los comentarios.
- Mobile 390×844 es el objetivo. Sin overflow horizontal.
- npm run build tiene que pasar al cerrar cada fase.
- No toques lib/data.ts sin necesidad: romper ese archivo ya tiró el build
  de Vercel antes.

════════════════════════════════════════════════════════════════════
2 · TIPOGRAFÍA — YA ESTÁ HECHA, NO LA REHAGAS
════════════════════════════════════════════════════════════════════

Satoshi (Fontshare) es la tipografía de producto. Ya está integrada en
app/layout.tsx y los tokens ya están en globals.css.

  400  cuerpo, metadatos, texto secundario
  500  labels, navegación, filtros, ítems de lista
  700  botones, titulares, datos importantes
  900  importes y cifras grandes

Satoshi NO tiene peso 600 ni 800. Si escribís uno, el navegador lo resuelve
a 700 y la jerarquía se rompe. Usá solo esos cuatro.
Satoshi NO tiene eje de ancho: --display-ancho es "normal" y font-stretch
no hace nada. No lo reintroduzcas.
Rothek está retirada de la interfaz; el logo es un asset vectorial.

Borrá public/fonts/rothek-extralight.otf y public/fonts/rothek-bolditalic.otf.
Están desenlazados del CSS pero siguen siendo descargables desde el deploy,
lo cual incumple la licencia web de la fuente. Los .woff se quedan.

════════════════════════════════════════════════════════════════════
3 · DECISIONES DE PRODUCTO — CERRADAS, NO LAS REABRAS
════════════════════════════════════════════════════════════════════

FONDO
  Nada de diagonales ni tramas geométricas. Borrá los
  repeating-linear-gradient(121deg, …) de globals.css líneas 247 y 261.
  En su lugar: un campo tonal ambiental anclado arriba — color suave en la
  zona del header que se disuelve hacia el fondo cálido antes de la mitad
  de la pantalla. En oscuro, el mismo campo hecho con negros.
  El amarillo #F5E500 NO vuelve a ser fondo.

BARRA INFERIOR — cinco destinos con acción central
  Inicio · Mi edificio · [ACCESO/QR] · Reservas · Más
  La barra FLOTA: no llega a los bordes, tiene radio propio, respira contra
  el fondo, y es más baja que la actual.
  La acción central es un squircle más ancho que alto, no un círculo.
  Los cinco destinos llevan ícono + label. El activo se marca con peso
  tipográfico y color sólido — NO con amarillo.
  Patrón: bottom app bar with docked FAB.
  Extendé el mapa PADRE de PillNav.tsx, no lo reemplaces.

MI EDIFICIO
  El destino se llama "Mi edificio" y adentro tiene navegación secundaria
  horizontal: Unidad | Edificio | Documentos. Absorbe R07.
  La separación de permisos entre unidad y consorcio se mantiene adentro.

HOME R01 — cuatro capas, en este orden
  A. Contexto silencioso: "Aráoz 1280 · Unidad 7D", perfil, búsqueda,
     notificaciones. SIN saludo grande. El home empieza con contenido útil.
  B. Primary Context Widget: una card con cuatro estados conmutables por
     tabs — Expensas, Visitas, Entregas, Reservas. Los tabs van ADENTRO del
     widget. La cifra grande es protagonista y no lleva card propia. Debajo,
     a lo sumo tres datos chicos en material translúcido.
  C. Quick actions: Crear visita, Hacer reclamo, Reservar espacio. Con el
     botón glass. Administración y Recepción NO compiten con estas.
  D. Live cards apiladas.

APILADO — regla exacta
  Apilan: Visitas hoy, Próxima reserva, Paquete para retirar, Estado del
  edificio. Son objetos equivalentes.
  NO apilan nunca: expensas, botones, contactos, categorías distintas.
  Desfase vertical corto: la card de abajo asoma 20-30px. No se presiona
  para seleccionar.

CALENDARIO R05 — grilla de mes, no tira
  Hoy hay una tira horizontal de 14 días. Pasa a grilla de mes completa.
  Día seleccionado en círculo sólido. Navegación de mes con flechas.
  Puntitos bajo los días con disponibilidad — eso REEMPLAZA los textos
  "hay lugar / quedan pocos / sin lugar", que salen.
  Antes de elegir día, una caja con borde marcado que dice:
  "Elegí un día del calendario para ver los horarios disponibles."
  Los horarios aparecen recién después de elegir el día.
  Sacá el título "Reservar · Elegí el día y la franja": es redundante.
  Los espacios van ABAJO del calendario, con foto a sangre.
  Mantené el modelo Espacio → Recurso → Franja de lib/reservas.ts.
  La lavandería reserva máquina, no sala.

VISITAS R06
  "Crear nueva visita" es un BOTÓN, no un deslizador.
  → formulario: nombre y apellido, documento, franja horaria
  → revisión
  → y recién ahí el slide para "Autorizar y emitir el pase".
  El gesto irreversible va al final, nunca al principio.

RECLAMOS
  Categoría OPCIONAL al crear, OBLIGATORIA para que administración cierre.
  El formulario abre desde abajo con el componente Hoja que ya existe.
  Faltan estados vacíos en abiertos y en cerrados.

EXPENSAS R20
  Divulgación progresiva: resumen → "cómo se compone" → torta SOLO cuando
  el usuario la pide → rubros → medios de pago y documentos por Hoja.
  No mostrar toda la contabilidad de una vez.
  El gráfico de torta ya está implementado en components/ui/Torta.tsx.

BÚSQUEDA
  Stub, sin motor. Entrada compacta en el header que abre una pantalla con
  cinco acciones frecuentes fijas. NO construyas índice de búsqueda.

EL HOME NO SE REORDENA SOLO
  Orden fijo. Cada módulo aparece solo si tiene contenido.

AMARILLO
  Acción primaria, estado activo y fecha seleccionada. Nada más.

GLASS
  Sí: navegación, acción central, botón de volver, filtros y segmented
  controls, hojas, algunas live cards.
  No: texto largo, historial, listas densas, todas las cards a la vez.

LA FOTO ES LA CARD
  Cuando una card representa un LUGAR —espacios reservables, el edificio,
  amenities— la imagen ocupa el bloque entero con el radio de la card y el
  texto va encima sobre un degradado. Nunca foto chica adentro de un
  contenedor blanco. Ese es el error visual número uno del build actual.

TÍTULOS
  Todos los titulares de pantalla bajan de escala.

DESPLEGABLES
  R02 y la card de entregas arrancan cerrados.

════════════════════════════════════════════════════════════════════
4 · COMPONENTES NUEVOS — SIETE, Y NINGUNO MÁS
════════════════════════════════════════════════════════════════════

components/ui/BotonGlass.tsx
  El botón con flecha de "Visitas hoy" es lo mejor que tiene el build.
  Convertilo en componente: tamaño fijo, ícono configurable, material
  vidrio. Usalo en Autorizar visita, Hacer reclamo, Reservar espacio,
  Administración, Recepción y el botón de volver.

components/ui/CardFoto.tsx
  Foto a sangre + degradado + slot de contenido. Ver "LA FOTO ES LA CARD".

components/ui/WidgetPrincipal.tsx
  Tabs + panel, crossfade corto entre estados. Mantiene el contexto dentro
  de la misma card.

components/ui/PilaVivas.tsx
  Stack de objetos equivalentes. Ver "APILADO".

components/ui/BuscarEntrada.tsx
  Entrada compacta. Sin motor.

components/ui/SubNav.tsx
  Navegación secundaria horizontal. Se usa en TRES lugares: Mi edificio
  (Unidad|Edificio|Documentos), Reservas (Espacios|Mis reservas|Historial)
  y Reclamos (Abiertos|En seguimiento|Cerrados).

components/ui/CalendarioMes.tsx
  Grilla de mes con puntos de disponibilidad.

════════════════════════════════════════════════════════════════════
5 · BUGS — REPRODUCIR ANTES DE ARREGLAR
════════════════════════════════════════════════════════════════════

Confirmados por recorrido del usuario:

BUG-01 R05 — elegir el 15 de septiembre no habilita nada y no se puede
  reservar. Mirá lib/reservas.ts ~línea 74 (el orden de los bloqueos:
  pasada / anticipacion / tope / superpuesta / ocupada) y el disabled de la
  tira de días en R05.tsx. Esta pantalla se reescribe en la fase 5:
  verificá que el bug no sobreviva a la reescritura.

BUG-02 R17 — volver manda a "Edificio Aráoz · unidad 7 · R07" en vez de a
  la pantalla anterior. Mirá el prop volverA de ui/TopBar.tsx en R17.tsx.

BUG-03 Más → Reglamento — volver va al panel central, no a configuración.
  Mismo patrón que BUG-02.

BUG-04 Administración → "Espacios del edificio" no abre.

BUG-05 Reclamos — categoría obligatoria bloquea el envío. Ver decisión.

BUG-06 R01 — el logo del banner no es el lockup correcto. En public/brand/
  están CT_LOGO_LIGHT_V2.png y CT_LOGO_DARK_V2.png. Verificá cuál usa R01 y
  si respeta el tema.

BUG-08 R01 — la card "Todo en orden" está rota, con tres defectos a la vez:
  a) el velo blanco del texto tiene radio propio distinto al de la card, y
     eso produce una escalera blanca en el ángulo inferior izquierdo;
  b) el texto desborda el velo: "orden" termina sobre la foto y se vuelve
     ilegible;
  c) la foto no llega al borde: queda margen blanco arriba y a la derecha.
  Fix: foto al 100% del bloque con el radio de la card, y degradado en vez
  de velo con borde propio.

BLOQUEADO — no lo toques:
BUG-07 R01 — "Visitas hoy" usa una imagen que no corresponde. Falta que
  Felipe indique cuál. Dejalo como está y anotalo en el changelog.

REPORTADOS PERO NO REPRODUCIDOS — verificá primero, no asumas:
  · R20 se colgaría al desplegar el detalle de gastos
  · R06 el selector de días no respondería
  Si no los podés reproducir, decilo en el changelog. No inventes un fix
  para un bug que no existe.

════════════════════════════════════════════════════════════════════
6 · ORDEN DE IMPLEMENTACIÓN — RESPETALO
════════════════════════════════════════════════════════════════════

FASE 0  Fundaciones: borrar diagonales (globals.css 247 y 261), campo
        tonal, bajar escala de títulos, consolidar radios/spacing/glass.
FASE 1  Los siete componentes de la sección 4, SIN cablearlos todavía.
FASE 2  Shell: PillNav de 5 con acción central, safe areas, BuscarEntrada.
FASE 3  Bugs 01 a 06 y 08.
FASE 4  R01 home sobre los componentes nuevos.
FASE 5  R05 reservas: CalendarioMes + slots + espacios con foto.
FASE 6  R06 visitas.
FASE 7  R20 expensas.
FASE 8  R02 Mi edificio con SubNav, absorbiendo R07.
FASE 9  R17 historial.
FASE 10 Estados vacíos, de carga y de error en todo lo tocado.
FASE 11 Motion y pulido.

Por qué este orden: las fases 0 a 2 las hereda todo lo demás. Construir los
componentes después de las pantallas obliga a reescribir las pantallas.
Animar en la fase 4 algo que se mueve de lugar en la 8 es tirar trabajo.

NO avances de fase con la anterior rota.

════════════════════════════════════════════════════════════════════
7 · QA OBLIGATORIO AL CERRAR CADA FASE
════════════════════════════════════════════════════════════════════

1. npm run build — tiene que pasar. Si falla, arreglá antes de seguir.
2. Abrí la app y recorré las rutas afectadas con los deep links:
     ?p=app&v=r01   ?p=app&v=r05   ?p=app&v=r06
     ?p=app&v=r20   ?p=app&v=r02   ?p=app&v=r17
   Sumá &tema=oscuro para verificar el modo oscuro.
   &limpio=1 saca el escenario y deja la pantalla sola.
3. Verificá a 390px de ancho que no haya overflow horizontal.
4. Chequeá los acceptance criteria de la sección 8 que apliquen a la fase.
5. Corregí regresiones ANTES de avanzar.
6. Actualizá ESTADO_IMPLEMENTACION.md y commiteá.

UNA FASE NO ESTÁ TERMINADA SI:
  · npm run build falla
  · rompe la navegación
  · hay overflow horizontal
  · la tipografía cae en fallback (computed font-family no dice Satoshi)
  · aparece una diagonal en el fondo
  · aparece un font-weight 600 u 800
  · un CTA queda tapado por la barra inferior
  · un estado se comunica solo por color
  · la interacción principal no funciona con mouse y con touch
  · el modo oscuro quedó roto

════════════════════════════════════════════════════════════════════
8 · ACCEPTANCE CRITERIA
════════════════════════════════════════════════════════════════════

GLOBAL
  [ ] grep de repeating-linear-gradient no devuelve nada en el fondo global
  [ ] grep de "font-weight:600" y "font-weight:800" en globals.css → 0
  [ ] computed font-family de body resuelve a Satoshi, sin fallback
  [ ] ningún titular de pantalla domina la interfaz
  [ ] el fondo usa campo tonal, no gradiente genérico ni amarillo
  [ ] glass solo en controles y capas
  [ ] ningún estado se comunica solo por color
  [ ] sin overflow horizontal a 390px
  [ ] la última card se ve entera sobre la barra inferior
  [ ] modo oscuro funciona en todo lo tocado
  [ ] npm run build pasa

R01
  [ ] header compacto, sin saludo grande
  [ ] edificio y unidad visibles sin ocupar un hero
  [ ] el widget conmuta entre Expensas, Visitas, Entregas y Reservas
  [ ] las quick actions se distinguen y usan el botón glass
  [ ] las live cards apilan solo objetos equivalentes; expensas NO apila
  [ ] "Todo en orden" sin velos ni radios rotos, foto a los cuatro bordes

R05
  [ ] el calendario es grilla de mes y ocupa la jerarquía principal
  [ ] la fecha seleccionada es inequívoca
  [ ] antes de elegir día no hay disponibilidad en texto
  [ ] elegir día actualiza los horarios
  [ ] SE PUEDE COMPLETAR UNA RESERVA DE PUNTA A PUNTA
  [ ] los espacios están abajo, con foto a sangre

R06
  [ ] "Crear nueva visita" es un botón convencional
  [ ] el selector de día funciona
  [ ] el slide aparece solo en "Autorizar y emitir el pase"

R20
  [ ] el resumen se lee antes que el detalle
  [ ] la torta aparece bajo demanda
  [ ] medios de pago y documentos salen por Hoja
  [ ] no se cuelga al abrir la composición

R02
  [ ] los desplegables arrancan cerrados
  [ ] el subnav Unidad|Edificio|Documentos funciona

BARRA INFERIOR
  [ ] cinco destinos, ni uno más
  [ ] la acción central destaca sin volver amarilla toda la barra
  [ ] targets táctiles ≥ 44px
  [ ] el destino activo se distingue por peso y color, no por amarillo

MOTION
  [ ] toda animación explica jerarquía o relación
  [ ] prefers-reduced-motion apaga lo decorativo y conserva el feedback
      funcional del swipe

════════════════════════════════════════════════════════════════════
9 · NO HAGAS
════════════════════════════════════════════════════════════════════

  · un rediseño desde cero
  · otro sistema tipográfico
  · colores nuevos fuera de los tokens
  · un logo nuevo
  · diagonales de fondo
  · glass en todas partes
  · un dashboard genérico
  · setenta pantallas independientes
  · duplicar componentes que ya existen en components/ui/
  · búsqueda con índice real
  · home que se reordena solo
  · cobro de amenities
  · tipos de acceso nuevos (trabajador, invitado temporal)
  · integración con cámaras
  · agregar al calendario del teléfono

════════════════════════════════════════════════════════════════════
10 · AL TERMINAR CADA FASE, ENTREGÁ
════════════════════════════════════════════════════════════════════

  · changelog por ID de pantalla
  · bugs corregidos, y los que no pudiste reproducir
  · decisiones de producto que NO tocaste y por qué
  · deuda restante
  · archivos principales modificados
  · y separado: REQUISITO CONFIRMADO / DECISIÓN DE DISEÑO / HIPÓTESIS /
    PREGUNTA ABIERTA

Si algo de este prompt contradice un documento del proyecto o el layout
aprobado de referencias/R01_LAYOUT_APROBADO.png, DECILO en vez de
resolverlo en silencio.

Preguntá solo lo que sea BLOQUEANTE. Todo lo que puedas resolver
inspeccionando el repositorio, resolvelo.
```

---

# I. Estrategia de loop y QA

El problema real no es que Claude Code haga las cosas mal: es que **da una fase por
terminada y se detiene**. Cuatro mecanismos, en orden de cuánto sirven.

## I.1 `ESTADO_IMPLEMENTACION.md` — el que más sirve

Un archivo en la raíz del repo con las once fases como checklist y, debajo de cada una,
sus acceptance criteria. Claude Code lo crea en la fase 0 y lo actualiza al cerrar cada
fase.

Por qué funciona: cuando la sesión se queda sin contexto o Felipe la corta, la
siguiente sesión lee ese archivo y sabe exactamente dónde retomar. Sin eso, cada
sesión nueva vuelve a auditar el repo desde cero y gasta la mitad del presupuesto en
releer lo que ya sabía.

Formato mínimo por fase:

```markdown
## FASE 4 — R01 home
Estado: EN CURSO
Commit: —
- [x] Contexto silencioso reemplaza el saludo
- [x] WidgetPrincipal cableado con los cuatro estados
- [ ] Quick actions con BotonGlass
- [ ] PilaVivas con las cuatro live cards
- [ ] npm run build pasa
Notas: BUG-07 bloqueado, falta el asset de Visitas hoy.
```

## I.2 `CLAUDE.md` en la raíz del repo

Las restricciones duras de la sección 1 del prompt —cero librerías, tokens, modo
oscuro, voseo, 390px— puestas en un `CLAUDE.md` se aplican **automáticamente en toda
sesión de Claude Code sobre este repo**, sin que haya que repetirlas en cada prompt.

Hoy el repo no tiene `CLAUDE.md`; solo un `.claude/launch.json`. **Esto es lo primero
que yo armaría**, y es de las cosas más baratas de esta lista.

## I.3 Compuerta dura por fase

`npm run build` como condición de avance no es negociable. Es la única verificación
automática que existe en este proyecto: no hay tests, no hay linter configurado más
allá del default de Next.

La verificación visual, en cambio, **no se puede automatizar acá** sin agregar
Playwright, y eso viola la restricción de cero librerías. Así que el loop visual es
manual y hay que escribirlo como tal: Claude Code enumera las URLs con deep links, y
Felipe mira. El prompt ya se las da hechas.

## I.4 Un commit por fase, con nombre de fase

`git log --oneline` se vuelve el índice de avance. El repo ya viene usando esa
convención —"Lenguaje visual 5/8 — la hoja, y menos pantallas"— y funciona bien.
Mantenerla.

## I.5 Cómo cortar el loop

Claude Code debe **frenar y preguntar**, no adivinar, cuando:

- un acceptance criterion depende de un asset o una decisión que no tiene
  (BUG-07 es el caso: falta la imagen);
- reproducir un bug reportado da negativo;
- implementar una decisión de esta lista rompería otra;
- una fase requiere tocar `lib/data.ts` de un modo que cambie el modelo.

Todo lo demás lo resuelve solo. Preguntar de más cuesta tanto como no preguntar.

---

## Lo que queda de tu lado

1. Las cuatro decisiones abiertas de la sección C (OPEN-1 a OPEN-4).
2. Confirmar si querés que arme el `CLAUDE.md` (I.2) antes de que corras el prompt.
3. Registrar en `DECISION_LOG` los tres cambios de arquitectura que esto implica:
   barra de cinco destinos, "Mi edificio" absorbiendo R07, y el módulo de expensas
   como expansión de alcance.
