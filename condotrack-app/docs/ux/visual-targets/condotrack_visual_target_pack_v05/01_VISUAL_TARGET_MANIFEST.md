# CondoTrack — Visual Target Manifest V05

## Global locks
- Typeface: Satoshi.
- Primary yellow: `#F5E500`.
- Charcoal: `#111614`.
- Warm background: `#F4F5F1`.
- Surface: `#FFFFFF`.
- Secondary text: `#515A56`.
- Navigation active state: **no yellow fill**.
- Keep the CondoTrack master mark geometry intact.
- Preserve valid data/state/routing; replace presentation as needed.

---

# 1. GLOBAL ART DIRECTION / MODULAR DASHBOARD

## V-GLOBAL-01 — Modular dashboard, unequal modules
**Local image:** `refs/user/U05_management_modular_dashboard.png`

Use for:
- Reception Home
- Administration Home
- modular dashboard system

Copy closely:
- unequal module sizes;
- multiple component anatomies on one canvas;
- strong large-area hierarchy;
- schedule + statistics + files/people/content coexisting without becoming identical cards;
- black/white contrast blocks;
- editorial composition.

Do not copy:
- literal content;
- unrelated metrics;
- black as the only surface color.

CondoTrack adaptation:
- warm background;
- charcoal anchor modules;
- yellow strategic state/action;
- optional architectural image module.

## V-GLOBAL-02 — Modular object-centric dashboard
**Local image:** `refs/user/U02_volvo_modular_dashboard.png`

Use for:
- Reception Home hero / main action area;
- future configurable modules.

Copy closely:
- one dominant visual anchor;
- supporting modules with different shapes and responsibilities;
- tool panels that feel integrated rather than floating random cards;
- date/time utility as designed object.

## V-GLOBAL-03 — Editorial hierarchy + data over image
**Local image:** `refs/user/U03_sleep_editorial_dashboard.png`

Use for:
- visual rhythm;
- hero/attention modules;
- image-backed modules.

Copy closely:
- large type hierarchy;
- asymmetry;
- image + data relationship;
- deliberate negative space.

## V-GLOBAL-04 — Editorial grid / hard divisions
**Local image:** `refs/user/U07_timepiece_editorial_grid.png`

Use for:
- overall page rhythm;
- Administration;
- module boundaries;
- reducing “floating card” feeling.

Copy closely:
- grid and rules/dividers;
- precise alignment;
- hard sectional composition;
- generous whitespace with clear hierarchy.

## V-GLOBAL-05 — Prior black/yellow premium system
**Local image:** `refs/project/pinterest_refs_condotrack_round1.png`

Use for:
- black/yellow discipline;
- dark anchor surfaces;
- calendar integration;
- module depth.

Do not copy lime/green accents from unrelated examples.

---

# 2. SHELL / SIDEBAR / DESKTOP STRUCTURE

## V-SHELL-01 — Compact vertical rail + planner workspace
**Local image:** `refs/user/U01_planner_clock_calendar.png`

Copy closely:
- compact left rail;
- icon-first navigation;
- clear active state;
- secondary workspace navigation inside content;
- clock/calendar as real utilities, not decoration.

## V-SHELL-02 — Management shell
**Local image:** `refs/user/U05_management_modular_dashboard.png`

Copy closely:
- narrow persistent sidebar;
- strong main workspace;
- sidebar visually recedes versus content;
- profile anchored low.

## External source — Kisi access control dashboard
Source: https://www.rhombus.com/integrations/kisi/
Use for:
- security/front-desk information density;
- location/occupancy/user activity structure.

## External source — Hotel front desk / reservations
Source: https://www.roommaster.com/blog/roomraccoon-alternatives
Use for:
- operational front-desk mental model;
- schedule density;
- today-focused reception workspace.

---

# 3. HOME RECEPTION / TODAY / MODULAR WIDGET SYSTEM

Primary local targets:
- `refs/user/U05_management_modular_dashboard.png`
- `refs/user/U02_volvo_modular_dashboard.png`
- `refs/user/U03_sleep_editorial_dashboard.png`
- `refs/user/U07_timepiece_editorial_grid.png`

Requirements:
- not a grid of identical cards;
- each module must have a distinct anatomy;
- Today overview should be an integrated composition, not five KPI tiles;
- current time/date should have real presence;
- attention module should feel editorial and actionable;
- recent activity should use a list/log anatomy;
- allow the architecture for future widget reordering/personalization.

