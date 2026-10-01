# Final Visual / UX Audit v03 · resultados

30/09/2026 · Claude Code · checkout `_github-sync/condotrack-app` (rama UxUi).
Autoridad: `CondoTrack_FINAL_VISUAL_UX_AUDIT_v03.md` + los tres videos finales.
Sin commit, push, deploy ni Figma. **Pendiente de aprobación visual de Felipe.**
Build final: `http://localhost:3003` (producción, `.next/qa-prod`).

## Reconciliación

- Los tres videos se reprodujeron en Chrome headless y se revisaron cuadro a cuadro
  (uno cada 5 s; medio segundo en los tramos dudosos): Residente 8:35
  (`ScreenSketch/Recordings/20260930-1705-28.7590689.mp4`), Recepción 9:33, Administración 9:26.
- Hallazgo del video de Residente (7:56–8:00): la pantalla que parecía quedar "en blanco"
  al tocar la barra es la transición de vista hacia Reservar capturada a mitad de camino.
  Se reprodujo el flujo en la app (dar de baja el pase → entrega → Retirar) y no hay pantalla vacía.
- Sistema compartido nuevo: `components/sistema/Tostada.tsx` — feedback específico de una
  acción ("Pago conciliado", "Entrega registrada · unidad avisada"…), no bloquea, se va sola,
  es `role=status`, reducido sin desplazamiento. Montado una vez por rol.

## Residente

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| RES-ONB-01 | DONE | Titular y apoyo bajan (bloque de texto más corto, pie más junto); CTA y fundido intactos | `globals.css` |
| RES-HOME-01 | DONE | Pila compacta: en reposo cada card ya asoma 116 px sobre la anterior (solapamiento evidente), recorrido por card 80 px, se traba a 1/4 de pantalla y al final se suelta: sube entera con el cierre de la lista, sin desarmarse | `ui/PilaVivas.tsx`, `globals.css` |
| RES-HOME-02 | DONE | Expensas: una sola línea de estado ("Vencida · 20 sep" en pastilla) y el amarillo sólo en Pagar | `screens/R01.tsx`, `ui/WidgetPrincipal.tsx`, `globals.css` |
| RES-R05-01 | DONE | El selector de espacios scrollea con rueda (vertical → horizontal), trackpad, dedo y arrastre; vidrio | `ui/Rail.tsx`, `globals.css` |
| RES-R05-02 | DONE | Degradé al 50 % | `globals.css` |
| RES-R05-03 | DONE | Sale el módulo "Tus reservas" que tapaba el calendario | `screens/R05.tsx` |
| RES-R05-04 | DONE | Sin leyenda: tu reserva = borde amarillo + tinte; con reservas = barra amarilla; completo = tachado; elegido = carbón. Una frase lo explica | `R05.tsx`, `globals.css` |
| RES-R05-05 | DONE | Cards: imagen + vidrio + nombre + "Ver espacio" | `R05.tsx` |
| RES-R05-06 | DONE | Éxito: contenido centrado, acción compacta al pie, nota centrada sin cortes | `globals.css` |
| RES-R02-01 | DONE | Sin blanco duro (neutro con filo); pastillas Vigente/Programada reales | `globals.css` |
| RES-HIST-01 | DONE | Filtros en dos líneas si no entran: nada queda cortado | `globals.css` |
| RES-HIST-02 | DONE | Más tamaño, divisiones entre eventos, íconos que toman el amarillo al recorrer y al filtrar | `screens/R17.tsx`, `globals.css` |
| RES-VIS-01 | DONE | Ticket KEEP; flecha en círculo que se mueve al hover; fondo del acceso con el asset de visitas; "Dar de baja" centrado | `screens/R16.tsx`, `globals.css` |
| RES-NOTIF-01 | DONE | Contadores y badges compactos | `globals.css` |
| RES-DEL-01 | DONE | Card de entrega compacta en vidrio; estado + dato en una línea; la acción es una fila propia debajo de la card | `paneles/PanelEntrega.tsx`, `globals.css` |
| RES-G11-01 | DONE | Seguimiento en vidrio claro, glifo amarillo, estado protagonista, recorrido con puntos | `globals.css` |
| RES-FIN-01 | DONE | Descargar: press, giro, tilde que entra, "Listo" y aviso "Comprobante descargado · archivo" sin bloquear | `ui/Descarga.tsx`, `globals.css` |
| RES-TABS-01 | DONE | Pestañas con peso 600/800 y activo sobrio (blanco cálido elevado) | `globals.css` |
| RES-COLOR-01 | DONE | Superficies de blanco puro → blanco cálido `#FBFBF8`; el carbón ya era `#111614` | `globals.css` |

