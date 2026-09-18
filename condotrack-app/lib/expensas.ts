/** Expensas y gastos del consorcio.
 *
 *  AMPLIACIÓN DE ALCANCE — este módulo no existe en la documentación del
 *  proyecto (ni en 05_INFORMATION_ARCHITECTURE ni en 06_UX_UI_SCOPE). Se
 *  agrega por pedido explícito del diseñador. Ver 10_DECISION_LOG D-007.
 *
 *  Los rubros son los ocho que fijó el pedido y no se tocan. Los importes
 *  son ficticios pero cierran: la suma de los detalles da el total del
 *  rubro, y la suma de los rubros da el total del período. Si no cerraran,
 *  la pantalla de gastos sería una decoración. */

import {
  correrPeriodo, diasHasta, periodoActual, periodoLargo, pesos,
  vencimientoEnPalabras,
} from "./formato";
import { RESIDENTE, type Aviso } from "./data";

/* ── tipos ───────────────────────────────────────────────────────── */

export type EstadoExpensa = "pendiente" | "pagada" | "vencida";

export type Expensa = {
  id: string;
  unidad: string;
  periodo: string;          // "2026-09"
  total: number;
  vencimiento: string;      // ISO
  estado: EstadoExpensa;
  pagadaEl?: string;        // ISO
  medioPago?: string;
};

export type RubroGasto = { id: string; nombre: string; monto: number };

export type GastoDetalle = {
  id: string;
  rubroId: string;
  proveedor: string;
  concepto: string;
  monto: number;
  fecha: string;            // ISO
  comprobante?: string;     // número de factura
};

export type MedioPago = {
  tipo: "transferencia" | "debito" | "presencial";
  titular: string;
  cbu?: string;
  alias?: string;
  banco?: string;
  nota?: string;
};

/** Lo que el residente declara cuando informa un pago. Queda pendiente de
 *  confirmación por administración: informar no es pagar. */
export type PagoInformado = {
  id: string;
  periodo: string;
  importe: number;
  fecha: string;            // ISO del pago declarado
  medio: MedioPago["tipo"];
  comprobante?: string;     // nombre del archivo adjunto
  informadoEl: string;
  estado: "informado" | "confirmado" | "rechazado";
};

/* ── períodos ────────────────────────────────────────────────────── */

export const PERIODO = periodoActual();
const P = (n: number) => correrPeriodo(PERIODO, n);

/** Vencimiento: día 20 del período. */
function vence(periodo: string) {
  const [a, m] = periodo.split("-").map(Number);
  return new Date(a, m - 1, 20, 0, 0, 0, 0).toISOString();
}
function pagoEl(periodo: string, dia: number) {
  const [a, m] = periodo.split("-").map(Number);
  return new Date(a, m - 1, dia, 11, 30, 0, 0).toISOString();
}

/* ── expensas de la unidad 7D ────────────────────────────────────── */

export const EXPENSAS: Expensa[] = [
  { id: "x0", unidad: RESIDENTE.unidad, periodo: P(0),  total: 184250, vencimiento: vence(P(0)),  estado: "pendiente" },
  { id: "x1", unidad: RESIDENTE.unidad, periodo: P(-1), total: 171900, vencimiento: vence(P(-1)), estado: "pagada", pagadaEl: pagoEl(P(-1), 18), medioPago: "Transferencia" },
  { id: "x2", unidad: RESIDENTE.unidad, periodo: P(-2), total: 168400, vencimiento: vence(P(-2)), estado: "pagada", pagadaEl: pagoEl(P(-2), 20), medioPago: "Débito automático" },
  { id: "x3", unidad: RESIDENTE.unidad, periodo: P(-3), total: 159750, vencimiento: vence(P(-3)), estado: "pagada", pagadaEl: pagoEl(P(-3), 15), medioPago: "Transferencia" },
  { id: "x4", unidad: RESIDENTE.unidad, periodo: P(-4), total: 155200, vencimiento: vence(P(-4)), estado: "pagada", pagadaEl: pagoEl(P(-4), 19), medioPago: "Presencial en recepción" },
  { id: "x5", unidad: RESIDENTE.unidad, periodo: P(-5), total: 151000, vencimiento: vence(P(-5)), estado: "pagada", pagadaEl: pagoEl(P(-5), 12), medioPago: "Transferencia" },
];

export const expensaDelMes = () => EXPENSAS[0];
export const expensaDe = (periodo: string) => EXPENSAS.find((e) => e.periodo === periodo);

/** Saldo de la unidad: lo que no está pagado. */
export const saldoUnidad = () =>
  EXPENSAS.filter((e) => e.estado !== "pagada").reduce((a, e) => a + e.total, 0);

/* ── desglose de la expensa de la unidad ─────────────────────────── */

export type LineaExpensa = { concepto: string; detalle: string; monto: number };

/** Prorrateo del edificio (participación de la unidad) + lo propio. */
export const DESGLOSE: { comunes: LineaExpensa[]; propios: LineaExpensa[] } = {
  comunes: [
    { concepto: "Gastos comunes del período", detalle: "Participación de la unidad: 1,897%", monto: 178900 },
  ],
  propios: [
    { concepto: "Lavandería", detalle: "4 turnos usados en el período", monto: 3600 },
    { concepto: "Cochera fija", detalle: "Cochera 12 · subsuelo", monto: 1750 },
  ],
};

