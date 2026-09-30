/** La unidad como entidad: quién vive, quién puede entrar siempre, y el
 *  historial de todo lo que pasó.
 *
 *  Esto es el corazón del producto:
 *  EDIFICIO → UNIDAD → PERSONA → OPERACIÓN → ESTADO → RESPONSABLE → HISTORIAL
 *  Cada operación que hace cualquier perfil deja un evento acá. */

import { EDIFICIO, RESIDENTE } from "./data";
import { isoDesdeHoy } from "./formato";

/* ── personas de la unidad ───────────────────────────────────────── */

export type Vinculo = "propietario" | "residente" | "conviviente" | "inquilino";

export type Persona = {
  id: string;
  nombre: string;
  iniciales: string;
  vinculo: Vinculo;
  contacto?: string;
  desde: string;          // ISO
  esTitular?: boolean;
};

export const ROTULO_VINCULO: Record<Vinculo, string> = {
  propietario: "Propietario",
  residente: "Residente",
  conviviente: "Conviviente",
  inquilino: "Inquilino",
};

export const PERSONAS: Persona[] = [
  { id: "p1", nombre: RESIDENTE.nombre, iniciales: RESIDENTE.iniciales, vinculo: "propietario",
    contacto: "+54 9 11 5544 8812", desde: isoDesdeHoy(-1220, 10), esTitular: true },
  { id: "p2", nombre: "Camila Arce", iniciales: "CA", vinculo: "conviviente",
    contacto: "+54 9 11 6677 2231", desde: isoDesdeHoy(-880, 10) },
  { id: "p3", nombre: "Tomás Osorio", iniciales: "TO", vinculo: "conviviente",
    desde: isoDesdeHoy(-880, 10) },
];

/* ── permisos permanentes ────────────────────────────────────────────
   Gente que entra sin que la autorices cada vez. Es el permiso más
   delicado del producto: por eso vive arriba de todo en Mi unidad, dice
   siempre quién lo dio y cuándo, y se revoca de un toque. */

export type TipoPermiso = "persona" | "servicio" | "proveedor";

export type PermisoPermanente = {
  id: string;
  nombre: string;
  iniciales: string;
  tipo: TipoPermiso;
  detalle: string;          // "Todos los días" / "Martes y viernes · 08:00–12:00"
  otorgadoPor: string;
  otorgadoEl: string;       // ISO
  ultimoIngreso?: string;   // ISO
  activo: boolean;
};

export const ROTULO_PERMISO: Record<TipoPermiso, string> = {
  persona: "Persona de confianza",
  servicio: "Servicio doméstico",
  proveedor: "Proveedor",
};

export const PERMISOS: PermisoPermanente[] = [
  { id: "pp1", nombre: "Rosa Medina", iniciales: "RM", tipo: "servicio",
    detalle: "Lunes, miércoles y viernes · 08:00–13:00",
    otorgadoPor: RESIDENTE.nombre, otorgadoEl: isoDesdeHoy(-410, 18, 20),
    ultimoIngreso: isoDesdeHoy(-2, 8, 12), activo: true },
  { id: "pp2", nombre: "Elena Osorio", iniciales: "EO", tipo: "persona",
    detalle: "Todos los días · sin restricción horaria",
    otorgadoPor: RESIDENTE.nombre, otorgadoEl: isoDesdeHoy(-730, 12),
    ultimoIngreso: isoDesdeHoy(-9, 16, 40), activo: true },
  { id: "pp3", nombre: "Paseo Canino Palermo", iniciales: "PC", tipo: "proveedor",
    detalle: "Lunes a viernes · 17:00–19:00",
    otorgadoPor: "Camila Arce", otorgadoEl: isoDesdeHoy(-120, 9, 15),
    ultimoIngreso: isoDesdeHoy(-1, 17, 30), activo: true },
];

/* ── datos de la unidad ──────────────────────────────────────────── */

export const UNIDAD = {
  codigo: RESIDENTE.unidad,
  piso: "Piso 7",
  ambientes: "3 ambientes · 74 m²",
  cochera: "Cochera 12 · subsuelo",
  baulera: "Baulera 7D · subsuelo",
  participacion: "1,897% del consorcio",
  edificio: EDIFICIO.nombreLargo,
} as const;

/* ── historial de la unidad ──────────────────────────────────────────
   Un solo registro para todo. El filtro por tipo existe, pero el orden
   natural es cronológico: lo que pasó, cuándo y quién lo hizo. */

