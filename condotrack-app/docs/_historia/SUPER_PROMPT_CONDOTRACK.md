# CondoTrack — Prompt maestro: corregir, completar y cerrar la app

> Pegá esto entero en Claude Code, parado en `E:\- DISEÑO WEB\CondoTrack\condotrack-app`.
> Es un trabajo largo. Ejecutalo por fases, en orden, y **commiteá al terminar cada fase**
> para poder volver atrás si algo sale mal.

---

## 0. Contexto

Sos el diseñador de producto y frontend de **CondoTrack**, una plataforma de gestión,
comunicación y trazabilidad para edificios y condominios. Trabajás sobre un prototipo
Next.js 14 App Router + TypeScript, **sin librerías de UI ni de estado**. CSS plano en
`app/globals.css`, que es la única fuente de verdad visual. Tokens en `design/tokens.json`.

**Leé antes de tocar nada** (están en la carpeta del proyecto o en el Project de Claude):

- `04_MAPEO_IDS_A_PATRONES.md` — los IDs de pantalla están asignados. **No inventes IDs.**
- `06_UX_UI_SCOPE.md` — los 12 templates reutilizables y las 16 pantallas del MVP.
- `05_INFORMATION_ARCHITECTURE.md` y `04_USERS_AND_ROLES.md`
- `00_MASTER_UI_SYSTEM_LOCK.md` — datos ficticios fijos, no los cambies por pantalla.
- `10_DECISION_LOG.md`

**El principio del producto, que manda sobre cualquier decisión estética:**

```
EDIFICIO → UNIDAD → PERSONA → OPERACIÓN → ESTADO → RESPONSABLE → HISTORIAL
```

El éxito del proyecto es: abrir un edificio o una unidad y entender **qué pasó, quién
está involucrado, qué autorización existe, en qué estado está, quién lo gestionó y qué
se hizo antes** — sin ir a buscar a otro lado.

**Si algo de este prompt contradice un documento del proyecto, decilo explícitamente
en vez de resolverlo en silencio.**

---

## 1. Dirección visual — vale para todo lo que toques

El sistema existe y funciona. Lo que falta es **sobriedad**. La referencia es Swiss:
poco color, mucha jerarquía tipográfica, aire, y el amarillo como acento puntual.

| Regla | Detalle |
|---|---|
| **El amarillo es acento, no ambiente** | Aparece en: el estado activo de la nav, el elemento seleccionado, y una sola acción por pantalla. En ningún otro lado. |
| **Fuera la tintura de fondo** | Los degradados amarillos del fondo de pantalla (`--malla-alto`, `--halo-1`) se eliminan. Confunden qué es botón y qué no. Los degradés **dentro de las cards** pueden quedar. |
| **Superficies sobrias** | Nada de bordes blancos brillantes. Contorno de carbón al 6%, sombra suavísima, radio generoso. |
| **Jerarquía por tipografía y espacio**, no por color ni por caja | No todo es una card. Border, relleno, radio y sombra se gastan por rol, no se estampan en todo. |
| **Titulares más chicos** | Los `Titulo/L` de 31px están grandes para mobile en listas. Bajalos donde compiten con el contenido. |
| Tipografía | Inter. Rothek no está disponible completa (solo pesos sueltos), así que no la uses en interfaz. |

**Paleta:** amarillo `#F5E500`, carbón `#111614`, fondo `#F4F5F1`, superficie `#FFFFFF`,
texto secundario `#515A56`, borde `#E4E6E0`, borde control `#C9CEC6`, error `#8C2F2F`.
Modo oscuro ya está resuelto con variables: mantenelo funcionando.

---

## FASE 0 — Arreglar lo que está roto

Antes de agregar nada. Cada punto es un bug reportado mirando el prototipo corriendo.

### 0.1 El scroll no funciona en ninguna vista
Es el bug más grave. Las vistas del residente no scrollean: el contenido que no entra
en 844px queda cortado y es inalcanzable. Revisá `.vista`, `.screen` y el contenedor
de `ShellResidente`: tiene que haber `overflow-y: auto` en el lugar correcto y padding
inferior suficiente para que la última fila no quede debajo de la pill nav.

**Verificalo pantalla por pantalla**, con el contenido real, no de memoria.

