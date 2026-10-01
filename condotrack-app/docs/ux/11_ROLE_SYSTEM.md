# 11 · Un sistema, tres roles

21/09/2026 · Base auditada: `UxUi`, commit `2fae1fe`. Propuesta funcional para implementar; no describe funciones terminadas ni cambia el LOCK visual.

## A. Principios del sistema

- **Residente** consulta, solicita, autoriza, reserva, informa pagos y vota. **Recepción** valida, registra y opera. **Administración** configura, concilia, asigna, publica y audita.
- Una entidad compartida por dominio, identificada por edificio y, cuando corresponde, unidad. Cada interfaz muestra una proyección con permisos; no mantiene otra copia del dato.
- Persona, vínculo con una unidad y permiso de operación son cosas distintas. Ser propietario, inquilino o conviviente no habilita automáticamente todas las acciones.
- Una acción válida actualiza la entidad y produce su evento en la misma operación. Historial, agenda y notificaciones se derivan de esas fuentes; nunca se cargan como una segunda versión de los hechos.
- Autorizar no es ingresar; validar no es ingresar; informar pago no es conciliar; terminar un horario no prueba uso ni salida. Un evento declarado se identifica como tal.
- Correcciones con motivo y referencia al original. Sin borrar movimientos, liquidaciones publicadas ni auditoría; una reversión deja otro evento.
- Se conserva Home, Login, Pase, navegación y sistema visual LOCK. AGENTS.md y las rondas más recientes de ESTADO_IMPLEMENTACION prevalecen sobre recetas visuales anteriores. Este documento propone capacidades, sin cambiar rutas.

## B. Matriz por dominio

Verbos explícitos: crear/modificar indica escritura; consultar no habilita cambios. Alcance del residente: su unidad y las capacidades concedidas. Los estados de esta tabla son el modelo objetivo, no todos existen hoy.

