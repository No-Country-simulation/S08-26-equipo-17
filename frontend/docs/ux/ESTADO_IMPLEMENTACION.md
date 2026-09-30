# Estado de implementación

Se actualiza al cerrar cada fase. **Si te quedaste sin contexto, retomá de acá.**

Última actualización: 18/09/2026 · doce fases cerradas + **ronda de corrección visual 01** (ver al final).

## Dónde estamos

El residente está implementado de punta a punta sobre el sistema nuevo: las 27
vistas renderizan en claro y en oscuro a 390×844, sin overflow, con Satoshi
resuelta y sin ningún target por debajo de 44 px. `npm run build` pasa.

**Lo que falta, y está fuera de este plan:** Administración (`ShellAdmin` llega a
su pantalla de pendiente, como dice el mapa de rutas) y la separación de eventos
registrados vs. declarados (D-17, fuera de MVP por decisión propia).

## Recorrido para mirar

```
?p=app&v=r01&limpio=1      el home sobre el sistema nuevo
?p=app&v=r05&limpio=1      el calendario, y reservar de punta a punta
?p=app&v=r06&limpio=1      visitas → botón → formulario → deslizar al final
?p=app&v=r20&limpio=1      expensa: resumen primero, detalle si lo pedís
?p=app&v=r21&limpio=1      gastos: la torta bajo demanda
?p=app&v=r02&limpio=1      Mi edificio con sus tres pestañas
?p=app&v=r09&limpio=1      reclamos: tres estados y la hoja
?p=app&v=r17&limpio=1      historial agrupado por día
```

Cada uno con `&tema=oscuro`. Y `?perfil=recepcion&p=app&v=p01&limpio=1` para
recepción, que sigue en pie.

## Lo que decidí yo y podés dar vuelta

Está todo en el DECISION_LOG, de D-18 a D-24. Los tres que más se ven:

1. **El widget y la pila cuentan lo mismo dos veces.** Los dos están pedidos por
   la documentación y por los acceptance criteria, así que hice los dos. Si al
   verlo sobra uno, sobra el widget en sus tres caras que no son expensas.
2. **Ni `SubNav` ni los tabs del widget usan amarillo.** Es el criterio de D-05
   llevado a los otros dos niveles de navegación.
3. **Los filtros de más de tres opciones se van a una hoja.** El historial
   ganó espacio y conteos; el precio es un toque más para filtrar.

---

## FASE 0 — Fundaciones · **HECHA**
- [x] Borradas las dos `repeating-linear-gradient(121deg, …)` y los dos planos
      diagonales. `grep repeating-linear-gradient` no devuelve nada
- [x] Campo tonal ambiental anclado arriba: `--campo-alto/medio/bajo`, muere en
      transparente al 47% de la pantalla (37% en escritorio). Claro con carbón,
      oscuro con negros. Verificado en los tres estados de tema
- [x] Escala de titulares abajo: 17 declaraciones. `.tit h1` 26→22, `.hero h2`
      31→24, `.login h1` 32→27, `.cabecera-ent h1` 34→27, `h2.sec` 19→17.
      Tracking de titulares -.035em→-.028em. **Los importes y cifras grandes no
      se tocaron**: son dato, no titular
- [x] `design/tokens.json` espejado: Satoshi en display y ui, pesos 400/500/700/900
      (fuera 600 y 800), grupo `fontStretch` eliminado —Satoshi no tiene eje wdth—,
      escala de tamaños alineada al CSS, tokens del campo tonal agregados
- [x] `npm run build` pasa

Verificado a 390×844 en `r01`, `r05`, `r20` claro y oscuro: `font-family`
computado de `body` resuelve a Satoshi sin fallback, y `scrollWidth` del
documento y de `.vista` es 390. Sin overflow horizontal.

## FASE 1 — Componentes compartidos · **HECHA**
Los cinco existen y tipan. **Todavía no están cableados**: eso pasa en las
fases 4 a 8, que es el orden que evita reescribir pantallas dos veces.

- [x] `BotonGlass.tsx` — dos tonos. `claro` es el aprobado de "Visitas hoy";
      `sobrio` es el mismo material sobre el fondo claro, con el filo de
      gradiente. Sin la variante clara el botón desaparecía sobre el crema
- [x] `WidgetPrincipal.tsx` — tabs adentro del widget, cifra sin card propia
      sobre el campo tonal, hasta tres datos chicos, crossfade de 180 ms con
      corrimiento corto en X
- [x] `PilaVivas.tsx` — gira sola, se frena con el puntero encima o con foco
      adentro, `prefers-reduced-motion` apaga el giro pero no el poder tocar
      una card de atrás. Las capas de atrás van `inert`
- [x] `SubNav.tsx` — activo por peso, color sólido y barra inferior. Sin
      amarillo, igual que la barra inferior
- [x] `CalendarioMes.tsx` — grilla de mes con puntos. **Trae el arreglo de
      BUG-01**: la captura del puntero se toma recién cuando el gesto pasa de
      8 px, así que un toque sigue llegando al botón del día
- [x] CSS de los cinco en `globals.css`, bloque propio al final
- [x] `npm run build` pasa

## FASE 2 — Shell · **HECHA**
- [x] `PillNav` de cinco: Inicio · Mi edificio · [Acceso] · Reservas · Más.
      La barra bajó de 70 a 62 px, flota a 16 px de los bordes con radio
      propio, y el destino activo ya no lleva círculo amarillo: va en peso y
      color sólido (D-05). Lo único amarillo es el squircle central,
      54×38, apoyado sobre la barra
- [x] Ruteo del destino Acceso: la acción central abre `r07`, que sin pase
      seleccionado muestra el vigente y, si no hay ninguno, el estado vacío
      con "Autorizar visita"
- [x] Mapa `PADRE` extendido: `g15` y `r14` pasan a colgar de Mi edificio
      junto con `r02`, `r06`, `r08`, `r16` y `g11`; `f01` cuelga de Acceso
