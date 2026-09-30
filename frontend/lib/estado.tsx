"use client";
/** Estado de la sesión del prototipo.
 *
 *  Sin librería de estado: contexto de React + useReducer. Existe por una
 *  razón concreta: si autorizás una visita y después abrís el historial de
 *  la unidad, la visita tiene que estar ahí. Si no, el prototipo no
 *  demuestra la trazabilidad, que es lo que el producto promete.
 *
 *  Regla del reducer: toda operación que cambia algo escribe también un
 *  evento en el historial de la unidad. Una sola vía, sin excepciones. */

import {
  createContext, useCallback, useContext, useMemo, useReducer,
  type Dispatch, type ReactNode,
} from "react";
import {
  ENTREGAS, RESERVAS, VISITAS, RESIDENTE, RECEPCION,
  type Entrega, type Reserva, type Visita,
} from "./data";
import { PERMISOS, type Evento, type PermisoPermanente, type TipoEvento } from "./unidad";
import { RECLAMOS, VOTACIONES, type Reclamo, type EstadoReclamo } from "./gestiones";
import type { PagoInformado } from "./expensas";

/* ── forma del estado ────────────────────────────────────────────── */

export type Estado = {
  visitas: Visita[];
  permisos: PermisoPermanente[];
  reclamos: Reclamo[];
  reservas: Reserva[];
  entregas: Entrega[];
  pagos: PagoInformado[];
  eventos: Evento[];          // sólo los nuevos: los históricos viven en unidad.ts
  votos: Record<string, string>;
  avisosLeidos: boolean;
};

const inicial: Estado = {
  visitas: VISITAS,
  permisos: PERMISOS,
  reclamos: RECLAMOS,
  reservas: RESERVAS,
  entregas: ENTREGAS,
  pagos: [],
  eventos: [],
  votos: Object.fromEntries(
    VOTACIONES.filter((v) => v.miVoto).map((v) => [v.id, v.miVoto!])
  ),
  avisosLeidos: false,
};

/* ── acciones ────────────────────────────────────────────────────── */

export type Accion =
  | { t: "visita/crear"; visita: Visita }
  | { t: "visita/cancelar"; id: string }
  | { t: "acceso/validar"; id: string; por: string }
  | { t: "acceso/ingreso"; id: string; por: string }
  | { t: "acceso/egreso"; id: string; por: string }
  | { t: "permiso/revocar"; id: string; por: string }
  | { t: "reclamo/crear"; reclamo: Reclamo }
  | { t: "reclamo/avanzar"; id: string; estado: EstadoReclamo; texto: string; autor: string }
  | { t: "reserva/crear"; reserva: Reserva; rotulo: string }
  | { t: "reserva/cancelar"; id: string; rotulo: string }
  | { t: "entrega/registrar"; entrega: Entrega }
  | { t: "entrega/retirar"; id: string; quien: string; por: string }
  | { t: "pago/informar"; pago: PagoInformado }
  | { t: "pago/confirmar"; id: string; por: string }
  | { t: "voto/emitir"; votacionId: string; opcionId: string }
  | { t: "avisos/leer" };

let n = 0;
const nuevoId = (p: string) => `${p}-${Date.now().toString(36)}-${n++}`;

function evento(
  tipo: TipoEvento, titulo: string, responsable: string,
  rol: Evento["rol"], detalle?: string, unidad: string = RESIDENTE.unidad
): Evento {
  return { id: nuevoId("ev"), cuando: new Date().toISOString(), tipo, titulo, detalle, responsable, rol, unidad };
}