### 0.2 R05 Reservas tira un runtime error
`TypeError: (0 , _lib_reservas__WEBPACK_IMPORTED_MODULE__.dias) is not a function`.
Primero probá borrar `.next` y reiniciar el server — es muy probable que sea caché de
un módulo escrito a mitad. Si persiste, revisá `lib/reservas.ts`: que el archivo esté
completo, que exporte `dias`, y que no haya import circular con `lib/data.ts`.

### 0.3 R01 — el layout es correcto, la implementación no
**`referencias/R01_LAYOUT_APROBADO.png` es el layout aprobado del home.**
No lo rediseñes. No cambies tamaños de card, radios, sombras ni el efecto de vidrio.
Lo que hay que arreglar es que la implementación **no llega a ese layout**:

- **"Para hoy"** se ve como una sola card con el texto cortado. En la referencia son
  **dos filas separadas**: "Próxima reserva · SUM · Hoy 20:30" con su miniatura, y
  "1 paquete para retirar" como fila propia con su chevron. Separalas y que el texto
  entre completo.
- El contenido de abajo queda inalcanzable porque no hay scroll (ver 0.1).
- Compará contra la imagen, elemento por elemento, hasta que coincida.

### 0.4 R06 — la tarjeta de visita está cortada
La tarjeta de Martín López (vigente, horario, "Ver pase") se corta, y el botón también.
Revisá alturas fijas y `overflow`. La tarjeta tiene que crecer con su contenido.

### 0.5 R06 — falta el final de la lista
Al llegar al fondo tiene que decir algo: **"No hay más visitas"**. Hoy simplemente se
termina. Aplicá el mismo cierre a todas las listas largas.

### 0.6 La ruedita de carga gira demasiado rápido
Bajala a ~1.1s por vuelta.

### 0.7 El swipe "Autorizar visita" no lleva a ningún lado
Es el problema conceptual más importante de esta fase: **hay un botón para autorizar
una visita, pero no hay a quién autorizar**. Ver Fase 2.

---

## FASE 1 — El home, respetando el layout aprobado

**El layout de `referencias/R01_LAYOUT_APROBADO.png` está aprobado y no se rediseña.**
El orden, los tamaños de card, los radios, las sombras y el efecto de vidrio quedan
como están. Lo único que cambia en el home es lo que sigue, y **nada más**:

1. **El botón de campana pasa a ser el perfil** (avatar con iniciales, "FO"). Las
   notificaciones se mueven a un acceso secundario dentro de Más. Mismo tamaño, misma
   posición, mismo tratamiento — solo cambia el contenido del círculo.

2. **Se suma una card de expensa del mes**, entre el hero y "Visitas hoy". Tiene que
   usar **exactamente el mismo lenguaje** que las cards que ya están: mismo radio,
   misma sombra, mismo tratamiento de superficie. No inventes un estilo nuevo.
   Contenido: período, importe, vencimiento y estado. Toca y lleva al detalle.

3. **Accesos rápidos a administración y a recepción.** Dos toques directos. Metelos
   donde menos ruido hagan respetando el layout — lo más probable es que sea dentro
   de la fila de tres accesos rápidos o inmediatamente debajo. No agregues una barra
   flotante nueva.

Todo lo demás del home queda igual. Si una decisión tuya obliga a mover algo del
layout aprobado, **no la tomes**: marcala como pregunta abierta y seguí.

## FASE 2 — Módulo Expensas y gastos *(lo más importante que falta)*

**Este módulo no existe en la documentación del proyecto.** Es una ampliación de alcance
deliberada, pedida por el diseñador. Registrala en `10_DECISION_LOG.md` como decisión
de producto nueva, con fecha, y marcá qué partes son requisito confirmado y cuáles
son hipótesis tuyas.

### Entidades

```ts
type Expensa = {
  id: string; unidad: string; periodo: string;       // "2026-09"
  total: number; vencimiento: string;                // ISO
  estado: "pendiente" | "pagada" | "vencida";
  pagadaEl?: string; medioPago?: string;
};

type RubroGasto = {
  id: string; nombre: string; monto: number;
};
// Rubros fijos del consorcio:
// servicios públicos · abono de servicios · obras y mejoras extraordinarias
// honorarios profesionales · seguros · gastos bancarios · amenities · sueldos y cargas

type GastoDetalle = {
  id: string; rubroId: string; proveedor: string;
  concepto: string; monto: number; fecha: string;
};

type MedioPago = {
  tipo: "transferencia" | "debito" | "presencial";
  titular: string; cbu?: string; alias?: string; banco?: string; nota?: string;
};
```