- [x] Safe areas: `--vista` reserva 124 px más `env(safe-area-inset-bottom)`.
      Medido en `r01`: la última card termina 37 px por encima del squircle
- [x] `npm run build` pasa

Los cinco destinos miden 70 px cada uno en 390: entran sin recortar la
etiqueta más larga ("Mi edificio").

## FASE 3 — Bugs · **HECHA**

Ocho bugs, **cuatro causas**. Dos de ellas explicaban seis síntomas.

- [x] **BUG-01** R05 no se podía reservar. Causa: el calendario tomaba el
      puntero (`setPointerCapture`) apenas apoyabas el dedo, y con la captura
      puesta el click se redirige al contenedor que capturó: nunca llegaba al
      botón del día. Ahora la captura se toma recién pasados 8 px de arrastre.
      Verificado con click real: elegir el 20 de sept muestra los 7 horarios,
      y el arrastre sigue cambiando de mes
- [x] **BUG-02** y **BUG-03**, misma causa: "volver" era un destino fijo por
      pantalla, no la pantalla anterior. El prototipo ahora lleva una pila
      (`lib/navegacion.tsx`). `volverA` queda como destino de reserva para
      cuando entrás por enlace directo. Verificado: historial → r01,
      Reglamento → Más
- [x] **BUG-04** "Espacios del edificio" no abría: **tiraba la app entera a
      pantalla en blanco**. Causa: el id del detalle viajaba en un prop
      llamado `ref`, que React 18 reserva; con un string adentro tira
      "Function components cannot have string refs". Afectaba a r13, g10,
      r16, g11 y r07 abierto con id. Renombrado a `refe` en las cinco
      pantallas y en el shell. Verificado: Parrilla abre r13
- [x] **BUG-05** El campo categoría no validaba nada: el problema era que
      venía con "Ascensores" puesto, o sea que el formulario elegía por el
      residente. Ahora la primera opción es "Todavía no sé" y es la que viene
      puesta (D-12). Lo que sí bloquea el envío es la descripción, y está
      bien que lo haga. En la lista y en el detalle el reclamo se lee
      "Sin clasificar". Verificado: se creó RC-0232 sin tocar la categoría
- [x] **BUG-06** El banner traía el símbolo V1 aplanado a blanco con un
      filtro de CSS. Ahora va el lockup V2 tal cual. La franja es carbón en
      los dos temas, así que siempre es `CT_LOGO_DARK_V2.png`
- [x] **BUG-07** `visitas_fondo.jpg` tenía el isotipo blanco quemado en la
      imagen. Reemplazado por un recorte nativo de `edificio.jpg`, 700×212
- [x] **BUG-08** Card "Todo en orden". Medido antes del arreglo: la foto
      ocupaba 231 de 350 px de la card. Ahora usa `.mat-foto` — la foto es la
      card, con el radio de la card y un degradado en lugar del velo con
      radio propio. Medido después: foto 350×214, exactamente la card
- [x] **Además, la misma falla que BUG-07 en seis archivos más:**
      `hero_araoz.jpg` y las tres fotos de espacios con sus miniaturas traían
      la mancha amarilla de marca quemada en el cielo. Se reencuadraron por
      debajo de la mancha, verificando por píxel que no quedara nada
- [ ] "R20 se cuelga al desplegar el detalle de gastos" — **sigue sin
      reproducirse, y ahora se entiende por qué**: R20 no tiene torta ni
      detalle desplegable. La torta vive en R21. Se revisa en la fase 7
- [ ] "El selector de días de R06 no responde" — **sigue sin reproducirse**:
      R06 no tiene selector de días, tiene un filtro de estado. El único
      selector de días de la app es el calendario de R05, que es BUG-01 y
      está arreglado. Se cierra en la fase 6 mirando F01

## FASE 4 — R01 · **HECHA**

R01 pasa a la jerarquía de la IA: contexto → estado → acciones → contenido vivo.

- [x] **Header compacto, sin saludo grande** (D-15). Pasó de 100 a 67 px:
      lockup V2, "Aráoz 1280 · Unidad 7D" en una línea, y el perfil. Edificio
      y unidad se ven sin ocupar un hero
- [x] **Widget principal** con las cuatro caras. Verificado: Expensas
      $ 184.250 con sus tres datos, Visitas 02 · 1 pase vigente, Entregas,
      Reservas SUM · Hoy 20:30, y vuelve a Expensas. La cifra no lleva card
      propia: se apoya sobre el campo tonal
- [x] **Accesos rápidos con el botón firma** (D-06). La card entera es el
      control y la flecha es el material: dos botones anidados no son HTML
      válido, así que `BotonGlass` tiene modo decorativo
- [x] Administración y Recepción pasan a fila completa. De a dos no entraban
      con la flecha sin apretar el nombre del administrador
- [x] **La pila** con las cuatro cards vivas (D-09): visitas de hoy, estado
      del día, próxima reserva y paquete. **La expensa no está ahí**: es
      plata, no es un objeto del día. Las cuatro miden 150 px — con alturas
      distintas el bloque saltaría en cada giro
- [x] Verificado: las capas de atrás van `inert`, y tocar una la trae
      adelante. El giro automático está apagado porque el navegador de
      pruebas pide `prefers-reduced-motion`, que es exactamente lo que
      corresponde
- [x] `npm run build` pasa · sin overflow a 390 · claro y oscuro

**Para mirar:** `?p=app&v=r01&limpio=1` y `?p=app&v=r01&limpio=1&tema=oscuro`.

### Dos cosas que quedan anotadas y no frenan nada

1. **El widget y la pila cuentan lo mismo dos veces.** El widget resume
   visitas, entregas y reservas; la pila muestra esos mismos objetos como
   cards. Los dos están pedidos por `04_COMPONENT_SYSTEM` y por los
   acceptance criteria, así que se implementaron los dos. Si al verlo te
   sobra uno, el que sobra es el widget en sus tres caras que no son
   expensas.
