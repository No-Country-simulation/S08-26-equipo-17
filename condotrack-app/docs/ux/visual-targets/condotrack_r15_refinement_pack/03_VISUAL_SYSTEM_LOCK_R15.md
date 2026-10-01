# CondoTrack — Visual System Lock R1.5

## Principio general
Todo el sistema debe verse como una familia única.
No pantallas aisladas.
No layouts heterogéneos.
No reinterpretaciones libres.

## Base visual
- Fondo general: abstracto claro aprobado.
- Paleta principal:
  - amarillo CondoTrack `#F5E500`
  - carbón `#111614`
  - warm light / off-white `#F4F5F1`
  - surface `#FFFFFF`
  - secondary text `#515A56`
- Tipografía: Satoshi / lenguaje grotesk limpio aprobado para esta fase.

## Materialidad
- Cards con `glass / frosted` real.
- Blur suave, no exagerado.
- Border muy sutil.
- Sombras livianas y difusas.
- Superficies translúcidas, nunca bloques blancos pesados.

## Home
- Home = command center / launcher visual.
- No dashboard administrativo denso.
- Hero dominante y cards inferiores como previews.
- Reloj analógico + hora digital + fecha integrados.
- Rails laterales 3 + 3 simétricos.
- Top shortcuts: Inicio/Centro operativo, Agenda, Unidades, Actividad.
- Menú general desplegable para el resto.

## Internas
Todas las pantallas internas deben heredar:
- header;
- background;
- cards glass;
- espaciado;
- motion;
- iconografía;
- botones;
- navegación contextual.

## Motion
- 140–240 ms microinteracciones.
- 400–500 ms para revelar panel contextual.
- Hover suave, elevación mínima.
- Search expand con continuidad.
- Scroll suave.
- Reloj analógico con segundero activo.
- Sin bounce exagerado.

## Reglas específicas por módulo

### Agenda
- No lista plana solamente.
- Debe usar lenguaje de calendario / planner del PDF de referencia.
- Vista calendario + agenda/timeline diario.
- La tarea/visita siguiente debe destacarse con claridad.

### Accesos
- Validación fuerte, tipo terminal / control point.
- Verificar y luego registrar movimiento.
- Estados muy claros: autorizado, vencido, no encontrado, etc.
- Debe sentirse operativo y rápido.

### Entregas
- Lista operativa clara.
- Formulario lateral / panel de carga.
- Jerarquía entre pendientes y retiradas.
- Botones de acción fuertes.

### Unidades
- Search muy protagonista.
- Tabla/list-detail clara.
- No sobrecargar con información innecesaria.
- Recepción necesita lectura rápida de unidad, residentes y estado operativo.

### Incidencias
- Lista clara con severidad/estado.
- Formulario de carga compacto y bien jerarquizado.
- Cards mejores que la versión actual.
- El módulo tiene que verse más editorial y menos formulario gris.

### Actividad
- Bitácora cronológica limpia.
- Filtros razonables.
- Debe poder leerse rápido qué pasó, cuándo y dónde.

## No hacer
- No volver a usar imágenes random de recepción.
- No volver a un sidebar clásico permanente.
- No usar cajas opacas pesadas.
- No reinterpretar libremente cada pantalla.
