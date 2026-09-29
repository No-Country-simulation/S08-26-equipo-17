/** Datos del edificio para los perfiles operativos.
 *
 *  Recepción ve el edificio en el que está parada. Administración ve todos
 *  los edificios de la cartera. Es la misma estructura, con distinto
 *  alcance: EDIFICIO → UNIDAD → PERSONA → OPERACIÓN. */

import { EDIFICIO, RECEPCION, RESIDENTE, type Visita } from "./data";
import { isoDesdeHoy } from "./formato";
import { PERSONAS, type PermisoPermanente } from "./unidad";

/* ── edificios de la administración ──────────────────────────────── */

export type Edificio = {
  id: string;
  nombre: string;
  direccion: string;
  unidades: number;
  ocupadas: number;
  recepcion: string;
  encargado: string;
  alDia: number;          // unidades sin deuda
  reclamosAbiertos: number;
  activo: boolean;        // el que se está mirando
};

export const EDIFICIOS: Edificio[] = [
  { id: "araoz", nombre: EDIFICIO.nombre, direccion: "Aráoz 1280 · Palermo",
    unidades: 24, ocupadas: 23, recepcion: RECEPCION.nombre, encargado: "Raúl Giménez",
    alDia: 19, reclamosAbiertos: 3, activo: true },
  { id: "gorriti", nombre: "Gorriti 4455", direccion: "Gorriti 4455 · Palermo",
    unidades: 18, ocupadas: 18, recepcion: "Sin recepción", encargado: "Norberto Paz",
    alDia: 16, reclamosAbiertos: 1, activo: false },
  { id: "dorrego", nombre: "Dorrego 2010", direccion: "Dorrego 2010 · Chacarita",
    unidades: 32, ocupadas: 29, recepcion: "Carla Domínguez", encargado: "Sergio Luna",
    alDia: 21, reclamosAbiertos: 5, activo: false },
];

export const edificioActivo = () => EDIFICIOS[0];

/* ── unidades ────────────────────────────────────────────────────── */

export type EstadoCuenta = "al-dia" | "debe" | "informado";

export type Unidad = {
  codigo: string;
  piso: number;
  ambientes: string;
  metros: number;
  residentes: string[];
  telefono?: string;
  cuenta: EstadoCuenta;
  saldo: number;
  cochera?: string;
};

const u = (
  codigo: string, piso: number, amb: string, metros: number,
  residentes: string[], cuenta: EstadoCuenta, saldo: number, telefono?: string
): Unidad => ({ codigo, piso, ambientes: amb, metros, residentes, cuenta, saldo, telefono });

export const UNIDADES: Unidad[] = [
  u("1A", 1, "2 ambientes", 48, ["Noelia Brizuela"], "al-dia", 0, "+54 9 11 4422 1180"),
  u("1B", 1, "2 ambientes", 46, ["Hernán Costa"], "debe", 168400, "+54 9 11 5533 7712"),
  u("2A", 2, "3 ambientes", 71, ["Verónica Ruiz", "Andrés Ruiz"], "al-dia", 0, "+54 9 11 6612 0043"),
  u("2B", 2, "1 ambiente", 34, ["Iván Petrov"], "al-dia", 0),
  u("3A", 3, "3 ambientes", 70, ["Delia Ferrari"], "al-dia", 0),
  u("3B", 3, "3 ambientes", 72, ["Nicolás Duarte", "Paula Duarte"], "informado", 171900, "+54 9 11 3344 8890"),
  u("4A", 4, "2 ambientes", 52, ["Gonzalo Rivas"], "al-dia", 0),
  u("4B", 4, "2 ambientes", 50, ["Marina Olivera"], "debe", 342100, "+54 9 11 2299 4417"),
  u("5A", 5, "3 ambientes", 74, ["Esteban Cáceres"], "al-dia", 0),
  u("5B", 5, "3 ambientes", 73, ["Luciana Ponce", "Bruno Ponce"], "al-dia", 0),
  u("5C", 5, "2 ambientes", 55, ["Nicolás Duarte"], "al-dia", 0),
  u("6A", 6, "3 ambientes", 74, ["Roxana Vidal"], "al-dia", 0),
  u("6B", 6, "3 ambientes", 72, ["Matías Herrera"], "debe", 184250),
  u("7A", 7, "2 ambientes", 51, ["Silvia Nardi"], "al-dia", 0),
  u("7B", 7, "2 ambientes", 53, ["Pablo Sarmiento"], "al-dia", 0),
  u("7C", 7, "3 ambientes", 70, ["Ana Belén Ortiz"], "al-dia", 0),
  u("7D", 7, "3 ambientes", 74, PERSONAS.map((p) => p.nombre), "debe", 184250, "+54 9 11 5544 8812"),
  u("8A", 8, "3 ambientes", 75, ["Ricardo Maidana"], "al-dia", 0),
  u("8D", 8, "3 ambientes", 74, ["Elsa Quiroga"], "al-dia", 0),
  u("9A", 9, "4 ambientes", 96, ["Familia Sandoval"], "al-dia", 0),
  u("9B", 9, "3 ambientes", 74, ["Tamara Leiva"], "al-dia", 0),
  u("10A", 10, "4 ambientes", 98, ["Jorge Dalmau"], "al-dia", 0),
  u("11C", 11, "3 ambientes", 76, ["Cecilia Arteaga"], "debe", 359600),
  u("12A", 12, "5 ambientes", 142, ["Familia Pizarro"], "al-dia", 0, "+54 9 11 7788 2201"),
];