2. **`prefers-reduced-motion` hoy apaga de más.** La regla global de
   `globals.css` mata todas las animaciones y todas las transiciones con
   `!important`, incluido el relleno del `SwipeButton`, que es feedback
   funcional y `05_MOTION_SYSTEM` pide conservar. Se arregla en la fase 11.
3. Las reglas CSS de `.expensa` quedaron sin uso: la card de expensa del
   home la reemplazó el widget. Se decide en la fase 7, cuando R20 diga si
   las reutiliza.
## FASE 5 — R05 · **HECHA**

- [x] El calendario **es** la pantalla: se fue el título "Reservar · Elegí el
      día y la franja". Queda un `h1` para lectores de pantalla — la pantalla
      no necesita explicarse, el documento sí necesita su encabezado
- [x] `CalendarioMes` cableado (venía de la fase 1, con el arreglo de BUG-01)
- [x] La caja de "todavía no elegiste día" pasa a borde sólido marcado, con
      ícono, arriba de todo lo demás y no perdida abajo
- [x] Sin disponibilidad en texto: sólo puntos. Se fue la leyenda de tres
      renglones "hay lugar / quedan pocos / sin lugar"
- [x] **Reserva completa de punta a punta, con gestos reales**: click real en
      el 21 de sept → 7 franjas → hoja → deslizamiento real → "Reserva
      confirmada · SUM · lun 21 sept · 10:00–12:00"
- [x] Lavandería elige máquina: la hoja ofrece las 5 libres de las 6, porque
      el Lavarropas 3 está tomado
- [x] Los espacios abajo, con foto a sangre y sin la mancha de marca
- [x] Las cards de espacio dejan de decir siempre "hoy": muestran el día que
      estás mirando en el calendario, y si está lleno dicen cuándo sí
      ("libre vie 18 sept"). A las siete de la tarde las cuatro decían
      "sin lugar hoy" mientras el calendario mostraba otro día con lugar
- [x] `npm run build` pasa · claro y oscuro · sin overflow

**Para mirar:** `?p=app&v=r05&limpio=1` y con `&tema=oscuro`.
## FASE 6 — R06 · **HECHA**

- [x] "Crear nueva visita" es un botón común de 58 px. Entrar a un
      formulario no es un acto irreversible (D-10); el deslizamiento ahí
      era fricción sin motivo
- [x] El deslizamiento se mudó al final del formulario. `PieForm` tiene
      ahora modo `deslizar`, así que el gesto es del sistema y no de una
      pantalla: cualquier formulario que termine en algo irreversible lo
      pide igual. Mientras confirma vuelve al botón normal — un deslizable
      que no se puede deslizar es peor que un botón deshabilitado
- [x] **Flujo completo verificado con gestos reales**: nombre → día (click
      real en el selector de días) → deslizamiento real → "Visita
      autorizada · Martín López · dom 20 sept · pase CT 7D 5481"
- [x] El selector de días de F01 **responde bien**: click real en "DOM 20"
      y queda marcado. Lo que no respondía era el calendario de R05, que es
      BUG-01 y está arreglado
- [x] "Ver pase" desde una visita abre el pase correcto (CT 7D 4821) sin
      tirar la app: es el quinto camino de BUG-04
- [x] `npm run build` pasa

**Para mirar:** `?p=app&v=r06&limpio=1` y `?p=app&v=f01&limpio=1`.
## FASE 7 — R20 y R21 · **HECHA**

- [x] **El resumen se lee antes que el detalle.** La composición pasa a dos
      paneles que arrancan cerrados y muestran el subtotal: $ 178.900 de
      gastos comunes y $ 5.350 propios. El total del período queda siempre a
      la vista. Antes la pantalla abría con las catorce líneas desplegadas
- [x] **La torta aparece bajo demanda** (R21). Por defecto se ve el total y
      la tabla de los ocho rubros; "Ver cómo se reparte" la despliega.
      Tocar un rubro en la tabla también la muestra, porque ahí la torta
      es la respuesta
- [x] **Medios de pago y documentos salen por `Hoja`.** El cupón y la
      rendición dejan de estar sueltos en la pantalla y viven en una hoja
      "Documentos de la expensa"
- [x] **No se cuelga.** Medido: abrir el detalle de gastos y desplegar la
      torta tarda menos de un segundo, sin overlay de error. El reporte
      original hablaba de R20, pero R20 no tenía torta: la torta es de R21
- [x] `npm run build` pasa · claro y oscuro

**Para mirar:** `?p=app&v=r20&limpio=1` · `?p=app&v=r21&limpio=1`.
## FASE 8 — Mi edificio · **HECHA**

- [x] **`SubNav` funcionando en las tres vistas**: Unidad (`r02`), Edificio
      (`g15`) y Documentos (`r14`) comparten título, pestañas y destino en la
      barra. Cada pestaña sigue siendo su propia vista, así que los enlaces
      directos siguen valiendo. Verificado: Unidad → Edificio → Documentos
- [x] **Los desplegables arrancan cerrados.** Los cinco paneles de la unidad
      estaban en `false` menos dos, que abrían solos
- [x] **Los números de documento: revisados.** No había ninguno. Lo que se
      mostraba, y sin decirlo, eran **teléfonos** de los convivientes, que
      leídos como número suelto parecen un DNI. Ahora dicen "Teléfono" y el
      panel abre diciendo quién ve qué: los residentes de la unidad ven el
      teléfono, recepción ve el nombre, administración ve nombre y vínculo.
      El documento aparece donde hace falta para identificar a alguien —la
      autorización de una visita y la pantalla de recepción—, no acá
- [x] Más deja de listar "Mi edificio" y "Documentos": el primero es un
      destino de la barra y el segundo su tercera pestaña. En su lugar
      aparecen "Historial de la unidad" y "Gastos del consorcio", que la IA
      pone en Más y no estaban