### Pantallas

**Expensa del mes (detalle)** — período, total, vencimiento, estado, desglose entre
gastos comunes y los propios de la unidad. Acciones: informar un pago, descargar el
cupón, descargar la rendición completa.

**Gastos del consorcio** — el panel que pidió explícitamente:
- **Gráfico de torta** por rubro, con la leyenda al lado y el porcentaje de cada uno.
  Dibujalo con SVG a mano, sin librerías. Cada rubro tiene su color propio, y esos
  colores son **una escala neutra derivada del carbón**, no ocho colores de fantasía.
  El amarillo se reserva para el rubro seleccionado.
- **Selector de período** — poder elegir el mes.
- **Ver por rubro** → al tocar un rubro, el detalle de ese rubro.
- **Ver por proveedor** — misma información agrupada distinto.
- **Descargar rendición completa** y **descargar comprobante**.

**Medios de pago** — CBU, alias, banco, titular, con botón de copiar. Y descargar PDF.

**Estado de cuenta** — histórico de expensas de la unidad con saldo.

**Informar un pago** — formulario: período, importe, fecha, medio, adjuntar comprobante.
Queda en estado "informado, pendiente de confirmación por administración".

### Lo importante
Los PDF no existen de verdad: la acción de descargar tiene que **mostrar el estado de
descarga y dejar claro qué archivo sería**, sin mentir con un archivo vacío.

---

## FASE 3 — Cerrar los flujos del residente

### 3.1 Autorizar una visita — el formulario que falta
Hoy hay un botón sin destino. Creá el formulario:
nombre y apellido, documento (opcional), tipo (visita / proveedor / servicio),
día, franja horaria, si es recurrente, y nota para recepción.
Al confirmar: se genera el pase, queda en el historial de la unidad, y se notifica
a recepción. Estados: confirmación, error de validación, cancelación.

### 3.2 "Visitas" pasa a ser "Mi unidad"
El destino de la nav se llama **Mi unidad** y adentro, en paneles:
- Quiénes viven en la unidad
- **Quién tiene permiso permanente de entrar** — accesible y fácil de revocar.
  Esto lo pidió explícitamente y hoy no existe.
- Visitas (hoy / próximas / historial)
- Entregas
- Datos de la unidad

Mejorá la navegación: hoy todo es una lista plana.

### 3.3 Reservas
- **El calendario es lo primero**, no la lista. Elegir amenity o servicio, día y franja.
- Los espacios (**Explorá los espacios**) van **abajo**, como algo agregado y lindo:
  imágenes, disponibilidad, particular de cada edificio.
- **Historial de reservas de todo el edificio**, no solo las propias.
- La última card deslizable estaba bien, mantené ese gesto.
- El modelo `Espacio → Recurso → Franja` ya existe en `lib/data.ts` y `lib/reservas.ts`:
  respetalo. La lavandería reserva **máquina**, no sala.

### 3.4 Panel "Más" completo
Preguntas frecuentes · Reglamento · Reclamos (crear y seguir) · **Votaciones** ·
Informar un pago · Estado de cuenta · Documentos · Preferencias · Cerrar sesión.

### 3.5 Reclamos (R09)
Crear: categoría, ubicación, descripción, foto. Seguir: estado, responsable, historial
de acciones. Es el patrón **Detalle + Timeline** del scope: usalo, no inventes otro.

---

## FASE 4 — Perfil Recepción

IDs ya asignados: `P01` inicio · `P02` unidades/búsqueda · `P03` escáner · `P04`
validación · `P05` entregas · `P07` incidencias · `P08` agenda operativa.

Es un **operational desk**, no un dashboard: pantalla de mostrador, acciones grandes,
poco texto, todo a un toque.

**P01 · Inicio de recepción** — cuatro acciones grandes: validar acceso, registrar
entrega, buscar unidad, reportar incidente. Más: quién está adentro ahora, entregas sin
retirar, y los avisos del día.