| Dominio | Residente | Recepción | Administración | Fuente de verdad | Estados | Eventos |
|---|---|---|---|---|---|---|
| Expensas | Consulta liquidación propia y cupón | Sin acceso económico | Crea borrador, liquida, publica y rectifica | Liquidación versionada + cargos por unidad/período | Borrador → publicada → rectificada/anulada | Liquidación publicada, rectificada; cargo emitido |
| Pagos / cuenta | Informa pago, adjunta prueba; consulta saldo | No concilia ni consulta deuda | Verifica, rechaza, concilia e imputa; revierte con motivo | Pago + imputaciones + movimientos de cuenta | Informado → en revisión → conciliado/rechazado; reversado. Cuenta: saldo pendiente/parcial/cero/a favor | Pago informado, rechazado, conciliado, imputado, reversado |
| Gastos / composición | Consulta detalle publicado | Sólo tareas asociadas, sin importes | Carga/modifica gasto, comprobante, rubro y proveedor; incorpora al período | Gasto y comprobante; versión publicada de liquidación | Borrador → validado → incluido; corregido por ajuste | Gasto registrado, validado, incluido, ajustado |
| Visitas | Crea/modifica autorización futura y revoca | Valida identidad/pase; registra entrada/salida | Configura política y audita; autoriza accesos de servicio comunes | Autorización + movimientos de acceso | Pase: programado/vigente/vencido/revocado. Presencia: sin ingreso/adentro/salió | Autorización creada/modificada/revocada; validación admitida/denegada; ingreso/egreso |
| Permisos permanentes | Otorga/modifica/revoca si está habilitado | Consulta vigencia y registra cada movimiento | Configura reglas; suspende con motivo y audita | Permiso con titular, unidad, alcance y horario + accesos | Programado/activo/suspendido/revocado/vencido | Permiso otorgado/modificado/suspendido/revocado; ingreso/egreso |
| Paquetes / entregas | Consulta; autoriza tercero si corresponde | Registra recepción; verifica receptor y confirma entrega | Audita y resuelve excepciones | Entrega + constancia de retiro | Recibida → entregada; incidencia/devolución | Paquete recibido, retiro autorizado, entregado, incidencia registrada, devuelto |
| Reservas | Solicita, consulta y cancela según regla | Consulta agenda; registra uso o incidencia | Configura espacio/recurso; aprueba/rechaza; bloquea y cancela con motivo | Espacio + recurso + reglas + reserva | Pendiente → confirmada/rechazada; cancelada; finalizada por horario. Uso: registrado/no registrado | Reserva solicitada/aprobada/rechazada/cancelada; uso registrado; recurso bloqueado |
| Reclamos | Crea y aporta información; solicita reapertura | Reporta incidencia y aporta observaciones operativas | Clasifica, prioriza, asigna, resuelve y cierra | Caso con origen reclamo/incidencia + acciones y responsable | Nuevo → en gestión → asignado → resuelto → cerrado; reabierto | Caso creado/clasificado/asignado/actualizado/resuelto/cerrado/reabierto |
| Unidades | Consulta ficha propia; solicita corrección | Consulta identificación, contactos autorizados y operación | Crea/modifica ficha, coeficientes y estado | Unidad del edificio | Activa/inactiva | Unidad creada/modificada/desactivada |
| Personas / vínculos | Actualiza contacto propio; solicita alta/baja de vínculo | Consulta identidad y contacto operativo permitido | Invita, verifica, vincula/desvincula y concede capacidades | Persona + vínculo temporal persona–unidad + capacidades | Invitado → verificado/activo → desvinculado; acceso suspendido | Persona invitada; vínculo aprobado/finalizado; contacto/capacidad modificados |
| Proveedores | Consulta responsable público de su caso | Consulta personal esperado e identidad | Crea/modifica proveedor, contactos y habilitación | Proveedor + personas + órdenes vinculadas | Activo/suspendido/inactivo | Proveedor creado/actualizado/suspendido |
| Mantenimiento | Consulta afectación; reporta problema | Consulta orden; registra llegada, salida y observación | Programa/asigna/reprograma, verifica resultado y cierra | Orden de trabajo + intervenciones + accesos vinculados | Programada → en curso → realizada → verificada/cerrada; cancelada | Orden programada/asignada; intervención iniciada/registrada/verificada |
| Documentos | Consulta/descarga lo publicado para su audiencia | Consulta reglamentos y material operativo | Carga, versiona, publica y archiva | Documento versionado + audiencia | Borrador → publicado → reemplazado/archivado | Documento publicado/reemplazado/archivado |
| Comunicados | Consulta y marca lectura | Consulta los operativos; propone información | Redacta/programa/publica/corrige y archiva | Comunicado + audiencia + lecturas | Borrador → programado → publicado → archivado | Comunicado publicado/corregido/archivado |
| Alertas | Recibe; acusa recibo cuando se requiere | Emite alerta operativa inmediata dentro de protocolo | Define protocolo/audiencia; emite, actualiza y resuelve | Alerta vinculada a incidencia/servicio | Activa → actualizada → resuelta; cancelada por error | Alerta emitida/actualizada/resuelta/cancelada |
| Votaciones | Vota si representa una unidad habilitada; consulta resultado publicado | Sólo consulta afectación operativa publicada | Configura padrón/reglas; abre, cierra y publica resultado | Votación + padrón congelado + voto único + resultado | Borrador → programada → abierta → cerrada → publicada; anulada | Votación abierta; participación registrada; cierre; resultado publicado |
| Historial / auditoría | Consulta eventos visibles de su unidad | Consulta bitácora operativa del edificio/turno | Consulta y filtra auditoría de edificios asignados | Eventos anexados por operaciones | Registrado; rectificado mediante otro evento | No se crean hechos desde el visor; lectura/exportación sensible puede auditarse |

## C. Flujos cruzados

