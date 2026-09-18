# Prompt — Fase Reservas (Semana 3, workflows del residente)

> Pegá esto entero en Claude Code, en la carpeta del proyecto.

---

## Contexto

Trabajás sobre `E:\- DISEÑO WEB\CondoTrack\condotrack-app` — Next.js 14 App Router +
TypeScript, sin librerías de UI ni de estado. CSS plano en `app/globals.css`, que es la
única fuente de verdad visual. Los tokens están en `design/tokens.json` (formato Tokens
Studio) y espejados a mano en `globals.css`.

Leé antes de tocar nada:

- `claude/17_ARCHIVO_FIGMA.md` — qué existe y qué deuda tiene
- `04_MAPEO_IDS_A_PATRONES.md` — los IDs de pantalla ya están asignados, no inventes
- `06_UX_UI_SCOPE.md` — los 12 templates; el calendario es el #8
- `10_DECISION_LOG.md` — decisiones cerradas

El prototipo residente hoy tiene **ocho vistas y cero flujos completos**. Todos los
botones de acción están dibujados y no llevan a ningún lado. Esta fase cierra el primer
flujo de punta a punta: **reservar un espacio común**.

## Conflicto que hay que resolver primero

`04_MAPEO_IDS_A_PATRONES.md` asigna:

- **R05** = reserva espacio, bajo **Calendario**
- **R18** = agenda personal / reservas, bajo **Lista mobile**
- **R13** = espacio común, bajo **Detalle**
- **G12** = detalle de reserva / ítem

Lo que está construido hoy como `R05` es una **lista** de reservas, o sea que en realidad
es **R18**. Primera tarea: renombrar. `components/screens/R05.tsx` pasa a `R18.tsx`, y
`R05` queda libre para el calendario, que es lo que el mapeo dice que es.

Actualizá `ROTULOS` y el tipo `Vista` en `lib/data.ts` en consecuencia.

## Decisión de modelo — la parte importante

Hoy `Reserva.cuando` es un string ya formateado (`"Hoy · 20:30–22:30"`). No hay fecha, no
hay duración, no se puede detectar un conflicto. Eso cambia.

**El modelo pasa a `Espacio → Recurso → Franja`.** La razón es la lavandería: ahí no
reservás el espacio, reservás *una máquina*. El SUM tiene un recurso; la lavandería tiene
seis. Si no se modela así ahora, entra laundry y hay que rehacer el calendario.

```ts
export type TipoReserva = "exclusiva" | "recurso";

export type Espacio = {
  id: string;
  nombre: string;
  img: string;
  piso: string;
  tipoReserva: TipoReserva;   // exclusiva = SUM, parrilla · recurso = lavandería
  bloqueMin: number;          // duración de la franja, en minutos
  aperturaMin: number;        // minuto del día en que abre (ej. 8*60)
  cierreMin: number;
  reglas: string[];           // texto para mostrar en R13, no lógica
};

export type Recurso = {
  id: string;
  espacioId: string;
  nombre: string;             // "Lavarropas 3", "Sala"
  estado: "disponible" | "fuera-de-servicio";
};

export type EstadoReserva = "confirmada" | "en-curso" | "finalizada" | "cancelada";

export type Reserva = {
  id: string;
  recursoId: string;
  unidad: string;
  inicio: string;             // ISO
  fin: string;                // ISO
  estado: EstadoReserva;
  creadaPor: string;
  creadaEl: string;           // ISO
};
```

Espacios del set ficticio (respetá los tres que ya existen y sumá la lavandería):

| Espacio | tipoReserva | Recursos | Bloque |
|---|---|---|---|
| SUM · Piso 9 | exclusiva | 1 (Sala) | 120 min |
| Cowork · Piso 2 | exclusiva | 1 (Sala) | 60 min |
| Parrilla · Terraza | exclusiva | 1 (Parrilla) | 180 min |
| Lavandería · Subsuelo | recurso | 4 lavarropas + 2 secarropas | 60 min |

Poné un lavarropas en `fuera-de-servicio` — el estado tiene que verse en el diseño, no
quedar como caso teórico.

## Reglas de reserva

Confirmación automática, sin aprobación de administración. Las reglas son duras y se
validan en el cliente:

1. **Tope por unidad:** 2 reservas activas por espacio.
2. **Anticipación mínima:** no se puede reservar una franja que arranca en menos de 30 min.
3. **Ventana máxima:** no más de 14 días hacia adelante.
4. **Sin superposición propia:** la unidad no puede tener dos reservas que se pisen, ni
   siquiera en espacios distintos.
