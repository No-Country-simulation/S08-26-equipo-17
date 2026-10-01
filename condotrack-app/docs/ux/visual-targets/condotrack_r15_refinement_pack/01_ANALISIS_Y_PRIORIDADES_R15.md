# Análisis y prioridades — R1.5

## Diagnóstico del estado actual

La versión actual mejoró la estructura general del Home, pero todavía **no transmite una interfaz premium cerrada**. El problema ya no es de dirección general, sino de **fidelidad, materialidad y consistencia del sistema**.

## Lo que sí funciona

- El **header** está cerca del objetivo: logo, accesos rápidos superiores y utilidades a la derecha.
- La lógica 3 + 3 de controles laterales ya se entiende mejor.
- El hero con reloj, hora y fecha va en la dirección correcta.
- Las tres cards inferiores ya tienen una estructura razonable.
- La idea de command center / launcher visual ya existe.

## Problemas actuales a corregir

### 1. Materialidad insuficiente
- Las cards de `Próximo acceso`, `Hoy` y `Entregas` no se sienten glass.
- Les falta transparencia real, blur, borde sutil y mejor relación con el fondo.
- El workspace se sigue percibiendo demasiado plano.

### 2. Fondo insuficientemente integrado
- Falta aplicar el **fondo abstracto aprobado** al sistema completo.
- Hoy el panel existe “sobre un claro neutro”, pero no se percibe una atmósfera detrás que sostenga el glass.
- Hace falta una **capa de color / tono / profundidad** que unifique Home e internas.

### 3. Escala y canvas
- El Home se ve en un tamaño raro / algo desproporcionado.
- Necesita mejor control del ancho útil, márgenes, respiración y relación entre hero y cards.
- El resultado tiene que sentirse más “cerrado” a 1440×900.

### 4. Acciones rápidas confusas
- “Acciones rápidas” todavía no termina de comunicar bien.
- No queda claro qué hace cada rail ni qué hace cada panel contextual.
- Debe haber una card/panel mejor resuelta para cada acción.
- La navegación contextual debe sentirse consistente en Home e internas.

### 5. Search mal integrada
- La lupa y su expansión actual no están bien resueltas.
- La apertura del search no debe romper el layout ni aparecer como un injerto.
- Debe sentirse como una command search refinada, no como un input inflado.

### 6. Motion pobre o incompleto
- Faltan microinteracciones visibles y sutiles.
- No hay suficiente reveal, hover, elevación, blur transition ni continuidad.
- El reloj analógico debería tener segundero vivo.
- Las cards podrían tener motion leve al hover.
- Falta smooth scroll consistente.

### 7. Cards inferiores todavía flojas
- `Próximo acceso`, `Hoy`, `Entregas/Actividad` no terminan de cerrar visualmente.
- Necesitan mejor jerarquía, indicadores/íconos más claros y una relación más fuerte con el módulo al que representan.
- Podrían incorporar un pequeño “marcador visual” o identidad de módulo en la esquina superior.

### 8. Arquitectura de navegación
- El botón superior `Actividad` no debería representar la Home.
- La Home debería tener una lógica más clara de “Inicio / Centro operativo”.
- El menú general desplegable tiene que convivir con los shortcuts superiores y los rails laterales sin confundir funciones.

## Prioridad de trabajo

### Bloque A — Refinamiento del Home y sistema global
1. Aplicar fondo abstracto aprobado a todo el Home.
2. Mejorar materialidad glass de hero, cards y paneles.
3. Ajustar escala/layout general del Home.
4. Refinar search, actions y menú desplegable.
5. Incorporar motion y smooth scroll.
6. Corregir copy y naming de la Home.

### Bloque B — Traslado del sistema a las internas
Una vez cerrado el Home, trasladar exactamente el mismo lenguaje visual a:
- Agenda
- Accesos / Validar acceso
- Entregas
- Unidades
- Incidencias
- Actividad

## Objetivo final

Cerrar un sistema que se sienta:
- premium;
- liviano;
- claro;
- institucional;
- operativo;
- consistente entre Home e internas.