Supporting source — customizable dashboards / widgets:
https://getforgeops.net/features/dashboards

---

# 4. SEARCH / COMMAND

## Local structural reference
Figma node: `23204:129953` — Search Flat XL

## External interaction target — Jitter Animated Search Bar
https://jitter.video/template/animated-search-bar/

## External interaction target — Jitter Search Bar Reveal
https://jitter.video/template/search-bar-reveal/

## External component reference — Attio search / command-style CRM
https://www.saasframe.io/saas/attio

Behavior target:
- search gains presence on focus;
- expansion/reveal is smooth, not bouncy;
- results can group person / unit / visit / provider;
- keyboard-friendly where practical;
- no dead static input.

---

# 5. OPERATIONAL LISTS — UPCOMING ACCESS / UNITS / ACTIVITY

## Primary external target — Attio Companies List
https://www.saasframe.io/examples/attio-companies-list

Use for:
- continuous table/list surface;
- readable columns;
- scanability;
- filters/sort/view controls;
- row selection;
- metadata and state without floating white cards.

Required for `Próximos accesos`:
- time = clear column;
- person/destination = strongest textual field;
- secondary context = readable, not washed out;
- state = semantic and immediately legible;
- full-row hover/selection;
- contextual action at right;
- avoid tiny dot-only states.

Notion-style adaptation:
- expandable rows/details where useful;
- ability to switch conceptual views later (list / agenda / calendar).

## Project activity timeline
**Local image:** `refs/project/021f68ec-76af-43d9-a20a-0c1ba06bf735.png`
Use for:
- bitácora;
- audit/history;
- timestamp hierarchy.

---

# 6. AGENDA / CALENDAR / TIMELINE

## V-AGENDA-01 — Planner + analog clock + monthly calendar
**Local image:** `refs/user/U01_planner_clock_calendar.png`

## V-AGENDA-02 — Timeline with modal/task editor
**Local image:** `refs/user/U08_timeline_calendar_modal.png`

## V-AGENDA-03 — Horizontal project timeline
**Local image:** `refs/user/U09_timeline_journey.png`

## V-AGENDA-04 — Clean workflow timeline
**Local image:** `refs/user/U10_workflow_timeline.png`

## Existing CondoTrack calendar master
**Local image:** `refs/project/6e914621-37cd-4a50-bb57-7bad0f953c00.png`
This remains the preferred calendar family for CondoTrack.

Supporting external calendar reference:
https://dribbble.com/tags/appointment-dashboard

Required composition:
- left/secondary calendar or date navigator;
- current time visible;
- scrollable agenda/timeline area;
- events differentiated by function, not random colors;
- enough desktop density to use the available screen.

---

# 7. ACCESS VALIDATION

Functional sources:
- Kisi: https://www.rhombus.com/integrations/kisi/
- Attio-style readable lists: https://www.saasframe.io/examples/attio-companies-list

Required anatomy:
1. Scan / enter code / search.
2. Identity and destination.
3. Very strong result state: AUTHORIZED / EXPIRED / NOT FOUND / ALREADY INSIDE.
4. Context.
5. Primary action: register entry / exit.

Do not represent access validation as a generic small form card.

---

# 8. DELIVERIES / PACKAGES / DESKTOP DRAWER

Direction approved:
- large side drawer / split view;
- list left or center + detail drawer;
- selectable delivery items;
- clear lifecycle status.

Use these project/visual sources:
- `refs/project/BG03_package_room_yellow.png` for optional hero/banner context;
- Attio list pattern for the list;
- U02/U05 for modular detail composition.

Lifecycle language:
- Received
- Notified
- Picked up / Delivered

Do not use a mobile bottom sheet scaled to desktop.

---

# 9. INCIDENTS / MAINTENANCE

External reference — Incident Management Dashboard:
https://dribbble.com/shots/27149562-Incident-Management-Dashboard-SaaS-UI

Use for:
- severity / priority visibility;
- recent incidents;
- state distinction;
- attention hierarchy;
- list/detail relationship.

Do not copy purple palette or cybersecurity-specific metrics.

---

# 10. GLASS / FROSTED / PHOTOGRAPHIC MODULES

## V-GLASS-01 — Frosted cards over architectural photography
**Local image:** `refs/user/U04_glass_photography_cards.png`

Use for:
- Home hero/banner;
- selected high-value widgets;
- shift/building context;
- editorial modules.

