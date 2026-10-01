# IMPLEMENTATION_PROGRESS

Checkpoint documental del master v02 (`CLAUDE_CODE_FINAL_MASTER_PROMPT.md`, 29/09/2026).
**No es un commit.** No se hizo commit, push ni deploy.

Última actualización: **29/09/2026** · sesión 1.

---

## Checkout y build fijados

| | |
|---|---|
| Producto real | `E:\- DISEÑO WEB\CondoTrack\_github-sync\condotrack-app` |
| Rama | **UxUi** |
| HEAD | `2fae1fe` · *UX/UI checkpoint: update CondoTrack resident prototype* |
| Dirty al empezar | **160 archivos**, casi todos de `backend/` (Java). **No se tocó ninguno.** |
| Stack | Next 14.2.35 · React 18.3.1 · TS 5.5.4 · sin librerías de UI |
| Tipografía vigente **en código** | **Satoshi** (Fontshare, `app/layout.tsx` + `--ff-ui`/`--ff-display`). Confirmada, **no migrada** |
| Gate ejecutado | `npx tsc --noEmit` → **limpio** antes y después de cada cambio |

### Conflicto de ruta resuelto — leer antes de seguir

El master dice trabajar en `_github-sync/condotrack-app` y **no** en el homónimo
`CondoTrack/condotrack-app`. Ambos existen y los dos tienen historia reciente:

| Ruta | Rama | HEAD | Qué es |
|---|---|---|---|
| `_github-sync/condotrack-app` | UxUi | `2fae1fe` | **El producto. Acá se trabaja.** |
| `condotrack-app` | master | `36e4ef4` | Hermano desincronizado. **No tocar.** |
| `condotrack-motion-lab` | — | — | Laboratorio, **sólo lectura** |

La documentación de `docs/ux/` y `CLAUDE.md` que se armó el 17/09 ya está dentro del
checkout autorizado, así que no hubo que migrarla.

---

## §2 · Correcciones finales

### DEC-002 · Archivadas fuera de la interfaz — **DONE**

Archivos: `components/screens/R03.tsx`, `lib/data.ts`.

- Se retiró la pestaña **Archivadas**, el filtro y el tipo `"archivada"` del estado
  de un aviso. No quedaron acciones de archivar ni desarchivar: no existían como
  acción en RES, sólo como filtro.
- El aviso que estaba archivado (`n5`, *Comunicado del edificio*, 10 sep) **no se
  borró**: pasó a `leida`, con lo cual queda en la lista general conservando su
  estado de lectura y su lugar cronológico, y se le dio destino (`r14`, Documentos)
  para que siga siendo alcanzable.
- Se revisó que no quedaran estados vacíos dependientes del filtro retirado. Apareció
  uno nuevo: con el filtro **No leídas** y nada sin leer, caía el vacío aprobado
  *"Sin notificaciones"*, que es mentira — hay notificaciones, están leídas. Se separó
  en dos vacíos: el aprobado se conserva intacto para "sin datos", y el de filtro dice
  *"Estás al día"* y ofrece **Ver todas**, como pide SYS-EMPTY.

**Distinción que importa:** `components/admin/Edificio.tsx` tiene documentos en estado
*Archivado*. **Eso no se tocó**: es el ciclo de vida de un documento del consorcio, no
el archivo personal de notificaciones que pidió retirar DEC-002.

Verificación: `grep -rn "archivada" components/ lib/ app/` → sin resultados. `tsc` limpio.

### DEC-003 · Pendiente de expensas en Home RES — **DONE**

Archivos: `components/ui/WidgetPrincipal.tsx`, `components/screens/R01.tsx`, `app/globals.css`.

Reconciliación primero: la etiqueta **ya era** metadata y **no** simulaba CTA —
`.pastilla` en el widget ya venía sin relleno, sin borde y sin radio. Eso se conserva.
Lo que sí fallaba:

