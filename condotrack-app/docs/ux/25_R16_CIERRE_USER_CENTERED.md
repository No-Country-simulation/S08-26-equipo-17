# R1.6 · Cierre user-centered de Recepción

Fecha: 24/09/2026. Branch `UxUi`, HEAD `2fae1fe`. **Sin commit ni push.** Pendiente de aprobación visual de Felipe.

Gobiernan este cierre el handoff R1.6 completo (`r16/CONDOTRACK_R16_SINGLE_HANDOFF.txt`), el recovery handoff de Codex y el override **USER-CENTERED VISUAL FIDELITY** del 24/09: una referencia primaria por pantalla, copiada en su lógica; ningún color sin significado; la tarea antes que la decoración.

## 1. Estado encontrado

- Working tree con 16 archivos modificados y ~30 sin trackear, todos de Codex (R1 → R1.6). Preservados: no hubo reset, checkout, stash ni borrado. Copia de seguridad del estado heredado fuera del repo antes de editar.
- Los dos últimos cambios de Codex (grilla del header con `--rec-brand-track/--rec-nav-track` y breakpoints 800/801 → 900/901) **compilan**: `npm run build` y `tsc` pasaron sobre el árbol heredado.
- Lo que Codex reportó y era real: Agenda con calendario + eje, Unidades sin finanzas, verificación separada del ingreso, AUTORIZADO/VENCIDO/NO ENCONTRADO, invalidación al editar el código, sensor ligado a IDs nuevos (dos iteraciones de 800 ms), búsqueda que se abre hacia la izquierda con flechas/Enter/Escape y foco devuelto.
- Lo que faltaba o estaba roto: estados elegidos invisibles en oscuro (contraste 1:1 medido en nav, segmentos, filtros, pisos y día del calendario); línea "Ahora" tachando títulos; leyenda del escáner encima del marco; pesos 550/600/650 que Satoshi no tiene (18 declaraciones); botón deshabilitado oliva en oscuro; la mudanza aprobada sólo abría la Agenda genérica; retiro de entrega podía confirmarse "Sin identificar"; Agenda con fills por categoría y un detalle que partía la pantalla.

## 2. Método

Por pantalla: referencia primaria abierta, captura actual al lado, cinco diferencias (composición, jerarquía, espaciado, peso, interacción), estructura → tipografía → material → motion, captura nueva, comparación. Capturas finales en [`qa-r16-cierre/`](qa-r16-cierre/).

## 3. Destinos

### Agenda · P08 — referencia U01 Planner (U08 sólo para el comportamiento del detalle)
- **USER GOAL:** ver el día, detectar lo que viene y abrir un evento sin perder la lectura temporal.
- **PRIMARY INFORMATION:** qué viene y a qué hora; después qué es, quién y dónde.
- **PRIMARY ACTION:** abrir un evento. En el detalle, una sola acción: *Abrir pase* (visita) o *Abrir unidad* (reserva, mudanza).
- **Cambios:** dos columnas del mismo material hundido, como U01: a la izquierda reloj, mes y filtros (la fila elegida se eleva, con contador); a la derecha el día con eje horario y eventos elevados. Sin fills por categoría: el tipo va en el rótulo, el color queda para *Aprobada* (verde semántico) y para lo próximo (filo amarillo). Lo ya hecho baja al material de la columna. Eventos largos rayados después de su cabecera. "Ahora" detrás de los eventos, con su hora en la columna de horas. Selección: contorno de 2 px en el color de selección del tema + el detalle con el mismo contorno.
- **Detalle:** reemplaza la columna del calendario (380 px) con una transición de 280 ms; el eje no se comprime. Escape o ✕ cierra y devuelve el foco al evento. Contenido: tipo + hora, título, unidad, estado, metadato útil, una acción. En ≤900 px es hoja con el mismo contenido.
- **Enlaces directos:** `?v=p08&ref=<evento>` abre y centra el evento; la mudanza aprobada llega así desde Home, la búsqueda y la campana.
- **Desvíos de U01:** U01 tiene tres columnas; el tercer panel de U01 es el detalle, que entra cuando se usa (contenido). El detalle va a la derecha para quedar pegado al eje (interacción pedida por el override §7).

