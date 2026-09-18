# CondoTrack — prototipo

Next.js 14 (App Router) + TypeScript. Sin librerías de UI ni de estado: todo es CSS y React.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Qué cubre

Onboarding (4 pasos) → **G01** Inicio de sesión → **G02** Carga → panel del perfil autorizado.

Onboarding: carrusel que rota solo en loop con crossfade; se pausa apenas tocás o deslizás. "Empezar" entra al login y no vuelve a aparecer.

Bloque residente: **R01** Inicio · **R06** Mis visitas · **R05** Reservas · **R04** Más · **R02** Mi edificio · **R03** Notificaciones · **R07** Pase QR · **R08** Entregas.
Acceso: **G01** login · **G02** recuperar acceso.
Recepción y administración llegan a una pantalla marcada como pendiente de diseño, con su ID visible.

## Cuentas de demostración

| Correo | Contraseña | Perfil |
|---|---|---|
| `felipe@araoz1280.com.ar` | `condo1234` | Residente |
| `recepcion@araoz1280.com.ar` | `condo1234` | Recepción |
| `admin@araoz1280.com.ar` | `condo1234` | Administración |

La cuenta determina perfil y contexto. **No hay selector de rol en el login.**

## Dónde está cada cosa

```
app/globals.css       tokens CSS + todos los componentes visuales
design/tokens.json    los mismos tokens en formato Tokens Studio (Figma)
lib/data.ts           datos ficticios, fijados por 00_MASTER_UI_SYSTEM_LOCK
components/ui/        Icon, SwipeButton, PillNav, TopBar, Chips
components/screens/   una pantalla por archivo
public/brand/         logo oficial en SVG (CONDOTRACK_BRAND_V1)
public/img/           recortes fotográficos de los mockups aprobados
public/fonts/         Rothek
```

## Tokens a Figma

`design/tokens.json` está en formato **Tokens Studio**. En Figma: plugin Tokens Studio → Import → pegá el archivo → Create variables.
Si cambiás un valor en `globals.css`, cambialo también ahí: hoy no hay generación automática entre los dos.

## Tipografía

Rothek está en `public/fonts/` en `.otf` y `.woff`. El archivo recibido trae **ExtraLight (200) y Bold Italic (700 italic) únicamente** — ningún peso de texto.
Por eso:

- el logo va como SVG con los trazos ya convertidos, no como texto;
- la interfaz usa **Inter**;
- el `@font-face` de Rothek está escrito y comentado en `globals.css`, listo para activarse cuando lleguen los pesos que faltan (Regular, Medium, SemiBold, Bold).

## Temas

Claro y oscuro salen de los mismos tokens y se resuelven con `prefers-color-scheme`: la app sigue el tema del dispositivo.
Ninguna regla de componente define un color literal que solo funcione en uno de los dos.

## Materiales

Tres, como los define `00_MASTER_UI_SYSTEM_LOCK`:

- `.vidrio` — light glass. Cards, menús, filtros, paneles.
- `.humo` — smoked glass. Sobre fotografía o superficie oscura.
- Amarillo sólido — acción primaria, estado activo, selección.

Para que el vidrio se lea, `.device::before` pone una atmósfera muy suave detrás de todo (halos del amarillo de marca). Sin algo detrás, `backdrop-filter` no hace nada.

## Estados

Tres tratamientos, siempre con ícono y texto además del color:

| Tratamiento | Significa |
|---|---|
| Amarillo | requiere una acción tuya, o está vigente |
| Carbón | en gestión, a cargo de otro |
| Contorno gris | finalizado, sin acción pendiente |

**Falta el cuarto: vencido / rechazado.** Está propuesto en `design/tokens.json` como `estado.vencido` pero sin aprobar.

## Pendiente

- `P01` y `A01` sin diseñar.
- `R09` reclamos, `R14` documentos, `G11` detalle de entrega.
- El QR de `R07` es geometría de demostración: no codifica datos. El pase real lo emite el backend.
- Catálogo de amenities por edificio: hoy son tres fijos (SUM, Cowork, Parrilla). Si cada edificio tiene los suyos, hace falta modelarlo.
- `G03` nueva contraseña (la pantalla a la que lleva el enlace del correo), `G04` activar invitación.
- **Conflicto de IDs:** `04_MAPEO_IDS_A_PATRONES` llama `G02` a recuperar acceso, y el pack de mockups llama `G02_Carga` a la pantalla de carga. Acá recuperar acceso es G02 y la carga no tiene ID. Hay que unificarlo.
- **Validar un pase y registrar un ingreso son dos acciones distintas.** `P04` tiene que mostrarlas separadas: validar responde si la autorización está vigente y no toca el estado; registrar crea el evento, sella hora y responsable, y es lo que aparece después en el historial de la unidad.