5. **Recurso fuera de servicio:** no reservable, se muestra igual con el motivo.

Cada regla que bloquea tiene que decir **por qué** bloquea, en texto, en el lugar donde
el usuario intenta la acción. Nunca un botón gris sin explicación.

## Pantallas de esta fase

### R18 · Mis reservas
Es la pantalla que hoy se llama R05. Renombrar y adaptar a las fechas reales: agrupar en
Próximas / Historial, mostrar estado, y que cada fila abra G12.

### R05 · Reservar espacio — el calendario
Entry point: el swipe "Reservar espacio" de R18 y la acción rápida de R01.

Tres pasos en una sola pantalla, con avance progresivo (no wizard de tres vistas):

1. **Espacio** — desplegable con los cuatro espacios y su disponibilidad de hoy.
2. **Día** — tira horizontal de 14 días, con marca de disponibilidad por día.
3. **Franja** — grilla de horarios del día elegido.
   - Si `tipoReserva === "exclusiva"`: una franja por horario.
   - Si `tipoReserva === "recurso"`: por cada horario, qué recursos quedan libres. El
     usuario elige horario **y** máquina.

Abajo, resumen persistente + botón de confirmar. La confirmación es un paso dentro de
esta pantalla, no una vista aparte: en mobile, mandar al usuario a otra pantalla para
confirmar una reserva de dos toques es ruido.

### R13 · Espacio común (detalle)
Foto, piso, capacidad, reglas de uso, política de cancelación, y disponibilidad de los
próximos días. Se llega desde el desplegable de R05 y desde "Explorá los espacios".

### G12 · Detalle de reserva
Qué, cuándo, qué recurso, quién la creó y cuándo. Acción de cancelar con confirmación
explícita. Después de cancelar, la reserva no desaparece: queda en estado `cancelada` en
el historial. Es un producto de trazabilidad — no se borra nada.

## Estados obligatorios

Ninguno de estos es opcional. Si falta uno, la pantalla no está terminada.

- Vacío: sin reservas / sin disponibilidad ese día
- Recurso fuera de servicio
- Tope de reservas alcanzado
- Fuera de la anticipación mínima
- Fuera de la ventana de 14 días
- Superposición con otra reserva propia
- Conflicto: la franja se ocupó mientras el usuario elegía
- Confirmación exitosa
- Cancelación: confirmar → hecho
- Carga

## Por cada flujo, dejá documentado

Actor · punto de entrada · disparador · precondiciones · camino principal · caminos
alternativos · permisos · estados · errores · cancelación · confirmación · qué datos
cambian · qué actividad queda en el historial · qué notificación se genera.

## Restricciones

- **No rompas el build.** `lib/data.ts` cambia de forma; ya se rompió una vez un deploy
  de Vercel por sacar un campo que otra pantalla usaba. Antes de terminar, grepeá cada
  referencia a `ESPACIOS`, `RESERVAS`, `EDIFICIO`, `RESIDENTE` y verificá que exista.
- **Componentes reales**, no capturas. Nada de imágenes que sustituyan una pantalla.
- **Reusá los tokens y los patrones que ya existen.** Antes de crear un componente nuevo,
  fijate si el chip, la pastilla de estado, la fila de lista o el campo ya resuelven el
  problema. Si hace falta uno nuevo, justificá por qué.
- **No agregues librerías.** Ni de fechas, ni de calendario, ni de estado. El manejo de
  fechas se hace con `Intl` y aritmética de minutos.
- **Español rioplatense**, voseo, sin tecnicismos en la interfaz.
- **Accesibilidad:** la grilla de franjas se navega con teclado, los estados no dependen
  solo del color, y cada control tiene nombre accesible.
- Mantené los deep links que ya existen (`?p=`, `?v=`, `&limpio=1`, `&tema=`) y agregá los
  de las vistas nuevas.

## Qué entregar

1. El código andando, con `npm run build` pasando.
2. Un resumen corto de qué cambió en el modelo de datos y qué pantallas lee cada campo.
3. La lista de decisiones que tomaste vos y que deberían ir al `DECISION_LOG`, separadas
   en: requisito confirmado / decisión de diseño razonable / hipótesis / pregunta abierta.
4. Lo que quedó afuera y por qué.

No te quedes en un plan: implementá lo que está definido acá. Si algo de este prompt
contradice un documento del proyecto, decilo explícitamente en vez de resolverlo en
silencio.
