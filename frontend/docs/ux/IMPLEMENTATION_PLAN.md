# Plan de implementación

Ordenado para minimizar retrabajo: lo que muchos componentes heredan va primero.
**No se avanza de fase con la anterior rota.**

| Fase | Qué | Archivos principales | Por qué acá |
|---|---|---|---|
| **0** | Fundaciones: borrar diagonales (globals.css 247 y 261), campo tonal ambiental, bajar escala de títulos, espejar `design/tokens.json` con Satoshi | `app/globals.css`, `design/tokens.json` | Todo lo demás se ve encima de esto |
| **1** | Los cinco componentes nuevos de `04_COMPONENT_SYSTEM.md`, **sin cablearlos** | `components/ui/*` | Construirlos después obliga a reescribir pantallas |
| **2** | Shell: `PillNav` de 5 con acción central, ruteo del destino Acceso, safe areas | `PillNav.tsx`, `ShellResidente.tsx` | Define el viewport real que tienen las pantallas |
| **3** | Bugs 01 a 08 | varios | Baratos, y sin esto no se puede validar nada visual |
| **4** | R01 sobre los componentes nuevos | `R01.tsx` | Es la pantalla que más hereda |
| **5** | R05: `CalendarioMes` + franjas + espacios con foto | `R05.tsx`, `lib/reservas.ts` | La más importante del producto |
| **6** | R06 visitas: botón → formulario → slide final | `R06.tsx`, `F01.tsx` | |
| **7** | R20 expensas: resumen → composición → torta bajo demanda | `R20.tsx` | |
| **8** | Mi edificio con `SubNav`, absorbiendo G15 y moviendo R14 | `R02.tsx`, `G15.tsx`, `PillNav.tsx` | Cambio de IA; conviene con el shell estable |
| **9** | R17 historial: jerarquía y filtros | `R17.tsx` | |
| **10** | Estados vacíos, de carga y de error en todo lo tocado | `Vacio.tsx`, varios | |
| **11** | Motion y pulido | `globals.css` | Animar algo que todavía se mueve de lugar es tirar trabajo |

## Compuerta por fase

1. `npm run build` pasa.
2. Recorrido con deep links: `?p=app&v=r01` · `r05` · `r06` · `r20` · `r02` · `r17`,
   y cada uno con `&tema=oscuro`.
3. Sin overflow horizontal a 390 px.
4. Los criterios de `08_ACCEPTANCE_CRITERIA.md` que apliquen.
5. Actualizar `ESTADO_IMPLEMENTACION.md` y commitear con el nombre de la fase.

## Una fase NO está terminada si

`npm run build` falla · rompe la navegación · hay overflow horizontal · la
tipografía cae en fallback · aparece una diagonal en el fondo · aparece un
`font-weight` 600 u 800 · un CTA queda tapado por la barra · un estado se comunica
solo por color · la interacción principal no funciona con mouse y con touch · el
modo oscuro quedó roto.

## Verificación visual — cómo se hace acá

No hay tests y no se puede agregar Playwright sin violar la restricción de cero
librerías. `npm run build` es la única verificación automática que existe.

Por eso el loop visual es **manual y explícito**: al cerrar cada fase, enumerá las
URLs con deep links que hay que mirar. No des una fase por cerrada visualmente sin
que alguien la haya visto.
