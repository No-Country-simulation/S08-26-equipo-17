# Residente · ronda 3 (segunda devolución de Felipe, 30/09/2026)

Sólo Residente. Sin commit, push, deploy ni Figma. Pendiente de aprobación.
Se ve en `http://localhost:3003/?p=app&v=r01` con **Movimiento: activado**.

| # | Pedido | Qué se hizo | Archivos |
|---|---|---|---|
| 1 | "Las cards no tenían que agrandarse; lo que te pedí más grande es el texto En tu edificio" | Cards de vuelta a 188 px (misma estructura y franja amarilla). "En tu edificio" pasa a 24 px | `app/globals.css` |
| 2 | "Que se bloquee a partir de un cuarto de la pantalla; que no haya scroll infinito en esa sección" | La pila se traba a 1/4 de la pantalla (211 px a 844). El espacio que necesita la última card para posarse es exacto y ahí va el cierre "Nada más para mostrar": la página termina cuando termina la pila. Tramo por card: 184 px (antes 296) | `components/ui/PilaVivas.tsx`, `app/globals.css` |
| 3 | Pagar · "el alias no entra" | Alias en una línea (16 px); el CBU entero a 12 px sin pisar "Copiar" | `app/globals.css` |
| 4 | Pagar · "Transferencia / Referencia: el texto no me gusta" | "Por transferencia" con el título de grupo de la app (no versalitas chicas); "Referencia" → "Concepto" | `components/paneles/PanelMedios.tsx`, `app/globals.css` |
| 5 | "El éxito tendría que usar la misma lógica que Visita autorizada, para todas las pantallas" | Pago informado (F03), Reclamo creado (R09 y F02), Reserva confirmada (R05) y la nueva pantalla **Reserva cancelada** (R18) usan `ExitoProtagonista`: tilde al centro, título, resumen, datos callados, nota y las acciones juntas al pie | `F03.tsx`, `F02.tsx`, `R09.tsx`, `paneles/PanelReclamo.tsx` (`ExitoReclamo`), `R05.tsx`, `R18.tsx` |
| 6 | R05 · "no me figuran reservas activas" | "Tus reservas" debajo del selector: cada reserva activa (de cualquier espacio) con filo amarillo; tocarla lleva el calendario a ese espacio y ese día y abre sus horarios con "Tu reserva" marcado | `R05.tsx`, `app/globals.css` |
| 7 | R05 · "no anda el scroll para la derecha de la lavandería" | El selector es un `Rail`: se arrastra con el mouse (y con el dedo) | `R05.tsx` |
| 8 | Notificaciones · "títulos, tamaño, colores; lo no leído se mezcla con hoy; amarillo y texto blanco" | Lo sin leer va aparte y arriba ("Sin leer" con contador amarillo), en cards carbón con texto blanco, ícono en círculo amarillo, marca "Nueva" y "Marcar como leída" por card. Lo leído, por día, en filas sobre el fondo. Sale el filtro Todas/No leídas (la separación lo resuelve) | `components/screens/R03.tsx`, `app/globals.css` |
| 9 | "La tabla de gastos usa la card que dijimos que no" | Gastos del consorcio: la tabla va sobre el fondo con encabezado (Rubro · Importe · %), sin la card blanca; "Tu parte" también sin la card gris | `components/screens/R21.tsx`, `app/globals.css` |
| 10 | Login · "el logo, ahora centrado" | Centrado | `app/globals.css` |

## Verificación

- `npx tsc --noEmit` limpio; build de producción a `.next/qa-prod`.
- Pila medida: posada en 211/231/251/271 px al final del scroll (923), sin montarse; reducido = lista quieta con el cierre al pie.
- Flujos: Tus reservas → Cowork → hoja del 2 oct con 09:00–12:00 "Tu reserva"; cancelar una reserva → "Reserva cancelada"; alias y CBU medidos sin desborde (176/176 px).

Evidencia 390×844: `01_R01_cards_y_pila.png` … `07_G01_logo.png` en esta carpeta.
