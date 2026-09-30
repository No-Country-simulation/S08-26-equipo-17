# 06 · Flujos del residente

Formato por flujo: **actor · entrada · precondición · camino principal ·
alternativos · permisos · estados · errores · datos que cambian · historial ·
notificaciones**.

---

## F-1 · Reservar un espacio común

**Actor** residente · **Entrada** barra inferior → Reservas, o quick action del home
**Precondición** tener menos de 2 reservas activas en ese espacio

**Camino principal**
1. R05. El calendario de mes es lo primero que ve.
2. Antes de elegir día: caja con borde que dice *"Elegí un día del calendario para
   ver los horarios disponibles."* **Sin** información de disponibilidad en texto.
   Los días con lugar llevan un punto debajo.
3. Elige día → aparecen las franjas.
4. Elige franja. Si el espacio es de tipo `recurso` (lavandería), además elige
   **máquina**.
5. Sube la hoja de confirmación con espacio, recurso, día, franja y reglas.
6. Confirma → pantalla de reserva confirmada.

**Alternativos** · explorar un espacio primero desde las cards de abajo (foto a
sangre) → R13 detalle → volver al calendario con ese espacio ya elegido.

**Estados de una franja** disponible · ocupada · pasada · sin anticipación
suficiente · se superpone con otra reserva tuya · llegaste al tope.
Los cinco motivos ya están implementados en `lib/reservas.ts` como `MotivoBloqueo`.

**Errores** BUG-01: elegir el 15/9 no habilita nada. Revisar el orden de los
bloqueos en `lib/reservas.ts` (~línea 74) y el `disabled` de la tira de días.

**Datos** crea una `Reserva` con estado `confirmada`.
**Historial** entrada "reserva creada" en el historial de la unidad.
**Notificaciones** confirmación al residente; aviso el día anterior.

**Reglas vigentes** (en `lib/data.ts`, `REGLAS`): tope 2 por espacio ·
anticipación mínima 30 min · ventana de 14 días.
El modelo `Espacio → Recurso → Franja` **no se toca**: la lavandería reserva
máquina, no sala.

---

## F-2 · Autorizar una visita

**Actor** residente · **Entrada** acción central Acceso, quick action del home, o
Mi edificio → Visitas

**Camino principal**
1. R06. Botón **"Crear nueva visita"** — botón convencional, no deslizador.
2. Formulario: nombre y apellido, documento, franja horaria.
3. Revisión.
4. **Slide** "Autorizar y emitir el pase". Acá sí, porque es el acto irreversible.
5. Pase emitido con QR, compartible.

**Permisos** solo residentes de la unidad. El propietario no residente no autoriza.
**Estados del pase** próximo · activo · ingresó · finalizado · vencido · cancelado.
**Errores** franja en el pasado; visita superpuesta con un permiso permanente.
**Datos** crea una autorización y un pase.
**Historial** "autorización creada" y, después, "ingresó" / "egresó".

> Ojo con el egreso: ver D-17. Si el residente abre la puerta desde su casa, nadie
> registra ese egreso. En esta pasada el historial lo muestra igual; la corrección
> del modelo queda fuera de MVP.

---

## F-3 · Ver y entender la expensa

**Actor** residente · **Entrada** widget principal del home (pestaña Expensas) o Más

**Camino principal**
1. Home: importe, período, vencimiento. Nada más.
2. → R20. Resumen arriba: total, gastos comunes, propios de la unidad.
3. "Cómo se compone" → rubros.
4. **Gráfico de torta solo cuando el usuario lo pide.** No aparece por defecto.
5. Medios de pago, cupón y rendición completa salen por `Hoja`.

**Errores** reportado: se colgaría al desplegar el detalle. **No reproducido** —
verificar antes de arreglar.
**Notificaciones** expensa emitida; aviso de vencimiento próximo.

---

## F-4 · Hacer un reclamo

**Actor** residente · **Entrada** quick action del home, o Más → Reclamos

**Camino principal**
1. `Hoja` con el formulario — sube desde abajo, no es pantalla.
2. Categoría **opcional**, ubicación, descripción, adjunto.
3. Enviar → reclamo abierto.

**Permisos** administración necesita categoría para **cerrarlo**. El residente no
la necesita para crearlo (D-12).
**Estados** abierto · en seguimiento · cerrado. Con `SubNav`.
**Vacíos** faltan en abiertos y en cerrados.
**Errores** BUG-05: hoy la categoría es obligatoria y bloquea el envío.
**Historial** entrada por cada cambio de estado, con responsable.

---

## F-5 · Retirar una entrega

**Actor** residente · **Entrada** widget principal (pestaña Entregas) o live card

**Camino principal**
1. Card **colapsada** por defecto (D-17 de UI: los desplegables arrancan cerrados).
2. Despliega → transportista, hora de recepción, estado, código de retiro.
3. Retira en recepción.

**Estados** esperada · recibida · retirada.
**Notificaciones** "tu paquete llegó a recepción", con enlace directo a la entrega.

---

## F-6 · Mostrar la credencial de acceso

**Actor** residente · **Entrada** acción central de la barra inferior

Es el flujo que justifica la acción central: se usa **parado en la puerta, con una
mano, sin buscar**. La referencia correcta no son apps de edificios: son el pase
de embarque de las aerolíneas y la tarjeta de transporte.

**Camino principal** un toque en el centro → credencial a pantalla completa.
**Contenido** credencial del residente · autorizar visita · mostrar QR ·
accesos activos · escanear, si el rol lo permite.
