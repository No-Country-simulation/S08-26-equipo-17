# Residente · ronda 2 (devolución de Felipe, 30/09/2026)

Claude Code · checkout `_github-sync/condotrack-app` (rama UxUi). Sólo Residente.
Sin commit, push, deploy ni Figma. **Pendiente de aprobación visual de Felipe.**
Se ve en producción en `http://localhost:3003/?p=app&v=r01` (poné **Movimiento: activado**).

## Tabla

| # | Pedido | Qué se hizo | Archivos |
|---|---|---|---|
| 1 | "Las cards se apilan al revés, todas juntas; copiá skiper16" | La pila es la de `skiper16.tsx` (StickyCard_001): cada card `sticky`, llegan **de a una**, la siguiente sube y tapa entera a la anterior, que queda asomando **20 px** y se achica desde arriba hasta `1 − (n−i−1)·0,1`. La rueda del mouse se suaviza como Lenis (lerp 0,1). La pila se posa a media altura, con "En tu edificio" pegado encima; al llegar la última termina la página. Movimiento reducido: lista quieta | `components/ui/PilaVivas.tsx`, `app/globals.css` |
| 2 | "Las cards de En tu edificio son muy chicas" · "que todas tengan la misma lógica y el mismo amarillo" | Las cuatro son la misma card de 300 px: foto con rótulo, titular y flecha (abre la lista de lo suyo) y **la misma franja amarilla** con la acción puntual: Pase activo → Ver pase · Historial de la unidad → Ver · Confirmada → Ver reserva · Para retirar → Ver entrega | `components/screens/R01.tsx` (`CardViva`), `app/globals.css` |
| 3 | R02 · "Historial de la unidad tiene un borde; todo blanco" | Sin filo, blanco | `app/globals.css` |
| 4 | R05 · "el selector de arriba era el correcto; me sacaste las imágenes" | Vuelve el selector de espacio con foto, arriba, en vidrio | `components/screens/R05.tsx`, `app/globals.css` |
| 5 | R05 · "abajo es para explorar los espacios, no para ver los días" | "Explorar espacios" abre la ficha de cada espacio (R13), con "Conocer". Ya no elige días | `components/screens/R05.tsx` |
| 6 | R05 · "no hay un shader donde lo pedí" | Shader WebGL real (degradé de malla vivo: foco amarillo de marca, uno cálido y uno salvia, trama que se mueve como tela y grano fino), detrás del título, el selector y el calendario, fundido con la página. 30 cuadros/s, 3/4 de resolución, se pausa fuera de la vista; reducido = un cuadro quieto; sin WebGL queda la luz en CSS de antes | `components/ui/FondoShader.tsx` (nuevo), `R05.tsx`, `app/globals.css` |
| 7 | R05 · "el calendario no muestra lo que está reservado y lo que no" | Cada día dice lo suyo: **barra corta** que crece con la parte reservada, **filo amarillo** = tu reserva, **número tachado** = completo, carbón = elegido. Clave de una línea con las mismas marcas. Se sumaron reservas de otras unidades a los datos de demo para que el mes tenga días parciales y completos | `R05.tsx`, `components/ui/CalendarioMes.tsx` (campos opcionales `ocupacion`/`completo`), `lib/data.ts`, `app/globals.css` |
| 8 | R19 · "la card de las preguntas, que pertenezca al mismo fondo, no dentro de una card blanca" · "Preferencias y seguridad es espectacular, copiemos eso" | Preguntas agrupadas por tema con el título de grupo de Preferencias y cada pregunta en su propia fila sobre el fondo; el reglamento igual. "Reglamento de convivencia" (Mi edificio) ahora abre el reglamento, no las preguntas | `components/screens/R19.tsx`, `lib/gestiones.ts`, `components/screens/G15.tsx`, `components/ShellResidente.tsx`, `app/globals.css` |
| 9 | R24 · "el botón de abierta no me gusta" · "la negra no; en oscuro queda todo negro" · "la de tu voto, más simple" | La abierta ya no es carbón: superficie clara con **franja amarilla arriba** ("Abierta · cierra en 6 días") y se distingue igual en oscuro. El estado es texto, no pastilla. Opciones con porcentaje solo; tu voto dice "Tu voto". La cerrada muestra sólo Resultado y Tu voto | `components/screens/R24.tsx`, `app/globals.css` |
| 10 | F01 · "Autorizar visita podría estar en amarillo" | Botón amarillo | `app/globals.css` |
| 11 | "Reinicio la demo y no anda el motion" | Lo que pide la URL (`motionreduce=0`) queda guardado como preferencia de la barra de demo | `components/Prototipo.tsx` |
| 12 | R08 · "tendría que ser el mismo lenguaje que Ver entrega" | La lista usa la card de seguimiento en chico (de quién, qué día, estado, recorrido) y abre la misma card en grande. Para retirar en carbón; retiradas apagadas | `components/screens/R08.tsx`, `components/paneles/PanelEntrega.tsx` (`CardEntrega`), `app/globals.css` |
| 13 | G11 · "no Sobre · Unidad 7D; qué día directamente" · "que diga Recibido" · "las líneas no están bien hechas" · "Nada más para mostrar" | Arriba el día y la hora en que llegó; "Recibido / Retirado / Entregado" (sin "Cuándo"); recorrido en una línea con los tres puntos alineados a sus rótulos; cierre "Nada más para mostrar" | `components/paneles/PanelEntrega.tsx`, `components/screens/G11.tsx`, `app/globals.css` |
| 14 | R06 · "el historial de mis visitas podría mostrar cards; en Próximas algo visual interesante" | Próximas como ticket con talón amarillo (día grande), corte, cuánto falta y "Pase listo". Historial en cards apagadas con iniciales y resultado | `components/screens/R06.tsx`, `app/globals.css` |