**P04 · Validar acceso** — **atención, esto es una decisión de producto ya tomada:**
validar un pase y registrar un ingreso son **dos acciones distintas**. Recepción primero
verifica que la autorización esté vigente, ve el resultado, y **después** registra la
entrada con un segundo toque. Las dos quedan en el historial de la unidad, con hora y
responsable. No las unifiques.

**P05 · Entregas** — registrar: unidad, remitente, tipo, foto. Notifica al residente.
Retirar: quién retiró, cuándo, quién lo entregó.

**P02 · Buscar unidad** — búsqueda por unidad o por persona, y desde ahí el contexto
completo de esa unidad.

---

## FASE 5 — Perfil Administración

IDs: `A01` inicio · `A02` edificios · `A03` edificio · `A04` unidades · `A05` unidad
(detalle + historial) · `A06` personas · `A07` persona · `A08` accesos · `A09` entregas
· `A10` reservas · `A11` · `A12` reclamos · `A13` documentos.

**Es en administración donde vive el criterio de éxito del proyecto.** `A05 Unidad`
es la pantalla más importante de toda la aplicación: abrir una unidad y ver residentes,
accesos, entregas, reservas, reclamos, expensas y **el historial completo de acciones**
en una sola vista. Diseñala primero y que el resto cuelgue de ahí.

**A01 · Dashboard** — pendientes del día, excepciones, actividad reciente, indicadores
de accesos, entregas, reservas, reclamos y cobranza. Quick actions.

**Layout desktop.** Administración no es mobile: app shell con sidebar, selector de
edificio, búsqueda global, notificaciones y perfil. Los templates *Entity list* y
*Entity detail + timeline* del scope resuelven casi todas estas pantallas: **usalos,
no diseñes veinte pantallas sueltas.**

**Expensas desde administración** — generar el período, cargar gastos por rubro y
proveedor, emitir, ver quién pagó y quién no, confirmar pagos informados.

---

## Reglas transversales

**Permisos.** Cada pantalla declara qué rol la ve y qué puede hacer. Un residente ve su
unidad; recepción ve el edificio operativo; administración ve todo. No asumas que todos
ven todo.

**Estados obligatorios en cada pantalla.** Vacío, carga, error, sin permiso,
confirmación y cancelación. Si falta uno, la pantalla no está terminada.

**Por cada flujo importante documentá:** actor · punto de entrada · disparador ·
precondiciones · camino principal · caminos alternativos · permisos · estados · errores ·
cancelación · confirmación · qué datos cambian · qué queda en el historial · qué
notificación se genera.

**Nada de librerías nuevas.** Ni de fechas, ni de gráficos, ni de estado, ni de UI.
La torta se dibuja con SVG. Las fechas con `Intl` y aritmética de minutos.

**No rompas el build.** `lib/data.ts` va a crecer bastante. Ya se rompió un deploy por
sacar un campo que otra pantalla usaba: antes de terminar cada fase, grepeá cada
referencia a los objetos exportados y verificá que exista. Corré `npm run build`.

**Español rioplatense**, voseo, sin tecnicismos en la interfaz. Los errores dicen qué
pasó y cómo resolverlo.

**Accesibilidad.** Navegación por teclado, nombres accesibles en todos los controles,
y los estados nunca dependen solo del color.

**Datos ficticios coherentes.** Edificio Aráoz 1280, unidad 7D, Felipe Osorio residente,
Diego Sosa recepción, Mariana Ferrari administración. No los cambies por pantalla.

---

## Cómo entregar

Al terminar **cada fase**:

1. Commit con un mensaje que diga qué fase cerró.
2. Un resumen corto: qué pantallas nuevas hay y en qué URL se ven
   (los deep links `?p=` y `?v=` ya existen — sumá los de las vistas nuevas).
3. Las decisiones que tomaste, separadas en: **requisito confirmado** / **decisión de
   diseño razonable** / **hipótesis** / **pregunta abierta**. Nunca presentes una
   hipótesis como requisito.
4. Lo que quedó afuera y por qué.

Al final de todo, actualizá `04_MAPEO_IDS_A_PATRONES.md` y `10_DECISION_LOG.md`.

**No te quedes en un plan: implementá.** Si una decisión de producto es ambigua y te
bloquea, elegí la opción más simple, marcala como hipótesis y seguí.
