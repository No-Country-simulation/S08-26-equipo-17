/** Datos y selectores de Administración (R1.7).
 *
 *  Todo lo que Administración muestra sale del mismo estado que usan
 *  Residente y Recepción (lib/estado). Acá sólo viven:
 *   · los selectores que proyectan ese estado para supervisar;
 *   · el MÍNIMO de datos demo que el prototipo no tenía y que la
 *     administración necesita para tener trabajo real que mostrar:
 *     solicitudes de reserva pendientes, pagos informados por otras
 *     unidades, el equipo y los proveedores. Son datos de prototipo, sin
 *     backend, sin banco ni conciliación real: decidir cambia el estado de
 *     la sesión y deja un registro de auditoría, nada más. */

import { EDIFICIO, RECEPCION, RESIDENTE, ADMINISTRACION, ESPACIOS, RECURSOS, type Reserva } from "./data";
import { UNIDADES, AGENDA, type Unidad } from "./edificio";
import { PERSONAS, ROTULO_VINCULO, type Vinculo } from "./unidad";
import { DOCUMENTOS, type Documento } from "./gestiones";
import { PERIODO } from "./expensas";
import { correrPeriodo, isoDesdeHoy } from "./formato";
import type { Estado } from "./estado";

/* ── equipo y proveedores ────────────────────────────────────────── */

export const EQUIPO = [
  { id: "eq1", nombre: ADMINISTRACION.nombre, rol: "Administración", detalle: ADMINISTRACION.estudio },
  { id: "eq2", nombre: "Raúl Giménez", rol: "Encargado", detalle: "Mantenimiento y espacios comunes" },
  { id: "eq3", nombre: RECEPCION.nombre, rol: "Recepción", detalle: RECEPCION.turno },
  { id: "eq4", nombre: "Carla Domínguez", rol: "Recepción", detalle: "Turno tarde · 15:00–23:00" },
];
export const PROVEEDORES = ["Clima Sur SRL", "Ascensores Milano", "Limpieza Nordeste SRL", "Impermeabilizaciones Sur", "Seguridad Vigía"];
/** A quién se le puede asignar un caso: personas del equipo o proveedores. */
export const RESPONSABLES = [...EQUIPO.map(e => e.nombre), ...PROVEEDORES];

/* ── solicitudes de reserva (espacios con aprobación manual) ─────────
   Las reservas del residente hoy se confirman solas; SUM y Parrilla
   también admiten pedidos que decide la administración. Dos pedidos
   pendientes, de otras unidades, para que A10 tenga qué decidir. */

export type SolicitudReserva = {
  id: string; recursoId: string; unidad: string;
  inicio: string; fin: string; pedidaPor: string; pedidaEl: string;
  motivo?: string; estado: "pendiente" | "aprobada" | "rechazada";
  decision?: { por: string; cuando: string; motivo?: string };
};
const h = (dias: number, hora: number, min = 0) => isoDesdeHoy(dias, hora, min);
export const SOLICITUDES: SolicitudReserva[] = [
  { id: "sr1", recursoId: "parrilla-1", unidad: "3A", inicio: h(2, 21), fin: h(3, 0), pedidaPor: "Delia Ferrari", pedidaEl: h(0, 8, 12),
    motivo: "Cumpleaños · 18 personas", estado: "pendiente" },
  { id: "sr2", recursoId: "sum-sala", unidad: "9B", inicio: h(3, 19), fin: h(3, 22), pedidaPor: "Tamara Leiva", pedidaEl: h(-1, 17, 40),
    motivo: "Reunión de consorcio de propietarios del piso 9", estado: "pendiente" },
];

/* ── pagos informados por las unidades ───────────────────────────────
   El residente del prototipo (7D) informa los suyos en lib/estado.pagos.
   Estos son los de otras unidades, para que la cobranza tenga cola. */

