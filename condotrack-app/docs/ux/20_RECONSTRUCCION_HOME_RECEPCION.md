# Reconstrucción de Home Recepción · 22/09/2026

Pendiente de revisión visual del usuario. Esta ronda reemplaza la composición de R1 documentada en 19_R1_VISUAL_TARGET_V05_REVIEW.md. Sin commit ni push.

## Referencias inspeccionadas directamente

Los tres PNG están en `docs/ux/visual-targets/condotrack_visual_target_pack_v05/refs/user/`.

- **U02_volvo_modular_dashboard.png:** encabezado superior con utilidades y contexto, título en segundo nivel, imagen dominante con panel de herramientas lateral sobre la misma escena. Se reconstruyó el hero: foto de fondo continua, reloj a la izquierda y panel de dos operaciones a la derecha. La imagen y Today comparten un único conjunto; las acciones ya no son filas subrayadas.
- **U01_planner_clock_calendar.png (Floor Main):** rail visualmente liviano, contraste entre campo hundido y controles elevados; dial con marcas horarias junto a hora/fecha y vidrio limitado a la fotografía. La búsqueda es una superficie hundida; controles y botones tienen elevación suave.
- **U05_management_modular_dashboard.png:** agrupación de información en módulos de distinta responsabilidad, cifra principal de mayor escala, métricas subordinadas en un plano compartido y selector reconocible. Today se reconstruyó como base horizontal del mostrador, no como card independiente. Hoy/Todos es un control segmentado con selección elevada.

Se mantuvieron Satoshi, tokens CondoTrack y geometría del logo. No se trasladaron branding ni paletas externas.

## Componentes y archivos

- `components/ShellRecepcion.tsx`: nuevo shell con rail que participa del flex layout, compacto por defecto. Abierto empuja el contenido y activa reflow a menor ancho.
- `components/recepcion/ReceptionHeader.tsx`: reconstruido en dos niveles; edificio/contexto y acciones Agenda/Unidades arriba; título/fecha y búsqueda abajo. La búsqueda existente conserva sus resultados y teclado.
- `components/recepcion/P01.tsx`: nueva anatomía del hero y Today; accesos separados en cinco columnas: hora, persona/tipo, unidad/contexto, estado y acción. Se conservan cálculos, registros, filtros, estado y destinos.
- `components/recepcion/ReceptionClock.tsx`: dial con doce marcas, sin animación decorativa continua.
- `app/globals.css`: composición y superficies de `.rec-rebuilt`, reflow responsive y motion CSS.

Reutilizados ReceptionSidebar, ReceptionProfile, ReceptionSearch, Icon, estado y derivaciones de lib/recepcion. No se rediseñaron atención, actividad, loading ni pantallas internas; sólo se ubicaron los módulos existentes en la composición nueva.

## Motion

- Sidebar: ancho y flex-basis, 280 ms, curva sin rebote; reorganiza el contenido.
- Búsqueda: expansión y cambio de superficie al foco; reveal de resultados existente de 180 ms.
- Botones operativos: elevación de 3 px, sombra y desplazamiento de flecha en 200 ms; respuesta al presionar.
- Rail y quick actions de header: hover de 180 ms.
- Filas de accesos: superficie al hover y acción derecha con contraste/desplazamiento de 180 ms.
- Toggle Hoy/Todos: superficie y sombra de selección en 180 ms.
- Scroll suave dentro del escritorio.
- Sin nuevos loops. El prototipo conserva su modo de movimiento forzado; `motionreduce=1` respeta la preferencia del sistema y desactiva las transiciones y el scroll suave cuando corresponde.

## Validación

- Build final correcto, incluye TypeScript/lint.
- Desktop 1440×900 revisado visualmente con rail compacto y expandido; móvil revisado con rail abierto.
- 1440/1280/1024/390, rail cerrado y abierto: 8 variantes sin overflow horizontal ni superposición rail/contenido.
- Hoy filtra los accesos del día; búsqueda Martín López, ArrowDown y Escape correctos.
- Motion normal: transition sidebar 0.28s y scroll smooth verificados. Modo reducido: transition 0s y scroll auto verificados.
- Barrido Resident de 27 vistas en claro/oscuro a 390×844: 54 casos sin overflow, imágenes rotas ni falta de Satoshi.
- Consola sin errores/advertencias. git diff --check correcto, con avisos preexistentes de normalización CRLF.

Versión disponible en http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro

Detenerse para revisión. No avanzar a internas.
