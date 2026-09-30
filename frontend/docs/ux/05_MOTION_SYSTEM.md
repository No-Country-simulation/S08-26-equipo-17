# 05 · Sistema de motion

## Principio

CondoTrack es software operativo. **El movimiento explica un cambio de estado o una
relación entre elementos. No decora.** Si una animación no responde "de dónde vino
esto" o "con qué se relaciona", no va.

## Inventario

| Dónde | Qué | Duración | Curva |
|---|---|---|---|
| Widget principal, cambio de pestaña | crossfade + desplazamiento corto en el eje X | 180 ms | `ease-out` |
| Pila de live cards | slide con resorte controlado | 260 ms | `cubic-bezier(.2,.8,.2,1)` |
| Hoja (bottom sheet) | entrada ligada al trigger, salida más rápida | 240 / 180 ms | `ease-out` / `ease-in` |
| Barra inferior | feedback corto en el destino tocado | 120 ms | `ease-out` |
| Calendario, selección de día | inmediata y estable, sin rebote | 90 ms | `ease-out` |
| Onboarding | crossfade lento entre fotos | 1500 ms | `ease` |
| Botones | cambio de fondo y color al presionar | 120 ms | `ease` |

## Reglas

1. **Nada por encima de 300 ms** salvo el crossfade del onboarding, que es
   contemplativo a propósito.
2. **Ninguna animación bloquea una tarea.** Si el usuario puede tocar antes de que
   termine, tiene que poder.
3. **El calendario no rebota.** Elegir un día es una acción de precisión.
4. **La pila de live cards se anima sola**, sin que el usuario la toque: la
   relación entre objetos equivalentes es lo que la animación explica.

## `prefers-reduced-motion`

Apaga lo **decorativo**, conserva lo **funcional**.

| Se apaga | Se conserva |
|---|---|
| crossfade del onboarding (corta seco) | el relleno del `SwipeButton` — es feedback, sin él no sabés si el gesto avanza |
| slide de la pila | el cambio de estado visual de un botón al presionar |
| desplazamiento del widget al cambiar de pestaña | la aparición y desaparición de la hoja, sin transición |

Esta distinción es la que más se rompe al implementar: apagar el relleno del swipe
deja al usuario sin saber si el gesto está funcionando.