1. **Tamaño invertido.** La etiqueta de estado se renderizaba a 12 px (`--t-label`)
   dentro de un detalle de 13,5 px: el estado quedaba por debajo de su propio contexto,
   y `AGENTS.md` ya fija que nada importante vive en 11–12 px. Ahora hereda el tamaño
   del detalle. Sigue siendo metadata: no gana superficie ni peso.
2. **Severidad indistinguible.** *Pendiente* y *Vencida* mostraban el mismo punto
   amarillo: la clase `.pastilla.vencida` existía en CSS pero nadie la aplicaba. Se
   agregó `tono` al tipo y R01 ahora pasa la severidad real. Estado y severidad quedan
   separados, y como la etiqueta textual va primero, se entiende en escala de grises.
3. **Contraste sobre el campo oscuro.** La etiqueta heredaba `rgba(255,255,255,.82)`;
   pasa a blanco pleno.

No se cambió el significado: *Pendiente* sigue mientras ese sea el estado real, nunca
se reemplaza por *Pagada*, y **Pagar** sigue siendo la acción aparte de abajo.

### DEC-005 · Regiones plegables del Home ADM — **DONE** (reparado y verificado en la sesión 2)

Archivos: `components/admin/Plegable.tsx` (nuevo), `components/admin/A01.tsx`,
`app/admin.css`, `app/sistema.css`.

**Identificación de la "barra de tareas"**, que DEC-005 pide hacer por función y
contenido: en `A01` hay cuatro regiones — el titular con sus cortes, *Próximo*,
*Pendientes* y *Qué cambió*. La barra de tareas del Home es **Pendientes**: es la cola
de lo que espera una decisión. El control segmentado de cortes es un filtro, no una
barra de tareas, y vive dentro del titular. Se aplicó por lo tanto **un solo control**
sobre Pendientes, sin acordeones anidados, como prevé el propio DEC-005.

Un componente compartido para las tres regiones, no tres implementaciones:

- `<button aria-expanded aria-controls>` con el título adentro.
- **El cuerpo no se desmonta, se oculta.** Esa es la decisión que hace que el filtro
  elegido, la selección, un borrador a medio escribir y el scroll interno vuelvan como
  estaban.
- Cerrada conserva encabezado, resumen y control de reapertura. *Pendientes* muestra
  cerrada `n de N` y, si hay críticas, cuántas más un punto rojo: plegar no puede
  esconder algo crítico.
- **Nunca se colapsa sola**: no hay lógica por vacío, por inactividad ni por recibir
  actualización. Sólo la pliega la persona.
- Si el foco está adentro de lo que se va a ocultar, vuelve al trigger.
- Motion 240 ms con token nuevo `--dur-panel` (MOT-010); `prefers-reduced-motion` y
  `[data-movimiento="reducido"]` lo dejan instantáneo.

**Descartado explícitamente**, como manda DEC-005: nada de apagar dashboards,
interruptores de encendido ni suspensión por inactividad. Plegar es presentación.

Efecto colateral revisado: `.ad-a01-cola>.ct-tabla-cab` era un selector de hijo directo
y dejó de alcanzar al moverse el cuerpo un nivel adentro. Corregido.

### DEC-001 · Gastos, alcance conservador — **DONE en la sesión 2** (ver ADM-021)
### DEC-004 · Tres controles — **IDENTIFICADOS en la sesión 2** (ver abajo)

El video `sources/01-cambos-condotrack-generales._compressed.mp4` (24:03, pista
silenciosa) no se puede inspeccionar desde este entorno, y los tres targets se
identifican por marca de tiempo sobre ese video. Según el propio DEC-004, sólo **ese
ajuste puntual** queda bloqueado: el comportamiento actual de los tres controles se
preserva y el resto de las fases sigue.

---

# Sesión 2 · 29/09/2026 · Claude Code (retoma el master completo)