function reducer(e: Estado, a: Accion): Estado {
  switch (a.t) {
    case "visita/crear":
      return {
        ...e,
        visitas: [a.visita, ...e.visitas],
        eventos: [
          evento("autorizacion", `Visita autorizada · ${a.visita.nombre}`,
            a.visita.creadaPor, "Residente",
            `${a.visita.dia ?? "Hoy"} ${a.visita.horario} · pase ${a.visita.codigo}`,
            a.visita.unidad),
          ...e.eventos,
        ],
      };

    case "visita/cancelar": {
      const v = e.visitas.find((x) => x.id === a.id);
      return {
        ...e,
        visitas: e.visitas.map((x) =>
          x.id === a.id ? { ...x, estado: "cancelada" as const, cuando: "historial" as const, nota: "Cancelada por el residente" } : x),
        eventos: v
          ? [evento("autorizacion", `Autorización cancelada · ${v.nombre}`, RESIDENTE.nombre, "Residente", `Pase ${v.codigo} dado de baja`), ...e.eventos]
          : e.eventos,
      };
    }

    case "acceso/validar": {
      const v = e.visitas.find((x) => x.id === a.id);
      if (!v) return e;
      const ahora = new Date().toISOString();
      return {
        ...e,
        visitas: e.visitas.map((x) => x.id === a.id ? { ...x, validadaEl: ahora, validadaPor: a.por } : x),
        eventos: [evento("acceso", `Pase validado · ${v.nombre}`, a.por, "Recepción",
          `${v.codigo} · autorización vigente. Todavía sin ingreso registrado.`, v.unidad), ...e.eventos],
      };
    }

    case "acceso/ingreso": {
      const v = e.visitas.find((x) => x.id === a.id);
      if (!v) return e;
      const ahora = new Date().toISOString();
      return {
        ...e,
        visitas: e.visitas.map((x) => x.id === a.id ? { ...x, ingresoEl: ahora, ingresoPor: a.por, estado: "vigente" as const } : x),
        eventos: [evento("acceso", `Ingreso registrado · ${v.nombre}`, a.por, "Recepción",
          `Pase ${v.codigo}`, v.unidad), ...e.eventos],
      };
    }

    case "acceso/egreso": {
      const v = e.visitas.find((x) => x.id === a.id);
      if (!v) return e;
      const ahora = new Date().toISOString();
      return {
        ...e,
        visitas: e.visitas.map((x) => x.id === a.id
          ? { ...x, egresoEl: ahora, egresoPor: a.por, estado: "finalizada" as const } : x),
        eventos: [evento("acceso", `Egreso registrado · ${v.nombre}`, a.por, "Recepción",
          `Pase ${v.codigo}`, v.unidad), ...e.eventos],
      };
    }

    case "permiso/revocar": {
      const p = e.permisos.find((x) => x.id === a.id);
      return {
        ...e,
        permisos: e.permisos.map((x) => x.id === a.id ? { ...x, activo: false } : x),
        eventos: p
          ? [evento("permiso", `Permiso permanente dado de baja · ${p.nombre}`, a.por, "Residente",
              "Desde ahora necesita una autorización puntual para entrar."), ...e.eventos]
          : e.eventos,
      };
    }

    case "reclamo/crear":
      return {
        ...e,
        reclamos: [a.reclamo, ...e.reclamos],
        eventos: [evento("reclamo", `Reclamo creado · ${a.reclamo.codigo}`,
          a.reclamo.creadoPor, "Residente", a.reclamo.ubicacion), ...e.eventos],
      };

    case "reclamo/avanzar": {
      const r = e.reclamos.find((x) => x.id === a.id);
      if (!r) return e;
      const accion = {
        id: nuevoId("ac"), cuando: new Date().toISOString(),
        estado: a.estado, texto: a.texto, autor: a.autor, rol: "Administración" as const,
      };
      return {
        ...e,
        reclamos: e.reclamos.map((x) => x.id === a.id
          ? { ...x, estado: a.estado, acciones: [...x.acciones, accion] } : x),
        eventos: [evento("reclamo", `Reclamo actualizado · ${r.codigo}`, a.autor, "Administración", a.texto), ...e.eventos],
      };
    }

    case "reserva/crear":
      return {
        ...e,
        reservas: [a.reserva, ...e.reservas],
        eventos: [evento("reserva", `Reserva confirmada · ${a.rotulo}`,
          a.reserva.creadaPor, "Residente", undefined, a.reserva.unidad), ...e.eventos],
      };

    case "reserva/cancelar":
      return {
        ...e,
        reservas: e.reservas.map((x) => x.id === a.id ? { ...x, estado: "cancelada" as const } : x),
        eventos: [evento("reserva", `Reserva cancelada · ${a.rotulo}`, RESIDENTE.nombre, "Residente"), ...e.eventos],
      };

    case "entrega/registrar":
      return {
        ...e,
        entregas: [a.entrega, ...e.entregas],
        eventos: [evento("entrega", "Paquete recibido en recepción", a.entrega.recibidoPor, "Recepción",
          `${a.entrega.titulo} · ${a.entrega.remitente}`, a.entrega.unidad), ...e.eventos],
      };

    case "entrega/retirar": {
      const en = e.entregas.find((x) => x.id === a.id);
      if (!en) return e;
      const ahora = new Date().toISOString();
      return {
        ...e,
        entregas: e.entregas.map((x) => x.id === a.id
          ? { ...x, estado: "retirado" as const, retiradoEl: ahora, retiradoPor: a.quien, entregadoPor: a.por } : x),
        eventos: [evento("entrega", "Entrega retirada", a.por, "Recepción",
          `${en.titulo} · retirada por ${a.quien}`, en.unidad), ...e.eventos],
      };
    }

    case "pago/informar":
      return {
        ...e,
        pagos: [a.pago, ...e.pagos],
        eventos: [evento("expensa", "Pago informado", RESIDENTE.nombre, "Residente",
          "Queda pendiente de confirmación por administración."), ...e.eventos],
      };

    case "pago/confirmar":
      return {
        ...e,
        pagos: e.pagos.map((p) => p.id === a.id ? { ...p, estado: "confirmado" as const } : p),
        eventos: [evento("expensa", "Pago confirmado", a.por, "Administración"), ...e.eventos],
      };

    case "voto/emitir":
      return { ...e, votos: { ...e.votos, [a.votacionId]: a.opcionId } };

    case "avisos/leer":
      return { ...e, avisosLeidos: true };

    default:
      return e;
  }
}