export type PagoUnidad = {
  id: string; unidad: string; periodo: string; importe: number; fecha: string;
  medio: "transferencia" | "debito" | "presencial"; comprobante?: string; informadoEl: string; informadoPor: string;
  estado: "informado" | "conciliado" | "rechazado";
  decision?: { por: string; cuando: string; motivo?: string };
};
export const PAGOS_UNIDADES: PagoUnidad[] = [
  { id: "pu1", unidad: "3B", periodo: PERIODO, importe: 171900, fecha: h(-1, 10, 5), medio: "transferencia", comprobante: "transferencia-3B.pdf",
    informadoEl: h(-1, 10, 12), informadoPor: "Nicolás Duarte", estado: "informado" },
  { id: "pu2", unidad: "6B", periodo: PERIODO, importe: 90000, fecha: h(0, 9, 30), medio: "transferencia", comprobante: "comprobante-6B.jpg",
    informadoEl: h(0, 9, 41), informadoPor: "Matías Herrera", estado: "informado" },
  { id: "pu3", unidad: "1A", periodo: PERIODO, importe: 118300, fecha: h(-3, 16, 0), medio: "debito",
    informadoEl: h(-3, 16, 0), informadoPor: "Sistema · débito", estado: "conciliado", decision: { por: ADMINISTRACION.nombre, cuando: h(-2, 11) } },
];

/* ── documentos con audiencia y estado de publicación ── */
export type DocumentoAdmin = Documento & { audiencia: "Todos" | "Propietarios" | "Equipo"; estado: "publicado" | "borrador" | "archivado"; version: number };
export const DOCUMENTOS_ADMIN: DocumentoAdmin[] = [
  ...DOCUMENTOS.map((d, i) => ({ ...d, audiencia: (d.tipo === "acta" ? "Propietarios" : "Todos") as DocumentoAdmin["audiencia"], estado: "publicado" as const, version: i === 0 ? 3 : 1 })),
  { id: "d6", titulo: "Protocolo de mudanzas", tipo: "reglamento", peso: "180 KB", fecha: h(-2, 12), archivo: "CondoTrack_Protocolo_Mudanzas_Araoz1280.pdf",
    audiencia: "Todos", estado: "borrador", version: 1 },
];

/* ── personas: vínculos por unidad ───────────────────────────────── */
export type PersonaAdmin = { id: string; nombre: string; unidad: string; vinculo: Vinculo; titular: boolean; contacto?: string; desde?: string; app: "activa" | "invitada" | "sin cuenta" };
export function personasDelEdificio(): PersonaAdmin[] {
  const lista: PersonaAdmin[] = [];
  for (const u of UNIDADES) {
    if (u.codigo === RESIDENTE.unidad) {
      PERSONAS.forEach(p => lista.push({ id: p.id, nombre: p.nombre, unidad: u.codigo, vinculo: p.vinculo, titular: Boolean(p.esTitular), contacto: p.contacto, desde: p.desde, app: p.contacto ? "activa" : "invitada" }));
      continue;
    }
    u.residentes.forEach((r, i) => lista.push({ id: `${u.codigo}-${i}`, nombre: r, unidad: u.codigo, vinculo: i === 0 ? "propietario" : "conviviente",
      titular: i === 0, contacto: i === 0 ? u.telefono : undefined, app: i === 0 && u.telefono ? "activa" : i === 0 ? "invitada" : "sin cuenta" }));
  }
  return lista;
}
export { ROTULO_VINCULO };

/* ── edificio ── */
export const espacioDeRecurso = (recursoId: string) => ESPACIOS.find(e => e.id === RECURSOS.find(r => r.id === recursoId)?.espacioId);
export const nombreRecurso = (recursoId: string) => {
  const r = RECURSOS.find(x => x.id === recursoId);
  const e = ESPACIOS.find(x => x.id === r?.espacioId);
  return e ? (r && r.nombre !== "Sala" && r.nombre !== e.nombre ? `${e.nombre} · ${r.nombre}` : e.nombre) : recursoId;
};

/* ── la cola de atención de A01 ──────────────────────────────────────
   Qué requiere una decisión de la administración, de quién es y cuál es
   la acción que corresponde. Cada ítem abre trabajo real. */
