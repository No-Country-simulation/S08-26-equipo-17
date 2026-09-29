import {
  ESPACIOS, RECURSOS, RESERVAS, REGLAS, RESIDENTE,
  type Espacio, type Recurso, type Reserva,
} from "./data";

/* Lógica de disponibilidad. Sin librerías de fecha: aritmética de minutos
   e Intl para formatear.

   Todas las funciones que consultan ocupación reciben la lista de reservas
   por parámetro, con RESERVAS como valor por defecto. Es lo que permite que
   una reserva creada en la sesión aparezca enseguida en el calendario, en
   el home y en el historial de la unidad. */

export type Franja = { inicio: Date; fin: Date };

export type MotivoBloqueo =
  | "ocupada"
  | "pasada"
  | "anticipacion"
  | "superpuesta"
  | "tope";

/** Quién tiene tomado un recurso en esa franja. Es un edificio: saber que
 *  el SUM lo tiene la 2A el sábado es información, no ruido. */
export type Ocupacion = { recurso: Recurso; unidad: string; por: string };

export type Turno = {
  franja: Franja;
  libres: Recurso[];          // recursos disponibles en esa franja
  ocupados: Recurso[];
  ocupaciones: Ocupacion[];
  bloqueo: MotivoBloqueo | null;
};

export const MOTIVO: Record<MotivoBloqueo, string> = {
  ocupada: "Sin disponibilidad",
  pasada: "Ya pasó",
  anticipacion: `Necesita ${REGLAS.anticipacionMin} minutos de anticipación`,
  superpuesta: "Se superpone con otra reserva tuya",
  tope: `Llegaste al tope de ${REGLAS.topePorEspacio} reservas en este espacio`,
};

export const activas = (reservas: Reserva[] = RESERVAS, unidad = RESIDENTE.unidad) =>
  reservas.filter((r) => r.unidad === unidad && r.estado === "confirmada");