export type TipoEvento =
  | "acceso" | "entrega" | "reserva" | "reclamo"
  | "expensa" | "autorizacion" | "permiso" | "comunicado";

export type RolResponsable = "Residente" | "Recepción" | "Administración" | "Sistema";

export type Evento = {
  id: string;
  cuando: string;           // ISO
  tipo: TipoEvento;
  titulo: string;
  detalle?: string;
  responsable: string;
  rol: RolResponsable;
  unidad: string;
};

export const ICONO_EVENTO: Record<TipoEvento, string> = {
  acceso: "credencial",
  entrega: "caja",
  reserva: "calendario",
  reclamo: "chat",
  expensa: "documento",
  autorizacion: "personaMas",
  permiso: "candado",
  comunicado: "lista",
};

export const ROTULO_EVENTO: Record<TipoEvento, string> = {
  acceso: "Acceso",
  entrega: "Entrega",
  reserva: "Reserva",
  reclamo: "Reclamo",
  expensa: "Expensa",
  autorizacion: "Autorización",
  permiso: "Permiso",
  comunicado: "Comunicado",
};

const U = RESIDENTE.unidad;

export const HISTORIAL: Evento[] = [
  { id: "h01", cuando: isoDesdeHoy(0, 14, 20), tipo: "entrega",
    titulo: "Paquete recibido en recepción",
    detalle: "Sobre de Correo Argentino a nombre de Lucía Fernández",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h02", cuando: isoDesdeHoy(0, 10, 42), tipo: "acceso",
    titulo: "Egreso registrado · Lucía Fernández",
    detalle: "Pase CT 7D 4795 · validado y registrado por recepción",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h03", cuando: isoDesdeHoy(0, 9, 4), tipo: "acceso",
    titulo: "Ingreso registrado · Lucía Fernández",
    detalle: "Pase CT 7D 4795 · vigente al momento del ingreso",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h04", cuando: isoDesdeHoy(0, 8, 12), tipo: "permiso",
    titulo: "Ingreso con permiso permanente · Rosa Medina",
    detalle: "Servicio doméstico · lunes, miércoles y viernes",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h05", cuando: isoDesdeHoy(-1, 19, 8), tipo: "autorizacion",
    titulo: "Visita autorizada · Martín López",
    detalle: "Hoy 18:30–23:30 · pase CT 7D 4821",
    responsable: RESIDENTE.nombre, rol: "Residente", unidad: U },
  { id: "h06", cuando: isoDesdeHoy(-1, 17, 30), tipo: "permiso",
    titulo: "Ingreso con permiso permanente · Paseo Canino Palermo",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h07", cuando: isoDesdeHoy(-3, 19, 0), tipo: "reserva",
    titulo: "Reserva confirmada · SUM",
    detalle: "Hoy 20:30–22:30",
    responsable: RESIDENTE.nombre, rol: "Residente", unidad: U },
  { id: "h08", cuando: isoDesdeHoy(-4, 11, 15), tipo: "reclamo",
    titulo: "Reclamo actualizado · Ascensor Torre A",
    detalle: "Pasó a En gestión · asignado a Ascensores Milano",
    responsable: "Mariana Ferrari", rol: "Administración", unidad: U },
  { id: "h09", cuando: isoDesdeHoy(-6, 9, 30), tipo: "comunicado",
    titulo: "Comunicado del edificio",
    detalle: "Corte de agua programado para el sábado de 09:00 a 13:00",
    responsable: "Mariana Ferrari", rol: "Administración", unidad: U },
  { id: "h10", cuando: isoDesdeHoy(-8, 19, 5), tipo: "entrega",
    titulo: "Entrega retirada",
    detalle: "Caja mediana de Mercado Libre · retirada por Felipe Osorio",
    responsable: "Diego Sosa", rol: "Recepción", unidad: U },
  { id: "h11", cuando: isoDesdeHoy(-12, 16, 0), tipo: "reserva",
    titulo: "Reserva finalizada · Parrilla",
    detalle: "Terraza · 21:00–00:00",
    responsable: RESIDENTE.nombre, rol: "Residente", unidad: U },
  { id: "h12", cuando: isoDesdeHoy(-27, 11, 30), tipo: "expensa",
    titulo: "Pago de expensas confirmado",
    detalle: "Período anterior · transferencia",
    responsable: "Mariana Ferrari", rol: "Administración", unidad: U },
];

export const historialOrdenado = (extra: Evento[] = []) =>
  [...HISTORIAL, ...extra].sort((a, b) => b.cuando.localeCompare(a.cuando));
