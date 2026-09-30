# 04 · Sistema de componentes

## Los cuatro materiales

La superficie se elige por lo que la cosa **es**, no por costumbre.
**Regla:** si tres elementos seguidos usan el mismo material, la jerarquía está mal.

| Material | Clase | Para qué | Nunca |
|---|---|---|---|
| **Vidrio** | `.vidrio` | contenido vivo: expensa, próxima reserva, paquete, chips, paneles | texto largo, historial, listas densas |
| **Carbón** | `.mat-carbon` | dato duro y jerárquico: visitas de hoy, pase QR, visita vigente | contenido secundario |
| **Foto** | `.mat-foto` | **lugares**: espacios reservables, edificio, amenities | datos, nunca |
| **Plano** | — | filas de lista, menús, notificaciones, tablas | — |

El filo del vidrio no es un borde plano: es un gradiente de 1px con máscara
(`--vidrio-filo`), claro arriba y nada abajo, más un brillo especular en el canto
superior. Eso es lo que lo hace leer como material y no como caja con borde.

**Plano es la mayoría de la interfaz, y está bien que lo sea.**

## Componentes existentes — reutilizar, no duplicar

`components/ui/`:

| Componente | Qué hace | Nota |
|---|---|---|
| `Hoja` | bottom sheet | bloquea scroll, cierra con Escape / tocando afuera / arrastrando, atrapa el foco, respeta `prefers-reduced-motion`. **Todo lo que sube desde abajo usa esto** |
| `Torta` | gráfico de torta | ya implementado a mano, sin librería |
| `Vacio` | estados vacíos | |
| `Formulario` | campos y validación | |
| `TopBar` | cabecera con volver | el prop `volverA` es el origen de BUG-02 y BUG-03 |
| `PillNav` | barra inferior | pasa de 4 a 5 destinos (D-04) |
| `SwipeButton` | gesto de confirmación | **solo** para el acto irreversible (D-10) |
| `Panel` · `Chips` · `Linea` · `Icon` · `Estados` · `Descarga` · `FinLista` · `Sello` · `TemaToggle` | | |

## Qué va en hoja y qué no

**Va:** medios de pago, informar un pago, detalle de un rubro, elegir período,
confirmar una reserva, detalle de una entrega, revocar un permiso, **hacer un
reclamo**.

**No va:** el calendario, la lista de visitas, el detalle de reclamo.
Nada que tenga navegación adentro.

Las vistas que además tienen enlace directo (R22 medios de pago, G11 entrega)
comparten el mismo componente de contenido que la hoja: no hay dos versiones del
mismo CBU.

## Componentes a crear — cinco, y ninguno más

> **Estado al cerrar la implementación: los cinco existen y están cableados.**
> Lo que cada uno terminó necesitando, y que este documento no preveía:
>
> | Componente | Lo que se agregó al construirlo | Por qué |
> |---|---|---|
> | `BotonGlass` | dos tonos (`claro` / `sobrio`) y modo `decorativo` | el blanco al 12% aprobado sobre foto es invisible sobre el fondo claro; y cuando la card entera es el control, la flecha tiene que ser un `span`, porque dos botones anidados no son HTML válido |
> | `WidgetPrincipal` | `datos` (hasta tres) y `accion` | la cifra sola no alcanzaba para que el widget respondiera "y ahora qué hago" |
> | `PilaVivas` | pausa al puntero y al foco, capas de atrás `inert`, y **alto fijo** | una pila de cards de alturas distintas salta en cada giro y no se lee como pila |
> | `SubNav` | `contador` por pestaña | en Reclamos, saber cuántos hay en cada estado es la mitad de la información |
> | `CalendarioMes` | umbral de 8 px antes de capturar el puntero | es el arreglo de BUG-01: capturar al apoyar el dedo redirige el click y el día nunca se elige |
>
> Y tres piezas existentes ganaron un modo en vez de tener un primo nuevo:
> `PieForm` con `deslizar` (D-10), `Linea` con `soloLaHora` (historial agrupado
> por día) y `paneles/PanelReclamo`, que comparten la hoja de Reclamos y F02.


Dos de los que estaban previstos **ya existen como convención CSS** y solo hay que
promoverlos y terminar de adoptarlos, no inventarlos.

| Componente | Estado | Qué hace |
|---|---|---|
| `BotonGlass.tsx` | **nuevo** | el botón con flecha de "Visitas hoy", el que funciona. Tamaño fijo, ícono configurable, material vidrio. Va en: Autorizar visita, Hacer reclamo, Reservar espacio, Administración, Recepción, volver (D-06) |
| `WidgetPrincipal.tsx` | **nuevo** | tabs + panel con crossfade. Cuatro estados: Expensas, Visitas, Entregas, Reservas. Los tabs van **adentro** del widget |
| `PilaVivas.tsx` | **nuevo** | stack de objetos equivalentes (D-09) |
| `SubNav.tsx` | **nuevo** | navegación secundaria horizontal. Se usa en **tres** lugares: Mi edificio, Reservas, Reclamos |
| `CalendarioMes.tsx` | **nuevo** | grilla de mes con puntos de disponibilidad (D-08) |
| ~~`CardFoto.tsx`~~ | **ya existe** como `.mat-foto` en `globals.css`, usada en G15, R05 y R13. Falta adoptarla en R01 | |
| ~~`BuscarEntrada.tsx`~~ | **se difiere** | con D-13 la búsqueda es un stub; puede resolverse con `Formulario` sin componente propio |

### Sobre `.circulo`
La clase existe (48 px, filo de 1px, sin relleno) y **se queda** para acciones
secundarias: volver, cerrar, compartir, filtrar, perfil del header.
Lo que cambia con D-06 es cuál es el **elemento firma**: el glass con flecha, no
el círculo vacío. Conviven; no cumplen el mismo rol.

## Anatomía de una card

Toda card tiene que responder al menos una de estas: qué pasó, qué está pasando,
qué va a pasar, hace falta una acción, qué acción puedo tomar.

```
volanta → información principal → metadato → estado → acción contextual
```

Nada de cards decorativas que existen para llenar espacio.

## Errores conocidos de composición

**La card "Todo en orden" (R01) estaba rota** — arreglada en la fase 3 — con tres
defectos a la vez:
1. el velo blanco del texto tiene radio propio, distinto al de la card → aparece
   una escalera blanca en el ángulo inferior izquierdo;
2. el texto desborda el velo: "orden" termina sobre la foto y se vuelve ilegible;
3. la foto no llega al borde: queda margen blanco arriba y a la derecha.

Es el caso testigo de D-11. Se arregló adoptando `.mat-foto`: la foto al 100% del
bloque con el radio de la card y un **degradado** en lugar del velo con borde
propio. Medido antes: la foto ocupaba 231 de 350 px. Medido después: 350×214, que
es exactamente la card.
