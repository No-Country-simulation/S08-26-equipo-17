# CondoTrack — Component References
Version 01 · Curaduría inicial para Recepción, Administración y motion de Resident

## 0. Propósito

Este archivo no define la identidad visual de CondoTrack. Define referencias externas concretas que pueden usarse para estudiar anatomía, jerarquía, densidad, composición e interacción.

Regla principal:

- **Figma = referencia estructural de UI**
- **Jitter = referencia de motion**
- **CondoTrack = identidad final**

No copiar colores, tipografías, branding, glassmorphism, sombras o estilos externos si entran en conflicto con el sistema CondoTrack.

Conservar siempre:
- Satoshi
- amarillo `#F5E500`
- carbón `#111614`
- fondo cálido
- iconografía CondoTrack
- botones, estados, formularios y patrones ya aprobados
- reglas de `AGENTS.md`
- locks visuales documentados

---

# 1. Fuente Figma principal

**Archivo:** DesignCode UI / Figma Design UI Kit  
**File key:** `CNuuTRQJHtAMwXJpDUQYER`

Codex debe inspeccionar los nodos con Figma MCP antes de implementar un patrón derivado de ellos.

---

# 2. Recepción

## 2.1 Search / Flat / Extra Large

**Node:** `23204:129953`

### Qué contiene realmente
- campo/acción horizontal muy simple
- texto protagonista
- icono de búsqueda alineado al extremo
- padding horizontal generoso
- anatomía de una sola línea
- jerarquía inmediata

### Extraer
- búsqueda como acción primaria del workspace
- lectura instantánea
- poca ornamentación
- área clickeable cómoda
- posibilidad de integrarse en header/hero operativo

### NO copiar
- forma pill de 99px como regla general
- blur/glass
- Inter
- dimensiones exactas
- fondo translúcido del kit

### Adaptación CondoTrack
Usar como patrón para:
- buscar unidad
- buscar residente
- buscar visitante
- buscar proveedor
- búsqueda global de Recepción

En desktop puede ser una pieza mucho más ancha que el nodo original.

---

## 2.2 Side Menu / Flat

**Node:** `23204:130822`

### Qué contiene realmente
- navegación vertical compacta
- items repetibles
- icono + label
- divisor entre grupos
- estado activo marcado por un borde lateral
- ancho contenido
- jerarquía silenciosa

### Extraer
- agrupación vertical
- indicador activo lateral
- jerarquía de navegación estable
- separación clara de familias funcionales
- patrón adecuado para desktop

### NO copiar
- glow azul
- gradientes
- glass
- iconos del kit
- divisores entre absolutamente todos los items
- composición exacta

### Adaptación CondoTrack
Referencia para:
- shell desktop de Recepción
- shell desktop de Administración
- navegación por grupos

Recepción:
- Inicio
- Accesos
- Entregas
- Unidades
- Operación
- Bitácora

Administración:
- Inicio
- Finanzas
- Operación
- Edificio
- Comunidad
- Control

Navigation lock aprobado el 21/09/2026: el estado activo NO usa amarillo.
Usar jerarquía tipográfica, contraste, superficie o indicador lateral.
Reservar `#F5E500` para foco, acción primaria, selección relevante y estados
puntuales. No cambiar este criterio sin pedido explícito.

---

## 2.3 List Card / Flat

**Node:** `23204:134577`

### Qué contiene realmente
El componente está dividido en dos zonas:
- bloque de contexto/resumen
- lista numerada de items

Incluye:
- título
- meta/resumen
- divisor
- indicador de progreso
- lista compacta al lado

### Extraer
- composición asimétrica
- summary + list
- jerarquías distintas dentro de un mismo módulo
- evitar cinco cards idénticas
- agrupar información relacionada en una sola superficie

### NO copiar
- card translúcida
- progreso visual si no representa un dato real
- numeración ornamental
- 12–13 px para información importante
- dos columnas si perjudican lectura

### Adaptación CondoTrack
Puede inspirar módulos como:

**Recepción**
- Ahora / Próximos accesos
- Paquetes pendientes + resumen
- Turno actual + pendientes

**Administración**
- Pendientes + lista concreta
- Conciliaciones + casos prioritarios
- Reclamos + próximos vencimientos

La idea a conservar es la **asimetría funcional**, no la card.

---

## 2.4 Notification / Flat

**Node:** `23204:134646`

### Qué contiene realmente
- header compacto
- lista vertical de eventos
- avatar/icono
- actor/título
- descripción
- timestamp alineado a la derecha
- estado hover diferenciado
- actividad ordenada cronológicamente

### Extraer
- anatomía de activity feed
- timestamp visible pero secundario
- actor + acción + contexto
- rows compactas
- estados hover
- buena base para bitácora/eventos

### NO copiar
- avatars obligatorios
- bordes en cada row
- glass
- botones circulares del header
- composición de popup flotante

### Adaptación CondoTrack
Usar como referencia para:

**Recepción**
- bitácora del turno
- actividad reciente
- accesos registrados
- cambios operativos

**Administración**
- auditoría
- actividad del edificio
- cambios en reclamos
- pagos conciliados
- acciones de usuarios

En CondoTrack, muchos eventos deben usar iconografía semántica en vez de avatar.

---

# 3. Administración — dirección inicial

