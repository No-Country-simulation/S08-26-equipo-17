# 10 · Visual Lock v02 · Residente

Cerrado el **18/09/2026**. Es el sistema con el que se pasa a Recepción y
Administración. Lo que está acá no se reinventa por pantalla: si una pantalla nueva
necesita algo que no está, primero se agrega acá.

Referencia funcional: Consorcio Abierto. Se copió su simpleza (flujo corto, pocas
decisiones a la vez, información esencial), no su estética. CondoTrack sigue siendo
fotográfico, con vidrio, amarillo y Satoshi.

> **Menos información visible. Más jerarquía. Más contexto. Menos pasos.**

Decisiones que lo sostienen: D-34 a D-39 en `02_DECISION_LOG.md`.

---

## 1 · Componentes cerrados

Todos existían antes del lock; se consolidaron, no se agregaron.

| Familia | Componente / clase | Regla |
|---|---|---|
| **Botones** | `.entrar` · `.btn-sec` · `.btn-ter` | Tres niveles. Modificadores: `compacto` (primario del ancho de su texto) y `peligro` (destructivo, en cualquier nivel). Un solo primario por pantalla u hoja |
| **Deslizar** | `SwipeButton` | Sólo para lo irreversible: emitir un pase. Reservar, pagar o entrar a un formulario son botones (D-10, D-37) |
| **Filas** | `.menu`, `.tabla-f`, `.mini-f`, `.persona-f`, `Descarga` con `meta` | Título 15 · metadata 12,5 en **una** línea, cortada si no entra |
| **Acordeones** | `Panel` | Título + resumen de una línea + contador. `color` para categorías de datos (rubros). Arrancan cerrados, salvo que adentro haya un error |
| **Hojas** | `Hoja` | Título, a lo sumo una frase, el cuerpo, acciones. Se arrastra desde el agarre; la captura del puntero se toma recién a los 8 px. Los callbacks de cierre son estables |
| **Zona de contexto** | `ZonaContexto` | Arriba de toda pantalla de detalle. Con foto si hay un lugar; sin foto (campo del ámbito + isotipo) si no |
| **Calendario** | `CalendarioMes` | Un mes, flechas, arrastre horizontal de 60 px. Nada de carrusel (D-35) |
| **Situación del home** | `WidgetPrincipal` | Una cara: la expensa. Sin pestañas con una sola cara (D-38) |
| **Actividad** | `PilaVivas` | Una card al frente, la siguiente asoma 46 px con su texto, contador "1 de N" |
| **Línea de tiempo** | `Linea` con `soloLaHora` | Hora · nodo · evento · metadata. El estado se lee en ícono y texto, no sólo en color |
| **Éxito** | `Confirmacion` | Tilde, qué, cuándo, [primario] y a lo sumo un terciario. Sin párrafo |
| **Vacío** | `Vacio` | Título corto. Sin párrafo. Sin botón si la acción ya está en la pantalla |
| **Descarga** | `Descarga` | Suelta es un botón; con `meta` es la fila del documento; `chico` en comprobantes |

## 2 · Flujos cerrados

```
Home        situación (expensa) → 3 accesos → lo de hoy
Expensas    monto · vence · estado → [Pagar] → hoja de medios → Ya pagué
            Ver composición → torta + rubros (acordeones) → tu parte + cupón
            Ver movimientos → saldo + movimientos de una línea
Reservas    espacio → día → hoja de horarios → [Confirmar reserva] → éxito → Listo
Visitas     [Crear nueva visita] → nombre · día · horario (+ Más datos) → deslizar
Reclamos    [Hacer un reclamo] arriba, una sola vez → hoja
```

Cada dato tiene **un** lugar principal: las normas en el espacio (y plegadas en la
hoja de reserva), los contactos en Mi edificio, las cards de espacios en Mi
edificio, el pago en la expensa, el historial en su línea de tiempo.

## 3 · Color

| Qué | Dónde sí | Dónde no |
|---|---|---|
| `--amarillo` | La acción primaria, el centro de la barra, la franja "Pase activo", la tilde de lo elegido | Pestañas y filtros elegidos (relleno y peso), fondos, texto |
| Carbón | Jerarquía: el campo del home, la barra, el primario del filtro | — |
| `--est-ok/curso/vencido/cerrado` | Estados: pastillas, texto de estado en filas, bordes de reclamos | Decoración |
| `--dv-1…8` / `--rubro-n` | Gráficos y lo que los acompaña (el filo del acordeón de cada rubro) | Cualquier cosa que no sea un dato |
| Ámbitos (`data-ambito`) | El campo tonal de fondo: edificio, expensas, reservas, acceso | Superficies de componentes |

