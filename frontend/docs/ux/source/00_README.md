# CondoTrack — UX/UI Research + Claude Pack v01

Este paquete no es una orden de “rediseñar desde cero”. Es un paquete de decisión y control para que Cowork/Claude entienda:

1. qué está mal en el build actual;
2. qué patrones profesionales estamos usando como referencia;
3. qué debe conservarse;
4. qué componentes deben rediseñarse como sistema compartido;
5. qué debe auditar antes de tocar código.

## Archivos

- `01_RESEARCH_PROFESIONAL.md` — investigación y criterio UX/UI.
- `02_REFERENCIAS_Y_QUE_EXTRAER.md` — lectura concreta de cada imagen adjunta.
- `03_PROMPT_COWORK_AUDIT.md` — prompt para Cowork/Claude antes de implementar.
- `04_PROMPT_CLAUDE_CODE_IMPLEMENTACION.md` — prompt de ejecución por fases.
- `05_ACCEPTANCE_CRITERIA.md` — QA y criterios de aceptación.
- `REFERENCIAS/` — imágenes de referencia originales + captura actual del onboarding.

## Regla crítica

Las referencias NO son templates para copiar literalmente. Cada una aporta un patrón puntual. Claude debe analizar las imágenes y combinar esos patrones con la IA, los roles y las funciones propias de CondoTrack.

## Fuente tipográfica

La tipografía aprobada es **Rothek**. Este paquete NO redistribuye archivos de fuente. Para que Next.js la use, los archivos reales deben incorporarse al repositorio (por ejemplo, `public/fonts/` o mediante `next/font/local`) y declararse explícitamente.
