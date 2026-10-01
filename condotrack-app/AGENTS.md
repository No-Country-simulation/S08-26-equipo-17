# CondoTrack · guía para el próximo agente

Prototipo navegable de CondoTrack (app de consorcios). Next.js 14 App
Router + React 18 + TypeScript, sin librerías de UI. Todo el estilo vive
en un solo archivo: `app/globals.css`. Los datos son demo, en `lib/`.

## Cómo se corre

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # tiene que quedar limpio antes de cerrar cualquier cambio
```

Deploy: Vercel, proyecto `condotrack` (scope `lobetofelipe-9828s-projects`).
Producción: https://condotrack-zeta.vercel.app — `npx vercel --prod --yes`.

## Cómo se navega el prototipo

La URL manda:

- `?p=login` · `?p=recuperar` · `?p=onb` · `?p=app`
- `?p=app&v=r01` abre una vista del residente (r01 home, r02 mi unidad,
  r03 notificaciones, r05 reservas, r06 visitas, r07 pase, r08 entregas,
  r09 reclamos, r14 documentos, r15 preferencias, r16 autorización,
  r17 historial, r18 mis reservas, r20 expensa, r21 gastos, r22 medios de
  pago, r23 estado de cuenta, r24 votaciones, `mas`, f01/f02/f03
  formularios, g10 reclamo, g11 entrega, g15 mi edificio).
- `&tema=claro|oscuro`, `&limpio=1` (sin la barra del escenario),
  `&perfil=recepcion|administracion`, `&motionreduce=1`.

## Reglas de diseño que ya están cerradas

**Tipografía.** Satoshi (Fontshare, en `app/layout.tsx`). Escala en
tokens: `--t-titulo` 28 · `--t-seccion` 19 · `--t-fila` 16 ·
`--t-cuerpo` 15 · `--t-meta` 13 · `--t-label` 12 · `--t-cifra` 48.
Nada de información importante en 11–12 px.

**Color.** `--fondo` papel cálido, `--sup` blanco, `--txt` carbón
`#111614`, amarillo `#F5E500` sólo para foco, selección, estado
relevante o la acción más importante de la pantalla. Colores semánticos
`--est-ok / --est-curso / --est-vencido / --est-cerrado`. Paleta
data-viz `--dv-1…8` sólo para gráficos.

**Botones.** `.entrar` primario (52, radio 14, carbón; hueso sobre foto
o carbón), `.btn-sec` secundario (44), `.btn-ter` quieto, botón de ícono
44. Foco amarillo. No hay más variantes: si hace falta una, primero
revisar si alguna existente sirve.

**Material.** Dos vidrios (`--glass-light`, `--glass-dark` +
`--glass-blur`) y sólo sobre foto. Sobre fondo plano, superficie sólida.
Profundidad en tres planos: fondo, superficie (`--sombra-1`), elevado
(`--sombra-2`).

**Estados.** Punto + etiqueta. Nada de pastillas grandes genéricas.

**Navigation lock (21/09/2026).** La navegación activa NO usa amarillo.
Se resuelve con jerarquía tipográfica, contraste, superficie o indicador lateral.
`#F5E500` queda para foco, acción primaria, selección relevante y estados
puntuales. No cambiar este criterio sin pedido explícito.

**Formularios.** Relleno suave sobre el fondo, sin borde ni caja blanca;
el foco se dice con el filo amarillo. Elegir abre una hoja con las
opciones (nunca el `<select>` del navegador). Adjuntar es una pieza con
ícono, título y qué acepta.

**Listas e internas.** A sangre, separadores sangrados, ícono suelto sin
baldosa, título, una línea de estado sólo si aporta y el chevron quieto.
Nada de card adentro de card.

**Hojas.** `components/ui/Hoja.tsx` se dibuja con portal en `.device`:
si cuelga de la vista, que es la que scrollea, aparece a mitad de
pantalla. No volver atrás con eso.

## Lo que NO se toca sin pedido explícito

Home (estructura, tabs, monto, accesos rápidos), Login, Pase QR, barra
inferior, arquitectura de información, rutas, y los tokens de arriba.

## Cómo trabaja este repo

- Comentarios y commits en castellano rioplatense, explicando **por qué**
  se hizo algo, no qué hace la línea.
- Un commit por familia de cambios.
- Antes de cerrar: `npm run build` + barrido de las 27 vistas a 390×844
  en claro y oscuro (sin desbordes, sin imágenes rotas, todo en Satoshi).
- El historial de decisiones está en `docs/ux/ESTADO_IMPLEMENTACION.md`
  y en `docs/ux/02_DECISION_LOG.md`.

## Fuentes permanentes para continuar

- [Sistema de roles](docs/ux/11_ROLE_SYSTEM.md): arquitectura funcional,
  fuentes de verdad, permisos y flujos entre los tres roles. Distingue la
  propuesta del estado implementado.
- [Referencias de componentes](docs/ux/12_COMPONENT_REFERENCES.md): biblioteca
  externa de anatomía e interacción. Antes de derivar una implementación,
  inspeccionar los nodos relevantes con Figma MCP y reutilizar el sistema local.
  Incorporar una referencia no autoriza cambios de UI ni levanta los locks.
  Las adaptaciones respetan el Navigation lock: indicador activo sin amarillo.

## Lo que quedó pendiente