### Home · P01 — referencia U02 Volvo
- **USER GOAL:** orientarse en el turno y arrancar la próxima tarea del mostrador.
- **PRIMARY INFORMATION:** hora, próximo acceso, qué hay pendiente.
- **PRIMARY ACTION:** Escanear acceso.
- **Cambios:** el riel derecho abre de entrada su panel de *Acciones rápidas* (≥1151 px), como el asistente de U02: la mitad derecha del hero deja de estar vacía y la acción principal se ve sin hover; ícono y fila se iluminan juntos. Selección y brillo interior de vidrios corregidos en oscuro. "Hoy" pasa a 3 + 2 en anchos medios sin pisar rótulos.
- **Desvíos:** el riel izquierdo de U02 es navegación global; acá son previews de contexto (el handoff prohíbe una segunda navegación). Bajo 1151 px el panel vuelve a abrirse desde el riel (responsive).

### Accesos · P04 y P03 — referencia U06 Security
- **USER GOAL:** decidir si una persona pasa y dejarlo registrado sin equivocarse de persona.
- **PRIMARY INFORMATION:** el estado del pase, después quién es.
- **PRIMARY ACTION:** Verificar el pase; recién después, Registrar el ingreso (o la salida).
- **Cambios:** resumen del mostrador en tarjetas iguales de U06 (Esperados hoy, Adentro ahora, Validados hoy, del estado real). El resultado es la fila de estados de U06: AUTORIZADO · VENCIDO · NO ENCONTRADO, el que ocurrió se llena con su ícono; los otros quedan con su nombre. PROGRAMADO y ANULADO ocupan el lugar del medio con su nombre exacto. Datos en filas con filetes; recuperación en una línea con filo; historial del pase plegado. El escáner suma un pase ya usado para ver VENCIDO y la leyenda sale del marco.
- **Desvíos:** sin la dona de U06: no hay un dato que la justifique. El teclado numérico de R1.5 se conserva (función).

### Entregas · P05 — referencia U05 Management
- **USER GOAL:** registrar lo que llega y entregarlo a la persona correcta.
- **PRIMARY INFORMATION:** qué espera retiro, de quién y desde cuándo.
- **PRIMARY ACTION:** Registrar retiro (por fila); en el módulo oscuro, Registrar y avisar al residente.
- **Cambios:** módulos de peso distinto como U05: lista clara con filas redondeadas de contorno fino e ícono en círculo; registro en el módulo oscuro con sus propios tokens. Sin retirar / Retiradas son dos vistas de la misma lista. Estado único: punto + Recibido / Avisado / Retirado. El retiro es un panel lateral de 440 px y **no confirma sin nombre** de quien retira.
- **Desvíos:** sin el Gantt de U05: el modelo de entregas no tiene duraciones.

### Unidades · P02 — referencia U07 Timepiece
- **USER GOAL:** encontrar una unidad y saber quién vive, quién la visita y qué espera.
- **PRIMARY INFORMATION:** unidad y residentes.
- **PRIMARY ACTION:** elegir la unidad; desde la ficha, abrir el pase de una visita.
- **Cambios:** un solo marco partido por filetes: dos tercios directorio (búsqueda, pisos, tabla), un tercio ficha. La columna nunca queda vacía: sin unidad elegida muestra las unidades con entregas o visitas de hoy. Elegido = banda de 4 px + fondo. Escape devuelve el foco a la fila; filtros y búsqueda se conservan. Sin cuenta, saldo, deuda ni m² (verificado en DOM).
- **Desvíos:** sin fotografía de U07: no hay assets y la foto aleatoria está prohibida.

