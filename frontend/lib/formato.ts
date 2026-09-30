/** Formato. Sin librerías de fecha ni de moneda: Intl y aritmética de minutos.
 *  Todo en es-AR, que es la locale del producto. */

const nf = (o: Intl.NumberFormatOptions) => new Intl.NumberFormat("es-AR", o);
const df = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-AR", o);

/** $ 184.250 — sin centavos, que en expensas no aportan nada. */
export const pesos = (n: number) =>
  nf({ style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/** 184.250 — el mismo número sin el signo, para tablas. */
export const numero = (n: number) =>
  nf({ maximumFractionDigits: 0 }).format(n);

export const porciento = (n: number) =>
  nf({ maximumFractionDigits: 1 }).format(n) + "%";

/** "2026-09" → "Septiembre 2026" */
export function periodoLargo(periodo: string) {
  const [a, m] = periodo.split("-").map(Number);
  const d = new Date(a, m - 1, 1);
  const t = df({ month: "long", year: "numeric" }).format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "2026-09" → "Sep 2026" */
export function periodoCorto(periodo: string) {
  const [a, m] = periodo.split("-").map(Number);
  const d = new Date(a, m - 1, 1);
  const t = df({ month: "short", year: "numeric" }).format(d).replace(".", "").replace("sept", "sep");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Corre un período N meses: ("2026-09", -1) → "2026-08" */
export function correrPeriodo(periodo: string, meses: number) {
  const [a, m] = periodo.split("-").map(Number);
  const d = new Date(a, m - 1 + meses, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const periodoActual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** ISO → "14 sep 2026" */
export const fechaCorta = (iso: string) =>
  df({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)).replace(".", "").replace("sept", "sep");

/** ISO → "14 sept" — para el vencimiento en primer nivel, donde el año
 *  sobra: si vence este mes, nadie duda de qué año es. */
export const diaMes = (iso: string) =>
  df({ day: "numeric", month: "short" }).format(new Date(iso)).replace(".", "").replace("sept", "sep");

/** ISO → "14 de septiembre" */
export const fechaLarga = (iso: string) =>
  df({ day: "numeric", month: "long" }).format(new Date(iso));

/** ISO → "14 sep · 14:20" */
export const fechaHora = (iso: string) => {
  const d = new Date(iso);
  return `${df({ day: "numeric", month: "short" }).format(d).replace(".", "").replace("sept", "sep")} · ${
    df({ hour: "2-digit", minute: "2-digit", hour12: false }).format(d)}`;
};

export const soloHora = (iso: string) =>
  df({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

/** "hace 18 min" / "hace 2 h" / "ayer" / "14 sep" — sin librería. */
export function hace(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  return fechaCorta(iso);
}

/** Días que faltan para una fecha. Negativo = ya pasó. */
export function diasHasta(iso: string) {
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/** "Vence en 6 días" / "Venció hace 3 días" / "Vence hoy" */
export function vencimientoEnPalabras(iso: string) {
  const d = diasHasta(iso);
  if (d === 0) return "Vence hoy";
  if (d === 1) return "Vence mañana";
  if (d > 1) return `Vence en ${d} días`;
  if (d === -1) return "Venció ayer";
  return `Venció hace ${Math.abs(d)} días`;
}

/** ISO de hoy corrido N días, a una hora dada. Para datos ficticios que
 *  siempre quedan coherentes con la fecha en que se abre el prototipo. */
export function isoDesdeHoy(dias: number, hora = 9, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString();
}
