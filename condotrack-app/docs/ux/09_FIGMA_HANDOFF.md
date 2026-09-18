# 09 · Handoff a Figma

## Estado del archivo

Archivo `CondoTrack · UI`, key `GRSLuRZc0WrRqi46vWtVoM`, cuenta `fosori@palermo.edu`.

| Página | Contenido |
|---|---|
| Fundaciones | 7 componentes |
| Acceso | G01, G02, Carga |
| Residente | 8 pantallas |

Colecciones de variables:

| Colección | Variables | Modos |
|---|---|---|
| `CondoTrack · Color` | 17 | Claro / Oscuro |
| `CondoTrack · Medida` | 17 | — |
| `CondoTrack · Tipografía` | `familia/ui` ligada a 9 estilos de texto y a los 228 nodos de texto | — |

## Deuda conocida del archivo

1. **Las 7 capas de placeholder no tienen foto.** El endpoint de subida de Figma
   (`mcp.figma.com`) devuelve 403 a través del proxy, así que `upload_assets` no
   se puede usar desde acá. Las imágenes hay que cargarlas a mano.
2. **Copias locales en vez de instancias.** Varias pantallas duplican componentes
   en lugar de instanciarlos; cambiar el original no las actualiza.
3. **21 combinaciones tipográficas para 9 estilos.** Falta normalizar la escala.

## Qué cambia con esta reconciliación

| Variable / estilo | Antes | Ahora |
|---|---|---|
| `familia/ui` | Archivo | **Satoshi** |
| `familia/display` | Archivo + wdth 118% | **Satoshi**, sin eje de ancho |
| pesos | 400/500/600/700/800 | **400 / 500 / 700 / 900** — 600 y 800 no existen en Satoshi |
| tracking de titulares | −.035 a −.045em | aflojado 0,01em |

Satoshi **no está en Figma por defecto**: hay que instalarla localmente desde
Fontshare para que el archivo renderice bien.

## Orden del handoff

El archivo de Figma va **detrás** del código, no delante. El prototipo en Next es
la fuente de verdad de esta etapa; Figma se sincroniza cuando las fases 0 a 4 estén
cerradas. Sincronizarlo antes obliga a rehacerlo dos veces.

Cuando toque:
1. actualizar las tres colecciones de variables desde `design/tokens.json`;
2. convertir las copias locales en instancias;
3. normalizar la escala tipográfica a 9 estilos;
4. cargar las fotos en las 7 capas de placeholder;
5. recién ahí, exportar las pantallas nuevas.

## Tokens

`design/tokens.json` está en formato Tokens Studio y **debe espejar**
`app/globals.css`. Hoy hay drift: el cambio a Satoshi todavía no se reflejó ahí.