## Recepción

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| REC-HOME-01 | DONE | Vidrio real (ronda anterior) conservado en cards y popovers | — |
| REC-HOME-02 | DONE | Elipse desde abajo a la izquierda; ahora con parallax sutil (12 %) | `ShellRecepcion.tsx`, `recepcion.css` |
| REC-HOME-03 | DONE | Cifras grandes, rótulos de 15,5 px, divisores fuertes | `recepcion.css` |
| REC-HOME-04 | DONE | Quick actions 58–68 px (proporción U02), integrados al command center; escáner con aro amarillo | `recepcion.css` |
| REC-HOME-05 | DONE | Hover/press de las tres cards (ronda anterior, medido) | — |
| REC-HOME-06 | DONE | Selector de edificios en el header: el actual con tilde y pastilla; los otros avisan que son de consulta | `ReceptionHeader.tsx`, `recepcion.css` |
| REC-NAV-01 | DONE | Botones separados, activo en carbón y bold (ronda anterior) | — |
| REC-AGENDA-01 | DONE | Filtros a todo el ancho; en angosto/zoom scrollean de costado | `recepcion.css` |
| REC-AGENDA-02 | DONE | "Resumen del día" con una frase: cuántos quedan y el próximo evento con hora | `P08.tsx` |
| REC-AGENDA-03 | DONE | "Agregar" en la cabecera: validar acceso, registrar entrega, reportar incidencia (flujos existentes) | `P08.tsx`, `recepcion.css` |
| REC-AGENDA-04 | DONE | Charcoal `#1E2421`/`#262C28`, nunca negro | `recepcion.css` |
| REC-UNIT-01 | KEEP | Sin cambios (la ronda anterior ya hizo Directorio + identidad) | — |
| REC-P04-01 | DONE | Resumen, campo y teclado más compactos | `recepcion.css` |
| REC-ACT-01 | DONE | Sin solapes (medido: 0 en "Todo"); el evento con foco/hover sube y queda al 100 %, los vecinos al 50 % | `recepcion.css` |
| REC-ACT-02 | DONE | Un solo indicador de foco en la búsqueda | `recepcion.css` |
| REC-THEME-01 | DONE | Tercera opción "Luz nocturna" en el perfil (Recepción y Administración): tokens cálidos de bajo azul, sin filtro; contraste AA | `sistema/Cabecera.tsx`, `recepcion.css` |
| REC-DEL-01 | DONE | "Entrega registrada · unidad avisada" (y "Entrega retirada") | `P05.tsx` |
| REC-DEL-02 | DONE | Recibido/Avisado/Retirado como pastillas; verde sólo en Retirado, con tilde | `recepcion.css` |
| REC-INC-01 | DONE | Sin derivar/Derivada/Cerrada como pastillas; "Nuevo reporte" grande; aviso al reportar | `P07.tsx`, `recepcion.css` |
| REC-SCROLL-01 | DONE | Scroll suave moderado sin secuestro; parallax sólo en la elipse; reducido = nada | `ShellRecepcion.tsx`, `recepcion.css` |

## Administración

