# Estado de implementación

Se actualiza al cerrar cada fase. **Si te quedaste sin contexto, retomá de acá.**

Última actualización: 17/09/2026 · **las doce fases cerradas** (0 a 11).

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