### Incidencias · P07 — referencia U06 Security
- **USER GOAL:** dejar asentado lo que pasa y saber qué sigue abierto y sin responsable.
- **PRIMARY INFORMATION:** gravedad y estado, separados.
- **PRIMARY ACTION:** Reportar el incidente.
- **Cambios:** resumen en tarjetas U06; dos barras de U06 que cuentan y filtran: gravedad (el ancho sigue a la cantidad; alta en rojo semántico) y estado (Sin derivar · Derivada · Cerrada). En la fila, gravedad a la izquierda con marca + palabra y estado a la derecha: nunca mezclados. Lo cerrado se pide desde la barra.
- **Desvíos:** ninguno de composición.

### Actividad · P09 — referencia U09 Timeline Journey
- **USER GOAL:** reconstruir qué pasó, cuándo y quién lo hizo.
- **PRIMARY INFORMATION:** el orden temporal.
- **PRIMARY ACTION:** filtrar y abrir el detalle de un movimiento.
- **Cambios:** recorrido de U09: título con número ("06/"), eje con guías punteadas, píldoras por carril (Accesos, Entregas, Incidencias) en su hora o su día; las que coinciden se escalonan. Tocar una píldora marca y enfoca su fila en la bitácora de abajo, que conserva el detalle plegado.
- **Desvíos:** carriles por categoría en vez de etapas de proyecto (contenido).

### Búsqueda — referencia U11
Campo suave con lupa adelante, sin botón oscuro; se abre hacia la izquierda, ↑↓ recorren, Enter abre, Escape cierra y devuelve el foco al disparador. En ≤900 px ocupa la fila de la navegación.

### Perfil — sistema de menú existente
Sin patrón nuevo: Perfil, Cambiar perfil/rol, Claro/Oscuro, Cerrar sesión. Escape y click afuera cierran; el foco vuelve a DS.

## 4. Sistema compartido de Recepción

- **Selección:** `--rec-sel` / `--rec-on-sel` (carbón en claro, hueso en oscuro) para nav actual, segmentos, filtros, pisos, controles abiertos y acciones fuertes. Resuelve el 1:1 medido en oscuro.
- **Material:** `--rec-recessed`, `--rec-raised`, `--rec-raised-line`, `--rec-raised-shadow`, `--rec-hatch`, `--rec-ok-strong`, `--rec-error-strong`, con valores de tema oscuro y de sistema oscuro.
- **Tipografía:** 0 pesos inexistentes (18 declaraciones 550/600/650 → 700).
- **Deshabilitado:** neutro (hundido + texto secundario), nunca amarillo lavado.
- **Detalles:** sin cruz azul nativa en búsquedas; disclosure con el chevron del sistema.
- **`Hoja`** (compartido): prop opcional `bloqueado` (deshabilita confirmar) y foco que ahora sí entra al abrir. Las otras 17 hojas no cambian de aspecto.
- **Todo lo nuevo está bajo selectores de Recepción** (`.rec-command-center`, `.ag-`, `.ac-`, `.en-`, `.un-`, `.inc-`, `.act-`, `.cc-action-panel`).

## 5. QA

