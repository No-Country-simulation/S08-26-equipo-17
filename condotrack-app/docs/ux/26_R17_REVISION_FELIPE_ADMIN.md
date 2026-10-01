# 26 · R1.7 · Revisión de Felipe → Recepción reconstruida, sistema compartido y Administración

25/09/2026 · rama `UxUi` · HEAD `2fae1fe` · **sin commit ni push**. Working tree preservado (sin reset, stash ni checkout). Respaldo previo en el scratchpad de la sesión (`backup_r16_final/`, `globals_antes_poda.css`).

Fuente: `CONDOTRACK — FINAL USER REVIEW OVERRIDE` + `MOTION SYSTEM OVERRIDE` + el video de revisión (9:28, sin audio: se leyó por lo que Felipe señala, selecciona y recorre). El override revoca "no empezar Administración".

---

## 0. Qué se vio en el video (evidencia)

| Momento | Lo que marcó Felipe | Qué se hizo |
|---|---|---|
| 0:30–1:40 | Selecciona el panel "Acciones rápidas" fijo, el "03" del módulo Hoy y la actividad metida en Entregas | Rieles que abren su carpeta; módulos Accesos / Actividad / Entregas con información real |
| 0:40 | Oscuro verde/oliva | Oscuro compartido con Residente (#0E1210 / #171D19) |
| 0:48 | Búsqueda que ocupa el header y muestra "↑↓ recorrer resultados · Enter abrir" | Búsqueda que se estira a la izquierda sólo sobre las utilidades; instrucciones sólo para lectores de pantalla |
| 2:40–3:10 | "Simular una lectura" como protagonista del escáner | Escáner task-first; la simulación queda como control chico de prototipo |
| 3:50–5:40 | Agenda: reloj, filtros abajo, "PRÓXIMO", rayado, línea Ahora, "Esc cierra el detalle", verde de Aprobada | Agenda sobre U01 sin reloj, filtros arriba, próximo como línea, detalle como tercera columna |
| 5:25 | Unidades (la toma como buena) | Se conserva; se suma cabecera de identidad |
| 5:50 | Notificaciones débiles | Filas actor · evento · contexto · hora |
| 6:10–6:50 | Incidencias: tres KPI grandes, "Qué pasó" chico y con autocompletar del navegador ("gestprop.com.ar") | Resumen compacto, cola protagonista, formulario con campo real y `autocomplete="off"` |
| 7:20 | Actividad: hay que pasar el mouse para entender | Píldoras con acción escrita y bitácora legible en reposo |
| 8:20–9:20 | Entregas (bien), Residente: el calendario de Reservas como "el calendario fuerte" | Entregas conservada; Agenda y Reservas usan el calendario de Residente |

## 1. Sistema compartido (fase C)

`app/sistema.css` (nuevo) es la única fuente de tokens y primitivas para Recepción y Administración. Residente conserva su hoja y sus nombres; sus valores oscuros son los del sistema.

- **Tokens semánticos** (`:root`, claro/oscuro, con `prefers-color-scheme` y `data-tema`): `--bg --surface --surface-elevated --surface-sunken --surface-glass --surface-glass-strong --surface-overlay --text-primary --text-secondary --text-tertiary --divider --divider-strong --interactive --on-interactive --interactive-hover --interactive-press --accent --on-accent --focus --disabled --on-disabled --status-success/-warning/-danger (+ -bg)`, sombras, radios.
- **Oscuro único:** los `--rec-*` de Recepción pasan a ser alias de los semánticos (`globals.css`). Se borraron los hex verdes (#1c2520, #29352e, #45564b, #1f2923, #3b4a41…) y el velo del fondo abstracto pasa a `rgba(14,18,16,.95)`.
- **Tipografía:** Satoshi 400/500/700/900 únicamente (barrido: 0 pesos falsos). Títulos de pantalla afuera de las superficies (`.ct-cabecera`).
- **Primitivas (React en `components/sistema/`):** `FolderGlassCard` (silueta de carpeta calculada por `clip-path: path()`, vidrio real con backdrop-filter, filo con gradiente, sombra hermana para no apagar el vidrio, solapa con rótulo y versión espejada), `Segmentado` (FilterControl, radiogroup con flechas e indicador que se traslada; variante elevada U01), `StatusTag` y `Severidad` (informan, no parecen botones; la forma de la marca cambia con el estado), `TransicionVista`, `ProveedorNovedad`/`useNovedad`, `Buscador`, `NavPrincipal`, `Avisos`, `MenuPerfil`, `PanelHeader`, `usePopover`, `useIndicador`.
- **Primitivas CSS:** `.ct-glass/.ct-surface` (vidrio con filo), `.ct-btn` primario/fuerte/secundario/texto, `.ct-fila` (selección por marca + profundidad), `.ct-tabla-cab`, `.ct-tl` (línea de tiempo), `.ct-pop`, `.ct-panel`, `.ct-campo`, foco visible (`outline` carbón/hueso + halo amarillo).

### Movimiento

- **Tres modos, una regla para los tres roles** (`lib/movimiento.ts` + CSS): `?motionreduce=0` → normal forzado; `?motionreduce=1` → reducido forzado; sin parámetro → preferencia del sistema. Antes, el prototipo forzaba siempre el movimiento y además había reglas de Recepción (`@media (prefers-reduced-motion)` sin guarda) que lo apagaban igual: por eso Felipe no veía nada. Se corrigieron.
- **Tokens:** micro 140 · estado 190 · reflow 250 · panel 280 · módulo 300 · página 320 · salida 130 · stagger 55 ms; ease-out para entrar, ease-in para salir, sin rebote.
- **Medido en el build de producción, muestreo por cuadro (requestAnimationFrame), entorno de Felipe (sistema reducido + `motionreduce=0`):**

| Patrón | Resultado |
|---|---|
| Búsqueda | 44 → 432 px en 281 ms, hacia la izquierda; resultados 60 ms después |
| Acción rápida (carpeta) | traslado 18 → 0 px + opacidad 0 → 1 en ~280 ms, desde el lado del riel; vuelve hacia el riel al cerrar |
| Avisos / perfil | 200 ms, opacidad + 6 px |
| Cambio de destino | sale 130 ms (ease-in), entra 320 ms (12 px); el header no se anima; el indicador de navegación se desliza en 250 ms |
| Detalle de Agenda | 280 ms desde la derecha; el eje queda entero |
| Acceso | verificando 360 ms (barrido sólo mientras consulta) → la barra de estado se llena en ~220 ms |
| Sensor de novedad | exactamente 2 × 800 ms; a los 1,8 s queda el punto quieto con la cuenta; navegar no lo repite |
| Reducido (sistema o `motionreduce=1`) | todo instantáneo; estados, cuentas y etiquetas intactos |

Capturas antes / durante / después en `docs/ux/qa-r17/mov-*` (para el cuadro del medio se alargaron los tokens ×10 sólo durante la captura; los tiempos reales son los de la tabla).

## 2. Recepción (fase B)

| Pantalla | USER GOAL | Referencia primaria | Acción primaria | Qué cambió | Por qué |
|---|---|---|---|---|---|
| **Header** | Moverse y encontrar sin perder contexto | U02 / U11 | — | Una capa: marca (menú), navegación en una cápsula con indicador de carbón que se desliza, utilidades sin cajas | Felipe aprobó la estructura; rechazó los botones encajonados |
| **Búsqueda** | Encontrar unidad, persona o pase | U11 | Abrir resultado | Se estira a la izquierda sobre las utilidades (marca y nav quedan), foco al campo, resultados como superficie secundaria, Escape devuelve el foco a la lupa, texto de teclado sólo para lectores | El panel anterior desplazaba el header y ocupaba jerarquía con instrucciones |
| **Notificaciones** | Saber qué pasó sin abrir cada pantalla | Figma 23204:134646 | Abrir el aviso | Filas actor · evento · contexto · hora, grupos con filetes, no leído con marca contenida | Filas débiles |
| **P01 Inicio** | Saber qué viene y actuar rápido | U02 | Escanear acceso (control amarillo) | Rieles simétricos que abren su FolderGlassCard (no hay panel fijo; el aire vuelve a ser aire). Izquierda: agenda de hoy, resumen, incidencias. Derecha: escanear, registrar entrega, reportar. Módulos: Accesos (Esperados / Dentro / Salieron + próximo), Actividad (cuenta + 3 movimientos), Entregas (Recibido / Avisado + 2 filas) | Se restaura la interacción contextual; el módulo de un número se reemplaza por información |
| **P03 Escanear** | Leer el pase y pasar a verificarlo | U06 | Leer / cargar el código | Visor grande y limpio, leyenda debajo, pasos 1-2-3 y "se esperan hoy"; simulación plegada y rotulada "Prototipo" | Task-first; la simulación competía con la tarea |
| **P04 Validar** | Saber si puede pasar y registrarlo | U06 | Registrar el ingreso (sólo tras AUTORIZADO) | Resumen en una banda, código grande + teclado, verificación → identidad y estado → registro; editar el código invalida | Tres tarjetas para tres números; orden de tarea |
| **P08 Agenda** | Ver el día y abrir lo que hay que operar | U01 (U08 sólo el detalle) | La acción del evento (abrir pase / ver unidad) | Sin reloj; filtros arriba en la columna hundida; calendario de Residente; día con "Próximo" como línea; eventos del mismo material; detalle en tercera columna con imagen aprobada (lobby para visitas, fotos de espacios para reservas), datos, una acción tipo pase y "Cerrar"; "Volver a Agenda" en la pantalla de destino | Todo lo marcado en el video |
| **P02 Unidades** | Encontrar la unidad y saber qué espera | U07 | — | Se conserva; cabecera de identidad con foto del edificio, marco de vidrio, pisos con indicador que se desliza, transición de región | Felipe la toma como benchmark |
| **P07 Incidencias** | Asentar lo que pasa y seguir lo abierto | U06 | Reportar incidencia | Un resumen compacto (gravedad y estado filtran), cola como protagonista, panel lateral: reporte con "Qué pasó" como campo principal o detalle con gravedad ≠ estado ≠ responsable ≠ lugar + historial; lo nuevo entra marcado en la cola | KPI gigantes, formulario confuso, autocompletar del navegador |
| **P09 Actividad** | Saber qué pasó, cuándo, a quién | U09 | — | Píldoras con hora y acción escritas por carril; bitácora con ancla de día y columnas hora · tipo · qué pasó · registró; nada depende del hover | Había que pasar el mouse para entender |
| **P05 Entregas** | Registrar y entregar | U05 | Registrar y avisar (form) | Se conserva el flujo; retiro por fila secundario; estado como progresión Recibido → Avisado → Retirado; la fila entregada muestra el cambio antes de irse; material y filetes del sistema | Era lo más fuerte; se ordenó sin rehacer |
| **Carga** | — | — | — | Se conserva; se anima también en modo forzado; sirve a Recepción y Administración | Pedido explícito de no rediseñar |

## 3. Administración (fase D) · A01–A17

Un solo shell (`components/ShellAdmin.tsx`): menú lateral estable (Figma 23204:130822: grupos General / Operación / Edificio / Economía, filas repetibles, indicador de carbón que se traslada, cuentas de pendientes en amarillo), barra superior con edificio, avisos, perfil y la misma búsqueda. Patrón central `ListaDetalle`: BUSCAR → FILTRAR → LISTA → ELEGIR → DETALLE sin salir de la lista (columnas secundarias se retiran mientras el detalle está abierto; Escape devuelve el foco a la fila).

| Pantalla | USER GOAL | Referencia | Acción primaria | Qué hace |
|---|---|---|---|---|
| **A01 Inicio** | Entender qué requiere atención y actuar | U03 | La acción de cada pendiente | Titular editorial "N cosas requieren atención." con cortes que filtran (críticas / sin responsable / de hoy); cola con qué · responsable · acción; "Próximo" en módulo carbón con lo que sigue; "Qué cambió" como línea de tiempo. Sin grilla de KPIs |
| **A12 Casos** | Clasificar, asignar y cerrar | U06 | Asignar responsable | Reclamos (residentes) + incidencias (recepción) en una cola; severidad, estado, responsable y categoría separados; asignar; cerrar exige resolución; historial |
| **A08 Accesos** | Auditar autorizaciones y movimientos | U06 | — (lectura) | Pases por hoy / próximos / historial / permanentes; estado del pase ≠ presencia; movimientos en línea de tiempo |
| **A09 Entregas** | Supervisar la custodia | U07 | — | En custodia / retiradas; horas de custodia (>24 h resaltado); trazabilidad |
| **A10 Reservas** | Decidir pedidos y cuidar la disponibilidad | U01 | Aprobar la reserva | Misma gramática que la Agenda de Recepción; aprobar revalida superposición (y se bloquea si hay choque); rechazar y cancelar exigen motivo; aprobar crea la reserva que ve Recepción |
| **A02 Edificios / A03 Edificio** | Ver la cartera y la ficha | U07 | Abrir ficha | Lista de edificios; ficha con espacios (aprobación manual o automática), reglas de reserva (lectura) y equipo |
| **A04 Unidades / A05 Unidad** | Ficha, vínculos, cuenta y pendientes | U07 | Ficha e historial | Administración sí ve cuenta y saldo; ficha completa con vínculos, cuenta e historial (y "Volver a Unidades") |
| **A06 Personas / A07 Persona** | Quién vive, con qué vínculo y capacidades | U07 | Ficha de la persona | Vínculo, titular, app activa/invitada; capacidades separadas del vínculo |
| **A13 Documentos** | Publicar y archivar | U07 | Publicar | Audiencia, versión, estado; archivar pide confirmación |
| **A15 Expensas** | Ver el período en preparación | U07 | Cargar gastos | Períodos con total y estado; rubros del período en curso; liquidar/publicar se declara fuera del prototipo |
| **A16 Gastos** | Cargar el gasto del mes | U07 | Cargar al período | Lista con rubro y búsqueda; formulario lateral validado; lo cargado suma al borrador |
| **A17 Cobranza** | Conciliar pagos informados | U06 | Conciliar el pago | Cola por conciliar / conciliados / rechazados + unidades con saldo; rechazar exige motivo; aviso visible: sin integración bancaria |

**Datos demo agregados (documentados en `lib/admin.ts`, sin backend):** 2 solicitudes de reserva pendientes (3A Parrilla, 9B SUM), 3 pagos informados de otras unidades, equipo y proveedores para asignar, documentos con audiencia/versión/estado (+1 borrador), personas derivadas de `UNIDADES`. Estado nuevo en `lib/estado.tsx`: `solicitudes`, `cobranza`, `gastosCargados`, `documentos` y `auditoria` (registro de decisiones de administración, separado del historial de la unidad del residente para no mezclarlo). `Incidencia` suma `responsable` y `acciones`.

## 4. QA (fase E)

- `next build` (producción) ✓ · `tsc --noEmit` ✓ · `git diff --check` ✓.
- **Barrido responsive en producción:** Recepción 8 vistas + Administración 15 vistas × claro/oscuro × 1440 / 1150 / 901 / 900 / 768 / 390 = **276 mediciones, 0 problemas** (sin desborde de documento ni de la región principal, sin imágenes rotas, sólo Satoshi, sin pesos inválidos).
- **Residente:** 27 vistas × 2 temas sin desborde, sin imágenes rotas, Satoshi, sin variables de Recepción filtradas; la hoja de R01 mide igual que antes (743 px).
- **Teclado:** búsqueda (foco al campo, ↓/↑ recorren, Enter abre, Escape cierra y devuelve el foco), perfil y avisos (Escape devuelve el foco), rieles (Enter abre, Escape cierra), paneles de Incidencias y de Administración (foco al panel, Escape vuelve a la fila), segmentados (flechas), hoja de retiro (foco adentro, Escape vuelve al botón).
- **Movimiento:** cuatro modos verificados (tabla §1).
- **CSS muerto:** poda automática en la región de Recepción de `globals.css` (una regla se va sólo si ningún selector puede coincidir con clases que existen en el código): 1.022 reglas; `globals.css` 346 KB → 250 KB. Re-verificado con todas las capturas.

Capturas: `docs/ux/qa-r17/` (103 archivos: claro/oscuro 1440 de todas las pantallas, móvil 390, tablet 900, cuadros de movimiento). **Se tomaron pasada la medianoche:** los datos demo son relativos al reloj de quien mira, así que a esa hora la actividad "de hoy" todavía no ocurrió (por eso el Inicio muestra "00 movimientos hoy" en algunas). Durante el día se ven completas.

## 5. Criterios de aceptación (§34)

Para cada pantalla se verificó: dónde estoy (título afuera + nav/menú con activo), qué importa primero (jerarquía tipográfica), acción primaria única (amarillo una vez por contexto), estado actual (StatusTag / progresión / barra de estado), selección (marca + profundidad), cerrar / volver (Cerrar visible, Escape, "Volver a…"), sin color (la forma de la marca y la palabra cambian), sin movimiento (modo reducido completo), teclado, mismo CondoTrack en los tres roles. **La aprobación visual es de Felipe:** no se declara terminado hasta su revisión.

## 6. Deuda y bloqueos reales

- `globals.css` sigue siendo una hoja histórica apilada (250 KB). Lo nuevo vive en `sistema.css` / `recepcion.css` / `admin.css`; migrar Residente al sistema semántico es otra ronda.
- Componentes sin uso que quedan: `ReceptionProfile.tsx`, `ShiftActivity.tsx`, `ReceptionSearch` (se usa sólo `OperationalSearchField`). No se borraron para no mezclar limpieza con la revisión.
- **Bloqueos de datos de producto:** liquidación por unidad y publicación de expensas (no hay motor), conciliación bancaria (no hay integración), pagos sin unidad en el modelo del residente, historial por unidad sólo cargado para 7D, auditoría sin persistencia (todo vive en memoria), capacidades por vínculo y protocolo de alertas sin definir (ver `11_ROLE_SYSTEM.md` §F).
- Las fotos de espacios y del edificio son assets aprobados del repo; no se agregó imaginería nueva.
- `next.config.mjs` admite `CT_DIST_DIR` para correr un servidor de QA sin pisar el `.next` de otro proceso (por defecto no cambia nada).

## 7. URLs de revisión

Build de producción de esta ronda (servidor de QA): `http://localhost:3003`. En el entorno de Felipe (movimiento reducido del sistema) agregar `&motionreduce=0` para ver el movimiento.

- Recepción: `/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro&motionreduce=0` (cambiar `tema=oscuro`)
- Agenda con la mudanza abierta: `…&v=p08&ref=ag4` · Validar: `…&v=p04&ref=CT%207D%204821` · Reportar incidencia: `…&v=p07&ref=nueva` · Unidad: `…&v=p02&ref=7D`
- Administración: `/?perfil=administracion&p=app&v=a01&limpio=1&tema=claro&motionreduce=0` · Casos `v=a12` · Reservas `v=a10` · Cobranza `v=a17` · Unidad `v=a04&ref=7D`

El `next start` que Felipe tenía en `:3001` sirve el build anterior: para ver esta ronda ahí, detenerlo, `npm run build` y `npm run start -- --port 3001`.