| Ticket | Estado | Qué se hizo | Archivos |
|---|---|---|---|
| ADM-SIDEBAR-01 | DONE | Toggle visible; 252 → 80 px en ~200 ms; mini = símbolo + íconos con contador; activo y contadores se conservan; se recuerda; nunca se colapsa solo; familias en 14,5 px bold | `admin/AdminMarco.tsx`, `admin.css` |
| ADM-HOME-01 | DONE | Próximo y dropdowns en vidrio con desenfoque | `admin.css` |
| ADM-HOME-02 | DONE | "En dos horas" como pill, igual que "17 novedades" | `admin/A01.tsx` |
| ADM-HOME-03 | DONE | Sin lengüeta: crítica por borde + tinte; responsable separado por divisor | `admin.css` |
| ADM-CASE-01 | DONE | Sin lengüetas laterales (también en selección de filas) | `admin.css` |
| ADM-ACCESS-01 | DONE | KPI 38 px, rótulos 15,5 px bold, dato de apoyo sólo si existe (próximo pase) | `admin/Operacion.tsx`, `admin.css` |
| ADM-RES-01 | DONE | Vidrio en los controles; "Hoy · 30 de septiembre"/"Mañana"; dos meses lado a lado (uno en angosto); "Ver mes" → "Elegir otra fecha"; vacío con la próxima reserva y "Ir a ese día"; avisos al aprobar/rechazar/cancelar | `admin/Reservas.tsx`, `admin.css` |
| ADM-BLDG-01 | DONE | Filas que comparten borde, columnas con divisores (U07), pills | `admin.css` |
| ADM-UNIT-01 | DONE | "1 entrega en custodia", "1 reclamo abierto" en lugar de un número | `admin/Edificio.tsx` |
| ADM-PAY-01 | DONE | "Pago conciliado" / "Pago rechazado · residente notificado" | `admin/Economia.tsx` |
| ADM-COLLECT-01 | DONE | Nombres, cifras y filas más grandes con divisores | `admin.css` |
| ADM-COLLECT-02 | DONE | "Enviar recordatorio" por unidad con deuda → "Recordatorio enviado a la unidad 1B" y el botón pasa a "Enviado" | `admin/Economia.tsx`, `admin.css` |
| ADM-EXP-01 | KEEP | Evolución, rubro principal, períodos, carga y tablero | — |
| ADM-EXP-02 | DONE | "Por rubro" del detalle es plegable con el mismo control para cerrar y reabrir; cerrado muestra el mayor gasto | `admin/Economia.tsx`, `admin.css` |
| ADM-EXP-03 | DONE | Sin aletas: pills + divisores | `admin.css` |
| ADM-EXP-04 | DONE | "En preparación" compacta | `admin.css` |
| ADM-EXP-05 | DONE | "Cargar gastos" abre Gastos con el formulario ya abierto | `admin/Economia.tsx` |
| ADM-GAST-01 | DONE | "Rubro que más pesa" → "Mayor gasto del período" (y "Rubro principal" en Expensas); lista más compacta | `admin/Economia.tsx`, `admin.css` |
| ADM-SCROLL-01 | DONE | Scroll suave moderado, reducido = nativo | `admin.css` |
| ADM-BLDSEL-01 | DONE | "Actual" como tilde discreta dentro de la opción | `ShellAdmin.tsx`, `admin.css` |

## QA

- `npx tsc --noEmit` limpio; `next build` a `.next/qa-prod` OK.
- Barrido de producción: 3 roles × claro/oscuro × 1440/1024/390/360 + Luz nocturna 1440 = 315 mediciones.
  Sin scroll horizontal de página ni imágenes rotas; sólo Satoshi. Los únicos elementos fuera del
  viewport son filas que scrollean de costado a propósito (filtros de Agenda).
- Zoom 200 % (720×450) en A01, A10, A15, A17, A02, P01, P04, P05, P08, P09: sin overflow; la fila
  de filtros de Agenda scrollea en vez de partirse.
- Motion medido: menú 252 → 80 px en ~200 ms; pila; aviso 260 ms de entrada; reducido sin desplazamiento.
- Teclado: foco visible en menú, toggle del menú, filtros, días de A10, eventos de Actividad (el foco sube el evento).
- Flujos: conciliar pago, recordatorio, registrar entrega, aprobar reserva, cargar gasto desde Expensas,
  descargar comprobante, cambiar de edificio (Recepción).

## Limitaciones

- Luz nocturna es de Recepción y Administración (el perfil vive ahí); Residente tiene su propio control
  de tema y no se tocó. El fondo decorativo definitivo para oscuro no estaba en el paquete.
- Cambiar de edificio en Recepción no cambia datos: el prototipo tiene un solo edificio operativo.
- El recordatorio de Cobranza es simulado (aviso in-app); no hay envío externo.