1. **Visita:** residente autoriza → recepción consulta vigencia real y verifica identidad → registra ingreso → registra egreso → historial de unidad y bitácora. Revocar impide nuevos ingresos, pero permite registrar la salida de alguien adentro. Sin autorización válida: denegar y contactar al autorizante; no inventar una autorización telefónica sin constancia. Permisos permanentes usan el mismo registro de movimientos, sin recrear un pase por visita.
2. **Paquete:** recepción registra unidad, remitente y evidencia disponible → aviso a los destinatarios habilitados → residente o tercero autorizado retira → recepción verifica identidad y confirma quién retiró/quién entregó/cuándo → historial. No se permite cerrar con “Sin identificar”; una excepción queda como incidencia, no como entrega exitosa.
3. **Reclamo:** residente crea → administración clasifica y asigna responsable/proveedor → seguimiento visible para el residente → resolución con evidencia → cierre. La categoría puede faltar al crear; es obligatoria al cerrar. Recepción crea un caso de origen operativo; sólo se comunica a residentes si les afecta. Notas internas y respuesta pública se separan.
4. **Reserva:** administración configura recurso, cupos, horarios, cancelación y aprobación → residente solicita → regla automática confirma o administración decide → recepción ve la reserva confirmada en agenda. Una solicitud pendiente retiene cupo hasta su plazo de decisión configurado; al vencer se rechaza y libera. Cada confirmación revalida disponibilidad de forma atómica. Bloqueo por mantenimiento dispara cancelación/reprogramación explícita y aviso. Pasar la hora finaliza el horario, no acredita uso.
5. **Expensa:** administración carga gastos → liquida y publica cargos/composición → residente ve deuda e informa transferencia o inicia un pago integrado futuro → administración verifica evidencia y concilia → imputación actualiza saldo e historial. Pago parcial deja saldo; excedente deja crédito. Rechazar no reduce deuda; corregir una conciliación genera reversión. Ningún clic en “Pagar” acredita dinero. La integración de cobro aún no existe.
6. **Votación:** administración fija padrón, representante, fechas, quórum y visibilidad antes de abrir → residente habilitado vota una vez por unidad → administración ve participación → cierre → resultado publicado. No se muestran resultados parciales por defecto. Elegibilidad, delegación y ponderación son reglas a validar por el consorcio antes de implementar; no se deducen del rótulo “propietario”. No se presenta este prototipo como certificación de una asamblea.
7. **Mantenimiento:** administración programa orden y proveedor/personas autorizadas → acceso esperado aparece en agenda de recepción → recepción valida y registra entrada/salida → administración registra trabajo/evidencia y verifica cierre. Entrar al edificio no completa la orden; salir tampoco. El acceso se vincula al edificio/orden, sin inventar una unidad residente.
8. **Alerta:** recepción puede emitir aviso inmediato por riesgo observado o interrupción imprevista (agua, ascensor, acceso), con ubicación, alcance, hora y medidas conocidas; se avisa también a administración. Administración publica cortes programados, cambios institucionales y actualizaciones generales. Recepción puede actualizar su alerta y resolverla sólo si el protocolo lo habilita y verificó la restitución; administración puede resolver cualquiera con evidencia. Un incidente ordinario se deriva sin difusión masiva. Una gravedad “alta” no publica sola una alerta. Cancelar un aviso equivocado genera corrección a la misma audiencia.

## D. Eventos e historial

Contrato mínimo: `id`, `tipo`, `entidadTipo/id`, `edificioId`, `unidadId?`, `actorId/rol`, `ocurridoEn`, `registradoEn`, `origen` (operador/sistema/declaración/integración), `estadoAnterior/nuevo`, `motivo?`, `correlacionId`, `visibilidad`. Una clave de operación impide duplicar efectos por reintentos.

- Historial de unidad = eventos filtrados por edificio, unidad y visibilidad. Bitácora = accesos, entregas, incidencias y operación del turno. Auditoría = cambios y decisiones autorizados. Son vistas del mismo registro, no listas mantenidas a mano.
- Publicación, transición, asignación, revocación y rectificación generan eventos. Abrir una pantalla o expandir un panel no genera actividad de negocio. Validación de acceso sí se registra, incluyendo motivo de denegación; nunca equivale a ingreso.
- Fecha vencida puede producir transición automática, identificada como Sistema; nunca un egreso o intervención realizada ficticios. Si un movimiento se declara después, se conservan ambas fechas y quién lo declaró.
- En votos, el historial visible registra participación sin opción elegida. El voto se guarda aparte con los permisos de la votación; administración no recibe por defecto una lista persona–opción.
- No copiar documentos de identidad, comprobantes completos ni notas privadas en texto de eventos. La evidencia queda vinculada al dominio y protegida por sus permisos.

## E. Notificaciones

Derivadas del evento confirmado, con `eventoId`, destinatario, canal, enlace a entidad y estado individual (pendiente/enviada/fallida/leída). Un aviso por evento–destinatario–canal; reintentar envío no repite el hecho. Lectura individual, sin booleano global. Bandeja interna primero; push/email se integrarán después y no se prometen como enviados sin confirmación.

