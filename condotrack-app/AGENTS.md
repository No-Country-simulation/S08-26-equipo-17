# CondoTrack · guía para el próximo agente

Prototipo navegable de CondoTrack (app de consorcios). Next.js 14 App
Router + React 18 + TypeScript, sin librerías de UI. Todo el estilo vive
en un solo archivo: `app/globals.css`. Los datos son demo, en `lib/`.

## Cómo se corre

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # tiene que quedar limpio antes de cerrar cualquier cambio
```

Deploy: Vercel, proyecto `condotrack` (scope `lobetofelipe-9828s-projects`).
Producción: https://condotrack-zeta.vercel.app — `npx vercel --prod --yes`.

## Cómo se navega el prototipo

La URL manda:

- `?p=login` · `?p=recuperar` · `?p=onb` · `?p=app`
- `?p=app&v=r01` abre una vista del residente (r01 home, r02 mi unidad,
  r03 notificaciones, r05 reservas, r06 visitas, r07 pase, r08 entregas,
  r09 reclamos, r14 documentos, r15 preferencias, r16 autorización,
  r17 historial, r18 mis reservas, r20 expensa, r21 gastos, r22 medios de
  pago, r23 estado de cuenta, r24 votaciones, `mas`, f01/f02/f03
  formularios, g10 reclamo, g11 entrega, g15 mi edificio).
- `&tema=claro|oscuro`, `&limpio=1` (sin la barra del escenario),
  `&perfil=recepcion|administracion`, `&motionreduce=1`.

## Reglas de diseño que ya están cerradas

**Tipografía.** Satoshi (Fontshare, en `app/layout.tsx`). Escala en
tokens: `--t-titulo` 28 · `--t-seccion` 19 · `--t-fila` 16 ·
`--t-cuerpo` 15 · `--t-meta` 13 · `--t-label` 12 · `--t-cifra` 48.
Nada de información importante en 11–12 px.

**Color.** `--fondo` papel cálido, `--sup` blanco, `--txt` carbón
`#111614`, amarillo `#F5E500` sólo para foco, selección, estado
relevante o la acción más importante de la pantalla. Colores semánticos
`--est-ok / --est-curso / --est-vencido / --est-cerrado`. Paleta
data-viz `--dv-1…8` sólo para gráficos.

**Botones.** `.entrar` primario (52, radio 14, carbón; hueso sobre foto
o carbón), `.btn-sec` secundario (44), `.btn-ter` quieto, botón de ícono
44. Foco amarillo. No hay más variantes: si hace falta una, primero
revisar si alguna existente sirve.

**Material.** Dos vidrios (`--glass-light`, `--glass-dark` +
`--glass-blur`) y sólo sobre foto. Sobre fondo plano, superficie sólida.
Profundidad en tres planos: fondo, superficie (`--sombra-1`), elevado
(`--sombra-2`).

**Estados.** Punto + etiqueta. Nada de pastillas grandes genéricas.

**Formularios.** Relleno suave sobre el fondo, sin borde ni caja blanca;
el foco se dice con el filo amarillo. Elegir abre una hoja con las
opciones (nunca el `<select>` del navegador). Adjuntar es una pieza con
ícono, título y qué acepta.

**Listas e internas.** A sangre, separadores sangrados, ícono suelto sin
baldosa, título, una línea de estado sólo si aporta y el chevron quieto.
Nada de card adentro de card.

**Hojas.** `components/ui/Hoja.tsx` se dibuja con portal en `.device`:
si cuelga de la vista, que es la que scrollea, aparece a mitad de
pantalla. No volver atrás con eso.

## Lo que NO se toca sin pedido explícito

Home (estructura, tabs, monto, accesos rápidos), Login, Pase QR, barra
inferior, arquitectura de información, rutas, y los tokens de arriba.

## Cómo trabaja este repo

- Comentarios y commits en castellano rioplatense, explicando **por qué**
  se hizo algo, no qué hace la línea.
- Un commit por familia de cambios.
- Antes de cerrar: `npm run build` + barrido de las 27 vistas a 390×844
  en claro y oscuro (sin desbordes, sin imágenes rotas, todo en Satoshi).
- El historial de decisiones está en `docs/ux/ESTADO_IMPLEMENTACION.md`
  y en `docs/ux/02_DECISION_LOG.md`.

## Lo que quedó pendiente

1. **Calendario de Reservas (R05).** Ya tiene rail rápido de días,
   cuadrados y mes grande, pero el dueño del producto todavía no lo
   aprueba. Referencias en `docs/` no; las mandó por chat: calendario
   oscuro con días en cuadrados y pastillas de día de la semana.
2. **Hoja de Continuar / Confirmar reserva.** Botones toscos.
3. **Motion de la pila del home** (`components/ui/PilaVivas.tsx`): el
   apilado por scroll funciona pero falta afinarlo.
4. **Comunicados**: no existe como pantalla; hoy es sólo una
   notificación. Si se agrega, usar patrón announcement feed.
5. Recepción y Administración quedaron fuera de todas las rondas
   visuales: siguen con el lenguaje viejo.
