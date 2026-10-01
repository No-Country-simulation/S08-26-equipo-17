# ROUTE_SCREEN_INVENTORY

Inventario real al 29/09/2026 (sesión 2), leído de `lib/data.ts` (`ROTULOS`,
`ROTULOS_P`, `ROTULOS_A`) y de los shells. El prototipo es una sola ruta de Next
(`/`) con el estado de pantalla en la query: no hay rutas de API.

## Patrón de URL

| Rol | URL | Notas |
|---|---|---|
| Residente | `/?p=app&v=<id>[&ref=<id>]` | `perfil` por defecto; en escritorio se ve en marco de teléfono |
| Recepción | `/?perfil=recepcion&p=app&v=<id>[&ref=<id>]` | |
| Administración | `/?perfil=administracion&p=app&v=<id>[&ref=<id>]` | |
| Todos | `&limpio=1` sin marco · `&tema=claro|oscuro` · `&motionreduce=0|1` | sin `motionreduce` manda la preferencia del sistema |

Otras pantallas del flujo: `?p=login`, carga, onboarding y recuperar contraseña (`components/*.tsx`).

## Residente · 27 vistas

| ID | Pantalla | Archivo | Tocada en esta ronda |
|---|---|---|---|
| `r01` | R01 Inicio residente | `components/screens/R01.tsx` | RES-002/003/004/005/007/035 |
| `r02` | R02 Mi unidad | `components/screens/R02.tsx` | — |
| `r03` | R03 Notificaciones | `components/screens/R03.tsx` | RES-018/019/021, DEC-004b |
| `mas` | R04 Más | `components/screens/MAS.tsx` | RES-017 |
| `r05` | R05 Reservar espacio | `components/screens/R05.tsx` | RES-015/016 |
| `r06` | R06 Mis visitas | `components/screens/R06.tsx` | — |
| `r07` | R07 Pase QR | `components/screens/R07.tsx` | RES-026/027/028 |
| `r08` | R08 Entregas | `components/screens/R08.tsx` | — |
| `r09` | R09 Reclamos | `components/screens/R09.tsx` | — |
| `g10` | G10 Reclamo · detalle | `components/screens/G10.tsx` | — |
| `g11` | G11 Entrega · detalle | `components/screens/G11.tsx` | — |
| `g15` | G15 Mi edificio | `components/screens/G15.tsx` | — |
| `r13` | R13 Espacio común | `components/screens/R13.tsx` | — |
| `r14` | R14 Documentos | `components/screens/R14.tsx` | — |
| `r15` | R15 Preferencias | `components/screens/R15.tsx` | — |
| `r16` | R16 Autorización · detalle | `components/screens/R16.tsx` | — |
| `r17` | R17 Historial de la unidad | `components/screens/R17.tsx` | — |
| `r18` | R18 Mis reservas | `components/screens/R18.tsx` | RES-007 |
| `r19` | R19 Preguntas y reglamento | `components/screens/R19.tsx` | — |
| `r20` | R20 Expensa del mes | `components/screens/R20.tsx` | RES-003/004 |
| `r21` | R21 Gastos del consorcio | `components/screens/R21.tsx` | RES-012/013/014, DEC-004a |
| `r22` | R22 Medios de pago | `components/screens/R22.tsx` | RES-033 |
| `r23` | R23 Estado de cuenta | `components/screens/R23.tsx` | RES-003/022 |
| `r24` | R24 Votaciones | `components/screens/R24.tsx` | RES-024 |
| `f01` | F01 Autorizar visita | `components/screens/F01.tsx` | RES-009/010/029/030 |
| `f02` | F02 Nuevo reclamo | `components/screens/F02.tsx` | KEEP (campos compartidos) |
| `f03` | F03 Informar un pago | `components/screens/F03.tsx` | RES-009/022 |

## Recepción · 8 vistas