export const PARTICIPACION = 1.897;

/* ── gastos del consorcio ────────────────────────────────────────── */

/** Los ocho rubros fijos. El orden es el del pedido, no el del monto: la
 *  torta ya ordena por tamaño, la leyenda no tiene por qué. */
export const RUBROS: RubroGasto[] = [
  { id: "sueldos",    nombre: "Sueldos y cargas",         monto: 3120000 },
  { id: "servicios",  nombre: "Servicios públicos",       monto: 1485600 },
  { id: "abonos",     nombre: "Abono de servicios",       monto: 1246000 },
  { id: "obras",      nombre: "Obras y mejoras",          monto: 1640000 },
  { id: "honorarios", nombre: "Honorarios profesionales", monto: 820000 },
  { id: "seguros",    nombre: "Seguros",                  monto: 486400 },
  { id: "bancarios",  nombre: "Gastos bancarios",         monto: 309600 },
  { id: "amenities",  nombre: "Amenities",                monto: 604800 },
];

/** Ícono por rubro. Lo usa la card de expensa del home para anticipar el
 *  desglose sin obligar a entrar, y la leyenda de la torta. */
export const ICONO_RUBRO: Record<string, string> = {
  sueldos: "personas",
  servicios: "rayo",
  abonos: "herramienta",
  obras: "obra",
  honorarios: "maletin",
  seguros: "escudo",
  bancarios: "banco",
  amenities: "chispa",
};

/** Nombre largo del rubro, para cuando hace falta desambiguar. */
export const RUBRO_LARGO: Record<string, string> = {
  obras: "Obras y mejoras extraordinarias",
  abonos: "Abono de servicios",
  sueldos: "Sueldos y cargas sociales",
};

const g = (
  id: string, rubroId: string, proveedor: string, concepto: string,
  monto: number, dia: number, comprobante: string
): GastoDetalle => {
  const [a, m] = PERIODO.split("-").map(Number);
  return {
    id, rubroId, proveedor, concepto, monto,
    fecha: new Date(a, m - 1, dia, 10, 0, 0, 0).toISOString(),
    comprobante,
  };
};

export const GASTOS: GastoDetalle[] = [
  g("g01", "sueldos", "Encargado · Raúl Giménez", "Sueldo y cargas sociales", 1980000, 5, "REC 00412"),
  g("g02", "sueldos", "Suplente de fin de semana", "Jornales del período", 640000, 5, "REC 00413"),
  g("g03", "sueldos", "SUTERH", "Aportes y contribuciones", 500000, 8, "F 0004-00091823"),

  g("g04", "servicios", "Edenor", "Luz de espacios comunes", 612400, 3, "F B-0021-0044119"),
  g("g05", "servicios", "AySA", "Agua y saneamiento", 398200, 4, "F B-0007-0091220"),
  g("g06", "servicios", "Metrogas", "Gas · calderas del edificio", 475000, 6, "F B-0013-0077410"),

  g("g07", "abonos", "Ascensores Milano", "Abono mensual · 2 equipos", 486000, 2, "F A-0003-0001987"),
  g("g08", "abonos", "Limpieza Nordeste SRL", "Limpieza de palieres y hall", 395000, 2, "F A-0011-0005522"),
  g("g09", "abonos", "Seguridad Vigía", "Monitoreo de cámaras", 215000, 7, "F A-0002-0003310"),
  g("g10", "abonos", "Fumigación Delta", "Desinsectación trimestral", 150000, 9, "F A-0001-0000874"),

  g("g11", "obras", "Impermeabilizaciones Sur", "Terraza · cuota 2 de 4", 1100000, 10, "F A-0005-0000231"),
  g("g12", "obras", "Clima Sur SRL", "Recambio de bomba presurizadora", 540000, 11, "F A-0008-0001102"),

  g("g13", "honorarios", "Estudio Aráoz", "Honorarios de administración", 620000, 1, "F C-0001-0002240"),
  g("g14", "honorarios", "Dra. Paula Rivas", "Asesoría legal · consulta", 200000, 9, "F C-0004-0000118"),

  g("g15", "seguros", "La Segunda", "Seguro integral de consorcio", 486400, 1, "P 8891-224417"),

  g("g16", "bancarios", "Banco Galicia", "Mantenimiento de cuenta", 128600, 1, "RES 0091"),
  g("g17", "bancarios", "Banco Galicia", "Comisiones de cobranza", 181000, 12, "RES 0114"),

  g("g18", "amenities", "Fibertel Empresas", "Internet del cowork", 214800, 3, "F B-0044-0012908"),
  g("g19", "amenities", "Mobiliaria Ítaca", "SUM · reposición de sillas", 180000, 8, "F A-0006-0000445"),
  g("g20", "amenities", "Service Drean", "Lavandería · service de lavarropas", 210000, 11, "F A-0009-0000772"),
];