| Disparador | Destinatario | Regla |
|---|---|---|
| Visita/permisos creados o revocados | Recepción: agenda actualizada; unidad: confirmación | Ingreso/egreso avisa a la unidad según preferencia; escaneo exitoso no necesita push |
| Paquete recibido / entregado | Unidad destinataria | Enlace a entrega; recepción sólo recibe fallos/excepciones operativas |
| Caso nuevo / asignado | Administración / responsable | Residente recibe cambios públicos, pedidos de datos y resolución; no notas internas |
| Reserva pendiente / decidida / cancelada | Administración si requiere decisión / solicitante | Agenda de recepción se actualiza; alerta operativa si cambia una reserva del día |
| Liquidación publicada / vencimiento | Responsables económicos de la unidad | Recordatorios consideran saldo real; detener al saldar |
| Pago informado / conciliado / rechazado | Administración / informante y responsables económicos | Rechazo con motivo y acción; conciliación con saldo resultante |
| Orden programada / reprogramada | Recepción y responsable operativo | Residentes sólo si afecta servicio o una intervención en su unidad |
| Documento / comunicado publicado | Audiencia seleccionada | No duplicar el mismo anuncio en dos notificaciones |
| Alerta emitida / actualizada / resuelta | Afectados + administración + recepción | Prioritaria cuando exige acción; sin nombres ni datos privados en difusión general |
| Votación abierta / por cerrar / resultado | Padrón habilitado | Recordatorio sólo a quienes faltan; resultado a audiencia definida |
| Vínculo/capacidad cambiado | Persona afectada y administración | Retirar acceso al finalizar vínculo; no avisar al edificio entero |

## F. Permisos por rol

- **Residente:** edificio/unidades con vínculo vigente. Capacidades separadas para operar visitas, reservar, gestionar convivientes/permisos, consultar cuenta, informar pago y representar voto. Consulta de datos comunes sólo publicados. No modifica importes, conciliaciones ni hechos de recepción.
- **Recepción:** edificio y turno asignados. Identidad, contacto autorizado, vigencia de permisos, paquetes, reservas y órdenes del día. Sin deuda, comprobantes económicos, padrón de votos ni historial privado completo. No concede permisos permanentes ni cambia vínculos; solicita intervención del autorizante/administración.
- **Administración:** edificios asignados, con capacidades internas para cobranza, operación y publicación. No cambia un voto ni reescribe eventos. Acceso a datos personales sólo para gestionar su dominio; identidad del actor siempre trazable.
- **Sistema:** calcula vigencias, proyecciones y avisos. No inventa hechos físicos. Cada comando valida actor, alcance, transición y versión del dato; ocultar botones o elegir `perfil` por URL no es autorización.
- **Decisiones propuestas a confirmar antes de su implementación:** capacidades por vínculo; regla de votación; protocolo de alertas y sus audiencias; plazo de reservas pendientes. Base conservadora: sin permiso explícito, no habilitar la operación. Recepción no cobra dinero en esta etapa; el medio demo “presencial en recepción” requiere un flujo de caja/rendición independiente si se conserva.

## G. Vacíos o contradicciones del prototipo actual

Auditoría estática de código, no QA visual nuevo. Resident tiene shell y recorridos con datos demo; Recepción tiene siete pantallas operativas; Administración sólo muestra `Pendiente`. Los tipos/rótulos A01–A17 no son pantallas implementadas.

### Lo que ya sirve

- `lib/estado.tsx`: estado compartido y acciones con eventos para visitas, entregas, reservas, permisos, reclamos y pagos. Es una buena base de integración en la misma sesión, todavía sin persistencia ni sincronización entre dispositivos.
- P01 prioriza operación; P02 busca por unidad/persona; P04 separa verificar de ingresar; P05 registra recepción/retiro y responsables. Se conserva ese propósito.
- Resident ya permite autorizar/revocar visitas, reservar/cancelar, crear reclamos, informar pagos y votar; consulta permisos, documentos, composición y movimientos. `lib/reservas.ts` aporta cálculo de cupos/superposición y `Linea` reutiliza la trazabilidad.

### Hallazgos que condicionan la implementación