- `npm run build` ✔ · `npx tsc --noEmit` ✔ · `node scripts/check-reception-selectors.cjs` ✔ (12) · `git diff --check` ✔ (sólo avisos LF/CRLF).
- Harness propio por CDP (Chrome headless, mouse/teclado reales, emulación de `prefers-reduced-motion` y `prefers-color-scheme`).
- **Barrido:** 8 vistas × 2 temas × 1440/1150/901/900/768/390: sin desborde horizontal de documento ni de `.desk-main`, sin imágenes rotas, todo Satoshi, sin pesos inexistentes.
- **Resident:** 27 vistas × 2 temas a 390×844: sin desborde, sin imágenes rotas, Satoshi, sin `.rec-command-center` ni tokens `--rec-*`. Hoja de Pagar en R01 intacta. Administración renderiza su pendiente sin desbordes.
- **Teclado:** búsqueda (Enter abre, ↓ enfoca resultado, Escape cierra y devuelve foco, Enter navega a Unidad 7D), perfil (Escape → foco en DS), notificaciones (click afuera cierra), Agenda (Enter abre, Escape vuelve al evento; en tablet hoja con Escape), Unidades (Escape vuelve a la fila).
- **Accesos:** AUTORIZADO → ingreso registrado → Adentro ahora 01; VENCIDO; NO ENCONTRADO; PROGRAMADO; editar el código borra el resultado y bloquea el paso 2.
- **Entregas:** retiro sin nombre bloqueado; panel lateral 440 × 460 px en 1440.
- **Incidencias:** crear "Ascensor B" (alta) → primera en la lista, resumen actualizado.
- **Motion** (medido con `document.getAnimations()`):
  - Normal: el sensor corre `rec-novelty-pulse` con 2 iteraciones × 800 ms (1,6 s) y queda el contador estático; no se repite al navegar, volver a Home ni pasar el mouse. Detalle de Agenda: 311 ms.
  - Sistema reducido: sin animación, contador presente.
  - `motionreduce=1`: sin animación, contador presente.

### Verificación independiente
Se lanzó una segunda verificación con cuatro agentes (teclado/contraste, flujos, responsive, fidelidad). También la cortó el límite de sesión, pero dejaron mediciones que se revisaron y corrigieron:
- **Hoja sin foco adentro** (compartido): el efecto de foco corría antes de que existiera el portal. Ahora espera al marco. Con teclado el foco entra al cerrar y Tab queda adentro; con mouse no aparece anillo (`:focus-visible` falso). Mejora también las hojas de Resident, verificado en Pagar de R01.
- Días de otro mes en el calendario de Agenda con contraste 1,99 (claro) y 2,97 (oscuro): ahora color secundario sin transparencia.
- "opcional" en formularios de Recepción: 4,34 → color secundario pleno.
- Dos amarillos en Accesos después de verificar: el de verificar pasa a carbón en cuanto hay resultado, así queda una sola acción primaria.
- Filtro elegido de Agenda: se suma un filo al fondo elevado y la negrita.
- Incidencias entre 651 y 1150 px: el estado vuelve a la derecha del título.
- Confirmados sin cambios: flujo de acceso completo (validar → ingreso → Adentro 01 → Actividad arriba → volver ofrece salida), escáner (cinco pases, estados correctos), registro de entrega con selector de unidad, incidencias con filtros combinados, Escape de búsqueda, perfil, notificaciones, edificio y menú devuelven el foco a su disparador.

## 6. Deuda real

- **Aprobación visual de Felipe** pendiente: la fidelidad a cada referencia es una lectura propia.
- CSS muerto heredado de R1–R1.4 (`.rec-sidebar`, `.rec-dashboard`, `.rec-header`, `.op-unit-*`, `.op-timeline`, `.op-planner-layout`…) y `ShiftActivity.tsx` sin uso. No se borró para no mezclar limpieza con el cierre visual.
- El audit de 10 agentes y la verificación de 4 se cortaron por límite de sesión antes de devolver informes. Se usaron sus mediciones crudas y el resto se auditó a mano con el mismo harness: no hubo una crítica de fidelidad independiente completa.
- Contraste: se verificaron los pares nuevos principales, no un barrido integral de WCAG.
- Datos demo en memoria: recargar reinicia las operaciones.

## 7. URLs

- Claro: http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro
- Oscuro: http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=oscuro
- Vistas: `v=p08` Agenda · `v=p04` Accesos · `v=p03` Escanear · `v=p05` Entregas · `v=p02` Unidades · `v=p07` Incidencias · `v=p09` Actividad.
- Directos: `v=p08&ref=ag4` (mudanza aprobada) · `v=p04&ref=CT%207D%204821` · `v=p02&ref=7D`.
