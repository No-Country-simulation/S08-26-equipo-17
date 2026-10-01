import type { Estado } from "./estado";
import { AGENDA, UNIDADES, type ItemAgenda } from "./edificio";
import { ROTULO_TIPO_VISITA, ESPACIOS, RECURSOS, type VistaP } from "./data";
import type { NombreIcono } from "@/components/ui/Icon";

export type DestinoOperativo = { vista: VistaP; ref?: string };
export type AccesoPrevisto = {
  id: string; nombre: string; contexto: string; cuando: string;
  estado: string; icono: NombreIcono; destino: DestinoOperativo;
};
export type ActividadTurno = {
  id: string; cuando: string; titulo: string; contexto: string;
  actor: string; icono: NombreIcono; categoria: "accesos" | "entregas" | "incidencias";
};

export const mismoDiaOperativo = (iso: string, ahora: Date) =>
  new Date(iso).toDateString() === ahora.toDateString();

export function accesosPrevistos(estado: Estado, ahora: Date): AccesoPrevisto[] {
  const inicio = new Date(ahora); inicio.setHours(0, 0, 0, 0);
  const visitas: AccesoPrevisto[] = estado.visitas
    .filter(v => !v.ingresoEl && !v.egresoEl && v.estado !== "cancelada" && v.estado !== "finalizada" && new Date(v.fecha) >= inicio)
    .map(v => ({ id: v.id, nombre: v.nombre, cuando: v.fecha,
      contexto: `${ROTULO_TIPO_VISITA[v.tipo]} · Unidad ${v.unidad}`,
      estado: "Autorizado", icono: v.tipo === "visita" ? "persona" : "herramienta",
      destino: { vista: "p04", ref: v.codigo } }));
  // La agenda sólo aporta operaciones sin entidad propia todavía. Visitas y
  // reservas se leen del estado para que cancelar no deje un duplicado visible.
  const externos: AccesoPrevisto[] = AGENDA
    .filter(a => (a.tipo === "proveedor" || a.tipo === "mudanza") && !a.hecho && new Date(a.hora) >= inicio)
    .map(a => ({ id: a.id, nombre: a.titulo, cuando: a.hora,
      contexto: a.unidad ? `Mudanza · Unidad ${a.unidad}` : a.detalle ?? "Proveedor del edificio",
      estado: a.tipo === "mudanza" ? "Aprobada" : new Date(a.hora) < ahora ? "Sin registro" : "Programado", icono: a.tipo === "proveedor" ? "herramienta" : "caja",
      destino: { vista: "p08", ref: a.id } }));
  return [...visitas, ...externos].sort((a, b) => a.cuando.localeCompare(b.cuando));
}

export function actividadRegistrada(estado: Estado, ahora: Date): ActividadTurno[] {
  const items: ActividadTurno[] = [];
  for (const v of estado.visitas) {
    for (const [tipo, cuando, actor, titulo, icono] of [
      ["validacion", v.validadaEl, v.validadaPor, "Pase validado", "credencial"],
      ["ingreso", v.ingresoEl, v.ingresoPor, "Ingreso registrado", "check"],
      ["egreso", v.egresoEl, v.egresoPor, "Salida registrada", "salir"],
    ] as const) {
      if (cuando) items.push({ id: `${v.id}-${tipo}`, cuando, actor: actor ?? "Recepción",
        titulo, contexto: `${v.nombre} · Unidad ${v.unidad}`, icono, categoria: "accesos" });
    }
  }
  for (const e of estado.entregas) {
    items.push({ id: `${e.id}-recibida`, cuando: e.recibidoEl, actor: e.recibidoPor,
      titulo: "Entrega recibida", contexto: `${e.remitente} · Unidad ${e.unidad}`, icono: "caja", categoria: "entregas" });
    if (e.retiradoEl) items.push({ id: `${e.id}-retirada`, cuando: e.retiradoEl,
      actor: e.entregadoPor ?? "Recepción", titulo: "Entrega retirada",
      contexto: `${e.retiradoPor} · Unidad ${e.unidad}`, icono: "check", categoria: "entregas" });
  }
  for (const i of estado.incidencias) items.push({ id: i.id, cuando: i.cuando,
    actor: i.reportadaPor, titulo: i.titulo, contexto: i.lugar, icono: "alerta", categoria: "incidencias" });
  return items.filter(i => new Date(i.cuando) <= ahora)
    .sort((a, b) => b.cuando.localeCompare(a.cuando));
}