| ID | Pantalla | Archivo | Tocada en esta ronda |
|---|---|---|---|
| `p01` | P01 Inicio de recepción | `components/recepcion/P01.tsx` | REC-002/003/004/005 |
| `p02` | P02 Unidades y búsqueda | `components/recepcion/P02.tsx` | — |
| `p03` | P03 Escáner | `components/recepcion/P03.tsx` | — |
| `p04` | P04 Validar acceso | `components/recepcion/P04.tsx` | campos compartidos (foco) |
| `p05` | P05 Entregas | `components/recepcion/P05.tsx` | — |
| `p07` | P07 Incidencias | `components/recepcion/P07.tsx` | — |
| `p08` | P08 Agenda operativa | `components/recepcion/P08.tsx` | — |
| `p09` | P09 Actividad | `components/recepcion/P09.tsx` | — |

## Administración · 15 vistas

| ID | Pantalla | Archivo | Tocada en esta ronda |
|---|---|---|---|
| `a01` | A01 Inicio de administración | `components/admin/A01.tsx` | ADM-006…012, DEC-005, DEC-004c |
| `a02` | A02 Edificios | `components/admin/Edificio.tsx` | — |
| `a03` | A03 Edificio | `components/admin/Edificio.tsx` | — |
| `a04` | A04 Unidades | `components/admin/Edificio.tsx` | — |
| `a05` | A05 Unidad · detalle e historial | `components/admin/Edificio.tsx` | — |
| `a06` | A06 Personas | `components/admin/Edificio.tsx` | — |
| `a07` | A07 Persona | `components/admin/Edificio.tsx` | — |
| `a08` | A08 Accesos | `components/admin/Operacion.tsx` | ADM-017 |
| `a09` | A09 Entregas | `components/admin/Operacion.tsx` | — |
| `a10` | A10 Reservas | `components/admin/Reservas.tsx` | — |
| `a12` | A12 Reclamos | `components/admin/Operacion.tsx` | ADM-015 |
| `a13` | A13 Documentos | `components/admin/Edificio.tsx` | — |
| `a15` | A15 Expensas · períodos | `components/admin/Economia.tsx` | copy (DEC-001) |
| `a16` | A16 Cargar gastos | `components/admin/Economia.tsx` | ADM-021, DEC-001 |
| `a17` | A17 Cobranza | `components/admin/Economia.tsx` | — |

## Componentes compartidos tocados

| Componente | Rol | Qué cambió |
|---|---|---|
| `components/ui/WidgetPrincipal.tsx` | RES | Teclado, swipe, indicador 1.03, memoria de categoría, accesorio (ojo) |
| `components/ui/Formulario.tsx` | RES/REC | `Segmentos` con indicador compartido y flechas; `Elegir` con label/valor/ayuda/error asociados |
| `components/ui/Importe.tsx` (nuevo) + `lib/privacidad.ts` (nuevo) | RES | Importe enmascarable y ojo |
| `components/ui/Descarga.tsx` · `Copiar` | RES | Éxito y error anunciados |
| `components/ui/Estados.tsx` · `Confirmacion` | RES | Variante compacta |
| `components/ui/ZonaContexto.tsx` | RES | Título acepta nodo |
| `components/paneles/PanelMedios.tsx`, `HojaPagar.tsx` | RES | Grilla de transferencia, estado derivado |
| `components/ShellResidente.tsx` | RES | Scroll restaurado al volver |
| `components/recepcion/ContextualActions.tsx` | REC | Rótulo visible, posición de carpeta por fila |
| `components/admin/AdminMarco.tsx` | ADM | Familias plegables |
| `components/admin/Plegable.tsx`, `useDesborde.ts` (nuevo) | ADM | Regiones plegables, fundido sólo con desborde |
| `app/sistema.css` | REC/ADM (+RES tokens) | Tokens de motion únicos, campos, botones, búsqueda |
| `lib/expensas.ts` | RES/ADM | Estado derivado, pagos confirmados, avisos con lectura y privacidad |
| `lib/estado.tsx` | todos | Acción `aviso/abrir` |