La sesión 1 (Cowork) aplicó sólo DEC-002, DEC-003 y DEC-005 y se detuvo. Esta
sesión retoma desde `## 5. Orden de implementación` del master y recorre las
fases 1–7. Servidores: producción de Felipe en **:3001** (build `.next`),
desarrollo de QA en **:3002** (`CT_DIST_DIR=.next/qa-dev`). Línea de base de
las 50 vistas capturada antes de tocar nada (scratchpad de QA, ver QA_RESULTS).

## Reparación de la sesión 1 — DONE (verificado en pantalla)

| Defecto | Causa real | Arreglo | Archivos |
|---|---|---|---|
| Flecha del plegado invertida | El ícono `chevron` apunta a la derecha; abierto rotaba 0° (›) y cerrado −90° (˄) | Cerrado 0° (›), abierto 90° (⌄) | `app/admin.css` |
| Región cerrada deja una card vacía del alto de la vecina | La grilla estira los ítems de la fila | `.ad-plegable:not([data-abierto]){align-self:start}`: cerrada mide su encabezado (90 px) | `app/admin.css` |
| `h2` dentro de `button` | El título dejaba de ser encabezado para lectores | `h2 > button[aria-expanded]` | `components/admin/Plegable.tsx` |
| Inicio decía *Pendiente* con la expensa vencida mientras Notificaciones decía *venció* | `lib/expensas` nunca asignaba `vencida`: el aviso calculaba por fecha y el Inicio leía el dato guardado. La rama *Vencida* de la sesión 1 era código muerto | Una sola regla `estadoDe()` en `lib/expensas.ts` (pagada es hecho registrado; vencida = sin pagar y vencimiento pasado). `expensaDelMes`, `expensaDe`, `expensasDeLaUnidad` y `avisosExpensa` la usan; Inicio, Expensa (R20) y Movimientos (R23) leen lo mismo. El detalle pasa a *Venció el 20 sep*. Punto de severidad sobre carbón con el rojo para fondo oscuro | `lib/expensas.ts`, `R01.tsx`, `R20.tsx`, `R23.tsx`, `app/globals.css` |
| Contraste de la etiqueta de estado (sesión 1) no aplicaba | Una regla posterior (`color:inherit`) la pisaba | La regla vigente pasa a `#fff` | `app/globals.css` |

## Fase 1 · Primitivas — DONE

Auditoría: ya existían `Segmentado`, `Buscador`, `StatusTag`, `ct-campo`, `ct-btn`
(escritorio) y `Formulario` (`Texto`, `Area`, `Elegir`, `Segmentos`), `Chips`,
`Hoja` (residente). No se creó ningún componente nuevo: se ajustaron los existentes.

| Req. | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| Tokens de motion (§07) | DONE | Tabla única MOT-001…014 en `sistema.css`: press 120, hover 140, foco 160, conteo/cierre 180, tema 200, panel/confirmación 240, búsqueda 260, detalle 280, grupo/entrada 300, salida 130. E1 `cubic-bezier(.22,1,.36,1)`, E2 `cubic-bezier(.4,0,1,1)` | `app/sistema.css` |
| SYS-FORM | DONE | Residente: label 14 px, filo de 1 px + sombra interior leve, foco 160 ms con anillo de contraste (carbón/hueso) + halo amarillo; error con anillo propio. `Elegir` asocia label, valor, ayuda y error. Escritorio: mismo filo e inset en `ct-campo`. Formularios de Recepción: el foco amarillo solo (1,2:1 sobre claro) pasa a anillo de contraste | `app/globals.css`, `app/sistema.css`, `components/ui/Formulario.tsx` |
| Foco visible | DONE | Residente: el foco global era un contorno amarillo (no llega a 3:1 sobre claro). Pasa a anillo 2 px de contraste + halo amarillo; sobre campos oscuros el anillo es blanco (`--foco-anillo`) | `app/globals.css` |
| SYS-BTN | DONE | Press 120 ms en `ct-btn`, `.entrar`, `.btn-sec`; estado ocupado (`aria-busy`) impide el segundo toque | `app/sistema.css`, `app/globals.css` |
| SYS-SELECT / RES-035 | DONE | El selector del Home no tenía teclado ni swipe. Ahora tap, swipe (>48 px horizontal) y flechas/Inicio/Fin pasan por el mismo estado; indicador que se traslada y queda a 1.03 (160 ms E1); reducido sin traslado ni zoom. `Segmentos` usa el mismo `useIndicador` que el segmentado de escritorio y suma flechas | `components/ui/WidgetPrincipal.tsx`, `components/ui/Formulario.tsx`, `app/globals.css` |
| SYS-SEARCH / ADM-004 | DONE | En Administración el campo quedaba en ~140 px porque el ancho mínimo era un % de un contenedor auto. Ahora se pide al viewport: 44→432 px. Abre 260 ms E1, cierra 180 ms E2; foco en el input al abrir; Escape devuelve el foco a la lupa | `app/sistema.css` |
| SYS-PANEL, SYS-STATUS, SYS-EMPTY | KEEP | `Hoja`, `ct-panel`, `StatusTag`, `Vacio` ya cumplen; se ajustan por pantalla en las fases 2–4 | — |

