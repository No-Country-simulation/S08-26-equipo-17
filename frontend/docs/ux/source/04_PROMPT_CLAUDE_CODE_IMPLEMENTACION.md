# Prompt para Claude Code — implementación por loop

> Ejecutar después de aprobar la auditoría de Cowork.

```text
CONDOTRACK — IMPLEMENTATION LOOP v01

Trabajá sobre el build existente. NO rehagas la aplicación desde cero.

OBJETIVOS NO NEGOCIABLES:
- práctica;
- rápida;
- fácil de entender;
- visualmente diferenciada;
- interactiva sin ser ornamental;
- consistente entre roles;
- funcional antes que decorativa.

ANTES DE MODIFICAR:
- inspeccioná el repositorio y la auditoría aprobada;
- verificá rutas y componentes;
- verificá el estado de Git;
- identificá archivos compartidos;
- no dupliques componentes si puede resolverse centralmente.

FASE 0 — FUNDACIONES
1. Cargar Rothek correctamente desde archivos locales del proyecto.
2. Definir tokens tipográficos reales por peso.
3. Eliminar diagonales/patrones globales de fondo.
4. Crear sistema de ambient gradient/tonal field reusable.
5. Consolidar radios, spacing, glass, colores y elevación en tokens/componentes.
6. Reducir escala de screen titles y headers.

FASE 1 — SHELL RESIDENTE
1. Rehacer el header de R01 como contexto mínimo.
2. Implementar bottom navigation compacta.
3. Crear acción central prominente: Acceso / QR.
4. Ajustar safe areas y viewport para no tapar contenido.
5. Crear Search entry MVP compacta.

FASE 2 — HOME R01
Crear cuatro capas claras:
A. Primary Context Widget intercambiable
   - Expensas
   - Visitas
   - Entregas
   - Reservas
B. Quick Actions
   - Crear visita
   - Hacer reclamo
   - Reservar espacio
C. Layered Live Cards
   - Visitas hoy
   - Próxima reserva
   - Paquete para retirar
   - Estado equivalente si existe
D. Context / contactos secundarios

El widget debe mantener contexto dentro de una misma card, con transición sutil entre estados.

Las live cards pueden usar stacked/layered carousel. NO mezclar categorías diferentes en el stack.

FASE 3 — R20 EXPENSAS
- resumen primero;
- composición bajo demanda;
- gráfico de torta solo cuando se solicita;
- rubros legibles;
- medios de pago / estado / documentos mediante accordions o bottom sheets;
- corregir bug actual de bloqueo.

FASE 4 — R06 VISITAS
- CTA “Crear nueva visita”;
- formulario simplificado;
- corregir selección de fecha;
- franja clara;
- confirmación final “Autorizar y emitir pase”;
- no usar gesto irreversible al comienzo.

FASE 5 — R05 RESERVAS
- calendario protagonista;
- remover título redundante;
- estado inicial: “Elegí un día del calendario para ver los horarios disponibles”;
- mostrar slots después de fecha;
- selección clara;
- CTA de confirmar;
- corregir bug que impide reservar.

FASE 6 — R02 MI EDIFICIO / UNIDAD
- acordeones cerrados por defecto;
- jerarquía visual mejorada;
- revisar exposición de documento/PII;
- mantener datos aprobados;
- no simular egresos que el sistema no puede registrar.

FASE 7 — MOTION / POLISH
Usar motion solo para explicar relación/estado:
- widget principal: crossfade + desplazamiento corto;
- layered live cards: spring/slide controlado;
- bottom sheets: transición vinculada al trigger;
- bottom nav: feedback corto;
- calendario: selección inmediata y estable.

Respetar reduced motion.

QA LOOP OBLIGATORIO:
Después de cada fase:
1. ejecutar lint/build/tests disponibles;
2. abrir la app;
3. recorrer rutas afectadas;
4. capturar visualmente desktop/mobile según aplique;
5. comparar contra referencias y acceptance criteria;
6. corregir regresiones antes de avanzar.

NO des por terminada una fase si:
- rompe navegación;
- hay overflow;
- la fuente cae en fallback;
- aparece una diagonal global;
- CTA queda tapado por bottom nav;
- el estado depende solo de color;
- la interacción principal no funciona con mouse/touch/teclado según corresponda.

Al finalizar:
- entregar changelog por ID de pantalla;
- listar bugs corregidos;
- listar decisiones de producto que NO tocaste;
- listar deuda restante;
- indicar archivos principales modificados.
```