1. **Calendario de Reservas (R05).** Ya tiene rail rápido de días,
   cuadrados y mes grande, pero el dueño del producto todavía no lo
   aprueba. Referencias en `docs/` no; las mandó por chat: calendario
   oscuro con días en cuadrados y pastillas de día de la semana.
2. **Hoja de Continuar / Confirmar reserva.** Botones toscos.
3. **Motion de la pila del home** (`components/ui/PilaVivas.tsx`): el
   apilado por scroll funciona pero falta afinarlo.
4. **Comunicados**: no existe como pantalla; hoy es sólo una
   notificación. Si se agrega, usar patrón announcement feed.
5. **Recepción:** Home y shell implementados el 21/09/2026, pendientes
   de revisión visual del dueño del producto. Las internas conservan su
   composición anterior. Administración todavía sigue con el lenguaje viejo.

## Dirección visual vigente · V05

La pasada V04 de Recepción fue rechazada visualmente. Para continuar, leer
`docs/ux/visual-targets/condotrack_visual_target_pack_v05/00_README_FOR_CODEX.md`
y `01_VISUAL_TARGET_MANIFEST.md` en la misma carpeta, fuente visual vigente.
R1 V05 implementado, pendiente de revisión del usuario: ver
`docs/ux/19_R1_VISUAL_TARGET_V05_REVIEW.md`. No avanzar a R2 sin aprobación.

Última revisión de Home: **R1.3 command center**, todavía sin aprobación.
Ver `docs/ux/21_R13_COMMAND_CENTER_REVIEW.md`; reemplaza visualmente R1/R1.2.
Actividad completa continúa pendiente; sus accesos actuales llevan al preview.

## Continuidad R1.4 · 22/09/2026

Implementación del target cerrado en curso. Leer `docs/ux/22_R14_TARGET_IMPLEMENTATION.md` y el PNG `docs/ux/visual-targets/CondoTrack_HOME_Recepcion_Target_R14.png`. Reemplazan la composición visual R1.3. **No está terminada:** falta identificar el asset abstracto claro aprobado, solicitado al usuario. No inventar un fondo ni volver a la foto. Sin commit/push ni avance a internas.

## Continuidad vigente R1.5 · 23/09/2026

El usuario pidió ejecutar `CondoTrack_R15_Refinement_Pack.zip`, incluyendo Home y las internas (fases A y B). Esa autorización supersede el límite de R1.4. Pack leído e inspeccionado en `docs/ux/visual-targets/condotrack_r15_refinement_pack/`; incluye el fondo abstracto aprobado, ya incorporado. Para Recepción rigen las superficies glass y referencias de ese pack; se conserva el sistema de Resident.

R1.5 implementada, pendiente de aprobación visual. Leer `docs/ux/23_R15_REFINEMENT_REVIEW.md` para cambios, pruebas, referencias y capturas. Agenda usa calendario y estado compartido; Actividad completa existe en `p09`, con compatibilidad para `p01&ref=bitacora`. No hay sidebar fija. No hacer commit/push ni continuar otra ronda sin revisión del usuario. Los pendientes de Resident siguen abiertos.

## Continuidad vigente R1.6 · 24/09/2026

El usuario autorizó Recepción completa (Home + internas + motion + temas + responsive), preservando R1.5 funcional. Ver `docs/ux/24_R16_IMPLEMENTATION_REVIEW.md` y `docs/ux/r16/CONDOTRACK_R16_SINGLE_HANDOFF.txt`. R1.6 implementada y validada; aprobación visual pendiente. No commit/push. Resident/Admin conservan su dirección anterior. El informe identifica el alcance real de QA y la limitación del entorno con movimiento reducido.

## Cierre R1.6 user-centered · 24/09/2026

Claude retomó el working tree de Codex sin revertir nada y aplicó el override USER-CENTERED VISUAL FIDELITY: una referencia primaria por pantalla (Home U02, Agenda U01, Accesos e Incidencias U06, Entregas U05, Unidades U07, Actividad U09, Búsqueda U11), sin colores por categoría y con una sola gramática de selección (`--rec-sel` / `--rec-on-sel`). Detalle, QA y deuda en `docs/ux/25_R16_CIERRE_USER_CENTERED.md`; capturas en `docs/ux/qa-r16-cierre/`. Pendiente la aprobación visual de Felipe. Sin commit ni push. **No empezar Administración** hasta esa aprobación: el contexto Admin llegó en el handoff V2 y todavía no se implementa.

## Continuidad vigente R1.7 · 25/09/2026

El override "FINAL USER REVIEW" de Felipe (video + texto) revocó el límite de Administración. Implementado en una pasada: Recepción reconstruida sobre la revisión (Home con rieles que abren FolderGlassCard, búsqueda que se estira a la izquierda, Agenda U01 sin reloj, Escanear task-first, Incidencias con cola protagonista, Actividad legible, Entregas y Unidades conservadas), sistema compartido (`app/sistema.css` + `components/sistema/`: tokens semánticos con el oscuro de Residente, FolderGlassCard, Segmentado, StatusTag, Buscador, Novedad, transiciones) y Administración A01–A17 (`components/admin/`, `lib/admin.ts`). Movimiento con tres modos: `motionreduce=0` normal, `=1` reducido, sin parámetro manda el sistema. Leer `docs/ux/26_R17_REVISION_FELIPE_ADMIN.md`; capturas en `docs/ux/qa-r17/`. Pendiente la aprobación visual de Felipe. Sin commit ni push.