Verificación Fase 1 (dev :3002, Chrome headless, medido por rAF): búsqueda Admin
`44 px → 431 px a los 213 ms, 432 al final`, foco `INPUT`; Escape → foco `ct-buscar-lupa`,
ancho 44. Selector Home: flecha → *Visitas* activa y enfocada, indicador
`matrix(1.03,…)`; swipe táctil → *Entregas*. Segmentos F01: flecha ← → *Tarde*
elegida y enfocada. Capturas de foco de campo en claro y oscuro. `tsc` limpio.

## DEC-004 · tres controles — IDENTIFICADOS (ya no BLOCKED)

El video del paquete se reprodujo en Chrome headless y se capturaron los tres
tramos cada 3 s (no hay ffmpeg en la máquina; cuadros en el scratchpad de QA).

| Tramo | Qué se ve | Target | Resolución |
|---|---|---|---|
| Gastos RES 02:25–03:00 | Selecciona "Tu parte · 1,897%" (02:38), apoya el puntero en "Septiembre de 2026 ⌄" (02:41–02:44) y abre la hoja Período | **Selector de período** de R21 | Se lee como control (rótulo, valor, flecha, 44 px) — RES-013/014 |
| Notificaciones RES 04:10–04:35 | Recorre los puntos amarillos y la hora; al pie, los puntos desaparecen (04:29) | **"Marcar todo como leído"**, al pie y tapado por la barra | Sube junto al filtro con el conteo — RES-019 |
| Home ADM 20:35–21:00 | El puntero queda sobre el título "Qué cambió" (20:36–20:57) | **Encabezado "Qué cambió"**, que no era un control | Hoy es disclosure (DEC-005) y se agrega acceso al historial (fase 4, ADM-010) |

## Fase 2 · Residente — DONE (con KEEP y límites anotados)