export const unidadPorCodigo = (c: string) =>
  UNIDADES.find((x) => x.codigo.toLowerCase() === c.toLowerCase());

/** Buscar por unidad o por persona: es la búsqueda que necesita recepción,
 *  porque quien llega dice "vengo a lo de Osorio", no "vengo al 7D". */
export function buscarUnidades(q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return UNIDADES;
  return UNIDADES.filter(
    (x) =>
      x.codigo.toLowerCase().includes(t) ||
      String(x.piso) === t ||
      x.residentes.some((r) => r.toLowerCase().includes(t))
  );
}

/* ── quién está adentro ──────────────────────────────────────────────
   Derivado: una visita con ingreso registrado y sin egreso está adentro.
   No es una lista aparte que haya que mantener sincronizada. */

export type Adentro = {
  id: string; nombre: string; unidad: string;
  desde: string; motivo: string;
};

export function quienEstaAdentro(visitas: Visita[], permisos: PermisoPermanente[]): Adentro[] {
  const deVisitas = visitas
    .filter((v) => v.ingresoEl && !v.egresoEl)
    .map((v) => ({
      id: v.id, nombre: v.nombre, unidad: v.unidad,
      desde: v.ingresoEl!, motivo: `Pase ${v.codigo}`,
    }));

  /* El permiso permanente que entró hoy y no salió. En el prototipo hay
     uno fijo para que la pantalla no arranque vacía. */
  const dePermisos = permisos
    .filter((p) => p.activo && p.id === "pp1")
    .map((p) => ({
      id: p.id, nombre: p.nombre, unidad: RESIDENTE.unidad,
      desde: isoDesdeHoy(0, 8, 12), motivo: "Permiso permanente",
    }));

  return [...deVisitas, ...dePermisos].sort((a, b) => b.desde.localeCompare(a.desde));
}

/* ── incidencias operativas (P07 · A12) ──────────────────────────── */

export type Gravedad = "baja" | "media" | "alta";
export type EstadoIncidencia = "abierta" | "derivada" | "cerrada";

export type Incidencia = {
  id: string;
  titulo: string;
  lugar: string;
  detalle: string;
  gravedad: Gravedad;
  estado: EstadoIncidencia;
  cuando: string;
  reportadaPor: string;
  derivadaA?: string;
};

export const ROTULO_GRAVEDAD: Record<Gravedad, string> = {
  baja: "Baja", media: "Media", alta: "Alta",
};