- [x] `npm run build` pasa

**Para mirar:** `?p=app&v=r02&limpio=1` · `?p=app&v=g15&limpio=1` ·
`?p=app&v=r14&limpio=1`.
## FASE 9 — R17 · **HECHA**

- [x] **División visual real entre grupos.** Los movimientos se agrupan por
      día, con encabezado y línea: "Hoy · 4 movimientos", "Ayer · 2",
      "14 de septiembre · 1". El hito ya no repite la fecha completa: dice
      la hora, porque el día lo dice el encabezado. `Linea` tiene ahora modo
      `soloLaHora`, así que el historial de un reclamo o de una entrega
      puede usar el mismo criterio
- [x] **Los filtros dejan de competir con el contenido.** Las cinco
      pastillas amarillas de arriba se reemplazan por una línea que dice qué
      estás mirando y cuánto hay; tocarla abre una hoja con las cinco
      opciones y **el conteo de cada una**, que antes no estaba. Es el mismo
      patrón del selector de período de R21
- [x] Volver lleva a la pantalla anterior (arreglado en la fase 3)
- [x] El timeline ya era línea vertical + nodo + hora + evento + metadata,
      que es el patrón pedido. Cada evento lleva ícono y texto: ningún
      estado depende sólo del color
- [x] `npm run build` pasa

**Ojo con D-17:** el historial sigue diciendo "Egreso registrado" para
egresos que nadie registró. Separar eventos **registrados** de
**declarados** está fuera de MVP por decisión propia, no por olvido.

**Para mirar:** `?p=app&v=r17&limpio=1`.
## FASE 10 — Estados · **HECHA**

- [x] **Hacer un reclamo sube desde abajo.** El formulario es un componente
      compartido (`paneles/PanelReclamo`): lo usan la hoja de Reclamos y la
      pantalla `f02` del enlace directo. Duplicarlo terminaba en dos
      formularios que validan distinto. Verificado de punta a punta: la hoja
      se cierra sola, avisa con el código y el reclamo aparece primero en la
      lista
- [x] De paso, el formulario cambió de orden: primero "Qué pasa", que es lo
      único obligatorio, y después ubicación, categoría y foto. Antes abría
      pidiendo que clasificaras algo que todavía no contaste
- [x] **Reclamos pasa a las tres pestañas de la IA**: Abiertos · En
      seguimiento · Cerrados, con `SubNav` y el conteo de cada una. Un
      reclamo asignado no es lo mismo que uno que nadie miró
- [x] **Estado vacío en las tres**, cada uno diciendo algo distinto y con
      acción sólo donde tiene sentido: en "Cerrados" ofrecer "hacer un
      reclamo" no venía a cuento
- [x] Estados vacíos nuevos en Documentos y en Votaciones
- [x] **Ningún estado depende sólo del color.** El punto de "quedan pocos"
      del calendario era el mismo punto en otro gris: ahora es un punto
      hueco. Cambia la forma, no el tono
- [x] `npm run build` pasa

### Lo que no se hizo, y por qué

`Cargando` y `SinPermiso` existen en `ui/Estados.tsx` y **no los usa nadie**.
No les inventé un uso: un prototipo con datos fijos no espera a una red ni
tiene a quién negarle permisos. Quedan escritos para cuando haya backend.
Los estados de error sí tienen uso real —las cuatro pantallas de detalle
cuando el id no existe— y funcionan.
## FASE 11 — Motion y pulido · **HECHA**

- [x] **`prefers-reduced-motion` dejaba de funcionar el deslizable.** La
      regla global apagaba todo con `!important`, incluido el relleno del
      `SwipeButton`, que es el único feedback de que el gesto avanza, y el
      giro de las ruedas de carga. Ahora la regla general sigue apagando
      todo y las excepciones están escritas una por una, con su motivo
- [x] Tiempos alineados a `05_MOTION_SYSTEM`: la hoja entra en 240 ms y
      sale en 180 —salía en 220—, el velo acompaña, y elegir un día del
      calendario cambia en 90 ms sin rebote
- [x] **Barrido de las 27 vistas del residente en claro y en oscuro**,
      hecho con un iframe de 390×844 que las carga una por una: las 27
      renderizan, ninguna desborda, `body` resuelve a Satoshi en todas y
      ningún titular pasa de 28 px
- [x] **Targets táctiles**: quedaban dos casos por debajo de 44 px. Los días
      del calendario medían 42 —salía del padding de la card y del gap de la
      grilla— y el círculo de perfil del home había quedado en 40 al
      compactar la franja. Los dos están en 44
- [x] La última card de cada pantalla queda por encima de la barra en las 27
- [x] Recepción: las siete pantallas siguen renderizando después de tocar
      `TopBar`, `PieForm` y `Formulario`. Administración llega a su pantalla
      de pendiente, como dice el mapa de rutas
- [x] `npm run build` pasa

---

## Hecho antes de este plan

- **Satoshi integrada** (17/09). `app/layout.tsx` carga Fontshare; tokens
  actualizados; 55 declaraciones de peso 600 → 500 y 15 → 700; cinco cifras
  grandes → 900; tracking aflojado 0,01em en 12 titulares.
  **Sin verificación visual todavía.**
- **`.otf` de Rothek desenlazados** del CSS. Los archivos siguen en
  `public/fonts/` y hay que borrarlos.

## Observado durante la Fase 0 — para las fases que correspondan

- **R05 ya tiene grilla de mes con puntos**, no la tira de 14 días que describe
  la auditoría: el commit `9c40ce5` la había cambiado. Lo que sigue pendiente de
  D-08 es el estado previo a elegir día, los horarios y el título
  "Reservar · Elegí el día y la franja", que tiene que salir. Fase 5.
- **La barra inferior tapa la última card** en `r01` y `r20`. Es el punto de safe
  areas de la Fase 2, confirmado visualmente.

## Bloqueos