Do not use glass for:
- long tables;
- dense operational lists;
- every card.

Approved CondoTrack background pool:
- `refs/project/BG01_brutalist_facade_yellow.png`
- `refs/project/BG02_reception_office_yellow.png`
- `refs/project/BG03_package_room_yellow.png`
- `refs/project/BG04_lounge_yellow.png`
- `refs/project/BG05_entry_intercom_yellow.png`

If using a background image:
- preserve text contrast;
- use controlled scrim/frosted layer;
- no generic gradient overlay;
- do not reduce readability for atmosphere.

---

# 11. MOTION SYSTEM — JITTER

These are behavior targets. Open the links and inspect the motion before coding.

### Search
- Animated Search Bar: https://jitter.video/template/animated-search-bar/
- Search Bar Reveal: https://jitter.video/template/search-bar-reveal/

### Brand / loading / success
- Morph: Animated Icon: https://jitter.video/template/morph-animated-icon/
- Loading Spinner: Success Animation: https://jitter.video/template/loading-spinner-success-animation/
- Loading Animation: Bars: https://jitter.video/template/loading-animation-bars/

### Navigation
- Side Rail Menu: https://jitter.video/template/side-rail-menu/
- UI templates index: https://jitter.video/templates/ui-elements/

### Resident card stack
- Stacked Cards: https://jitter.video/template/stacked-cards/

Motion rules:
- purposeful, not ornamental;
- opacity/transform before expensive effects;
- reduced-motion support;
- no springy/gaming behavior;
- do not copy Jitter duration literally; adapt to production UI speed.

---

# 12. RESIDENT MOBILE NAV / QUICK ACTION

## V-RESIDENT-NAV-01
**Local image:** `refs/user/U11_mobile_search_bottom_nav.png`

Use for Resident mobile only:
- persistent bottom dock;
- global/mobile search;
- dominant center quick action;
- four secondary destinations;
- subtle frosted material allowed.

CondoTrack quick action can open:
- Authorize visit
- Make complaint
- Reserve space

Do not apply this pattern to Reception desktop.

---

# 13. ADMINISTRATION

Primary art-direction targets:
- `refs/user/U05_management_modular_dashboard.png`
- `refs/user/U07_timepiece_editorial_grid.png`
- Attio list/table pattern

Functional style:
- denser than Reception;
- filters / table / list-detail;
- modular overview;
- finance and audit should not become a card zoo.

---

# 14. PERSONAL-TASTE / PINTEREST SUPPORTING REFERENCES

## Saved Pinterest round 1
**Local image:** `refs/project/pinterest_refs_condotrack_round1.png`

## Prior CondoTrack visual pool
**Local image:** `refs/project/contact_all_refs.jpg`

External saved references:
- FARFROM — Real Estate Branding & UX/UI: https://makermanifest.co/DesignWebU/web-design-figma-template?farfrom-r-real-estate-branding-ux-ui-design-by-shiva
- FF Move / interactive Framer reference: https://www.instagram.com/p/DFnlbAVIXzT/
- Shakuro motion/product UI: https://shakuro.com/ui-ux
- Brand Doula / SaaS brand direction: https://brand-doula.com/branding-for-saas-and-tech

Use these as taste/art-direction support, not as mandatory one-to-one copies.

---

# 15. FIGMA REFERENCES ALREADY APPROVED

DesignCode UI file: `CNuuTRQJHtAMwXJpDUQYER`

Nodes:
- Search Flat XL — `23204:129953`
- Side Menu Flat — `23204:130822`
- List Card Flat — `23204:134577`
- Notification Flat — `23204:134646`
- Navigation Desktop — `23204:129834`
- Tab Flat — `259:34188`
- Segmented Control — `259:33582`

Rules:
- inspect anatomy and geometry;
- do not copy Inter, blue glow, 99px pills, kit branding or generated Tailwind;
- translate to CondoTrack tokens.

---

# 16. ACCEPTANCE TEST

A block is NOT complete if:
- it still uses the old generic card anatomy with only CSS restyling;
- hierarchy remains weak;
- metadata relies on low-contrast gray;
- the same rounded card is reused for unrelated functions;
- motion target was specified but ignored;
- the local target image was not inspected.

A block IS complete when:
- its anatomy clearly reflects the referenced target;
- CondoTrack branding is preserved;
- information is immediately scanable;
- desktop space is used deliberately;
- interaction/motion follows the linked source when applicable.