| Evidencia | Problema actual | Dirección funcional |
|---|---|---|
| `ShellAdmin.tsx`, `Pendiente.tsx`, `lib/data.ts` | Todas las vistas administrativas terminan en un placeholder | Implementar los dominios sobre el estado común; no otra demo aislada |
| `recepcion/P07.tsx` | `useState(INCIDENCIAS)` se pierde al desmontar; promete “Administración lo ve” | Caso compartido con origen operativo, asignación y eventos |
| `recepcion/P08.tsx`, `lib/edificio.ts` | Agenda constante; muestra “Hecho” si pasó la hora, aunque no exista confirmación | Proyección de reservas/visitas/órdenes; separar pasado de realizado |
| `lib/edificio.ts: quienEstaAdentro` | Inventa presencia para permiso `pp1`; revocarlo lo haría desaparecer sin salida | Presencia exclusivamente desde movimientos de acceso |
| `recepcion/P04.tsx`, `lib/estado.tsx` | Vigencia depende de etiqueta, no del horario; escáner evalúa sin evento, manual registra incluso pase programado como vigente; reducer no controla transiciones | Único comando de validación con hora/alcance; ingreso y egreso separados y protegidos |
| `recepcion/P04.tsx` | Sugiere autorizar desde la unidad tras llamada, pero P02 no ofrece ese flujo; teclado numérico no escribe prefijo CT/letra de unidad | No prometer excepción inexistente; definir entrada manual compatible con código |
| `recepcion/P05.tsx`, `ShellRecepcion.tsx` | Retiro admite “Sin identificar”; primera unidad preseleccionada; detalle enlazado desde P01 pierde `refe` | Elegir destino, verificar receptor y abrir entrega por ID |
| `screens/R03.tsx`, `lib/estado.tsx` | Avisos demo + avisos de expensa, sin generación desde entregas/casos; lectura global | Notificaciones por evento y destinatario; no afirmar envío real |
| `screens/R17.tsx`, `lib/unidad.ts`, P02 | Historial mezcla eventos sin filtro de unidad; P02 sólo habilita permisos/historial completos para 7D y muestra deuda | Selectores por alcance; ficha operativa sin datos financieros |
| `lib/estado.tsx`, `lib/unidad.ts` | Algunos eventos usan unidad del residente por defecto; no enlazan entidad; permisos sin unidad ni horario estructurado | IDs y alcance obligatorios; horarios verificables; vínculo al objeto |
| `lib/expensas.ts`, `screens/R23.tsx`, `lib/edificio.ts` | Confirmar pago cambia etiqueta pero `saldoUnidad()` sigue leyendo EXPENSAS estáticas; cuenta duplicada en UNIDADES; pago sin unidad | Cuenta derivada de cargos/imputaciones, con rechazo, parciales y reversión |
| `lib/reservas.ts`, `lib/data.ts` | Sin aprobación manual; ocupación sólo considera confirmadas; reglas fijas y sin protección concurrente | Política por espacio y validación atómica de pendientes/confirmadas/en uso |
| `lib/gestiones.ts`, `lib/estado.tsx` | Reclamo avanza estado, pero no hay comandos de clasificación/asignación ni vínculo a proveedor | Caso compartido con acciones válidas, responsable y orden asociada |
| `screens/R24.tsx`, `lib/estado.tsx` | Voto por ID de votación, sin unidad/padrón ni evento; resultados parciales visibles; reducer permite sobrescribir | Voto único por unidad habilitada; participación separada del resultado |
| `lib/unidad.ts`, `lib/edificio.ts`, `lib/gestiones.ts` | Personas y unidades duplicadas; documentos estáticos; proveedores son textos; sin órdenes, comunicados ni alertas gestionables | Entidades vinculadas, publicación y ciclo de vida por dominio |
| `Prototipo.tsx`, `lib/estado.tsx` | Rol elegido para demo; comandos sin autorización; estado sólo en memoria | Permisos en la capa de operaciones y persistencia compartida antes de uso real |
| `10_VISUAL_LOCK_V02.md`, rondas finales de `ESTADO_IMPLEMENTACION.md` | V02 pide Home sin tabs y swipe en visita; rondas posteriores restauran tabs y usan botón | No retroceder el diseño actual; conservar AGENTS.md y última decisión aplicable |

### Mapa de Recepción

Conservar IDs existentes; capacidades nuevas se agrupan sin asignar rutas todavía.

| Pantalla | Alcance necesario |
|---|---|
| P01 · Inicio de turno | Acciones rápidas, presencia real, pendientes de entrega y alertas; pocas cifras operativas |
| P02 · Unidades | Búsqueda + detalle operativo; personas, contactos habilitados, permisos y movimientos visibles |
| P03/P04 · Accesos | Lectura/manual → validación → ingreso/salida; visitas, permisos y proveedores; denegación explícita |
| P05 · Entregas | Registrar, pendientes, detalle, entrega verificada y excepciones |
| P07 · Incidencias | Crear, consultar seguimiento, aportar evidencia; emitir alerta sólo con alcance permitido |
| P08 · Agenda | Día/turno, reservas, visitas y mantenimiento; abrir objeto de origen y registrar operación |
| Bitácora de turno · nueva capacidad | Eventos filtrados + pendientes de relevo; nota de turno identificada como nota, nunca como hecho físico |

### Mapa de Administración

Los IDs siguientes están declarados, pero todas sus pantallas faltan. Los módulos adicionales son propuestas sin ID nuevo.

