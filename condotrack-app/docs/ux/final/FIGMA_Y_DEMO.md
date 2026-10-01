# FIGMA_Y_DEMO · preparación (no ejecutado)

Master v02 §10 y §12. **No se escribió en Figma ni se grabó un video final.**
Esto deja listo el material para cuando Felipe apruebe la ronda.

## Figma · manifiesto

Destino a confirmar antes de sincronizar: *CondoTrack UI* `GRSLuRZc0WrRqi46vWtVoM`
(verificar que sea el archivo propietario; no usar el archivo de referencias).

Páginas propuestas: 00_Index · 01_System · 02_Resident · 03_Reception · 04_Admin ·
05_Flows · 06_QA.

Nombres: `ROL_ID_ESTADO_TEMA_VIEWPORT`. Las capturas son bitmaps de la build de
QA (`next build` + `next start` en :3003, 29/09/2026); **no son componentes
editables ni Auto Layout**.

| Nombre Figma | Fuente en disco | Ruta | QA |
|---|---|---|---|
| RES_R01_HOME_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r01-home-residente.png` (derecha) | `/?p=app&v=r01&limpio=1&tema=claro` | QA-01/02 |
| RES_R01_HOME_IMPORTE-OCULTO_LIGHT_390x844 | `qa-v02/res003-importe-oculto.png` | idem + ojo | QA-02 |
| RES_R01_HOME_DEFAULT_DARK_390x844 | `qa-v02/final-r01-oscuro-390.png` | `…&tema=oscuro` | — |
| RES_R03_NOTIFICACIONES_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r03-notificaciones.png` | `v=r03` | — |
| RES_R21_GASTOS_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r21-gastos.png` | `v=r21` | — |
| RES_R21_GASTOS_PERIODO-ABIERTO_LIGHT_390x844 | `qa-v02/res014-hoja-periodo.png` | `v=r21` + selector | — |
| RES_R22_MEDIOS_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r22-medios-de-pago.png` | `v=r22` | — |
| RES_R05_RESERVAR_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r05-reservas.png` | `v=r05` | QA-09 |
| RES_MAS_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-mas.png` | `v=mas` | — |
| RES_R24_VOTACIONES_DEFAULT_LIGHT_390x844 | `qa-v02/antes-despues-r24-votaciones.png` | `v=r24` | — |
| RES_F01_VISITA_CONFIRMADA_LIGHT_390x844 | `qa-v02/res030-visita-autorizada.png` | `v=f01` + enviar | QA-04 |
| REC_P01_HOME_DEFAULT_LIGHT_1440x900 | `qa-v02/antes-despues-p01-home-recepcion.png` (derecha) | `/?perfil=recepcion&p=app&v=p01&limpio=1` | — |
| REC_P01_HOME_DEFAULT_DARK_1440x900 | `qa-v02/final-p01-oscuro-1440.png` | `…&tema=oscuro` | — |
| REC_P01_HOME_FOCO-REPORTAR_LIGHT_1440x900 | `qa-v02/rec004-rotulo-al-foco.png` | foco en el riel | — |
| REC_P04_VALIDAR_ANULADO_LIGHT_1440x900 | `qa-v02/qa06-pase-de-baja-en-recepcion.png` | `v=p04` | QA-06 |
| ADM_A01_HOME_DEFAULT_LIGHT_1440x900 | `qa-v02/antes-despues-a01-home-admin.png` (derecha) | `/?perfil=administracion&p=app&v=a01&limpio=1` | QA-17 |
| ADM_A01_HOME_DEFAULT_DARK_1440x900 | `qa-v02/final-a01-oscuro-1440.png` | `…&tema=oscuro` | — |
| ADM_A01_HOME_FILTRO-CRITICAS_LIGHT_1440x900 | `qa-v02/adm008-filtro-y-limpiar.png` | Críticas | QA-17 |
| ADM_A01_HOME_PENDIENTES-CERRADA_LIGHT_1440x900 | `qa-v02/dec005-pendientes-cerrada.png` | plegar | QA-18 |
| ADM_MENU_FAMILIA-CERRADA_LIGHT_1440x900 | `qa-v02/adm001-familia-plegada.png` | plegar Operación | QA-18 |
| ADM_A01_HOME_DEFAULT_LIGHT_390x844 | `qa-v02/final-a01-claro-390.png` | `…` a 390 | — |
| ADM_A12_CASOS_DEFAULT_LIGHT_1440x900 | `qa-v02/antes-despues-a12-casos.png` | `v=a12` | — |
| ADM_A16_GASTOS_DEFAULT_LIGHT_1440x900 | `qa-v02/antes-despues-a16-gastos.png` | `v=a16` | QA-12 |
| ADM_A17_COBRANZA_CONCILIADO_LIGHT_1440x900 | `qa-v02/qa11-conciliado-en-admin.png` | `v=a17` | QA-11 |

Las 146 capturas del barrido (claro/oscuro, 1440 y 390) están en el scratchpad
de QA de la sesión; para Figma se recapturan desde la build aprobada.

Motion para Figma: trigger, duración y reducido salen de la tabla de
`QA_RESULTS.md` (medido) y de los tokens de `app/sistema.css`. Una flecha de
prototipo no demuestra la animación: acompañar con un clip corto de la build.

## Demo · guion (orientativo, 100–125 s, sólo tras QA)

Fixture: Aráoz 1280, Unidad 7D (Felipe Osorio), Recepción Diego Sosa,
Administración Mariana Ferrari. Sin datos personales reales.

| # | Rol | Acción | Motion visible | Continuidad |
|---|---|---|---|---|
| 1 | RES | Home: Expensas → Visitas con swipe; ocultar importe | selector 160 ms, 1.03 | misma unidad |
| 2 | RES | Autorizar visita "Ana Pérez", Noche; Ver el pase | foco de campo, confirmación 240 ms | el pase CT 7D … que usa Recepción |
| 3 | RES | Pagar → Ya pagué → Informar | hoja | "Pago informado · a confirmar" |
| 4 | REC | Home; buscar "Ana" | búsqueda 44→432 px | misma persona |
| 5 | REC | Validar el pase y después registrar el ingreso | verificar ≠ registrar | queda en Actividad |
| 6 | ADM | Hero y cola: "Pago informado · Unidad 7D" | filtros, fundido de cola | objeto del paso 3 |
| 7 | ADM | Conciliar el pago | fila → detalle | — |
| 8 | RES | Home: "Pagada" | — | cierra la historia entre roles |
| 9 | Cierre | Marca | — | — |

No mostrar "backend conectado": es un prototipo con estado en memoria.