export const INCIDENCIAS: Incidencia[] = [
  { id: "in1", titulo: "Pérdida de agua en el subsuelo", lugar: "Subsuelo · sala de bombas",
    detalle: "Charco debajo de la bomba nueva. No crece, pero moja el paso.",
    gravedad: "alta", estado: "derivada", cuando: isoDesdeHoy(0, 7, 40),
    reportadaPor: RECEPCION.nombre, derivadaA: "Clima Sur SRL" },
  { id: "in2", titulo: "Luz quemada en el palier del 4", lugar: "Palier piso 4",
    detalle: "Tubo del fondo. Queda medio oscuro de noche.",
    gravedad: "baja", estado: "abierta", cuando: isoDesdeHoy(-1, 19, 10),
    reportadaPor: "Raúl Giménez" },
  { id: "in3", titulo: "Portón de cocheras traba al cerrar", lugar: "Subsuelo · portón",
    detalle: "Frena a mitad de camino y hay que darle otra vez al control.",
    gravedad: "media", estado: "abierta", cuando: isoDesdeHoy(-2, 9, 25),
    reportadaPor: RECEPCION.nombre },
  { id: "in4", titulo: "Ruido de obra fuera de horario", lugar: "Unidad 8D",
    detalle: "Trabajaron hasta las 22:30 un martes. Se avisó al residente.",
    gravedad: "media", estado: "cerrada", cuando: isoDesdeHoy(-8, 22, 40),
    reportadaPor: RECEPCION.nombre },
];

export const LUGARES = [
  "Hall de entrada", "Palier piso 1", "Palier piso 4", "Ascensor Torre A",
  "Ascensor Torre B", "Terraza", "SUM", "Cowork", "Lavandería",
  "Subsuelo · cocheras", "Subsuelo · sala de bombas", "Subsuelo · portón",
  "Fachada", "Otro",
];

/* ── agenda operativa del día (P08) ──────────────────────────────── */

export type TipoAgenda = "reserva" | "proveedor" | "mudanza" | "visita" | "tarea";

export type ItemAgenda = {
  id: string;
  hora: string;         // ISO
  tipo: TipoAgenda;
  titulo: string;
  unidad?: string;
  detalle?: string;
  hecho?: boolean;
};

export const ROTULO_AGENDA: Record<TipoAgenda, string> = {
  reserva: "Reserva", proveedor: "Proveedor", mudanza: "Mudanza",
  visita: "Visita", tarea: "Tarea",
};

export const AGENDA: ItemAgenda[] = [
  { id: "ag1", hora: isoDesdeHoy(0, 8, 0), tipo: "tarea", titulo: "Apertura y recorrida de espacios comunes",
    hecho: true },
  { id: "ag2", hora: isoDesdeHoy(0, 9, 0), tipo: "reserva", titulo: "Lavandería · 3 máquinas tomadas",
    detalle: "Unidades 3B, 12A y 5C", hecho: true },
  { id: "ag3", hora: isoDesdeHoy(0, 11, 0), tipo: "proveedor", titulo: "Ascensores Milano · visita técnica",
    detalle: "Ascensor Torre A · reclamo RC-0231", hecho: true },
  { id: "ag4", hora: isoDesdeHoy(0, 14, 0), tipo: "mudanza", titulo: "Mudanza de salida", unidad: "8A",
    detalle: "Autorizada hasta las 18:00 · ascensor de servicio" },
  { id: "ag5", hora: isoDesdeHoy(0, 18, 30), tipo: "visita", titulo: "Martín López", unidad: RESIDENTE.unidad,
    detalle: "Pase CT 7D 4821 · hasta las 23:30" },
  { id: "ag6", hora: isoDesdeHoy(0, 20, 30), tipo: "reserva", titulo: "SUM", unidad: RESIDENTE.unidad,
    detalle: "20:30 a 22:30 · entrega de llave en recepción" },
  { id: "ag7", hora: isoDesdeHoy(0, 22, 0), tipo: "tarea", titulo: "Cierre de terraza y control de luces" },
];

/* ── avisos del día para recepción ───────────────────────────────── */

export const AVISOS_RECEPCION = [
  { id: "ar1", texto: "Corte de agua programado el sábado de 09:00 a 13:00. Avisar a quien pregunte.", tono: "info" as const },
  { id: "ar2", texto: "Lavarropas 3 fuera de servicio desde el 11/09. No entregar ficha.", tono: "alerta" as const },
  { id: "ar3", texto: "La 11C tiene expensas impagas de dos períodos. Derivar a administración si consulta.", tono: "info" as const },
];
