# ASSET_MANIFEST_ACTUAL

Inventario real de `public/` al 29/09/2026 (sesión 2), generado leyendo los
archivos y buscando sus usos en `components/`, `app/` y `lib/`. No se generó
ni se descargó ninguna imagen nueva: todo lo que usa esta ronda ya estaba en
el repo.

## Asignación de los assets del master (§08)

| ID master | Nombre propuesto | Asset real usado | Dónde | Decisión |
|---|---|---|---|---|
| AST-001 | adm-attention-architecture.webp | **`/img/fachada.jpg`** (752×896, 88 KB) | Hero del Inicio de Administración (A01) | Reutilizado, no generado: hormigón claro, vidrio y carpintería carbón, sin personas ni marcas, el mismo edificio del Home de Residente. Encuadre `object-position: 50% 38%`, fundido a la superficie hacia la izquierda (máscara 0→62 %); en oscuro al 70 %; en móvil banda superior de 120 px |
| AST-002 | res-pass-entry.webp | **`/img/hero_lobby.jpg`** (414×272, 41 KB) | Cabecera del pase de acceso (R07) | Reutilizado: el hall ya se usaba en el Home RES. Sólo en la cabecera, detrás del nombre, con velo carbón; el QR queda sobre blanco, sin imagen debajo |
| AST-003 | adm-module-context.webp | — | — | No hizo falta: los módulos plegados se reconocen por su título y resumen |
| AST-004 | reception-backdrop-arc.svg | CSS (`.rx-home::before`) | Home de Recepción | Forma geométrica en CSS, no raster: semicírculo neutro 9→5 % en claro y 9→4,5 % en oscuro, detrás de las superficies, sin interceptar eventos |
| AST-005 | CT master vigente | `/brand/CT_LOGO_DARK_V2.png`, `/brand/CT_LOGO_LIGHT_V2.png`, `/brand/CT_MASTER_DUOTONE_DARK.svg` | Shells y pie de listas | Geometría intacta. El pie de lista pasa a opacidad 1 (estaba al 14 %) y 14 px de alto |

## QR del pase

- Contraste módulos/fondo: `#111614` sobre `#FFFFFF` ≈ 18:1.
- Zona blanca: 14 px de padding sobre 206 px con 25 módulos (≈ 2 módulos).
- **Límite:** la matriz es de demostración (`R07.tsx`, "no codifica datos
  reales"); no se puede probar un escaneo real. Cuando el backend emita la
  credencial conviene 4 módulos de zona blanca. Se deja anotado, sin cambiar
  el tamaño aprobado.

## Inventario

| Archivo | Dimensiones | Peso | Usado en |
|---|---|---|---|
| /brand/CT_APPICON_V2.png | 512×512 | 22 KB | layout.tsx |
| /brand/CT_APPLE_TOUCH_V2.png | 180×180 | 11 KB | layout.tsx |
| /brand/CT_LOGO_DARK_V2.png | 780×170 | 14 KB | AdminMarco, Carga, FinLista, Login, Onboarding, R01 |
| /brand/CT_LOGO_LIGHT_V2.png | 780×158 | 14 KB | AdminMarco, FinLista, ReceptionHeader, ReceptionLoading |
| /brand/CT_MASTER_DUOTONE_DARK.svg | vector | 25 KB | ReceptionLoading |
| /brand/CT_SIMBOLO_V2_MASCARA.png | 570×600 | 29 KB | globals.css |
| /img/edificio.jpg | 900×558 | 134 KB | Edificio (A02/A03), data.ts, recepcion.css |
| /img/esp_cowork.jpg · esp_parrilla.jpg · esp_sum.jpg | 900×342 | 68–74 KB | data.ts (espacios) |
| /img/fachada.jpg | 752×896 | 88 KB | **A01 (nuevo)**, Edificio, G15, Login, P08, R01 |
| /img/hero_araoz.jpg | 700×428 | 86 KB | P08, R01 |
| /img/hero_lobby.jpg | 414×272 | 41 KB | R01, **R07 (nuevo)** |
| /img/mini_cowork.jpg · mini_parrilla.jpg · mini_sum.jpg | 320×201 | 19–21 KB | data.ts |
| /img/ob_balcon.jpg · ob_edificio.jpg · ob_terraza.jpg | 780×1080 | 127–154 KB | data.ts (onboarding) |
| /img/visitas_fondo.jpg | 700×212 | 37 KB | R01, R06 |
| /recepcion/abstract-approved.png | 1672×941 | 1987 KB | globals.css |
| /fonts/rothek-*.woff | — | 68–70 KB | globals.css (tipografía histórica; la vigente es Satoshi) |

## Sin uso detectado (no se borraron)

`/brand/CT_FAVICON.svg`, `CT_LOGO_BLACK.svg`, `CT_LOGO_DARK.svg`,
`CT_LOGO_HORIZONTAL.svg`, `CT_LOGO_WHITE.svg`, `CT_SYMBOL_PRIMARY_TRANSPARENT.svg`,
`/img/ob_accesos.jpg`, `ob_espacios.jpg`, `ob_gestiona.jpg`, `ob_unidad.jpg`,
`visitas_bg.jpg`, `/recepcion/reception-office-v05.png` (1,9 MB),
`/fonts/rothek-*.otf`. El master pide no borrar componentes ni recursos
supuestamente muertos sin revisar sus usos fuera de la app; quedan listados
para decidir.