Ninguno bloquea el arranque. Las dos preguntas abiertas (Q-01 y Q-02 del
DECISION_LOG) no frenan ninguna fase.

---

# RONDA DE CORRECCIÓN VISUAL 01 · 18/09/2026 · **HECHA**

Documento de origen: `RONDA_CORRECCION_VISUAL_01.md`. Tres decisiones las tomó
Felipe antes de arrancar: calendario como grilla de mes sin caja, centro de la
barra dinámico, y "medio de pago actual" fuera de esta ronda porque el modelo no
lo guarda. Todo lo demás está en el DECISION_LOG, D-25 a D-33.

| Paso | Commit | Qué |
|---|---|---|
| A · Sistema | `26ff063` | color funcional en tokens, campo atmosférico por ámbito, botones en tres niveles, tipografía por rol, trazo de íconos único, `ZonaContexto`, motion neutralizado |
| B+C · Home, barra, expensas | `75075f0` | el home como campo oscuro, barra pegada al borde con centro dinámico, expensa con Pagar, hoja de pago liviana, torta con data-viz |
| D · Reservas | `974d05d` | calendario sin caja en carrusel, selector de espacio con foto, horarios en hoja |
| E+F · Resto | `a24523d` | Mi edificio con zona, visitas por momento, historial con hora en columna, reclamos con estado visual, vacíos con identidad |

## Criterios de aceptación de la ronda

- [x] Home con jerarquía en 3 segundos: campo → estado → acción → accesos → lo de hoy
- [x] Expensas muestra monto + estado + **Pagar** sin buscar, en el home y en R20
- [x] Ningún bloque económico flotando sin agrupar: los subtotales viven en la composición
- [x] El header deja de dominar: 60 px adentro del campo, sin banda propia
- [x] La barra deja de ser la píldora negra genérica
- [x] R05 sin calendario en caja
- [x] Elegir fecha no alarga la pantalla: los horarios van en hoja (medido: 1300 → 1289 px)
- [x] Se percibe el ámbito: piedra, pizarra, atardecer; foto del edificio en Mi edificio
- [x] Más color y profundidad sin perder sobriedad: todo en tokens de baja saturación
- [x] Las fotos aportan lugar: edificio, espacios, visita vigente
- [x] Glass perceptible, y sólo donde hay algo detrás
- [x] Los accesos rápidos son una familia de círculos
- [x] La pila con profundidad: la de adelante manda, las de atrás se insinúan
- [x] Datos y estados jerarquizados: importes más grandes, estados más chicos
- [x] Nada verificado se rompió: reserva y visita de punta a punta con gestos reales,
      barrido de las 27 vistas en claro y oscuro, recepción y login en pie
- [x] Sin motion nuevo como parche: el zoom de fotos, la entrada de vistas y el giro
      de la pila quedaron apagados hasta Motion 02

## Para mirar

`?p=app&v=r01&limpio=1` · `r20` · `r20&ref=pagar` · `r21` · `r05` · `r02` · `r06` ·
`r09` · `r17`, cada uno con `&tema=oscuro`.

## Pendiente

- **Motion 02.** Todo lo que se apagó espera esa ronda: la pila no gira sola.
- **Foto de la lavandería** (Q-05). Va en carbón con su ícono mientras tanto.
- **"Pagar" dos veces en el home** (Q-06) y **widget vs. pila** (Q-07).
- **Medio de pago actual / cambiar medio**: fuera por decisión, necesita modelo.

---

# LOCK V02 · 18/09/2026

Pack: `CONDOTRACK_VISUAL_LOCK_V02_PACK`. Referencia funcional: Consorcio Abierto
(simplicidad, no estética). Decisiones de Felipe antes de arrancar:
Pagar sale del centro de la barra · calendario simple sin carrusel · la pila se
arregla antes de reemplazarla · las cards de espacios salen de R05.
Correcciones al plan: consolidar sin framework nuevo · "Ver composición" abre
gráfico + rubros · éxito de reserva mínimo · F01 con nombre, día y horario
directos · foto sólo donde hay un lugar.

## Fase 0 · Bugs · **HECHA**

| Bug | Causa | Arreglo | Verificado |
|---|---|---|---|
| **A1** la pila no se usaba | la siguiente asomaba 15 px | asoma 46 px por abajo, con su texto; contador "1 de 4" | toque real en la franja: pasa a "2 de 4" sin navegar |
| **A2** "se traba" | **dos causas**. La grave: `Hoja` borraba su propio temporizador de cierre y el velo invisible quedaba encima de la pantalla comiéndose los toques. Además, la X de la hoja vivía adentro de la zona de arrastre, que capturaba el puntero | callbacks de cierre estables; captura recién a los 8 px. Y el calendario vuelve a un mes con flechas y gesto simple, sin carrusel | X real cierra, el velo se desmonta, el día 25 recibe el toque; arrastre real cambia de mes |
| **A3** composición indirecta | 3 pasos hasta la torta | "Ver composición" va a R21 con la torta ya visible | torta + 8 rubros al llegar |
| **A4** se perdía el espacio | el elegido vivía sólo en la pantalla | se anota en el historial (`reemplazarRef`) | Cowork → detalle → volver: Cowork |
| **A5** la hoja se reabría | "pagar" era una orden guardada en el historial | se consume al entrar | Pagar → Ya pagué → volver: sin hoja |

Además: Pagar salió del centro de la barra. Hoy el centro dice **Pase**.

## Fase 1 · Familias · **HECHA**

Consolidación sobre lo que ya existía, sin componentes nuevos.

- **Botones:** 15 variantes en pantallas (`principal`, `secundario`, `prim`,
  `sec`, `widget-cta`, `volver-txt`, `marcar`, `dar-baja`, `cancelar-r`…) pasan a
  tres niveles: `.entrar` (primario), `.btn-sec`, `.btn-ter`. Dos modificadores:
  `compacto` (primario del ancho de su texto) y `peligro` (destructivo, en
  cualquier nivel). Recepción no se tocó: sus `btn-desk` y `fila-op` quedan
  como estaban
