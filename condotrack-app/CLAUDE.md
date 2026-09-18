# CondoTrack — reglas permanentes del repositorio

Este archivo se aplica a **toda** sesión de Claude Code sobre este repo.
No hace falta repetir nada de acá en un prompt.

## Fuente de verdad

1. `docs/ux/00_CONTEXT_INDEX.md` — el índice. **Empezá siempre por ahí.**
2. `docs/ux/02_DECISION_LOG.md` — decisiones vigentes y decisiones derogadas.
3. `app/globals.css` — la verdad visual. Si un documento no coincide con el CSS,
   decilo; no lo resuelvas en silencio.

Los documentos de `docs/ux/` tienen prioridad sobre cualquier `.md` de la raíz.
Los `.md` de la raíz son historia, no instrucciones.

## Restricciones duras

- **Cero librerías nuevas.** Ni UI, ni estado, ni fechas, ni gráficos, ni
  animación. Las tres dependencias de `package.json` (next, react, react-dom)
  no se tocan. No hay Tailwind.
- Todo el estilo vive en `app/globals.css` con tokens. **Cada color sale de un
  token**, nunca de un literal que solo sirva en un tema.
- **Modo oscuro tiene que seguir funcionando** en todo lo que toques. Los tres
  estados son `:root`, `@media (prefers-color-scheme: dark)` guardado por
  `:root:not([data-tema="claro"])`, y `:root[data-tema="oscuro"]`.
- **Tipografía: Satoshi**, pesos 400 / 500 / 700 / 900 y ninguno más. Satoshi no
  tiene 600 ni 800: si los escribís, el navegador los resuelve a 700 y la
  jerarquía se rompe. Tampoco tiene eje de ancho — `--display-ancho` es `normal`.
- **Español rioplatense, voseo**, en la interfaz y en los comentarios del código.
- Objetivo **390 × 844**. Sin overflow horizontal.
- `npm run build` tiene que pasar antes de cerrar cualquier tarea.
- No toques `lib/data.ts` sin necesidad: romperlo ya tiró el build de Vercel.

## Antes de crear un componente

Buscá en `components/ui/`. Ya existen y se reutilizan:
`Chips · Descarga · Estados · FinLista · Formulario · Hoja · Icon · Linea ·
Panel · PillNav · Sello · SwipeButton · TemaToggle · TopBar · Torta · Vacio`.

`Hoja` es el bottom sheet. `Torta` es el gráfico de torta. `Vacio` son los
estados vacíos. No hagas otro.

## Cómo entregar

Un commit por fase, con el nombre de la fase.
Al cerrar, separá siempre: **requisito confirmado / decisión de diseño /
hipótesis / pregunta abierta**.
Actualizá `docs/ux/ESTADO_IMPLEMENTACION.md`.

## Cuándo frenar y preguntar

- Falta un asset o una decisión que no tenés.
- Un bug reportado no se reproduce.
- Implementar una decisión rompería otra.
- Hay que cambiar el modelo de datos.

Todo lo demás, resolvelo inspeccionando el repo. Preguntar de más cuesta igual
que no preguntar.
