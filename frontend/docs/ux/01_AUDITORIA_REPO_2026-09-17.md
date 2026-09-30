# 01 · Auditoría del repositorio — 17/09/2026

Inspección del código real en `E:\- DISEÑO WEB\CondoTrack\condotrack-app`,
commit `856dfc7` más la pasada de Satoshi.

> Las decisiones que salieron de esta auditoría viven en `02_DECISION_LOG.md`.
> Este documento es el **estado**, no las decisiones.

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
2. **`docs/_historia/PROMPT_02_LENGUAJE_VISUAL.md` pide una "geometría arquitectónica apenas
   perceptible" en el fondo.** Eso produjo las diagonales que hay que sacar. Ese
   documento queda **derogado** por este.
3. **El pack propone fusionar unidad y edificio en "Mi edificio".** La IA aprobada
   (`05_INFORMATION_ARCHITECTURE`) las separa. Resuelto abajo (C.4).
4. **El pack propone amarillo para "navegación activa".** La pasada de sobriedad lo
   sacó justamente de ahí. Resuelto abajo (C.12).
5. **`00_MASTER_UI_SYSTEM_LOCK.md` fija cuatro destinos en la barra.** Pasamos a cinco.
   Es un cambio de IA y va al `DECISION_LOG`.
