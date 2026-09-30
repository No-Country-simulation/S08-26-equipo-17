# Prompt para Cowork / Claude — auditoría antes de implementar

```text
PROYECTO: CondoTrack
OBJETIVO DE ESTA PASADA: AUDITAR, NO REDISEÑAR A CIEGAS Y NO IMPLEMENTAR TODAVÍA.

Tenés adjuntos:
- investigación profesional UX/UI;
- referencias visuales numeradas;
- captura del build actual;
- criterios de aceptación.

ANTES DE PROPONER CÓDIGO:

1. Leé todos los .md del paquete.
2. Abrí y analizá visualmente TODAS las imágenes de /REFERENCIAS.
3. Auditá el repositorio actual y localizá:
   - arquitectura de rutas;
   - componentes compartidos;
   - layout residente;
   - bottom navigation;
   - home R01;
   - R02;
   - R05;
   - R06;
   - R20;
   - estilos/tokens/global CSS;
   - implementación actual de fuentes;
   - animaciones existentes;
   - datos mock/API que alimentan estados.
4. Confirmá por qué Rothek NO se está aplicando. No asumas que instalar una fuente en Windows sirve para Next.js.
5. Identificá todas las diagonales/patrones de fondo y dónde se generan.
6. Detectá duplicación de componentes y estilos ad-hoc que impedirían aplicar un sistema coherente.
7. Identificá bugs funcionales conocidos:
   - R20 se cuelga o falla al desplegar detalle de gastos;
   - R06 selector/carrusel de días no responde correctamente;
   - R05 reserva no completa correctamente;
   - revisar navegación/back de rutas existentes.

ENTREGABLE DE ESTA PASADA:

A. Diagnóstico del estado actual.
B. Mapa de componentes compartidos que conviene tocar UNA sola vez.
C. Lista de contradicciones entre build, documentación y referencias.
D. Propuesta de arquitectura UI para:
   - header mínimo;
   - Primary Context Widget;
   - quick actions;
   - layered live-card stack;
   - bottom navigation con acción central Acceso/QR;
   - search MVP;
   - bottom sheets / accordions;
   - calendario R05.
E. Plan de implementación por fases, con archivos concretos afectados.
F. Lista breve de preguntas BLOQUEANTES únicamente. No preguntes detalles que puedas resolver inspeccionando el proyecto.

NO HAGAS:
- un rediseño desde cero;
- nuevos colores arbitrarios;
- un logo nuevo;
- otro sistema tipográfico;
- diagonales de fondo;
- glass en todas partes;
- un dashboard genérico;
- 70 pantallas independientes.

USÁ COMO SOURCE OF TRUTH:
1. el comportamiento funcional ya definido en el proyecto;
2. este paquete de decisiones;
3. las referencias adjuntas para patrones concretos, no para copiar literalmente.

DIFERENCIÁ SIEMPRE:
- BUG
- CAMBIO VISUAL
- CAMBIO DE COMPONENTE COMPARTIDO
- CAMBIO DE MODELO / PRODUCTO
- FUERA DE MVP

Al final, proponé el orden exacto de implementación que minimiza retrabajo.
```