- **Filas:** una sola escala en menús, paneles, tablas, documentos, personas y
  opciones: título 15, metadata 12,5 en una línea
- **Acordeón:** `Panel` acepta `color`, un filo a la izquierda de la paleta
  data-viz, para los rubros de la fase 3
- **Velos de foto:** dos tokens (`--velo-abajo`, `--velo-lado`) en lugar de uno
  por pantalla
- Barrido de las 27 vistas en claro y oscuro: limpio

**Nota de verificación:** el navegador de pruebas congela las transiciones
cuando no dibuja, y la regla de `prefers-reduced-motion` le deja a todo
`transition: all`. Al cambiar de tema al cargar, algunos textos quedan en el
color del tema anterior **sólo en ese navegador**. En uno real terminan en
0,01 ms. Para las capturas se fuerzan a terminar.


## Fase 2 · Copy y densidad · **HECHA**

Regla: si una línea no cambia lo que la persona decide, se va.

- **Subtítulos** debajo del título: fuera en Más, Notificaciones, Visitas, Pase,
  Entregas, Reclamos, Perfil, Detalle de reserva, Votaciones e Historial
- **Avisos:** los que explicaban cómo funciona el producto se sacaron (F01
  recurrente, G10, R07, R08, R16). Los que avisan algo que pasó quedan en una
  línea (R09, R15, R21, R24, pago informado)
- **Formularios:** fuera las ayudas debajo de cada campo y las notas al pie
  (F01, F02, PanelReclamo, R15). F03 conserva una sola: "Queda pendiente hasta
  que administración lo confirme."