| Req. | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| RES-001/006/008/020/023/031/034 | KEEP | Home, Visitas hoy, composición de formularios, vacío aprobado, gráfico de gastos, Reclamo creado y flujos no señalados sin rediseño | — |
| RES-002 | DONE | Importe del Home 50→32 px (texto 30 px), cabe en una línea a 390 px | `app/globals.css` |
| RES-003 | DONE | Ojo mostrar/ocultar (aria-pressed, 44 px). Preferencia por usuario en el navegador (sólo sí/no, nunca el importe); sin preferencia se ve, que es la composición aprobada. Oculto enmascara Inicio, Expensa, Movimientos, Pagar, Tu parte, Más y los avisos, también para lector (`Importe oculto`) | `lib/privacidad.ts`, `components/ui/Importe.tsx`, `R01/R20/R21/R23/Mas/R03`, `HojaPagar`, `lib/expensas.ts` |
| RES-004 | DONE | Pendiente/Vencida como metadata con regla única de estado (ver Reparación) | — |
| RES-005 | DONE | Pagar: press 120 ms, foco blanco sobre carbón, 52 px; activar abre la misma hoja | `app/globals.css` |
| RES-007 | DONE | La card de reserva abre ESA reserva (R18 la marca y la centra); volver restaura scroll y la categoría del selector | `R01`, `R18`, `ShellResidente`, `WidgetPrincipal` |
| RES-009/010 | DONE | Campos compartidos (fase 1); la franja se dice completa: "De 19:00 a 00:30 del día siguiente" | `lib/formato.ts`, `F01` |
| RES-011 | KEEP | El formulario no tiene fondo animado; la carga sólo afecta el botón | — |
| RES-012 | DONE | "Tu parte" en su propio plano opaco con participación de la unidad; montos con privacidad | `R21`, `app/globals.css` |
| RES-013 | DONE | DEC-004 (a): selector de período | `R21` |
| RES-014 | DONE | Hoja de períodos con la lista del sistema (sin tarjeta anidada); elegido con peso, filo y tilde; Escape devuelve el foco al selector | `R21`, `app/globals.css` |
| RES-015 | DONE | Espacio y fecha se leen con el título; espacio elegido con filo (no bloque negro); leyenda corta; el calendario sigue al día elegido en la tira (en la revisión decía "Julio" con "10 oct" en la hoja); un solo estilo de elegido | `R05`, `app/globals.css` |
| RES-016 | DONE | La hoja del día muestra todos los turnos: libres, "Ocupado", "Tu reserva", "Tenés otra"; nunca de quién. Revalida al confirmar y conserva el día si el turno se ocupó | `R05` |
| RES-017 | DONE | Más en tres grupos (Tu cuenta, Edificio, Preferencias) con subgrupos; 2 columnas desde 720 px; ningún destino perdido | `Mas.tsx`, `app/globals.css` |
| RES-018 | DONE | "No leída" en texto junto a la hora (+ punto); se retira el punto flotante; abrir un aviso lo marca leído (estado personal por aviso) | `R03`, `lib/estado.tsx`, `lib/expensas.ts` |
| RES-019 | DONE | Grupos Hoy/Ayer a 24 px con rótulo fijo al scrollear; DEC-004 (b) | `R03`, `app/globals.css` |
| RES-021 | DONE | Sesión 1; el contador de Más y la lista leen la misma función | `lib/expensas.ts` |
| RES-022 | DONE | Informado ≠ conciliado: el Inicio dice "Pago informado · a confirmar" y no ofrece Pagar otra vez; un pago confirmado por Administración salda la expensa en Residente | `R01`, `lib/expensas.ts` |
| RES-024 | DONE | Votaciones sin verde/rojo por opción; "Tu voto" y "Más votada" en texto; cuerpo ≥4.5:1 sobre carbón | `R24`, `app/globals.css` |
| RES-025 | DONE | Marca del pie de lista a opacidad 1 (estaba al 14 %); geometría intacta | `app/globals.css` |
| RES-026 | DONE | Foto del hall en la cabecera del pase, detrás del nombre; el QR queda sobre blanco | `R07`, `app/globals.css` |
| RES-027 | DONE | Compartir real (Web Share) con estados compartido/cancelado/copiado/error; sin Web Share copia el pase; Copiar dice éxito y error | `R07`, `Descarga.tsx` |
| RES-028 | KEEP | Baja: texto que aclara historial y serie; Recepción ya trata el pase dado de baja como "de baja" (P04) | `R07` |
| RES-029 | DONE | Resumen de recurrencia (día de la semana + franja + qué hace la baja) | `F01` |
| RES-030 | DONE | Confirmación compacta con el pase emitido (visita, día, franja, repetición, código); "Ver el pase" abre ESE pase; motion 240 ms una vez | `F01`, `Estados.tsx`, `app/globals.css` |
| RES-032 | DONE | Internas sin manchas por ámbito: un plano neutro común arriba | `app/globals.css` |
| RES-033 | DONE | Transferencia en grilla (titular, banco, alias, CBU, referencia) con copia inequívoca y "Transferí desde tu banco y después informá el pago" | `PanelMedios.tsx`, `app/globals.css` |
| RES-035 | DONE | Fase 1 | — |

