# CondoTrack — Investigación profesional UX/UI v01

## 1. Fuentes de criterio

Este documento toma como base tres familias de referencia profesional:

### Nielsen Norman Group (NN/g)
- **Progressive Disclosure — Jakob Nielsen:** mostrar primero pocas opciones importantes y revelar complejidad secundaria bajo demanda.
- **Visual Hierarchy in UX — Kelley Gordon:** la jerarquía se construye con escala, color/contraste, agrupación y espacio; una interfaz sin jerarquía obliga al usuario a “descifrar” dónde mirar.
- **5 Principles of Visual Design in UX:** recomienda una escala visual contenida y pocos niveles tipográficos para evitar ruido.
- **Iterative UI Design:** la iteración deliberada mejora la usabilidad; no esperar resolver una interfaz compleja en una sola pasada.

### Apple Human Interface / Apple Design (2025–2026)
- La navegación top-level persistente debe ser clara y estable.
- Los elementos de barra deben organizarse por **función y frecuencia**; si la barra se llena, es señal de sacar acciones secundarias y moverlas a “Más”.
- El material glass es una **capa funcional flotante**, principalmente para controles y navegación, no un efecto decorativo aplicado indiscriminadamente al contenido.
- Search debe ubicarse según el modelo de navegación y el alcance de la búsqueda; puede ser campo, botón o destino dedicado.
- El contenido debe seguir siendo protagonista y las capas de navegación no deberían competir con él.

### Material Design / Android Developers
- **FAB (Floating Action Button):** representa una acción primaria.
- **Cards:** agrupan contenido y acciones de un único asunto.
- **Carousels:** sirven para colecciones de objetos equivalentes.
- **Bottom sheets:** muestran contenido secundario/contextual sin obligar a cambiar de pantalla.
- **Tabs / segmented controls:** cambian vistas relacionadas o modos dentro de un mismo contexto.
- **Date pickers:** existen para seleccionar fecha/rango; el calendario debe ser funcional, no decorativo.
- **Search bar:** es apropiada como elemento persistente cuando Search es un foco principal; de lo contrario conviene una entrada más compacta.

---

# 2. Diagnóstico profesional del build actual

## 2.1 El problema no es falta de “diseño”: es falta de jerarquía sistémica

En el build actual conviven:
- header muy pesado;
- cards de muchas categorías compitiendo;
- quick actions poco diferenciadas;
- fondos diagonales que agregan ruido sin explicar jerarquía;
- títulos sobredimensionados;
- glass aplicado de forma irregular;
- navegación inferior todavía sin una función central inequívoca.

Eso genera un problema clásico de **visual hierarchy**: demasiados elementos reclaman atención con pesos parecidos.

### Decisión
Construir una jerarquía explícita:
1. contexto;
2. estado/tarea principal;
3. acciones frecuentes;
4. contenido vivo/contextual;
5. detalle e historial bajo demanda.

---

# 3. Home residente — modelo recomendado

## 3.1 Header mínimo

Eliminar el gran bloque “Buen día, Felipe”.

Debe quedar una cabecera silenciosa:
- contexto: `Edificio Aráoz 1280 · Unidad 7D`;
- avatar/perfil;
- acceso compacto a búsqueda y notificaciones, si corresponden.

El home debe empezar rápido con el contenido útil, no con una bienvenida.

## 3.2 Widget principal intercambiable

Adoptar un **Primary Context Widget**: una card central de alto valor que cambia entre contextos principales mediante tabs/segmentos.

Estados propuestos:
- Expensas
- Visitas
- Entregas
- Reservas

Cada estado debe responder una pregunta inmediata:
- ¿Cuánto debo y cuándo vence?
- ¿Quién entra hoy / tengo pase activo?
- ¿Tengo algo para retirar?
- ¿Cuál es mi próxima reserva?

### Por qué funciona
- Reduce scroll y competencia visual.
- Aplica progressive disclosure: resumen primero, detalle después.
- Evita crear pantallas intermedias para cada microconsulta.
- Genera la sensación de herramienta interactiva que el usuario está buscando.

## 3.3 Quick actions

Las acciones frecuentes quedan fuera del widget principal y se agrupan en una sección clara.

Ejemplos:
- Crear visita
- Hacer reclamo
- Reservar espacio

Deben tener una jerarquía mayor que la actual: superficie propia, iconografía consistente, separación semántica y feedback de interacción.

Administración y Recepción no deberían competir visualmente con acciones personales; pueden ser contactos/contextos secundarios.

## 3.4 Live / status cards

Cards como:
- Visitas hoy
- Próxima reserva
- Todo en orden
- Paquete para retirar

pueden usar un **stacked-card carousel / layered carousel** porque son objetos equivalentes de “estado actual”.

Nunca apilar:
- Expensas
- botones
- contactos
- categorías distintas

La animación debe reforzar relación entre elementos, no ser decorativa.

---

