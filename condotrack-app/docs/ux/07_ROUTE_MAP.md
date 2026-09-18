# 07 · Mapa de rutas

No hay router de Next: una sola ruta (`app/page.tsx`) y el estado de vista vive en
`components/Prototipo.tsx`. La navegación es por el tipo `Vista` de `lib/data.ts`.

## Deep links

```
?p=<pantalla>   onb · g01 · g02 · app
?v=<vista>      cualquiera del mapa de abajo
&tema=claro|oscuro
&limpio=1       saca el escenario y deja la pantalla sola
```

Ejemplos de QA:
`?p=app&v=r01` · `?p=app&v=r05&tema=oscuro` · `?p=app&v=r20&limpio=1`

## Residente

| ID | Pantalla | Padre en la barra |
|---|---|---|
| `r01` | Inicio del residente | Inicio |
| `r17` | Historial de la unidad | Inicio |
| `g15` | Mi edificio | **Mi edificio** ← cambia con D-07 |
| `r02` | Mi unidad | **Mi edificio** |
| `r06` | Mis visitas | Mi edificio |
| `r07` | Pase de acceso | **Acceso** ← cambia con D-04 |
| `r08` | Entregas | Mi edificio |
| `r16` | Autorización, detalle | Mi edificio |
| `g11` | Entrega, detalle | Mi edificio |
| `f01` | Autorizar una visita | Acceso |
| `r05` | Reservar | Reservas |
| `r18` | Mis reservas | Reservas |
| `r13` | Espacio común, detalle | Reservas |
| `mas` | Más | Más |
| `r03` | Notificaciones | Más |
| `r09` | Reclamos | Más |
| `g10` | Reclamo, detalle | Más |
| `f02` | Hacer un reclamo | Más |
| `r14` | Documentos del consorcio | Mi edificio → Documentos |
| `r15` | Preferencias y seguridad | Más |
| `r19` | Preguntas frecuentes / Reglamento | Más |
| `r20` | Expensa del mes | Más |
| `r21` | Gastos del consorcio | Más |
| `r22` | Medios de pago | Más |
| `r23` | Estado de cuenta | Más |
| `r24` | Votaciones | Más |
| `f03` | Informar un pago | Más |

## Recepción

| ID | Pantalla |
|---|---|
| `p01` | Inicio de turno |
| `p02` | Buscar unidad |
| `p03` | Escanear un pase |
| `p04` | Validar acceso |
| `p05` | Entregas |
| `p07` | Incidencias |
| `p08` | Agenda del día |

## Administración

Sin diseñar. `ShellAdmin` llega a una pantalla marcada como pendiente, con su ID
visible.

## Cambios de ruteo que trae esta pasada

1. El mapa `PADRE` de `components/ui/PillNav.tsx` **se extiende**, no se reemplaza.
2. `r02` y `g15` pasan a colgar del mismo destino (Mi edificio), diferenciados por
   `SubNav`.
3. `r07` deja de colgar de "Mi unidad" y pasa a ser la vista raíz de la acción
   central.
4. `r14` (Documentos) se mueve de Más a la tercera pestaña de Mi edificio.

## Bugs de navegación conocidos

| ID | Qué | Dónde mirar |
|---|---|---|
| BUG-02 | Volver desde `r17` cae en `r07` | prop `volverA` de `TopBar` en `R17.tsx` |
| BUG-03 | Volver desde Reglamento (`r19`) va al panel central | mismo patrón |
| BUG-04 | "Espacios del edificio" no abre desde administración | handler `ir()` del ítem |