| Pantalla / grupo | Alcance necesario |
|---|---|
| A01 · Inicio | Cola de decisiones: pagos por conciliar, casos sin asignar, reservas pendientes y alertas; actividad reciente |
| A02/A03 · Edificios | Selección, configuración, contactos, servicios y reglas; contexto siempre visible |
| A04/A05 · Unidades | Lista/detalle, vínculos, cuenta y línea de eventos con permisos |
| A06/A07 · Personas | Invitaciones, identidad, vínculos temporales y capacidades |
| A08 · Accesos | Autorizaciones, permisos permanentes, movimientos y excepciones auditables |
| A09 · Entregas | Supervisión, incidencias y trazabilidad; operación normal sigue en recepción |
| A10 · Espacios y reservas | Recursos/reglas, disponibilidad, aprobación manual y bloqueos |
| A12 · Casos | Reclamos e incidencias por origen, clasificación, asignación y seguimiento |
| A13 · Documentos | Versiones, audiencia, publicación y archivo |
| A15/A16/A17 · Economía | Períodos/liquidación; gastos/comprobantes/proveedores; conciliación, imputaciones y cuenta |
| Proveedores y mantenimiento · nuevo módulo | Directorio vinculado a órdenes, agenda, acceso esperado y evidencia de intervención |
| Comunicaciones · nuevo módulo | Comunicados y alertas con audiencias, programación y seguimiento |
| Votaciones · nuevo módulo | Padrón/reglas, participación, cierre y publicación |
| Auditoría · nueva capacidad transversal | Búsqueda de eventos por entidad, actor, unidad y fecha; detalle de rectificaciones |

### Componentes y dirección de producto

- **Reutilizar:** tokens, Satoshi, amarillo `#F5E500`, carbón `#111614`, fondo cálido, botones, estados, `Icon`, `Formulario` (Texto/Area/Elegir/Segmentos/Adjuntar), `Panel`, `Hoja`, `Linea`, `SubNav`, `Chips`, `Descarga`, `Vacio`, `Estados` y formateadores. P05/P07 ya consumen parte de esa familia. `CalendarioMes` sirve para elegir fecha, no reemplaza una agenda operativa.
- **Variantes de densidad:** filas, `Panel`, `Linea`, filtros y formularios con más información por ancho en Administración. Reducir espacio, no legibilidad ni áreas táctiles. Recepción conserva acciones grandes y lectura a distancia. `Hoja` conserva portal/foco; el detalle persistente de escritorio necesita otro contenedor, no estirar todas las hojas.
- **Nuevos componentes justificados:** contenedor lista–detalle con selección; tabla semántica con orden/paginación para gastos/cobranza; barra de búsqueda/filtros reutilizable; agenda operativa con enlaces al origen; ficha de validación de acceso común a los tipos de autorización. Formularios de conciliación, publicación y asignación componen controles existentes, sin otro kit visual.
- **Identidad:** Administración usa listas/detalle y tablas donde permiten comparar, pocas métricas accionables, actividad y encabezados editoriales con marca. Recepción es un mostrador de filas, agenda y bitácora. Evitar grillas de cards y dashboard SaaS genérico; no trasladar el widget ni la pila del Home por defecto al escritorio.
- **Motion futuro:** las dos geometrías del isotipo pueden separarse en `Cargando`, alinearse en éxito, abrir/revelar el resultado de P04 y descansar en `Vacio`/“todo en orden”. Jitter para explorar/exportar; evaluar Rive o Lottie sólo al integrar un asset necesario. Sin librerías ahora, sin demoras artificiales: resultado textual inmediato, fallback estático y `prefers-reduced-motion`. Validación exitosa y entrada registrada tienen feedback distinto.

### Próximos tres pasos

1. **Cerrar contrato funcional e implementar estado común:** identidades/alcance, transiciones, eventos y selectores; resolver las decisiones de F. Verificar que ningún evento cruce unidades y que pago informado no altere saldo. Sin rediseñar Resident.
2. **Completar Recepción conectada:** visitas/permisos → entrada/salida, entregas verificadas, casos compartidos, agenda derivada y bitácora. Pruebas cruzadas con Resident y manejo de errores; adaptar el sistema visual actual sólo en una tarea posterior explícita.
3. **Construir Administración por recorridos completos:** primero casos/asignación, reservas y conciliación; después publicaciones, votaciones y mantenimiento. Cada recorrido termina en efecto visible para Resident/Recepción, evento y notificación. Incorporar lista–detalle y tabla sólo cuando el recorrido los requiera.
