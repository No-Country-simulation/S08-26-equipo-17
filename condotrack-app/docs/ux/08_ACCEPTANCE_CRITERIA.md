# 08 · Acceptance criteria

Una fase no está cerrada si alguno de los criterios que le aplican falla.

## Global — aplica a toda fase

- [ ] `npm run build` pasa.
- [ ] `grep -c "font-weight:600" app/globals.css` → **0**. Idem `font-weight:800`.
      Satoshi no tiene esos pesos.
- [ ] `grep -n "repeating-linear-gradient" app/globals.css` no devuelve nada en el
      fondo global.
- [ ] En DevTools, el `font-family` computado de `body` resuelve a **Satoshi**, sin
      caer al fallback.
- [ ] Sin overflow horizontal a 390 px.
- [ ] La última card de cada pantalla se ve entera sobre la barra inferior.
- [ ] Modo oscuro funciona en todo lo tocado (`&tema=oscuro`).
- [ ] Ningún estado se comunica **solo** por color.
- [ ] Ningún titular de pantalla domina la interfaz.
- [ ] Glass solo en controles y capas, no en listas ni en historial.
- [ ] Targets táctiles ≥ 44 px.

## R01 — Inicio

- [ ] Header compacto. **No hay saludo grande.**
- [ ] Edificio y unidad visibles sin ocupar un hero.
- [ ] El widget principal conmuta entre Expensas, Visitas, Entregas y Reservas.
- [ ] Las quick actions se distinguen del resto y usan el botón glass.
- [ ] Las live cards apilan **solo** objetos equivalentes. Expensas **no** apila.
- [ ] "Todo en orden": la foto llega a los cuatro bordes, no hay velo con radio
      propio, y ningún texto se sale de su caja.
- [ ] "Visitas hoy" usa un asset **sin la marca incrustada**.
- [ ] El logo del header es el lockup V2 y respeta el tema.

## R05 — Reservas

- [ ] El calendario es **grilla de mes** y ocupa la jerarquía principal.
- [ ] La fecha seleccionada es inequívoca.
- [ ] Antes de elegir día **no hay disponibilidad en texto**; hay puntos.
- [ ] Elegir día actualiza los horarios.
- [ ] **Se puede completar una reserva de punta a punta.**
- [ ] En lavandería se elige máquina, no solo horario.
- [ ] Los espacios están abajo, con foto a sangre.
- [ ] No quedó el título "Reservar · Elegí el día y la franja".

## R06 — Visitas

- [ ] "Crear nueva visita" es un botón convencional.
- [ ] El selector de día funciona.
- [ ] El slide aparece **solo** en "Autorizar y emitir el pase".

## R20 — Expensas

- [ ] El resumen se lee antes que el detalle.
- [ ] La torta aparece **bajo demanda**.
- [ ] Medios de pago y documentos salen por `Hoja`.
- [ ] No se cuelga al abrir la composición.

## R02 / Mi edificio

- [ ] Los desplegables arrancan **cerrados**.
- [ ] El subnav `Unidad | Edificio | Documentos` funciona.
- [ ] Se revisó qué se muestra de los números de documento y con qué criterio.

## R17 — Historial

- [ ] El historial se lee: hay división visual real entre grupos.
- [ ] Los filtros no compiten con el contenido.
- [ ] Volver lleva a la pantalla anterior, no a `r07`.

## Barra inferior

- [ ] Cinco destinos, ni uno más.
- [ ] La acción central destaca **sin** volver amarilla la barra.
- [ ] El destino activo se distingue por peso y color sólido, **no por amarillo**.
- [ ] La barra flota y es más baja que la actual.

## Reclamos

- [ ] Se puede crear un reclamo **sin** elegir categoría.
- [ ] El formulario sube desde abajo con `Hoja`.
- [ ] Hay estado vacío en abiertos y en cerrados.

## Motion

- [ ] Toda animación explica jerarquía o relación.
- [ ] Nada dura más de 300 ms salvo el crossfade del onboarding.
- [ ] `prefers-reduced-motion` apaga lo decorativo y **conserva** el relleno del
      `SwipeButton`, que es feedback funcional.
