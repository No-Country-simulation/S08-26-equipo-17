# R1.4 · Implementación del target cerrado

22/09/2026. **Incompleta: falta identificar el asset abstracto aprobado.** No considerar aceptada ni cerrada visualmente. Sin commit ni push. No avanzar a internas.

## Fuente visual

`visual-targets/CondoTrack_HOME_Recepcion_Target_R14.png`, copia exacta de la imagen adjunta. Inspeccionada completa antes de editar. El pedido R1.4 reemplaza la dirección visual R1.3; no se combinaron Volvo, Planner ni Management en esta ronda.

Se trasladaron: header con logo / tres shortcuts / utilidades, hero con título y reloj, dos rails 3+3, composición inferior de tres módulos iguales, acciones rápidas contextuales, superficies translúcidas y footer.

## Archivos de esta ronda

- `components/ShellRecepcion.tsx`: retiró sidebar permanente; conserva rutas, vistas y scroll principal.
- `components/recepcion/ReceptionHeader.tsx`: logo como trigger del menú completo; cierre externo/Escape, shortcuts y utilidades reales.
- `components/recepcion/ReceptionSidebar.tsx`: reutilizado como contenido de navegación desplegable con los siete destinos.
- `components/recepcion/ContextualActions.tsx`: componente de rail compartido por ambos lados; espera 450 ms, click fija, Escape/click externo cierran. Panel derecho con tres filas de acciones y búsqueda real.
- `components/recepcion/P01.tsx`: reconstrucción del hero, Hoy inferior central y módulo combinado Entregas/Actividad.
- `app/globals.css`: reemplazo del bloque R1.3; composición, medidas, materiales, responsive y motion encapsulados en Recepción.
- `docs/ux/visual-targets/CondoTrack_HOME_Recepcion_Target_R14.png`: target incorporado.
- Este informe y actualización de continuidad en `AGENTS.md`.

## Conservado

Estado, derivaciones de accesos/actividad, fuentes de datos, routing, formularios e internas. Reutilizados ReceptionClock, ReceptionSearch, ReceptionProfile, Icon, useApp y lib/recepcion. No se agregaron dependencias. No se tocaron otras pantallas durante esta ronda.

## Diferencias y pendientes contra el PNG

- **Fondo pendiente:** el PNG llegó, pero no se localizó un asset separado del fondo abstracto aprobado. Se pidió la ruta al usuario. La foto de recepción fue retirada; queda el fondo base #F4F5F1. No se inventó ni reconstruyó otra imagen. Esto limita fuertemente la comparación de materialidad; rgba/backdrop-filter están implementados, pero falta el ambiente que debe verse a través.
- Rails compactos en reposo conforme al texto R1.4. El panel de acciones rápidas del PNG aparece al abrir el contextual derecho.
- Hora, fecha, tiempos relativos y contadores reales; no se fijaron ejemplos del PNG.
- El logo usa el asset vectorial horizontal existente, sin reinterpretar el isotipo ni redibujar el wordmark. No se recreó el círculo del mockup.
- Agenda no aparece falsamente activa en Home. La navegación activa usa contraste carbón/blanco.
- No se añadió Configuración: no existe ese destino funcional en Recepción. Perfil y cerrar sesión están disponibles. Actividad sigue llevando al preview; la interna completa continúa pendiente.

## Motion

Menú: visibilidad/opacidad/traslación de 200 ms tanto al abrir como al cerrar. Rails: hover/press de 180 ms. Contextuales: delay 450 ms y reveal de 220 ms. Top nav: 180 ms. Búsqueda: expansión/reveal de 220 ms. Cards: elevación de 2 px y superficie de 200 ms. Scroll suave, sin loops. Se respeta prefers-reduced-motion; QA tiene esa preferencia activa y no se afirma haber medido visualmente la animación normal.

## Verificación

- Build final correcto; TypeScript y lint incluidos en Next build.
- 1440×900: Home completa sin scroll extra; seis controles de 68×68 con filas alineadas y separación de 20 px; tres cards de 248 px de alto y anchuras equivalentes.
- 1280 y 1024: Home sin overflow horizontal; seis controles de 62×62 alineados.
- 390×844: Home y contextuales dentro del viewport; menú desplegable cabe con scroll propio sólo si es necesario.
- Escape del contextual y apertura por foco sostenido comprobados; búsqueda real Martín con ArrowDown y Escape comprobados.
- Registrar entrega abre P05 y enfoca el selector del formulario existente.
- Resident: 27 vistas × claro/oscuro a 390×844: 54 comprobaciones sin overflow ni imágenes rotas; Satoshi cargada.
- Capturas de default, menú, contextual izquierdo, contextual derecho y búsqueda emitidas en la conversación.
- git diff --check sin errores; avisos CRLF previos.

Local: http://localhost:3001/?perfil=recepcion&p=app&v=p01&limpio=1&tema=claro

Próximo paso: incorporar únicamente el asset abstracto aprobado cuando el usuario lo identifique; revisar de nuevo materialidad/composición y presentar R1.4 para aprobación. No iniciar otra fase.
