R1.5 — REFINAMIENTO GLOBAL DEL SISTEMA + INTERNAS

Partimos del estado actual de R1.4 ya implementado en localhost.

NO quiero una exploración nueva.
NO quiero que vuelvas a reinterpretar el lenguaje visual.
NO quiero una mezcla libre de referencias.

A partir de ahora, los SOURCE OF TRUTH visuales son:

1. refs/CondoTrack_HOME_Recepcion_Target_R14.png
2. refs/CondoTrack_Abstract_Background_Approved.png
3. refs/panel_de_agenda_para_condominio.png
4. refs/panel_de_incidencias_del_edificio.png
5. refs/panel_de_unidades_del_condominio.png
6. refs/panel_de_gestion_de_entregas_condotrack.png
7. refs/pantalla_de_validacion_de_acceso_condotrack.png

Leé también:
- 01_ANALISIS_Y_PRIORIDADES_R15.md
- 03_VISUAL_SYSTEM_LOCK_R15.md
- docs/ux/22_R14_TARGET_IMPLEMENTATION.md si necesitás contexto técnico.

Conservá la lógica, el estado, los datos, el routing y los formularios válidos.
Podés reconstruir JSX/CSS y reorganizar componentes si hace falta.

────────────────────────────────────────
FASE A — HOME + SISTEMA GLOBAL
────────────────────────────────────────

Quiero que cierres definitivamente la Home Recepción.

### A1. Background aprobado
Usar `refs/CondoTrack_Abstract_Background_Approved.png` como fondo base del sistema.
No usar fotografías, árboles ni renders de recepción.
El fondo debe estar visible detrás del hero, cards y sistema glass, generando profundidad.

### A2. Escala / canvas
La pantalla a 1440×900 debe sentirse más cerrada y mejor proporcionada.
Ajustar:
- ancho útil;
- márgenes;
- padding general;
- proporción del hero;
- tamaño/aire de las tres cards inferiores.

### A3. Header
El header actual va bien, pero ajustar naming y arquitectura:
- Home no debe depender del botón “Actividad”.
- Definir claramente la lógica superior.
Propuesta:
- Inicio / Centro operativo
- Agenda
- Unidades
- Actividad

Mantener:
- edificio actual;
- notificaciones;
- perfil;
- búsqueda.

### A4. Search
Refinar fuertemente la búsqueda.
La lupa actual y su expansión no están cerradas.
Necesito una command search elegante:
- apertura limpia;
- field bien integrado;
- resultados;
- teclado;
- Escape;
- no romper el layout.

### A5. Hero
Mantener composición base del target R1.4, pero mejorar:
- integración del fondo abstracto;
- glass general;
- profundidad;
- contraste;
- equilibrio visual.

Textos:
- kicker: “Centro operativo”
- title: “Recepción”
- supporting line: “Accesos, entregas e incidencias en un solo flujo.”

No usar “Mostrador”.
No usar “Todo en orden, un mejor edificio para todos.”

### A6. Reloj
Mantener reloj analógico + hora digital + fecha.
Agregar segundero vivo / aguja de segundos en movimiento.
No sobreactuar la animación.
Debe ser sutil y continua.

### A7. Cards inferiores
Refinar las tres cards para que se sientan premium y claras.

#### Próximo acceso
- mejor jerarquía interna;
- posiblemente un identificador visual del módulo (ícono/acento en esquina);
- CTA claro.

#### Hoy
- mantener resumen de actividad;
- mejor materialidad;
- mejor composición;
- no volverla una card de fecha y hora.

#### Entregas / Actividad
- conservar doble bloque interno;
- hacer que se entienda mejor la relación entre “entregas pendientes” y “actividad reciente”.

Las tres deben tener:
- glass real;
- mismo sistema de bordes/sombra/blur;
- hover muy sutil;
- microinteracciones.

### A8. Rails laterales y paneles contextuales
Mantener la lógica 3 + 3.
Mejorar:
- naming;
- legibilidad;
- simetría;
- panel contextual de cada acción.

Las acciones rápidas del lado derecho no deben sentirse ambiguas.
Cada acción debe abrir un panel contextual bien resuelto.

Si hace falta, usar:
- título;
- subtítulo;
- mini descripción;
- CTA principal;
- input de búsqueda o acción concreta.

### A9. Menú general desplegable
La navegación completa del sistema debe estar en un panel desplegable claro.
No quiero sidebar clásica fija.
Debe incluir:
- Inicio
- Accesos
- Entregas
- Unidades
- Agenda
- Incidencias
- Actividad reciente
- perfil/configuración si corresponde

Motion suave.
Accesible por teclado.
Cerrar con click afuera y Escape.

### A10. Motion global
Implementar microinteracciones visibles y sobrias:
- hover de cards;
- reveal de paneles contextuales;
- search open/close;
- menú desplegable;
- press states;
- smooth scroll;
- blur transitions;
- reloj con segundero.

Podés usar jitter sutil únicamente donde aporte refinamiento y nunca como gimmick.
Debe sentirse premium, no ruidoso.

────────────────────────────────────────
FASE B — PANTALLAS INTERNAS
────────────────────────────────────────

Una vez refinado Home, trasladar el mismo sistema visual a las internas.

TODAS deben compartir:
- mismo background aprobado;
- misma lógica de header;
- misma materialidad glass;
- misma paleta;
- mismas transiciones;
- misma familia de componentes.

### B1. Agenda
Usar como base `refs/panel_de_agenda_para_condominio.png`, pero MEJORARLA.
No dejarla como simple lista plana.
Necesito una agenda más tipo calendario/planner, más cerca de las referencias del PDF previo:
- componente calendario visible;
- timeline / agenda del día;
- siguiente evento destacado;
- estados claros;
- mejor jerarquía.

### B2. Incidencias
Usar como base `refs/panel_de_incidencias_del_edificio.png`.
Mejorar las cards de incidencias y el formulario lateral.
Tiene que verse más pulido, más editorial y menos formulario plano.
Mantener severidades y lógica operativa.

### B3. Unidades
Usar como base `refs/panel_de_unidades_del_condominio.png`.
Mantener el search fuerte, pero integrarlo mejor al sistema.
La tabla/list-detail debe verse más premium y con mejor espaciado.

### B4. Entregas
Usar como base `refs/panel_de_gestion_de_entregas_condotrack.png`.
Mejorar jerarquía entre pendientes y retiradas.
Mejorar el panel de registro.
Mantenerlo operativo.

### B5. Accesos / Validar acceso
Usar como base `refs/pantalla_de_validacion_de_acceso_condotrack.png`.
Tiene que sentirse fuerte, rápido y muy claro.
Los estados y el flujo de validación deben leerse instantáneamente.
No hacerlo infantil ni recargado.

### B6. Actividad
Si hoy no existe una pantalla de actividad suficientemente armada,
construir una bitácora clara usando el mismo sistema visual.
Cronológica, filtrable y simple de escanear.

────────────────────────────────────────
ENTREGA
────────────────────────────────────────

Trabajá en ese orden:
1. cerrar Home + sistema global;
2. adaptar internas.

Al finalizar:
1. mostrar localhost 1440×900 de Home;
2. screenshot Home default;
3. screenshot search abierta;
4. screenshot menú general abierto;
5. screenshot Agenda;
6. screenshot Incidencias;
7. screenshot Unidades;
8. screenshot Entregas;
9. screenshot Accesos/Validar acceso;
10. screenshot Actividad;
11. listar qué cambió en Home;
12. listar qué cambió en cada interna;
13. build + TypeScript;
14. no commit;
15. no push;
16. detenerse para revisión.