export type ItemAtencion = {
  id: string; tipo: "caso" | "reclamo" | "reserva" | "pago" | "entrega" | "mudanza";
  titulo: string; contexto: string; responsable: string | null; critico: boolean; hoy: boolean;
  accion: string; destino: { vista: "a12" | "a10" | "a17" | "a09" | "a04"; ref?: string }; cuando: string;
};
export function colaDeAtencion(e: Estado, ahora = new Date()): ItemAtencion[] {
  const hoy = (iso: string) => new Date(iso).toDateString() === ahora.toDateString();
  const items: ItemAtencion[] = [];
  for (const i of e.incidencias.filter(x => x.estado !== "cerrada")) {
    const resp = i.responsable ?? i.derivadaA ?? null;
    if (i.gravedad === "alta" || !resp) items.push({ id: `i:${i.id}`, tipo: "caso", titulo: i.titulo, contexto: `${i.lugar} · reportó ${i.reportadaPor}`,
      responsable: resp, critico: i.gravedad === "alta", hoy: hoy(i.cuando), accion: resp ? "Revisar" : "Asignar", destino: { vista: "a12", ref: i.id }, cuando: i.cuando });
  }
  for (const r of e.reclamos.filter(x => x.estado === "nuevo" || x.estado === "en-gestion")) {
    items.push({ id: `r:${r.id}`, tipo: "reclamo", titulo: `${r.codigo} · ${r.descripcion.split(".")[0]}`, contexto: `Unidad ${r.unidad} · ${r.ubicacion}`,
      responsable: r.responsable ?? null, critico: false, hoy: hoy(r.creadoEl), accion: r.responsable ? "Revisar" : "Asignar", destino: { vista: "a12", ref: r.id }, cuando: r.creadoEl });
  }
  for (const s of e.solicitudes.filter(x => x.estado === "pendiente")) {
    items.push({ id: `s:${s.id}`, tipo: "reserva", titulo: `${nombreRecurso(s.recursoId)} · Unidad ${s.unidad}`, contexto: `Pide ${s.pedidaPor}${s.motivo ? ` · ${s.motivo}` : ""}`,
      responsable: ADMINISTRACION.nombre, critico: false, hoy: hoy(s.inicio), accion: "Decidir", destino: { vista: "a10", ref: s.id }, cuando: s.pedidaEl });
  }
  for (const p of e.cobranza.filter(x => x.estado === "informado")) {
    items.push({ id: `p:${p.id}`, tipo: "pago", titulo: `Pago informado · Unidad ${p.unidad}`, contexto: `${p.informadoPor} · ${p.medio}`,
      responsable: ADMINISTRACION.nombre, critico: false, hoy: hoy(p.informadoEl), accion: "Conciliar", destino: { vista: "a17", ref: p.id }, cuando: p.informadoEl });
  }
  for (const p of e.pagos.filter(x => x.estado === "informado")) {
    items.push({ id: `p7:${p.id}`, tipo: "pago", titulo: `Pago informado · Unidad ${RESIDENTE.unidad}`, contexto: `${RESIDENTE.nombre} · ${p.medio}`,
      responsable: ADMINISTRACION.nombre, critico: false, hoy: hoy(p.informadoEl), accion: "Conciliar", destino: { vista: "a17", ref: p.id }, cuando: p.informadoEl });
  }
  const viejas = e.entregas.filter(x => x.estado === "retirar" && Date.now() - new Date(x.recibidoEl).getTime() > 20 * 3600000);
  for (const en of viejas) items.push({ id: `e:${en.id}`, tipo: "entrega", titulo: `${en.titulo} sin retirar`, contexto: `Unidad ${en.unidad} · desde ${new Date(en.recibidoEl).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`,
    responsable: RECEPCION.nombre, critico: false, hoy: false, accion: "Ver", destino: { vista: "a09", ref: en.id }, cuando: en.recibidoEl });
  return items.sort((a, b) => Number(b.critico) - Number(a.critico) || Number(!b.responsable) - Number(!a.responsable) || b.cuando.localeCompare(a.cuando));
}

export const hoyEnAgenda = (ahora = new Date()) => AGENDA.filter(a => new Date(a.hora).toDateString() === ahora.toDateString());
export const unidadDe = (codigo: string): Unidad | undefined => UNIDADES.find(u => u.codigo === codigo);
export const nombreEdificio = EDIFICIO.nombre;
export const periodoAnterior = (n: number) => correrPeriodo(PERIODO, n);
export type { Reserva };