- **Éxitos:** sin el bloque "registro" (F01, F02, F03, R05)
- **Hojas:** una línea de consecuencia, no un párrafo ("El pase deja de servir
  enseguida.", "No se puede cambiar.")
- **Vacíos:** título corto sin párrafo ("Sin entregas", "Sin reservas"). El
  texto de `Vacio` pasa a opcional. En Reclamos el vacío ya no repite "Hacer
  un reclamo": el botón está arriba
- **Home:** el widget habla corto ("Expensas", "2 visitas", "Pase activo",
  "Entrega pendiente"); la card de historial muestra el último movimiento
- **Área táctil:** las pestañas del widget y "Copiar" se ven igual pero
  responden en 44 px
- Barrido de las 27 vistas en claro y oscuro: sin desbordes. Quedan chicos los
  "Reservar" de las cards de espacios de R05, que salen en la fase 3

## Fase 3 · Expensas y Reservas · **HECHA**

**Expensas** (D-36)
- **R20** queda en el primer nivel: monto, vencimiento, estado, [Pagar], Ver
  composición, Ver movimientos. Fuera la composición en paneles, el total y el
  menú "Pagos y papeles" (repetía Movimientos y "Ya pagué")
- **R21** abre con la torta. Pestañas Por rubro / Por proveedor arriba. Cada rubro
  es un acordeón con el color de su porción y sus comprobantes adentro: ya no
  sube una hoja. La torta pierde su leyenda (la lista es la leyenda). Al final,
  **tu parte**: comunes (1,897 %), lavandería, cochera, total y el cupón
- **R23**: el saldo arriba, grande, en la zona de la expensa. Movimientos en una
  línea; el estado es el color del texto, no una pastilla en su propio renglón
- Arreglado de paso: la participación se leía "1.897%" (mil ochocientos). Ahora
  "1,897%"

**Reservas** (D-37)
- **R05** sin "Explorá los espacios". Las cards completas, con disponibilidad del
  día y [Reservar], pasan a **Mi edificio · Espacios** (G15); la lavandería sale
  sin foto también ahí
- Confirmar con botón, no deslizando. Normas plegadas en un acordeón
- Éxito: "Reserva confirmada", espacio, día y hora, [Listo] y [Ver reserva].
  Listo vuelve a donde estabas

**Verificado con toques reales:** Ver composición → torta y 8 rubros; abrir
Sueldos muestra sus 3 comprobantes. Home → Reservar → día 20 → 14:00–16:00 →
Confirmar reserva → éxito → Listo → Home. G15 → Reservar en Cowork → R05 con
Cowork elegido. Barrido de las 27 vistas en claro y oscuro: limpio.

## Fase 4 · Home, Mi edificio, Visitas y Reclamos · **HECHA**

- **Home** (D-38): la expensa arriba, sin pestañas; tres accesos (Autorizar,
  Reclamar, Reservar); la pila abajo. Nada se cuenta dos veces
- **Mi unidad:** paneles con títulos cortos (Personas, Permisos permanentes); el
  resumen de permisos dice quiénes, no cómo funciona el permiso
- **Mi edificio · Edificio:** los dos contactos con la misma forma (quién, rol y
  horario, Llamar / Escribir). Salieron los atajos a reclamos y entregas que cada
  uno tenía. Los espacios, con sus cards completas (fase 3)
- **Documentos:** una lista agrupada; cada fila es el documento y su descarga
  (título, tipo · fecha, peso). `Descarga` acepta `meta` para ser esa fila
- **F01** (D-39): nombre, día y horario; el resto en "Más datos". Sin subtítulo ni
  ayudas. Todo entra en una pantalla de 812 px
- **Visitas:** el vacío ya no repite el botón de arriba; fuera el subtítulo que
  repetía el filtro elegido
- **Reclamos:** ya estaba (fase 2): un solo "Hacer un reclamo", arriba
- Barrido de las 27 vistas en claro y oscuro: limpio

## Fase 5 · Pulido y lock · **HECHA**

- **Fotos** (D-40): revisadas una por una. Todas son un lugar (edificio, espacios,
  hall, fachada). Ninguna pantalla de plata o de datos tiene foto. No hizo falta
  sacar ninguna
- **Blur moderado:** 3 px en la foto de la zona de contexto de Mi edificio, con la
  escala justa para que no se vea el borde
- **CSS muerto:** 104 selectores de cosas que ya no existen (carrusel de meses,
  leyenda de la torta, paneles de expensa, card por documento, widget viejo,
  botones de antes de la fase 1). ~10 KB menos. Detectados cruzando cada clase del
  CSS contra el código; los que se arman dinámicamente (`est-*`, `entra-*`,
  `cruza-*`) quedaron
- **Metadata en una línea** también en el resumen de los acordeones
- Copy: la notificación "tiene un pase vigente hoy" pasa a "pase activo hoy"
- **Documento del lock:** `10_VISUAL_LOCK_V02.md` (componentes, flujos, color, foto
  y vidrio, medidas, copy, motion futuro, prohibiciones, abierto)
- Barrido final de las 27 vistas en claro y oscuro: sin desborde, sin objetivos
  chicos, lo último de cada pantalla por encima de la barra

## Lock V02 · cierre

Cinco fases, cinco commits. Recepción y Administración no se tocaron. No se agregó
ninguna función ni movimiento. Lo que queda abierto está en la sección 9 de
`10_VISUAL_LOCK_V02.md`.

# RONDA FUERTE · CORRECCIÓN QUIRÚRGICA · 18/09/2026

Pedido: no rediseñar de cero; restaurar la base aprobada y corregir sobre
ella. Referencias: Mercado Pago (claridad, ritmo, jerarquía), iOS
(comportamiento), CondoTrack (fotografía arquitectónica, vidrio, amarillo).

**Restaurado:** el home con el widget de pestañas (Expensas · Visitas ·
Entregas · Reservas) y la pila de "Lo de hoy" (commit `0e2dffa`). Se
descartó el rediseño en curso (hero nuevo, panel único, primario negro con
borde amarillo).

| Pantalla / componente | Qué cambió |
|---|---|
| **Home** | Fachada real atrás del campo, con luz cálida filtrada. Pestañas, accesos y Composición/Movimientos en vidrio. "Vence 20 sep · ● Pendiente" en una línea. Sin "Contactar". Pila con puntos, deslizable, cards del mismo alto; "Hoy, en casa" vuelve como rótulo |
| **Pagar (primario)** | Amarillo con relieve y estado al presionar; no una cápsula plana |
| **G01 Login** | Fachada de fondo, card de vidrio oscuro, "Ingresar" claro. Sin subtítulo ni texto de alta |
| **R07 Pase** | Card carbón lisa; la atmósfera queda atrás. Código y Copiar juntos, Compartir primario, Dar de baja como texto. Sin "se activa 30 minutos antes" |
| **R21 Gastos** | Sin bloque negro: título → período → donut con el total → pestañas → desglose de una línea con el color de su porción. El detalle se abre desde la fila |
| **R23 Estado de cuenta** | Card de saldo con el lenguaje del home (fachada, luz cálida, cifra grande). Movimientos: período, fecha, monto; estado sólo si no está pagada |
| **R20 Expensas** | "Expensas", fachada atrás, Composición y Movimientos como botones |
| **R05 Reservas** | Calendario más corto (sin la semana del mes siguiente), día elegido en círculo amarillo. Hoja: horarios en chips → Continuar → "SUM / 25 sep · 14:00 / Confirmar reserva" → éxito de una línea |
| **Más** | Filas iOS: ícono, título, a lo sumo una línea de estado, chevron sin círculo. Sin descripciones que explican |
| **Mi edificio** | Fachada sin blur, pestañas como control segmentado de vidrio, sin volanta repetida. Personas: nombre, vínculo, teléfono. Contactos compactos con botones de ícono. Espacios: "Hoy · N horarios". Documentos: "PDF · peso" y descarga |
| **Formularios** | Sin subtítulos ni avisos de error que repiten el del campo. "Enviar reclamo". F01: "Autorizar visita" sin "Deslizá"; el pulgar amaga el gesto. La tira de días se arrastra con mouse |
| **Tipografía** | Sin mayúsculas sostenidas en títulos de sección, volantas y rótulos del residente |
| **Atmósfera** | Luz filtrada cálida (champagne, piedra, oliva); ningún ámbito lleva amarillo ni azul |
| **Motion** | La pantalla entra del lado de la navegación, el mes del lado de la flecha, la cara del widget se corre con su pestaña, la pila se desplaza. `?motionforce=1` lo muestra aunque el sistema pida reducir movimiento |

**Hallazgo:** el navegador de pruebas tiene "reducir movimiento" activo; con
esa preferencia la app apaga el movimiento a propósito. Para la demo:
`?motionforce=1`.

**Verificado a mano:** pila (toque, arrastre, puntos, botones de la card),
reserva completa (día → 14:00 → Continuar → Confirmar → éxito), tira de días
de F01 (arrastre con mouse y toque), fila de rubro ↔ porción del donut,
volver con dirección. Barrido de 27 vistas × 2 temas: sin desbordes, sin
imágenes rotas, nada tapado por la barra.

**Motion no está cerrado:** queda la pasada específica.

# FASE 1 · SYSTEM LOCK · 19/09/2026 · **HECHA**

Cierre del sistema visual compartido. No se tocó arquitectura, navegación,
orden de bloques, layouts, flujos, Home, calendario, barra inferior, widget
central ni motion. Cinco commits.

| Capa | Fuente única |
|---|---|
| **Tipografía** | `--t-titulo` 28 · `--t-seccion` 19 · `--t-fila` 16 · `--t-cuerpo` 15 · `--t-meta` 13 · `--t-label` 12 · `--t-cifra` 48 (cifras protagonistas). Satoshi sigue por Fontshare |
| **Botones** | `.entrar` (primario carbón; hueso sobre foto o carbón) · `.entrar.acento` (amarillo, se pide) · `.entrar.pagar` (carbón translúcido + filo amarillo; amarillo al presionar) · `.entrar.peligro` · `.btn-sec` 44 · `.btn-ter` quieto · ícono 44. Alturas 52/44/40, radio 14, foco amarillo |
| **Material** | `--glass-light` / `--glass-dark` + `--glass-blur`, sólo sobre foto. Sobre fondo plano, superficie sólida |
| **Profundidad** | L0 fondo · L1 `--sup` + `--borde` + `--sombra-1` · L2 `--sombra-2` / `--sombra-2-sube` |
| **Estados** | Punto + etiqueta (`.pastilla`, `.reclamo-f .estado-r`) con los colores `--est-*` existentes |
| **Íconos compartidos** | 16 (chevrons, en línea, quietos) · 20 (filas, botones, volver) · 24 reservado |

**Recepción** conserva su primario amarillo, sus pastillas y el `h2.sec` en
mayúsculas como excepción `.desk`, hasta su propia fase.

**QA:** firma de layout de 10 pantallas contra la base (sólo se movió lo
esperado: `.ayuda` de Recuperar quitada, botón de ícono 48 → 44); barrido de
27 vistas × 2 temas limpio; revisión visual de Home, Login, Recuperar, Pase,
Reservas, Más, Estado de cuenta, Mi edificio y Gastos; `next build` limpio.

# FASE 2B · HOME · 19/09/2026 · **HECHA**

Pulido visual sobre el Home lock. No se tocó arquitectura, tabs, monto,
accesos rápidos, barra inferior, rutas ni copy.

| Punto | Qué quedó |
|---|---|
| **Fondo del hero** | La misma fachada, fuera de foco a 16 px. El desenfoque va en la capa de atmósfera (`backdrop-filter`) y no en la imagen, igual que en el login 2A: sin halos, sin escalar, sin corrimiento lateral |
| **Marca de agua** | Se retiró el isotipo gigante del campo (`.zc-iso` sólo en el home; en zona-ctx sigue) |
| **Pagar** | Variante `.pagar` con el mismo vidrio oscuro que los secundarios y un filo amarillo al 55 %: integrado al widget. Al presionar, amarillo con texto carbón |
| **Pendiente** | "Vence 20 sep · Pendiente" es una línea secundaria: punto de 6 px, mismo peso que el vencimiento, sin halo |
| **Cards de Lo de hoy** | Sin filo: se separan por foto, contraste y sombra `--sombra-2` |
| **Lo de hoy** | Pila vertical gobernada por el scroll (`position:sticky`, escalón de 7 px por índice). Sin gesto horizontal, sin puntos, sin "1 de 4" |
| **Onboarding** | "Empezar" queda centrado en todo el ancho del botón; el pulgar amarillo no lo corre |

**Para la fase de motion (3):** el apilado es sólo CSS y responde a rueda,
trackpad y dedo. Lo que falta es el refinamiento fino: atenuar o escalar
apenas la card que queda atrás mientras la siguiente la tapa
(`animation-timeline: view()` donde esté disponible, con el estado actual
como base). Nada de eso debe volver a introducir gesto lateral.

## Fase 2B.2 · terminación del Home · **HECHA**

- **Vértices del campo.** El halo gris de las esquinas de abajo eran dos
  cosas sumadas: la capa de atmósfera con `backdrop-filter` (que se comía
  el fondo claro de la página hacia adentro del radio) y la sombra del
  campo cayendo sobre ese mismo fondo. El desenfoque volvió a la foto
  —agrandada un 12 % para que el borde lavado quede fuera del recorte— y
  la sombra se retiró: el campo es una masa oscura sobre página clara y
  no necesita sombra para separarse.
- **Lo de hoy.** Las tres cards con foto comparten un solo velo: fade
  horizontal de izquierda a derecha, donde vive el texto, más un cierre
  suave abajo. La foto de visitas baja a 0,82 de opacidad con un poco de
  gris, para que el título mande.

**Próxima fase (2D · Reservas):** se trabaja con la referencia de
calendario enviada: pastillas de fechas arriba, calendario limpio y
aireado, composición simple y CTA sobrio. En esta pasada no se tocó nada
del calendario.

# CORRECCIÓN VISUAL V3 · RESIDENTE · 20/09/2026

Seis commits sobre el estado actual del repo, con las capturas de
`01_CURRENT_ERRORS` como fuente de verdad estructural y las referencias
como patrón puntual. No se tocó Recepción ni Administración.

| # | Qué |
|---|---|
| 1 | **Login + Home.** Autofill de Chrome tapado con sombra interna del color del campo. Pagar deja el filo amarillo y usa el primario del sistema, el mismo de Ver pase y Ver entrega |
| 2 | **Autorizar visita + éxito.** Rail de fechas sin caja por día, horarios en la misma familia, "Más datos" como fila, CTA primario en vez del deslizable, éxito centrado con jerarquía |
| 3 | **Reservas.** El espacio pasa a rail compacto con foto chica; el calendario es el contenido principal y usa el mismo lenguaje de fecha; horarios y confirmación en la misma familia |
| 4 | **Más e internas.** Listas a sangre con separadores sangrados, ícono suelto, sin card adentro de card. Reclamos abre en la primera pestaña con contenido |
| 5 | **Entregas.** Detalle sin repetir tipo/remitente cuatro veces: estado protagonista, quién y cuándo, foto real de recepción si existe, datos y historial. Lista en la familia de filas |
| 6 | **Expensas y Gastos.** La fila Expensas de Más sale (llevaba al hero duplicado); Estado de cuenta es el destino canónico, con saldo compacto sin foto ni punto y movimientos en lista. Proveedores tiene donut y color; los períodos sin detalle dicen dónde está; los nombres largos entran mejor |

**QA:** 26 vistas × 2 temas a 390×844 sin desbordes, sin imágenes rotas,
todo en Satoshi y sin objetivos por debajo de 36 px; flujos de autorizar
visita, reservar, entregas y gastos probados a mano; `next build` limpio.
