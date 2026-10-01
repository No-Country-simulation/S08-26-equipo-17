# R1.3 · Home Recepción como command center

22/09/2026. Pendiente de aprobación visual. Reemplaza la composición R1.2. No commit ni push; no se avanzó a internas.

## Referencias inspeccionadas completas

PNG originales bajo `docs/ux/visual-targets/condotrack_visual_target_pack_v05/refs/user/`:

- **U02_volvo_modular_dashboard.png — principal:** rail a la izquierda, tres destinos centrales, edificio/utilidades a la derecha, título debajo, una superficie visual dominante, dock contextual derecho y previews inferiores. Se retiraron el mega-header, la tabla del Home y la composición de paneles independientes. Utility bar de 64 px; superficie central de 426 px; dock de tres controles de 60 px. La imagen se convierte en ambiente con blur de 2 px, saturación reducida y velo cálido.
- **U01_planner_clock_calendar.png — materialidad:** dial secundario a la hora digital de 94 px, sin rectángulo detrás del conjunto. Vidrio con blur real exclusivamente sobre foto, reflejo superior y sombra suave. Today comparte una única superficie frosted con divisores y jerarquía numérica.
- **U05_management_modular_dashboard.png — secundaria:** módulos inferiores con distintos pesos (próximo acceso, alertas y dos previews pequeños); controles con contraste de selección. No se traslada la densidad administrativa ni las métricas ajenas.

## Cambios por componente

- `components/ShellRecepcion.tsx`: un único scroll en desk-main que incluye utility bar y contenido. El header deja de cortar la pantalla al desplazarse.
- `components/recepcion/ReceptionHeader.tsx`: utility bar nueva, Agenda/Unidades/Actividad, edificio, notificaciones reales de incidencias, perfil y trigger de búsqueda.
- `components/recepcion/ReceptionSidebar.tsx`: rail sin placa, labels por hover/foco y expansión que empuja contenido; perfil trasladado al header.
- `components/recepcion/ReceptionSearch.tsx`: reutiliza lógica/resultados/teclado; acepta autofocus al abrir desde utility bar.
- `components/recepcion/ContextualActions.tsx` (nuevo): dock con tres acciones y panel con contexto, dato y CTA. Apertura tras 450 ms de hover/focus, apertura por click/touch, Escape y cierre al salir del grupo.
- `components/recepcion/P01.tsx`: nueva Home. Un próximo acceso, resumen Hoy, alerta prioritaria con total real, entregas pendientes con última entrega, último movimiento o vacío compacto y navegación inferior. Sin tablas, filtros, formularios ni workspace completo.
- `app/globals.css`: se reemplazó el bloque R1.2 por `.rec-command-center`; geometría, superficies, responsive, estados y motion R1.3.

Lógica/estado/datos/routing existentes conservados. Reutilizados ReceptionProfile, ReceptionClock, ReceptionSearch, Icon, useApp y las derivaciones de lib/recepcion. No se instalaron librerías.

## Motion

- Rail: hover/focus revela labels y superficie; expansión/contracción en 220 ms reorganiza layout.
- Search: apertura desde trigger en 220 ms y resultados con reveal de 180 ms; teclado conservado.
- Dock: elevación/contraste de 180 ms; panel contextual con delay de 450 ms y reveal de 200 ms.
- CTA: press y cambios de superficie en 160–180 ms.
- Previews: hover vertical de 2 px en 200 ms; enlaces responden en 180 ms.
- Quick nav: hover/active en 180 ms.
- Superficie ambiental: variación de overlay por foco en 220 ms.
- Scroll natural único, suave para navegación programática cuando no hay preferencia de movimiento reducido.
- Sin loops nuevos. `prefers-reduced-motion` se respeta incluso si el prototipo global tiene movimiento forzado. En el navegador de QA la preferencia está activa: las transiciones se verificaron desactivadas; no se afirma haber medido visualmente el timing normal.

## Verificación

- Build final correcto con TypeScript y lint.
- 1440×900: capturas en la conversación de rail compacto, expandido, búsqueda activa y contextual abierto por teclado.
- 1280/1024 y 390: sin superposición rail/contenido. Se corrigió la expansión por hover desktop que afectaba al viewport móvil; 390 compacto/expandido sin desbordes.
- Contextual de entrega abre P05 y focaliza el selector del formulario existente.
- Search real para Martín López, navegación por foco y Escape comprobados.
- Home a 1440×900 entra en el canvas sin scroll de contenido; a menor ancho el scroll pertenece sólo a desk-main.
- Resident: 27 vistas × claro/oscuro a 390×844, 54 verificaciones sin overflow ni imágenes rotas; Satoshi disponible.
- Git diff --check correcto; avisos de conversión CRLF preexistentes.

## Límites funcionales preservados

Actividad todavía no tiene pantalla de bitácora completa. Los accesos a Actividad apuntan al preview real existente; no se añadió una ruta ficticia ni se desarrolló la interna. Se informa actividad de hoy porque la fuente actual es actividadDelDia; no se afirma tener un filtro real por turno. Notificaciones muestra incidencias abiertas del estado, no eventos inventados. El escáner abre la pantalla existente; no promete validar DNI ni operar sin salir del Home.

Revisar en http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro

Detenerse para revisión del usuario.
