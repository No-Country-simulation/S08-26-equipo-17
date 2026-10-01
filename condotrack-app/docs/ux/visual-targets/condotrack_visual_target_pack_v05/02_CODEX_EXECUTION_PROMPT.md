# Prompt to paste into Codex

Use `condotrack_visual_target_pack_v05` as the canonical visual source for the next pass.

Before editing code, open and inspect:
1. `00_README_FOR_CODEX.md`
2. `01_VISUAL_TARGET_MANIFEST.md`
3. every local image referenced by the sections you are implementing
4. every linked Figma/Jitter/source reference where interaction or motion is part of the target

Important: the current Reception UI is **functionally useful but visually rejected**. Preserve valid logic, state, data and routing. Do not preserve current visual anatomy by default.

If the manifest says a module is based on a local image, inspect that image directly and reproduce its relevant composition, hierarchy, density and component anatomy inside CondoTrack. Do not summarize the image into generic adjectives and then improvise a standard SaaS card.

Use this implementation order:

### Phase R1
- foundations/typography/contrast
- Reception shell/sidebar/header
- Reception Home
- search interaction
- Today overview
- attention module
- upcoming access list preview
- activity/shift log preview
- Reception desktop loading state

### Phase R2
- Agenda
- Access validation
- Deliveries

### Phase R3
- Incidents
- full shift log
- refinements/motion/QA

For every changed module, report:
- local target image(s) opened;
- source URL/Figma/Jitter reference inspected;
- exact visual properties reproduced;
- what old anatomy was replaced;
- motion implemented or intentionally deferred.

Do not mark a phase complete if the result is merely a CSS restyle of the old card layout.

No commit. No push. Stop after each phase for localhost review.