Las pantallas de plata y de datos (expensa, composición, estado de cuenta, informar
pago, medios) van en **superficie tonal**, nunca con foto.

## 4 · Foto y vidrio

- **Foto = lugar.** Edificio (Mi edificio), espacios (Reservas, Mi edificio, R13),
  hall de entrada (visitas), fachada (historial del home). Si no hay un lugar, no
  hay foto: la lavandería va en carbón con su ícono hasta que haya una propia (Q-05)
- **Blur moderado:** la foto de la zona de contexto lleva 3 px de desenfoque; el
  lugar se reconoce y el texto se lee
- **Velos:** dos tokens, `--velo-abajo` (texto apoyado abajo) y `--velo-lado`
  (texto a la izquierda). No se inventa un degradado por pantalla
- **Vidrio sólo con algo detrás** (D-32): el volver sobre la foto, las pestañas del
  campo, "Reservar" sobre la card del espacio

## 5 · Tipografía y medidas

- Satoshi 400 / 500 / 700 / 900, ninguno más
- Títulos de pantalla: 1 a 4 palabras. Sin subtítulo que repita el título
- Filas: 15 / 12,5. Cifras en 900
- Área táctil: 44 px siempre. Lo que se ve chico (pestañas del widget, "Copiar",
  "Reservar" de las cards) agranda su área por fuera, sin moverse
- 390 × 844 sin desborde horizontal; lo último de cada pantalla queda por encima de
  la barra

## 6 · Copy

- Si se entiende por contexto, no se escribe
- Metadata: una línea. Hojas: una frase. Ayudas: sólo si evitan un error real
- Vacíos: "Sin entregas", "Sin reservas", "Sin reclamos abiertos"
- Estados: "Pase activo", "2 visitas", "Entrega pendiente", "Pendiente · vence el
  20 sept"
- Acciones con verbo y objeto cuando hace falta ("Confirmar reserva", "Ver
  composición"); una sola palabra cuando el contexto alcanza ("Pagar", "Listo",
  "Llamar")
- Montos y porcentajes en formato argentino: `$ 184.250`, `1,897 %`

## 7 · Motion (futuro, no implementado en este lock)

El lock v02 no agregó movimiento. Queda anotado para la próxima ronda, siempre sin
librerías y respetando `prefers-reduced-motion`:

- la pila: la card de atrás sube cuando pasás a la siguiente
- el calendario: el mes entra desde el lado del gesto
- el acordeón: el cuerpo se despliega en altura en lugar de aparecer
- el éxito: la tilde se dibuja

Lo que ya se mueve (hojas, transiciones de pantalla) sigue como está en
`05_MOTION_SYSTEM.md`.

## 8 · Prohibido

- Una variante de botón, fila, hoja o velo propia de una pantalla
- Repetir en la barra una acción que la pantalla ya muestra
- Mostrar el mismo dato en dos lugares de la misma pantalla (widget y pila, cards
  y selector, enlace y menú)
- Párrafos que explican cómo funciona el producto
- Foto decorativa, de stock o de otro lugar; foto en pantallas de plata o de datos
- Amarillo para marcar lo elegido en un filtro o una pestaña
- Deslizar para algo que se puede deshacer
- Más de tres niveles visibles en una pantalla: principal, secundario, metadata
- Carrusel con scroll nativo para cambiar de mes
- Librerías nuevas

## 9 · Abierto

- **Q-05** · foto de la lavandería
- **Decisión de diseño a validar:** "Tu parte" (comunes, propios, cupón) vive al
  final de la composición (D-36). Si tiene que estar en la expensa, es una tabla
  de tres filas
- **Decisión de diseño a validar:** el home no reordena la situación: siempre es la
  expensa (D-14, D-38). Si Felipe quiere que un paquete o una visita la desplacen,
  hace falta una regla de prioridad escrita
- **Hipótesis:** la pila, ya usable, aporta lo suficiente para no reemplazarla por
  una lista compacta. Se decide mirándola en uso