/* ── contexto ────────────────────────────────────────────────────── */

const Ctx = createContext<{ estado: Estado; hacer: Dispatch<Accion> } | null>(null);

export function ProveedorEstado({ children }: { children: ReactNode }) {
  const [estado, hacer] = useReducer(reducer, inicial);
  const valor = useMemo(() => ({ estado, hacer }), [estado]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp fuera de ProveedorEstado");
  return c;
}

/* ── ayudas de creación ──────────────────────────────────────────── */

/** Código de pase con la forma que usa el edificio: CT · unidad · 4 dígitos. */
export function nuevoCodigoPase(unidad = RESIDENTE.unidad) {
  const n = 5000 + Math.floor(Math.random() * 900);
  return `CT ${unidad} ${n}`;
}

export const nuevoIdVisita = () => nuevoId("v");
export const nuevoIdReclamo = () => nuevoId("rc");
export const nuevoIdReserva = () => nuevoId("rs");
export const nuevoIdEntrega = () => nuevoId("e");
export const nuevoIdPago = () => nuevoId("pg");

/** Código correlativo de reclamo, a partir de los que ya hay. */
export function nuevoCodigoReclamo(reclamos: Reclamo[]) {
  const max = reclamos.reduce((m, r) => {
    const n = Number(r.codigo.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `RC-${String(max + 1).padStart(4, "0")}`;
}

/** Hook chico para las acciones de recepción, que siempre las firma la
 *  misma persona en el prototipo. */
export function useRecepcion() {
  const { hacer } = useApp();
  return useCallback(
    (a: Extract<Accion, { por: string }>) => hacer({ ...a, por: RECEPCION.nombre } as Accion),
    [hacer]
  );
}