# 4. Navegación inferior

## Patrón recomendado

Barra inferior persistente + acción central prominente.

Propuesta base:
- Inicio
- Mi edificio
- **Acceso / QR** (centro)
- Reservas
- Más

### Razón
El centro destacado debe representar una acción realmente primaria y transversal. Mostrar/usar una credencial de acceso es:
- frecuente;
- inmediata;
- útil en contexto físico;
- más justificable como botón central que una pantalla específica.

### Tratamiento visual
- bottom bar compacta;
- superficie glass/frosted o clara;
- acción central con forma propia y acento de marca;
- active state legible sin saturar todo de amarillo;
- no hacer la barra tan alta que robe viewport.

---

# 5. Search

No convertir Search en un input gigante permanente si no es el objetivo principal del home.

## Propuesta MVP
Entrada compacta desde home:
`Buscar funciones, personas o documentos`

Al activarla:
- sugerencias frecuentes;
- accesos recientes;
- acciones comunes;
- resultados por categoría.

Si el producto evoluciona y Search se vuelve verdaderamente transversal, puede convertirse en un destino dedicado.

---

# 6. Glass / Frosted

## Usar en
- navegación;
- CTA central;
- botón volver;
- filtros/segmented controls;
- sheets;
- controles flotantes;
- algunas cards live.

## No usar indiscriminadamente en
- texto largo;
- historial;
- listas densas;
- todas las cards simultáneamente.

## Comportamiento visual
- blur real de fondo;
- transparencia suficiente para mostrar contexto sin perder contraste;
- borde fino y suave;
- profundidad ligera;
- sin glow excesivo;
- sin “glassmorphism” genérico de Dribbble.

El glass debe señalar **control/capa**, no convertirse en decoración.

---

# 7. Fondo y color

## Eliminar
- diagonales repetidas;
- patrones geométricos de fondo que compitan con el contenido.

## Adoptar
Un **ambient gradient / tonal field** muy controlado:
- color suave en parte superior o en zonas de foco;
- transición hacia fondo cálido;
- profundidad sin “gradient SaaS”;
- el amarillo #F5E500 sigue siendo acento funcional de CondoTrack, no fondo global.

El objetivo es dar estructura visual donde hoy el layout queda vacío, no “decorar”.

---

# 8. Expensas

## Home
Resumen compacto:
- monto;
- estado;
- vencimiento;
- acceso a composición;
- CTA de detalle.

## R20
Progressive disclosure:
1. resumen;
2. `Cómo se compone`;
3. gráfico torta solo al solicitarlo;
4. rubros y detalle;
5. medios de pago / documentos mediante desplegables o bottom sheets.

No presentar toda la contabilidad de una vez.

---

# 9. Reservas

El calendario debe ser el elemento dominante de R05.

Flujo:
1. seleccionar día;
2. mostrar slots disponibles;
3. seleccionar franja;
4. confirmar.

Eliminar señales redundantes del calendario antes de que el usuario elija un día.

Estado inicial:
`Elegí un día del calendario para ver los horarios disponibles.`

Después de seleccionar:
mostrar disponibilidad real y CTA.

---

# 10. Visitas

Flujo recomendado:
1. `Crear nueva visita`;
2. datos mínimos;
3. fecha/franja;
4. revisión;
5. `Autorizar y emitir pase`.

El gesto de slide solo tiene sentido como confirmación final si se decide conservarlo; no debe ser el control inicial para crear una visita.

---

# 11. Mi edificio

Propuesta top-level:
`Mi edificio`

Navegación secundaria:
- Unidad
- Edificio
- Documentos

Esto mantiene una navegación inferior simple y conserva la separación conceptual y de permisos dentro de la sección.

---

# 12. Tipografía

Rothek debe cargarse realmente en el proyecto.

## Reglas
- usar archivos locales del repositorio;
- definir pesos reales, no simularlos con browser synthesis;
- si Rothek tiene Regular / Medium / Semibold suficientes, usar una sola familia;
- si no, Rothek queda para display y se define una grotesca neutra para UI.

## Jerarquía recomendada
La UI debe trabajar con muy pocos niveles:
- display / screen title;
- section title;
- body / metadata.

No usar títulos gigantes para cada pantalla.

---

# 13. Principios no negociables

1. **Rapidez:** la tarea frecuente debe estar a 1–2 interacciones.
2. **Claridad:** una pantalla debe tener una prioridad visual evidente.
3. **Progressive disclosure:** no mostrar todo por defecto.
4. **Consistencia:** mismo componente = mismo comportamiento.
5. **Contexto:** el usuario siempre sabe edificio/unidad y estado actual.
6. **Interactividad útil:** animación y glass explican capas/relaciones; no son adorno.
7. **Accesibilidad:** estado nunca solo por color; targets cómodos; contraste suficiente.
8. **MVP honesto:** no simular funciones que el modelo todavía no puede sostener.
