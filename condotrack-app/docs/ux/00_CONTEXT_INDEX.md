# 00 · Índice de contexto

**Punto de entrada único.** Si estás por tocar CondoTrack, leé este archivo primero.

Última reconciliación: **17/09/2026** · repo en commit `856dfc7` + pasada Satoshi.
Implementación de las doce fases cerrada el **17/09/2026**: ver
`ESTADO_IMPLEMENTACION.md`, que es el estado real, y `02_DECISION_LOG.md`, donde
D-18 a D-24 son decisiones tomadas al implementar.

## Orden de lectura

| # | Documento | Para qué |
|---|---|---|
| 01 | `01_AUDITORIA_REPO_2026-09-17.md` | Qué hay realmente en el código hoy |
| 02 | `02_DECISION_LOG.md` | Qué está decidido y qué quedó derogado |
| 03 | `03_INFORMATION_ARCHITECTURE.md` | Destinos, jerarquía, permisos |
| 04 | `04_COMPONENT_SYSTEM.md` | Materiales y componentes compartidos |
| 05 | `05_MOTION_SYSTEM.md` | Qué se anima y qué no |
| 06 | `06_USER_FLOWS.md` | Los seis flujos del residente, paso a paso |
| 07 | `07_ROUTE_MAP.md` | Todas las vistas, sus IDs y sus padres |
| 08 | `08_ACCEPTANCE_CRITERIA.md` | La compuerta de cada fase |
| 09 | `09_FIGMA_HANDOFF.md` | Qué se exporta y en qué estado está el archivo |
| 10 | `10_VISUAL_LOCK_V02.md` | El sistema visual cerrado del residente: componentes, color, foto, copy, prohibiciones |
| — | `IMPLEMENTATION_PLAN.md` | Las once fases, en orden |
| — | `ESTADO_IMPLEMENTACION.md` | Dónde estamos ahora |
| — | `../_historia/README.md` | Qué documentos dejaron de regir y por qué |

## Jerarquía de autoridad

```
docs/ux/02_DECISION_LOG.md          ← gana siempre
        ↓
docs/ux/*                           ← vigente
        ↓
app/globals.css                     ← la verdad de lo implementado
        ↓
docs/ux/source/*                    ← material de origen, ya procesado
        ↓
docs/_historia/*                    ← HISTORIA. Nunca son instrucciones.
```

Si un documento de `source/` contradice al DECISION_LOG, **gana el DECISION_LOG**.

## Dónde quedó cada documento anterior

Los derogados se movieron a `docs/_historia/` el 17/09/2026. **No se borraron.**

| Archivo | Ubicación actual | Estado |
|---|---|---|
| `CLAUDE.md` | raíz | **Vigente.** Reglas permanentes del repo |
| `README.md` | raíz | **Vigente** para stack, comandos y cuentas demo. Su lista de pantallas quedó vieja |
| `LENGUAJE_VISUAL.md` | raíz | **Vigente, reconciliado.** Tenía cinco puntos vencidos (D-01, D-03, D-05, D-06, D-11); se corrigieron y quedaron marcados |
| `CONDOTRACK_AUDITORIA_Y_PROMPT_MAESTRO.md` | `docs/_historia/` | Absorbido en 01, 02, 04, 08 e IMPLEMENTATION_PLAN |
| `PROMPT_02_LENGUAJE_VISUAL.md` | `docs/_historia/` | Derogado. Es el origen de las diagonales |
| `SUPER_PROMPT_CONDOTRACK.md` | `docs/_historia/` | Derogado. Anterior al cambio de IA |
| `PROMPT_FASE_RESERVAS.md` | `docs/_historia/` | Derogado. El calendario cambió de tira a grilla de mes |

Ver `docs/_historia/README.md`.

## Qué NO está resuelto

Ver la sección "Preguntas abiertas" del DECISION_LOG. Hoy son dos, y ninguna
bloquea el arranque de la implementación.
