# _historia/ — documentación histórica

**Nada de esta carpeta es una instrucción vigente.**

Estos documentos se conservan porque explican cómo se llegó a las decisiones
actuales. No se borran. Pero:

- son **documentación histórica**;
- **no son instrucciones vigentes**;
- **no deben usarse para implementar** nada;
- ante cualquier contradicción prevalecen, en este orden:
  `CLAUDE.md` → `docs/ux/00_CONTEXT_INDEX.md` → `docs/ux/02_DECISION_LOG.md` →
  el resto de `docs/ux/` vigente.

Si estás leyendo un archivo de esta carpeta para decidir cómo implementar algo,
estás leyendo el archivo equivocado. Volvé a `docs/ux/00_CONTEXT_INDEX.md`.

---

## Qué hay acá y por qué dejó de regir

| Archivo | Estado | Qué lo reemplaza |
|---|---|---|
| `CONDOTRACK_AUDITORIA_Y_PROMPT_MAESTRO.md` | **Absorbido** | Su contenido se repartió en `01_AUDITORIA_REPO_2026-09-17.md`, `02_DECISION_LOG.md`, `04_COMPONENT_SYSTEM.md`, `08_ACCEPTANCE_CRITERIA.md` e `IMPLEMENTATION_PLAN.md` |
| `PROMPT_02_LENGUAJE_VISUAL.md` | **Derogado** | Es el origen de las diagonales del fondo. Ver D-03 |
| `SUPER_PROMPT_CONDOTRACK.md` | **Derogado** | Anterior al cambio de arquitectura de información. Ver D-04 y D-07 |
| `PROMPT_FASE_RESERVAS.md` | **Derogado** | El calendario pasó de tira de 14 días a grilla de mes. Ver D-08 |

## Documentos que NO están acá porque siguen vigentes

| Archivo | Dónde | Por qué sigue |
|---|---|---|
| `CLAUDE.md` | raíz | Reglas permanentes del repositorio |
| `README.md` | raíz | Stack, comandos y cuentas de demostración |
| `LENGUAJE_VISUAL.md` | raíz | **Reconciliado el 17/09/2026.** Tenía cinco puntos vencidos; se corrigieron y quedaron marcados con el ID de la decisión que los reemplaza |