Verificación Fase 2 (dev :3002, 390×844, headless): ojo → `aria-pressed=true`,
cifra `$ ••••••`, etiqueta accesible `Importe oculto`; Más y Notificaciones ya no
contienen `184.250`; foco vuelve a `comp-periodo` tras Escape; elegir 2 oct en la
tira pone el calendario en `Octubre 2026`; confirmación de visita con franja
"De 19:00 a 00:30 del día siguiente" y "Ver el pase" abre el pase de Ana Pérez;
compartir sin Web Share → "copiamos el pase"; R18 con `ref=rs1` marca la reserva.

## Fase 3 · Recepción — DONE

| Req. | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| REC-001 | KEEP | Layout, navegación, reloj, módulos y carpetas contextuales sin reconstruir | — |
| REC-002 | DONE | Arco neutral CSS (semicírculo) detrás del centro y los módulos: 9→5 % carbón en claro, 9→4,5 % hueso en oscuro; `pointer-events:none`, z-index debajo de las superficies, sin verde | `app/recepcion.css` |
| REC-003 | DONE | Controles de 48 px (antes 56), centrados en vertical con el centro operativo (medido: centro 110–458, rieles 200–368, ambos con centro en y=284). A ≤900 px pasan a fila sin comprimirse; la carpeta se posiciona por fila de control | `app/recepcion.css`, `ContextualActions.tsx` |
| REC-004 | DONE | "Ver incidencias" (ícono lista) y "Reportar incidencia" (ícono +) se distinguen por nombre e ícono; "Resumen de hoy" pasa a reloj. Cada control muestra su nombre al foco y al hover, y al toque abre su carpeta titulada | `P01.tsx`, `ContextualActions.tsx`, `app/recepcion.css` |
| REC-005 | DONE | La solapa del módulo ya no repite "Accesos"; queda "Accesos de hoy" como único encabezado; Esperados/Dentro/Salieron, Próximo y "Ver accesos" siguen | `P01.tsx` |
| REC-006 | KEEP | Agenda, Unidades, Actividad, Accesos, verificar ≠ registrar, mudanza aprobada: sin cambios de función | — |

Verificación Fase 3: capturas 1440 claro/oscuro, 900 y 390 sin desborde horizontal;
foco en "Reportar incidencia" muestra el rótulo; Enter abre su carpeta.

## Fase 4 · Administración — DONE (con KEEP y un bloqueo de datos)