Cierres de lista de las pantallas tocadas: "Nada más para mostrar".

## Motion medido (producción :3003)

- **Pila:** tope de cada card al posarse 218 / 238 / 258 / 278 px; escala final 0,7 / 0,8 / 0,9 / 1; las cards se posan en scroll 354, 650, 946 y 1242 (una por tramo de 296 px: el alto de la card más el hueco, menos el filo).
- **Rueda suave:** 4 muescas (400 px) → el scroll recorre 560 → 960 en ~1 s con salida suave (66 ms: +34, 133 ms: +76, 333 ms: +271, 600 ms: +376).
- **Reducido:** `apilada` apagado, cards `position: relative`, sin relleno extra.
- **Shader:** lienzo WebGL vivo en claro y oscuro (293×525 a 3/4 de resolución).

## Verificación

- `npx tsc --noEmit`: limpio.
- `next build` a `.next/qa-prod`: OK. `tsconfig.json` devuelto a HEAD (Next le agrega los `include`).
- Barrido en producción: 27 pantallas de Residente × claro/oscuro × 390/360 = 108 mediciones, sin scroll horizontal de página, sin imágenes rotas, sólo Satoshi. Los únicos avisos son elementos decorativos recortados que ya existían (foto del campo del Inicio, isotipo de las cabeceras, tira de días de R13).
- Recepción P08 y Administración A10 (comparten `CalendarioMes` y los datos de reservas): sin cambios visuales; las marcas nuevas sólo se dibujan si la pantalla las pasa. El día completo del SUM se puso el domingo para no chocar con el pedido del sábado que Administración tiene "por decidir".
- Flujos: votar (En contra → Emitir → "Tu voto"), Mi edificio → Reglamento de convivencia → Reglamento, Reservar → Conocer → R13 → Volver → R05, Entregas → card → G11, Inicio → franja "Ver entrega" → G11.

## Evidencia (390×844)

`01_R01_pila_skiper16.png` · `02_R01_cards_iguales.png` · `03_R02_historial.png` ·
`04_R05_reservar.png` · `05_R19_preguntas_reglamento.png` · `06_R24_votaciones.png` ·
`07_F01_autorizar.png` · `08_R08_entregas.png` · `09_G11_entrega.png` · `10_R06_mis_visitas.png`

## Para aprobar

1. La pila: 20 px de filo y 10 % de achique por capa (los valores de skiper16) y la rueda suavizada.
2. El shader de Reservar (intensidad del amarillo).
3. La clave de una línea debajo del calendario (usa las marcas, no palabras sueltas).
4. La franja amarilla en la votación abierta.
5. Mis visitas · Próximas como ticket.
