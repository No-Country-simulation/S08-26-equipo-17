# 03 · Arquitectura de información

## Principio de producto

```
EDIFICIO → UNIDAD → PERSONA → OPERACIÓN → ESTADO → RESPONSABLE → HISTORIAL
```

Desde un edificio o una unidad, el usuario tiene que poder entender quién está
involucrado, qué está pasando, qué autorización existe, en qué estado está, quién
es responsable y qué se hizo antes.

## Jerarquía de toda pantalla — no negociable

```
CONTEXTO → ESTADO / TAREA PRINCIPAL → ACCIONES FRECUENTES
        → CONTENIDO VIVO → DETALLE E HISTORIAL BAJO DEMANDA
```

Nada se muestra completo por defecto. El home da la respuesta; el detalle da la
información.

## Navegación global — residente

| Posición | Destino | Vista raíz | Qué contiene |
|---|---|---|---|
| 1 | **Inicio** | `r01` | Dashboard del residente |
| 2 | **Mi edificio** | `r02` | Subnav: Unidad · Edificio · Documentos |
| 3 | **Acceso / QR** | `r07` | Acción central. Credencial, autorizar, pases activos |
| 4 | **Reservas** | `r05` | Subnav: Espacios · Mis reservas · Historial |
| 5 | **Más** | `mas` | Todo lo de baja frecuencia |

**Criterio de ubicación:** frecuencia, no inventario.
Alta → barra inferior. Media → contextual dentro de su sección. Baja → Más.
La barra inferior **no es un directorio de funcionalidades**.

### Qué vive en Más
Reclamos · Notificaciones · Votaciones · Estado de cuenta · Gastos del consorcio ·
Medios de pago · Informar un pago · Preguntas frecuentes · Reglamento ·
Preferencias y seguridad · Historial de la unidad.

## Navegación secundaria

Se usa cuando varias vistas pertenecen al mismo ámbito. Componente único: `SubNav`.

| Sección | Pestañas |
|---|---|
| Mi edificio | Unidad · Edificio · Documentos |
| Reservas | Espacios · Mis reservas · Historial |
| Reclamos | Abiertos · En seguimiento · Cerrados |

No se crean destinos nuevos en la barra inferior para esto.

## Ámbitos de permisos

| Ámbito | Quién ve | Ejemplos |
|---|---|---|
| **Unidad** | residentes y propietario de esa unidad | quiénes viven acá, permisos permanentes, visitas, entregas, expensa |
| **Consorcio** | todos los residentes | reglamento, documentos, comunicados, gastos del consorcio, votaciones |
| **Operación** | recepción y administración | validar accesos, registrar entregas, gestionar incidencias |

Que "Mi edificio" agrupe unidad y consorcio en un destino **no** los une: adentro
siguen siendo pestañas distintas, con contenidos de ámbitos distintos.

## Roles

| Rol | Shell | Estado |
|---|---|---|
| Residente | `ShellResidente` | 27 pantallas, en refactor |
| Recepción | `ShellRecepcion` | 7 pantallas (P01–P05, P07, P08) |
| Administración | `ShellAdmin` | sin diseñar |
| Propietario | — | no diferenciado del residente todavía |
| Proveedor / mantenimiento | — | fuera de MVP |

La cuenta determina el perfil. **No hay selector de rol en el login.**

## Fuera de MVP

Búsqueda global con índice real · home que se reordena por contexto ·
integración con cámaras · cobro de amenities · tipos de acceso adicionales
(trabajador, invitado temporal) · agregar al calendario del teléfono ·
separación de eventos registrados / declarados (ver D-17).