| Req. | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| ADM-001 | DONE | Operación, Edificio y Economía con encabezado-botón (`aria-expanded`); plegar no navega; con la familia cerrada el destino activo sigue visible y el encabezado suma los pendientes ocultos; se recuerda en el navegador; filas de 42 px (shell más compacto) | `AdminMarco.tsx`, `app/admin.css` |
| ADM-002 | DONE | Títulos de página 30–36 px, sección 20–21, fila 15, meta 13; cuerpo operativo ≥14 | `app/admin.css` |
| ADM-003 | KEEP · límite | El selector conserva su relación con el contenido. El prototipo opera un solo edificio (Aráoz 1280); los demás se consultan en Edificios. Cambiar el alcance operativo necesita datos de otros edificios: BLOCKED por datos, no por diseño | — |
| ADM-004 | DONE | Fase 1: el campo abre a 432 px (antes ~140); estados buscando/vacío existentes; Escape devuelve el foco | `app/sistema.css` |
| ADM-005 | KEEP | Proveedor de tema intacto | — |
| ADM-006 | DONE | Total derivado de las entidades accionables únicas (dedupe por id); 0/1/N; conteo filtrado "n de N" en la cola; la cifra se anima (180 ms) sólo si cambia, no al volver | `A01.tsx`, `app/admin.css` |
| ADM-007 | DONE | Hero de 208 px con `fachada.jpg` fundida a la derecha (mismo asset del Home RES); titular y filtros sobre la parte serena; en móvil la foto pasa a banda superior de 120 px | `A01.tsx`, `app/admin.css` |
| ADM-008 | DONE | Filtros en fila compacta (sin la barra de fondo a todo el ancho), "Limpiar filtro" cuando hay uno activo, "n de N" en la cola; vacío que explica y ofrece ver toda la cola | `A01.tsx` |
| ADM-009 | DONE | Cola en 2/3 del ancho; a 1440×900 las primeras cuatro filas terminan en y=710; scroll interno sólo en escritorio alto (≥1101×760) con fundido que aparece sólo si hay filas fuera (`useDesborde`); en móvil, scroll de página | `A01.tsx`, `useDesborde.ts`, `app/admin.css` |
| ADM-010 | DONE | "Qué cambió" agrupado por día (Hoy/Ayer/fecha), filas compactas hora · acción y entidad · actor; "Ver N más" despliega el resto en el lugar; fundido si desborda | `A01.tsx`, `app/admin.css` |
| ADM-011 | DONE | Tres regiones plegables (reparadas): barra de tareas = Pendientes, abierta al entrar; nada se pliega solo | `Plegable.tsx`, `A01.tsx` |
| ADM-012 | DONE | DEC-004 (c): "Qué cambió" era el control que no abría; hoy es disclosure y el resto de la historia se despliega | `A01.tsx` |
| ADM-013 | KEEP | Reservas: aprobar/rechazar con motivo y conflicto sin cambios | — |
| ADM-014 | KEEP | Casos: lista/detalle, asignación y cierre | — |
| ADM-015 | DONE | Los cuatro KPI grandes pasan a ser los filtros con su conteo (Abiertos, Gravedad alta, Sin responsable, Cerrados, Todos; origen con conteo); "n de N"; "Limpiar filtros"; vacío con limpiar | `Operacion.tsx`, `app/admin.css` |
| ADM-016 | KEEP | Sin bloques de relleno nuevos | — |
| ADM-017 | DONE | Accesos: filas de 70 px, persona 16 px, estado y celdas 13,5–14,5 px; sólo esa lista | `app/admin.css` |
| ADM-018/019/022 | KEEP | Entregas, Edificio/Unidades y Cobranza (con su nota de "sin integración bancaria") | — |
| ADM-020 | KEEP | La lupa ya está al inicio del campo en todas las listas | — |
| ADM-021 | DONE | Copy sin promesa de liquidación ("el reparto por unidad no se calcula en este prototipo"); período y moneda fijos a la vista en el formulario; importe con ayuda que confirma lo que se va a cargar; errores con ícono y `aria-describedby`; al cargar se limpian filtros que la ocultarían, la fila nueva se marca y el mensaje da el total nuevo del período; fechas en una línea | `Economia.tsx`, `app/admin.css` |
| ADM-023 | KEEP | Ninguna card informativa se eleva al hover en Administración | — |

Verificación Fase 4 (dev :3002, headless, medido): hero 208 px; cuatro primeras
filas de la cola hasta y=710 a 1440×900; `data-desborde="abajo"` con 8 ítems;
Críticas → "1 de 8 · 1 crítica" + Limpiar; Limpiar → "8 en total"; Operación
plegada → sin ítems visibles y "4" pendientes; en Casos con Operación plegada
queda "Casos" activo; Casos · Gravedad alta → "1 de 6"; gasto "Vidriería Norte
$ 125.000" → primera fila y "21 gastos · $ 9.837.400". Claro/oscuro y 390 px sin
desborde.