Todavía no hay una referencia Figma única aprobada para tablas/list-detail.

Por ahora, la implementación de Administración puede derivar de:

### Navegación
`23204:130822` — Side Menu / Flat

### Búsqueda / filtros
`23204:129953` — Search / Flat / Extra Large

### Módulos asimétricos
`23204:134577` — List Card / Flat

### Auditoría / actividad
`23204:134646` — Notification / Flat

## Regla
No inventar un “admin template” completo a partir de estos cuatro componentes.

La dirección de Administración debe mantenerse:
- list-detail
- filas densas
- tablas sólo cuando exista comparación real entre columnas
- filtros claros
- pocos KPIs accionables
- actividad/auditoría visible
- branding CondoTrack presente
- sin Bootstrap dashboard
- sin grilla uniforme de cards

### Referencias específicas todavía por curar
Pendientes de encontrar con nodo concreto:
- tabla densa / data table
- filtros avanzados
- list-detail
- toolbar administrativa
- conciliación financiera
- calendario operativo de reservas

Hasta tener una referencia concreta, Codex debe resolver estos patrones usando el sistema existente y no “copiar de memoria”.

---

# 4. Resident — motion

## 4.1 Jitter — Stacked Cards by Anagram

**Referencia:**  
https://jitter.video/template/stacked-cards/

### Extraer
- percepción de profundidad
- cards superpuestas
- separación/ascenso secuencial
- continuidad entre estados
- jerarquía clara de card activa vs cards detrás

### NO copiar
- loop permanente
- velocidad de showcase
- exageración de escala
- gesto Tinder
- animación decorativa sin relación con scroll

### Adaptación CondoTrack
Aplicar al bloque **“En tu edificio”**:

- máximo 3 cards visibles en la pila
- desplazamiento vertical trasero aprox. `8–12px`
- escala trasera aprox. `0.97–0.98`
- card activa sticky
- la siguiente sube con scroll vertical
- la anterior queda parcialmente visible
- sin swipe horizontal
- sin autoplay
- sin rotación 3D
- respetar `prefers-reduced-motion`

Implementación preferida:
1. CSS `position: sticky`
2. z-index / offsets
3. transform + opacity/brightness sólo como pulido
4. no instalar librería salvo necesidad posterior demostrada

Hook sugerido:
`data-motion="card-stack"`

---

# 5. Motion de marca CondoTrack

Jitter sirve para explorar; Rive/Lottie sólo se incorporan después si el comportamiento final lo justifica.

## Lenguaje base
Las dos geometrías del isotipo pueden:

- separarse
- alinearse
- encastrarse
- revelar contenido
- cerrarse
- transformarse brevemente en estado

## Estados a diseñar

### Loading
Dos módulos se separan y vuelven a alinearse.

### Access success
Las piezas se alinean/cerran y aparece el estado:
`Acceso permitido`

### Success general
Pequeña transformación/confirmación y retorno al isotipo.

### Empty / all-clear
Movimiento ambiental muy lento o estado estático con posibilidad de motion.

Hooks:
- `data-motion="brand-mark"`
- `data-motion="access-success"`
- `data-motion="operational-status"`
- `data-motion="card-stack"`

## Regla
No implementar loop ornamental permanente en pantallas operativas.

---

# 6. Cómo debe usar esto Codex

Antes de implementar una pantalla:

1. Leer `AGENTS.md`.
2. Leer este archivo.
3. Identificar qué patrón necesita realmente la pantalla.
4. Abrir por Figma MCP sólo los nodos relevantes.
5. Extraer estructura/anatomía.
6. Revisar componentes existentes en CondoTrack.
7. Reutilizar tokens y componentes locales.
8. Implementar el patrón adaptado a CondoTrack.
9. No portar código Tailwind generado por Figma de forma literal.
10. No importar estilos externos al proyecto.

---

# 7. Matriz rápida

| Área | Patrón | Fuente | Node / URL | Uso |
|---|---|---|---|---|
| Recepción | Search | DesignCode UI | `23204:129953` | unidad/persona/visitante |
| Recepción | Side navigation | DesignCode UI | `23204:130822` | shell desktop |
| Recepción | Summary + list | DesignCode UI | `23204:134577` | ahora/pendientes |
| Recepción | Activity feed | DesignCode UI | `23204:134646` | bitácora |
| Administración | Side navigation | DesignCode UI | `23204:130822` | shell desktop |
| Administración | Search | DesignCode UI | `23204:129953` | búsqueda/filtros |
| Administración | Summary + list | DesignCode UI | `23204:134577` | pendientes |
| Administración | Activity feed | DesignCode UI | `23204:134646` | auditoría |
| Resident | Card stack motion | Jitter / Anagram | stacked-cards | En tu edificio |
| Global | Brand motion | CondoTrack + Jitter | propio | loading/success/access |

---

# 8. Criterio de aprobación

Una implementación basada en referencia sólo se aprueba si:

- sigue pareciendo CondoTrack;
- la referencia resolvió un problema funcional concreto;
- no introdujo un estilo paralelo;
- no agregó variantes innecesarias;
- funciona en el contexto del rol;
- mantiene jerarquía y legibilidad;
- el motion aporta estado, transición o continuidad;
- la referencia puede explicarse como patrón y no como copia visual.