export function diaCon(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export const dias = () =>
  Array.from({ length: REGLAS.ventanaDias }, (_, n) => diaCon(n));

const cruza = (a: Franja, b: { inicio: string; fin: string }) =>
  a.inicio < new Date(b.fin) && new Date(b.inicio) < a.fin;

/** Turnos de un espacio en un día, con por qué cada uno está o no disponible. */
export function turnos(espacio: Espacio, dia: Date, reservas: Reserva[] = RESERVAS): Turno[] {
  const recursos = RECURSOS.filter((r) => r.espacioId === espacio.id);
  const enServicio = recursos.filter((r) => r.estado === "disponible");
  const mias = activas(reservas);
  const enEsteEspacio = mias.filter(
    (r) => RECURSOS.find((x) => x.id === r.recursoId)?.espacioId === espacio.id
  );
  const ahora = new Date();
  const lista: Turno[] = [];

  for (let m = espacio.aperturaMin; m + espacio.bloqueMin <= espacio.cierreMin; m += espacio.bloqueMin) {
    const inicio = new Date(dia);
    inicio.setMinutes(m);
    const fin = new Date(inicio.getTime() + espacio.bloqueMin * 60000);
    const franja: Franja = { inicio, fin };

    const cruzadas = reservas.filter((r) => r.estado === "confirmada" && cruza(franja, r));
    const tomados = cruzadas.map((r) => r.recursoId);

    const libres = enServicio.filter((r) => !tomados.includes(r.id));
    const ocupados = enServicio.filter((r) => tomados.includes(r.id));
    const ocupaciones: Ocupacion[] = ocupados
      .map((rec) => {
        const r = cruzadas.find((x) => x.recursoId === rec.id)!;
        return { recurso: rec, unidad: r.unidad, por: r.creadaPor };
      });

    let bloqueo: MotivoBloqueo | null = null;
    if (fin <= ahora) bloqueo = "pasada";
    else if (inicio.getTime() - ahora.getTime() < REGLAS.anticipacionMin * 60000) bloqueo = "anticipacion";
    else if (enEsteEspacio.length >= REGLAS.topePorEspacio) bloqueo = "tope";
    else if (mias.some((r) => cruza(franja, r))) bloqueo = "superpuesta";
    else if (libres.length === 0) bloqueo = "ocupada";

    lista.push({ franja, libres, ocupados, ocupaciones, bloqueo });
  }
  return lista;
}

/** Cuántos turnos quedan disponibles ese día — para marcar el calendario. */
export const cupoDelDia = (espacio: Espacio, dia: Date, reservas: Reserva[] = RESERVAS) =>
  turnos(espacio, dia, reservas).filter((t) => !t.bloqueo).length;

/** Cuántos turnos tiene el día en total, disponibles o no. */
export const turnosDelDia = (espacio: Espacio, dia: Date) =>
  Math.max(1, Math.floor((espacio.cierreMin - espacio.aperturaMin) / espacio.bloqueMin));

/* ── calendario de mes ────────────────────────────────────────────────
   Seis filas de siete días, empezando en lunes. Los días de otro mes
   vienen marcados para poder atenuarlos sin sacarlos de la grilla. */

export type Celda = { fecha: Date; delMes: boolean; dentroDeVentana: boolean };

export function mesDe(ancla: Date): Celda[] {
  const primero = new Date(ancla.getFullYear(), ancla.getMonth(), 1);
  const desplazamiento = (primero.getDay() + 6) % 7;   // lunes = 0
  const arranque = new Date(primero);
  arranque.setDate(primero.getDate() - desplazamiento);

  const hoy = diaCon(0);
  const ultimo = diaCon(REGLAS.ventanaDias - 1);

  return Array.from({ length: 42 }, (_, n) => {
    const f = new Date(arranque);
    f.setDate(arranque.getDate() + n);
    f.setHours(0, 0, 0, 0);
    return {
      fecha: f,
      delMes: f.getMonth() === ancla.getMonth(),
      dentroDeVentana: f >= hoy && f <= ultimo,
    };
  });
}

export const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/* ── formato ──────────────────────────────────────────────────────── */
/* Sin timeZone fija: las fechas se construyen en la zona del navegador,
   así que hay que formatearlas en la misma. Fijar una zona acá desfasaba
   todo tres horas. */
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-AR", o);

export const hora = (d: Date) =>
  fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
export const rango = (f: Franja) => `${hora(f.inicio)}–${hora(f.fin)}`;
export const diaCorto = (d: Date) => fmt({ weekday: "short" }).format(d).replace(".", "");
export const numDia = (d: Date) => fmt({ day: "numeric" }).format(d);
export const mesCorto = (d: Date) =>
  fmt({ month: "short" }).format(d).replace(".", "").replace("sept", "sep");
/** "25 sep": el día de una reserva, sin el día de la semana. */
export const diaYMes = (d: Date) => `${numDia(d)} ${mesCorto(d)}`;
export const mesLargo = (d: Date) => {
  const t = fmt({ month: "long", year: "numeric" }).format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const esHoy = (d: Date) => d.toDateString() === new Date().toDateString();

export const diaEnPalabras = (d: Date) =>
  esHoy(d) ? "Hoy" : `${diaCorto(d)} ${numDia(d)} ${mesCorto(d)}`;

export function cuandoLargo(r: Reserva) {
  const i = new Date(r.inicio);
  const f = new Date(r.fin);
  return `${diaEnPalabras(i)} · ${hora(i)}–${hora(f)}`;
}

/** Igual que cuandoLargo pero sólo con la hora de inicio, que es lo que
 *  muestra la fila del home en el layout aprobado. */
export function cuandoCorto(r: Reserva) {
  const i = new Date(r.inicio);
  return `${diaEnPalabras(i)} · ${hora(i)}`;
}

export const proximas = (reservas: Reserva[] = RESERVAS, unidad = RESIDENTE.unidad) =>
  reservas
    .filter((r) => r.unidad === unidad && r.estado === "confirmada" && new Date(r.fin) >= new Date())
    .sort((a, b) => a.inicio.localeCompare(b.inicio));

export const historial = (reservas: Reserva[] = RESERVAS, unidad = RESIDENTE.unidad) =>
  reservas
    .filter((r) => r.unidad === unidad && (r.estado !== "confirmada" || new Date(r.fin) < new Date()))
    .sort((a, b) => b.inicio.localeCompare(a.inicio));

/** Historial de todo el edificio, no sólo de la unidad. Sirve para saber
 *  cuánto se usan los espacios y para reclamar un turno que quedó mal. */
export const historialEdificio = (reservas: Reserva[] = RESERVAS) =>
  reservas
    .filter((r) => r.estado !== "confirmada" || new Date(r.fin) < new Date())
    .sort((a, b) => b.inicio.localeCompare(a.inicio));

export const espacioPorId = (id: string) => ESPACIOS.find((e) => e.id === id)!;

/** Espacios sin foto propia en el repo. La lavandería usaba la del cowork,
 *  que es otro lugar: mientras no llegue una va en carbón con su ícono.
 *  Mejor ningún lugar que el lugar equivocado. */
export const SIN_FOTO = new Set(["lavanderia"]);

/** Primer día con lugar después de `desde`, dentro de la ventana de
 *  reserva. Para que una card de espacio lleno diga cuándo sí hay. */
export function proximoLibre(espacio: Espacio, desde: Date, reservas: Reserva[] = RESERVAS) {
  for (let n = 1; n <= REGLAS.ventanaDias; n++) {
    const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + n);
    if (cupoDelDia(espacio, d, reservas) > 0) return d;
  }
  return null;
}

/* Re-exportados desde acá porque las pantallas de reservas los piden a este
   módulo y no a data: así el import de una pantalla es uno solo. */
export { espacioDe, recursoDe } from "./data";