---

## Fases (estado al cierre de la sesión 2)

| Fase | Estado |
|---|---|
| 0 · Auditoría y conciliación | DONE (sesión 1 + línea de base de 50 vistas en la sesión 2) |
| Reparación de la sesión 1 | DONE |
| 1 · Primitivas | DONE |
| 2 · Residente | DONE — requisitos RES conciliados: 26 DONE, 9 KEEP, ninguno BLOCKED |
| 3 · Recepción | DONE — REC-002…005 DONE, REC-001/006 KEEP |
| 4 · Administración | DONE — 13 DONE, 9 KEEP, ADM-003 limitado por datos (un solo edificio operativo) |
| 5 · Assets | DONE — `ASSET_MANIFEST_ACTUAL.md` |
| 6 · QA | DONE sobre la build de producción — `QA_RESULTS.md` |
| 7 · Handoff | DONE — este archivo, `DECISIONS_IMPLEMENTED.md`, `QA_RESULTS.md`, `ROUTE_SCREEN_INVENTORY.md`, `ASSET_MANIFEST_ACTUAL.md`, `FIGMA_Y_DEMO.md`, evidencia en `qa-v02/` |

## KEEP preservados y verificados (QA-24)

Home RES y su navegación · card *Visitas hoy* con foto y franja amarilla ·
Autorizar/Reclamar/Reservar · vacío *Sin notificaciones* · formulario y
confirmación *Reclamo creado* (F02 idéntico a la línea de base) · baja de pases ·
centro operativo REC, Agenda, verificar ≠ registrar, mudanzas aprobadas ·
arquitectura de Casos, Personas (A06 idéntico), Entregas, Unidades, Edificios,
Reservas y Cobranza ADM · Satoshi · paleta. Las diferencias en Home RES y Home
REC son sólo las enumeradas (importe, ojo, etiqueta de estado; rieles, arco,
rótulos, solapa de Accesos).

## Limitaciones de prototipo (no son regresiones)

- Estado en memoria: recargar vuelve a la fixture.
- QR de demostración: no se puede escanear.
- Un solo edificio con datos operativos.
- Sin integración bancaria ni motor de expensas por unidad (dicho en la UI).
- Web Share real y zoom 200 % no probados en dispositivo.

## Archivos tocados en la sesión 2

`lib/expensas.ts`, `lib/estado.tsx`, `lib/formato.ts`, `lib/privacidad.ts` (nuevo) ·
`components/ui/{WidgetPrincipal,Formulario,Descarga,Estados,ZonaContexto,Icon,Importe(nuevo)}.tsx` ·
`components/paneles/{PanelMedios,HojaPagar}.tsx` · `components/ShellResidente.tsx` ·
`components/screens/{R01,R03,R05,R07,R18,R20,R21,R23,R24,Mas,F01}.tsx` ·
`components/recepcion/{P01,ContextualActions}.tsx` ·
`components/admin/{A01,AdminMarco,Plegable,Operacion,Economia,useDesborde(nuevo)}.tsx` ·
`app/{globals,sistema,recepcion,admin}.css` · `docs/ux/final/*`.
No se tocó `backend/`, `frontend/`, el homónimo `CondoTrack/condotrack-app` ni el laboratorio.

## Siguiente paso exacto

1. Revisión visual de Felipe en **http://localhost:3001** (build recompilada al
   cierre con todo lo de esta sesión). Recorrido sugerido en `FIGMA_Y_DEMO.md`.
2. Si aprueba: exportar a Figma con el manifiesto de `FIGMA_Y_DEMO.md` y grabar la
   demo. Ambos requieren su autorización explícita (no concedida en este master).
3. Pendientes que dependen de datos o decisiones de producto: operación con
   varios edificios (ADM-003), credencial real para el QR, persistencia.

No se hizo commit, push, deploy ni publicación en Figma.