export const TOTAL_GASTOS = RUBROS.reduce((a, r) => a + r.monto, 0);

export const rubroPorId = (id: string) => RUBROS.find((r) => r.id === id);
export const gastosDeRubro = (rubroId: string) =>
  GASTOS.filter((x) => x.rubroId === rubroId).sort((a, b) => b.monto - a.monto);

export type Agrupado = { clave: string; total: number; items: GastoDetalle[] };

export function porProveedor(): Agrupado[] {
  const mapa = new Map<string, GastoDetalle[]>();
  for (const x of GASTOS) {
    const l = mapa.get(x.proveedor) ?? [];
    l.push(x);
    mapa.set(x.proveedor, l);
  }
  return [...mapa.entries()]
    .map(([clave, items]) => ({ clave, items, total: items.reduce((a, i) => a + i.monto, 0) }))
    .sort((a, b) => b.total - a.total);
}

/** Meses del selector de período. Sólo el mes en curso tiene el detalle
 *  cargado; de los anteriores se muestra el total y se dice que el detalle
 *  no está en el prototipo. Inventar seis meses de facturas sería mentir. */
export const PERIODOS_GASTOS = [P(0), P(-1), P(-2), P(-3), P(-4), P(-5)];

export const TOTAL_POR_PERIODO: Record<string, number> = {
  [P(0)]: TOTAL_GASTOS,
  [P(-1)]: 9062000,
  [P(-2)]: 8875400,
  [P(-3)]: 8421000,
  [P(-4)]: 8180600,
  [P(-5)]: 7960200,
};

export const hayDetalle = (periodo: string) => periodo === PERIODO;

/* ── medios de pago ──────────────────────────────────────────────── */

export const MEDIOS_PAGO: MedioPago[] = [
  {
    tipo: "transferencia",
    titular: "Consorcio Edificio Aráoz 1280",
    cbu: "0070123420000012345678",
    alias: "ARAOZ.1280.EXP",
    banco: "Banco Galicia · Cta. corriente 1234-5 012/0",
    nota: "Poné el número de unidad en la referencia de la transferencia.",
  },
  {
    tipo: "debito",
    titular: "Consorcio Edificio Aráoz 1280",
    cbu: "0070123420000012345678",
    nota: "El débito se adhiere desde el home banking con el CBU del consorcio. Se debita el día 20 de cada mes.",
  },
  {
    tipo: "presencial",
    titular: "Recepción · Diego Sosa",
    nota: "Recepción recibe pagos en efectivo de lunes a viernes de 09:00 a 18:00 y entrega recibo en el momento.",
  },
];

export const ROTULO_MEDIO: Record<MedioPago["tipo"], string> = {
  transferencia: "Transferencia bancaria",
  debito: "Débito automático",
  presencial: "Pago presencial",
};

/* ── nombres de los archivos que generaría el sistema real ───────── */

export const archivoCupon = (periodo: string) =>
  "CondoTrack_Cupon_Araoz1280_" + RESIDENTE.unidad + "_" + periodo + ".pdf";
export const archivoRendicion = (periodo: string) =>
  "CondoTrack_Rendicion_Araoz1280_" + periodo + ".pdf";
export const archivoComprobante = (gasto: GastoDetalle) =>
  "CondoTrack_Comprobante_" + (gasto.comprobante ?? gasto.id).replace(/[^A-Za-z0-9]/g, "") + ".pdf";
export const archivoEstadoCuenta = () =>
  "CondoTrack_EstadoDeCuenta_Araoz1280_" + RESIDENTE.unidad + ".pdf";
export const archivoMedios = () => "CondoTrack_MediosDePago_Araoz1280.pdf";


/* ── avisos de expensa ───────────────────────────────────────────────
   Se arman con la fecha de vencimiento real en vez de estar escritos a
   mano: si el aviso dijera "vence en 6 días" un mes después, el
   prototipo estaría mintiendo. */

export function avisosExpensa(pagada = false): Aviso[] {
  const e = expensaDelMes();
  const faltan = diasHasta(e.vencimiento);
  const lista: Aviso[] = [
    {
      id: "nx1", icono: "documento",
      titulo: "Expensa del mes disponible",
      cuando: "Hace 3 h",
      desc: `${periodoLargo(e.periodo)} · ${pesos(e.total)} · ya podés ver la rendición`,
      estado: "leida", va: "r20",
    },
  ];

  if (pagada || e.estado === "pagada") return lista;

  if (faltan < 0) {
    lista.unshift({
      id: "nx2", icono: "alerta",
      titulo: "La expensa venció",
      cuando: "Hoy",
      desc: `${vencimientoEnPalabras(e.vencimiento)} · ${pesos(e.total)}`,
      estado: "sinleer", va: "r20",
    });
  } else if (faltan <= 7) {
    lista.unshift({
      id: "nx2", icono: "reloj",
      titulo: "La expensa está por vencer",
      cuando: "Hoy",
      desc: `${vencimientoEnPalabras(e.vencimiento)} · ${pesos(e.total)}`,
      estado: "sinleer", va: "r20",
    });
  }

  return lista;
}