const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function buscarOperacion(q: string, estado: Estado) {
  const texto = normalizar(q);
  if (!texto) return [];
  const candidatos: { id: string; titulo: string; detalle: string; destino: DestinoOperativo; busqueda: string }[] = [
    ...UNIDADES.map(u => ({ id: `u-${u.codigo}`, titulo: `Unidad ${u.codigo}`,
      detalle: u.residentes.join(" · "), busqueda: `${u.codigo} ${u.residentes.join(" ")}`,
      destino: { vista: "p02" as const, ref: u.codigo } })),
    ...estado.visitas.map(v => ({ id: `v-${v.id}`, titulo: v.nombre,
      detalle: `${ROTULO_TIPO_VISITA[v.tipo]} · Unidad ${v.unidad} · ${v.codigo}`,
      busqueda: `${v.nombre} ${v.unidad} ${v.codigo}`, destino: { vista: "p04" as const, ref: v.codigo } })),
    ...AGENDA.filter(a => a.tipo === "proveedor").map(a => ({ id: a.id,
      titulo: a.titulo, detalle: a.detalle ?? "Proveedor · Agenda", busqueda: `${a.titulo} ${a.detalle ?? ""}`,
      destino: { vista: "p08" as const, ref: a.id } })),
  ];
  return candidatos.filter(c => normalizar(c.busqueda).includes(texto)).slice(0, 8);
}

export function actividadDelDia(estado: Estado, ahora: Date): ActividadTurno[] {
  return actividadRegistrada(estado, ahora).filter(i => mismoDiaOperativo(i.cuando, ahora));
}

export type EventoAgendaOperativa = ItemAgenda & { destino?: DestinoOperativo; estadoVisible?: string; fin?: string };
/** Visitas y reservas se proyectan desde el estado: cancelar nunca deja un duplicado en agenda. */
export function agendaOperativa(estado: Estado): EventoAgendaOperativa[] {
  const externos: EventoAgendaOperativa[] = AGENDA.filter(a => a.tipo !== "visita" && a.tipo !== "reserva").map(a => ({ ...a, estadoVisible: a.tipo === "mudanza" ? "Aprobada" : undefined,
    destino: a.unidad ? { vista: "p02" as const, ref: a.unidad } : undefined }));
  const visitas: EventoAgendaOperativa[] = estado.visitas.filter(v => v.estado !== "cancelada").map(v => ({
    id: `visita-${v.id}`, hora: v.fecha, tipo: v.tipo === "proveedor" ? "proveedor" : "visita", titulo: v.nombre,
    unidad: v.unidad, detalle: `${v.horario} · Pase ${v.codigo}`, destino: { vista: "p04", ref: v.codigo },
    estadoVisible: v.egresoEl ? "Salida registrada" : v.ingresoEl ? "Dentro del edificio" : v.estado === "finalizada" ? "Finalizada" : undefined,
  }));
  const reservas: EventoAgendaOperativa[] = estado.reservas.filter(r => r.estado !== "cancelada").map(r => {
    const recurso = RECURSOS.find(x => x.id === r.recursoId);
    const espacio = ESPACIOS.find(x => x.id === recurso?.espacioId);
    return { id: `reserva-${r.id}`, hora: r.inicio, fin: r.fin, tipo: "reserva", titulo: espacio?.nombre ?? "Reserva", unidad: r.unidad,
      detalle: `${recurso?.nombre ?? "Espacio"} · ${new Date(r.inicio).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}–${new Date(r.fin).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
      destino: { vista: "p02", ref: r.unidad }, estadoVisible: r.estado === "finalizada" ? "Horario finalizado" : undefined };
  });
  return [...externos, ...visitas, ...reservas].sort((a,b) => a.hora.localeCompare(b.hora));
}

/** Nombre corto de cada destino, para "Volver a…" y migas. */
export const ROTULO_CORTO_P: Record<VistaP, string> = {
  p01: "Inicio", p02: "Unidades", p03: "Escanear", p04: "Accesos",
  p05: "Entregas", p07: "Incidencias", p08: "Agenda", p09: "Actividad",
};
