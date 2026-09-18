/** Datos ficticios del prototipo.
 *  Fijados por 00_MASTER_UI_SYSTEM_LOCK.md — no cambiarlos por pantalla. */

import { isoDesdeHoy } from "./formato";

export const EDIFICIO = {
  nombre: "Aráoz 1280",
  nombreLargo: "Edificio Aráoz 1280",
  ciudad: "Buenos Aires · CABA",
  administracion: "Estudio Aráoz",
  telefono: "+54 11 4555 1280",
  horarioRecepcion: "Lun a vie · 09:00–18:00",
  mail: "administracion@araoz1280.com.ar",
} as const;

export const RESIDENTE = {
  nombre: "Felipe Osorio",
  nombrePila: "Felipe",
  iniciales: "FO",
  unidad: "7D",
  rol: "Residente",
} as const;

export const RECEPCION = {
  nombre: "Diego Sosa",
  iniciales: "DS",
  rol: "Recepción",
  turno: "Turno mañana · 07:00–15:00",
} as const;

export const ADMINISTRACION = {
  nombre: "Mariana Ferrari",
  iniciales: "MF",
  rol: "Administración",
  estudio: "Estudio Aráoz",
} as const;

export const CONTEXTO = `${EDIFICIO.nombre} · Unidad ${RESIDENTE.unidad}`;

export type Perfil = "residente" | "recepcion" | "administracion";

export const CUENTAS: {
  mail: string; pass: string; perfil: Perfil; nombre: string; etiqueta: string;
}[] = [
  { mail: "felipe@araoz1280.com.ar",    pass: "condo1234", perfil: "residente",      nombre: "Felipe Osorio",   etiqueta: "Residente" },
  { mail: "recepcion@araoz1280.com.ar", pass: "condo1234", perfil: "recepcion",      nombre: "Diego Sosa",      etiqueta: "Recepción" },
  { mail: "admin@araoz1280.com.ar",     pass: "condo1234", perfil: "administracion", nombre: "Mariana Ferrari", etiqueta: "Administración" },
];

export const ONBOARDING = [
  { img: "/img/ob_edificio.jpg", h: "Gestioná tu edificio.",       p: "Todo más claro, más simple y más cerca de lo que pasa en casa." },
  { img: "/img/ob_balcon.jpg",   h: "Viví tu unidad más simple.",  p: "Visitas, entregas, avisos y espacios, todo desde un mismo lugar." },
  { img: "/img/ob_terraza.jpg",  h: "Disfrutá más tus espacios.",  p: "SUM, cowork, terraza y lavandería con disponibilidad clara." },
];

/* ── Visitas y autorizaciones (R06 · R16 · F01) ──────────────────────
   Una visita es una autorización con ventana horaria. Validar el pase y
   registrar el ingreso son dos hechos distintos y se guardan por separado:
   es una decisión de producto, no un detalle de implementación. */

export type EstadoVisita = "vigente" | "programada" | "finalizada" | "cancelada";
export type TipoVisita = "visita" | "proveedor" | "servicio";

export const ROTULO_TIPO_VISITA: Record<TipoVisita, string> = {
  visita: "Visita",
  proveedor: "Proveedor",
  servicio: "Servicio",
};

export type Visita = {
  id: string;
  nombre: string;
  documento?: string;
  tipo: TipoVisita;
  horario: string;            // "18:30–23:30"
  dia?: string;               // rótulo del día, vacío = hoy
  fecha: string;              // ISO del día autorizado
  recurrente?: boolean;
  nota?: string;
  estado: EstadoVisita;
  cuando: "hoy" | "proximas" | "historial";
  codigo: string;             // código del pase
  creadaPor: string;
  creadaEl: string;
  unidad: string;
  /* trazabilidad del acceso */
  validadaEl?: string;
  validadaPor?: string;
  ingresoEl?: string;
  ingresoPor?: string;
  egresoEl?: string;
  egresoPor?: string;
};

const U = RESIDENTE.unidad;

export const VISITAS: Visita[] = [
  { id: "v1", nombre: "Martín López", tipo: "visita", horario: "18:30–23:30",
    fecha: isoDesdeHoy(0, 18, 30), estado: "vigente", cuando: "hoy", codigo: "CT 7D 4821",
    documento: "32.884.109",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-1, 19, 8), unidad: U },
  { id: "v2", nombre: "Lucía Fernández", tipo: "visita", horario: "09:00–11:00",
    fecha: isoDesdeHoy(0, 9), estado: "finalizada", cuando: "hoy", codigo: "CT 7D 4795",
    nota: "Salida registrada · 10:42",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-2, 21, 30), unidad: U,
    validadaEl: isoDesdeHoy(0, 9, 2), validadaPor: RECEPCION.nombre,
    ingresoEl: isoDesdeHoy(0, 9, 4), ingresoPor: RECEPCION.nombre,
    egresoEl: isoDesdeHoy(0, 10, 42), egresoPor: RECEPCION.nombre },
  { id: "v3", nombre: "Clima Sur SRL", tipo: "proveedor", horario: "10:00–13:00",
    dia: "Lun 22 sep", fecha: isoDesdeHoy(3, 10), estado: "programada", cuando: "proximas",
    codigo: "CT 7D 4903", nota: "Recambio de bomba presurizadora",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-1, 12), unidad: U },
  { id: "v4", nombre: "Ana Rossi", tipo: "visita", horario: "20:00–00:30",
    dia: "Sáb 20 sep", fecha: isoDesdeHoy(1, 20), estado: "programada", cuando: "proximas",
    codigo: "CT 7D 4877",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-1, 22, 10), unidad: U },
  { id: "v5", nombre: "Julián Paz", tipo: "visita", horario: "16:00–18:00",
    dia: "09 sep", fecha: isoDesdeHoy(-5, 16), estado: "finalizada", cuando: "historial",
    codigo: "CT 7D 4610", nota: "Salida registrada · 17:51",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-7, 10), unidad: U,
    validadaEl: isoDesdeHoy(-5, 15, 58), validadaPor: RECEPCION.nombre,
    ingresoEl: isoDesdeHoy(-5, 16, 1), ingresoPor: RECEPCION.nombre,
    egresoEl: isoDesdeHoy(-5, 17, 51), egresoPor: RECEPCION.nombre },
  { id: "v6", nombre: "Sofía Blanco", tipo: "visita", horario: "13:00–16:00",
    dia: "02 sep", fecha: isoDesdeHoy(-12, 13), estado: "cancelada", cuando: "historial",
    codigo: "CT 7D 4502", nota: "Cancelada por el residente",
    creadaPor: RESIDENTE.nombre, creadaEl: isoDesdeHoy(-14, 19), unidad: U },
];

export const FRANJAS_VISITA = [
  { id: "manana", rotulo: "Mañana", horario: "08:00–13:00" },
  { id: "tarde", rotulo: "Tarde", horario: "13:00–19:00" },
  { id: "noche", rotulo: "Noche", horario: "19:00–00:30" },
  { id: "todo", rotulo: "Todo el día", horario: "08:00–00:30" },
];

/* ── Espacios, recursos y reservas ───────────────────────────────────
   El modelo es Espacio → Recurso → Franja. Hace falta por la lavandería:
   ahí no reservás el espacio, reservás una máquina. El SUM tiene un
   recurso, la lavandería seis. */

export type TipoReserva = "exclusiva" | "recurso";

export type Espacio = {
  id: string; nombre: string; img: string;
  /** Recorte chico, al tamaño real de la fila del home. Servir la foto de
   *  900 px para un hueco de 124 era tirar 40 veces los píxeles que hacen
   *  falta. */
  mini: string;
  piso: string;
  tipoReserva: TipoReserva;
  bloqueMin: number;      // duración de la franja
  aperturaMin: number;    // minuto del día en que abre
  cierreMin: number;
  reglas: string[];
  descripcion: string;
  capacidad: string;
};

const H = (h: number, m = 0) => h * 60 + m;

export const ESPACIOS: Espacio[] = [
  { id: "sum", nombre: "SUM", img: "/img/esp_sum.jpg", mini: "/img/mini_sum.jpg", piso: "Piso 9",
    tipoReserva: "exclusiva", bloqueMin: 120, aperturaMin: H(10), cierreMin: H(24),
    descripcion: "Salón de usos múltiples con cocina, barra y terraza propia mirando al frente.",
    capacidad: "Hasta 40 personas",
    reglas: ["Capacidad 40 personas", "Se entrega y se devuelve limpio", "Música hasta las 23:00"] },
  { id: "cowork", nombre: "Cowork", img: "/img/esp_cowork.jpg", mini: "/img/mini_cowork.jpg", piso: "Piso 2",
    tipoReserva: "exclusiva", bloqueMin: 60, aperturaMin: H(8), cierreMin: H(20),
    descripcion: "Sala de trabajo con seis puestos, fibra dedicada y cabina para llamadas.",
    capacidad: "6 puestos",
    reglas: ["6 puestos de trabajo", "Sin llamadas en la sala"] },
  { id: "parrilla", nombre: "Parrilla", img: "/img/esp_parrilla.jpg", mini: "/img/mini_parrilla.jpg", piso: "Terraza",
    tipoReserva: "exclusiva", bloqueMin: 180, aperturaMin: H(12), cierreMin: H(24),
    descripcion: "Parrilla de la terraza con mesada, bacha y mesa para diez.",
    capacidad: "Hasta 10 personas",
    reglas: ["Carbón y utensilios a cargo del residente", "Se apaga a las 00:00"] },
  { id: "lavanderia", nombre: "Lavandería", img: "/img/esp_cowork.jpg", mini: "/img/mini_cowork.jpg", piso: "Subsuelo",
    tipoReserva: "recurso", bloqueMin: 60, aperturaMin: H(7), cierreMin: H(22),
    descripcion: "Cuatro lavarropas y dos secarropas de uso comunitario. Se reserva la máquina, no la sala.",
    capacidad: "6 máquinas",
    reglas: ["Retirá la ropa al terminar el ciclo", "Una máquina por turno"] },
];

export type Recurso = {
  id: string; espacioId: string; nombre: string;
  estado: "disponible" | "fuera-de-servicio";
  motivo?: string;
};

export const RECURSOS: Recurso[] = [
  { id: "sum-sala",      espacioId: "sum",        nombre: "Sala",         estado: "disponible" },
  { id: "cowork-sala",   espacioId: "cowork",     nombre: "Sala",         estado: "disponible" },
  { id: "parrilla-1",    espacioId: "parrilla",   nombre: "Parrilla",     estado: "disponible" },
  { id: "lav-1",         espacioId: "lavanderia", nombre: "Lavarropas 1", estado: "disponible" },
  { id: "lav-2",         espacioId: "lavanderia", nombre: "Lavarropas 2", estado: "disponible" },
  { id: "lav-3",         espacioId: "lavanderia", nombre: "Lavarropas 3",
    estado: "fuera-de-servicio", motivo: "En reparación desde el 11/09" },
  { id: "lav-4",         espacioId: "lavanderia", nombre: "Lavarropas 4", estado: "disponible" },
  { id: "sec-1",         espacioId: "lavanderia", nombre: "Secarropas 1", estado: "disponible" },
  { id: "sec-2",         espacioId: "lavanderia", nombre: "Secarropas 2", estado: "disponible" },
];

export type EstadoReserva = "confirmada" | "en-curso" | "finalizada" | "cancelada";

export type Reserva = {
  id: string; recursoId: string; unidad: string;
  inicio: string; fin: string;      // ISO
  estado: EstadoReserva;
  creadaPor: string; creadaEl: string;
};

/* Reglas duras. Cada una explica por qué bloquea cuando bloquea. */
export const REGLAS = {
  topePorEspacio: 2,
  anticipacionMin: 30,
  ventanaDias: 14,
} as const;

function iso(diasDesdeHoy: number, minutoDelDia: number) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  d.setHours(Math.floor(minutoDelDia / 60), minutoDelDia % 60, 0, 0);
  return d.toISOString();
}

export const RESERVAS: Reserva[] = [
  { id: "rs1", recursoId: "sum-sala", unidad: "7D",
    inicio: iso(0, H(20, 30)), fin: iso(0, H(22, 30)),
    estado: "confirmada", creadaPor: "Felipe Osorio", creadaEl: iso(-3, H(19)) },
  { id: "rs2", recursoId: "cowork-sala", unidad: "7D",
    inicio: iso(2, H(9)), fin: iso(2, H(13)),
    estado: "confirmada", creadaPor: "Felipe Osorio", creadaEl: iso(-1, H(11)) },
  { id: "rs3", recursoId: "parrilla-1", unidad: "7D",
    inicio: iso(-7, H(21)), fin: iso(-7, H(24)),
    estado: "finalizada", creadaPor: "Felipe Osorio", creadaEl: iso(-12, H(16)) },
  /* ocupación de otras unidades: es lo que hace que el calendario tenga
     franjas tomadas y no todo libre */
  { id: "rs4", recursoId: "lav-1", unidad: "3B",
    inicio: iso(0, H(9)), fin: iso(0, H(10)),
    estado: "confirmada", creadaPor: "Unidad 3B", creadaEl: iso(-1, H(20)) },
  { id: "rs5", recursoId: "lav-2", unidad: "12A",
    inicio: iso(0, H(9)), fin: iso(0, H(10)),
    estado: "confirmada", creadaPor: "Unidad 12A", creadaEl: iso(-1, H(21)) },
  { id: "rs6", recursoId: "lav-4", unidad: "5C",
    inicio: iso(0, H(9)), fin: iso(0, H(10)),
    estado: "confirmada", creadaPor: "Unidad 5C", creadaEl: iso(-1, H(22)) },
  { id: "rs7", recursoId: "sum-sala", unidad: "2A",
    inicio: iso(1, H(14)), fin: iso(1, H(16)),
    estado: "confirmada", creadaPor: "Unidad 2A", creadaEl: iso(-2, H(10)) },
  { id: "rs8", recursoId: "cowork-sala", unidad: "9B",
    inicio: iso(-2, H(14)), fin: iso(-2, H(16)),
    estado: "finalizada", creadaPor: "Unidad 9B", creadaEl: iso(-5, H(9)) },
  { id: "rs9", recursoId: "parrilla-1", unidad: "4A",
    inicio: iso(-3, H(21)), fin: iso(-3, H(24)),
    estado: "finalizada", creadaPor: "Unidad 4A", creadaEl: iso(-9, H(18)) },
  { id: "rs10", recursoId: "sum-sala", unidad: "11C",
    inicio: iso(-5, H(18)), fin: iso(-5, H(20)),
    estado: "cancelada", creadaPor: "Unidad 11C", creadaEl: iso(-10, H(13)) },
];

export const espacioDe = (recursoId: string) => {
  const r = RECURSOS.find((x) => x.id === recursoId);
  return ESPACIOS.find((e) => e.id === r?.espacioId);
};
export const recursoDe = (recursoId: string) => RECURSOS.find((x) => x.id === recursoId);

/* ── Notificaciones (R03) ────────────────────────────────────────── */
export type Aviso = {
  id: string;
  icono: "caja" | "check" | "calendario" | "alerta" | "lista" | "documento" | "reloj";
  titulo: string; cuando: string; desc: string;
  estado: "sinleer" | "leida" | "archivada"; va?: Vista;
};
/** Los avisos de expensa no están acá: los arma lib/expensas a partir de
 *  la fecha de vencimiento real, así el "está por vencer" no miente. */
export const AVISOS: Aviso[] = [
  { id: "n1", icono: "caja",       titulo: "Paquete recibido",        cuando: "Hace 18 min", desc: "Correo de Lucía para retirar en recepción", estado: "sinleer", va: "r08" },
  { id: "n2", icono: "check",      titulo: "Visita autorizada",       cuando: "Hace 2 h",    desc: "Martín López tiene un pase vigente hoy",     estado: "leida",   va: "r06" },
  { id: "n3", icono: "calendario", titulo: "Reserva confirmada",      cuando: "Ayer",        desc: "SUM · hoy, 20:30–22:30",                     estado: "leida",   va: "r18" },
  { id: "n4", icono: "alerta",     titulo: "Reclamo actualizado",     cuando: "Ayer",        desc: "Ascensor Torre A · asignado a Ascensores Milano", estado: "leida", va: "r09" },
  { id: "n5", icono: "lista",      titulo: "Comunicado del edificio", cuando: "10 sep",      desc: "Corte de agua programado para el sábado",    estado: "archivada" },
];

/* ── Entregas (R08 · G11 · P05) ──────────────────────────────────── */

export type TipoEntrega = "paquete" | "sobre" | "delivery" | "otro";
export const ROTULO_ENTREGA: Record<TipoEntrega, string> = {
  paquete: "Paquete", sobre: "Sobre", delivery: "Delivery de comida", otro: "Otro",
};

export type Entrega = {
  id: string;
  unidad: string;
  titulo: string;
  tipo: TipoEntrega;
  remitente: string;
  estado: "retirar" | "retirado";
  recibidoEl: string;
  recibidoPor: string;
  foto?: string;
  retiradoEl?: string;
  retiradoPor?: string;
  entregadoPor?: string;
};

export const ENTREGAS: Entrega[] = [
  { id: "e1", unidad: U, titulo: "Sobre de Correo Argentino", tipo: "sobre",
    remitente: "Correo Argentino", estado: "retirar",
    recibidoEl: isoDesdeHoy(0, 14, 20), recibidoPor: RECEPCION.nombre, foto: "sobre-7d.jpg" },
  { id: "e2", unidad: U, titulo: "Caja mediana · Mercado Libre", tipo: "paquete",
    remitente: "Mercado Libre", estado: "retirado",
    recibidoEl: isoDesdeHoy(-9, 11, 5), recibidoPor: RECEPCION.nombre,
    retiradoEl: isoDesdeHoy(-8, 19, 5), retiradoPor: RESIDENTE.nombre, entregadoPor: RECEPCION.nombre },
  { id: "e3", unidad: "3B", titulo: "Caja grande · Frávega", tipo: "paquete",
    remitente: "Frávega", estado: "retirar",
    recibidoEl: isoDesdeHoy(0, 11, 40), recibidoPor: RECEPCION.nombre },
  { id: "e4", unidad: "12A", titulo: "Sobre de escribanía", tipo: "sobre",
    remitente: "Escribanía Lauría", estado: "retirar",
    recibidoEl: isoDesdeHoy(-1, 16, 15), recibidoPor: RECEPCION.nombre },
  { id: "e5", unidad: "5C", titulo: "Paquete · Andreani", tipo: "paquete",
    remitente: "Andreani", estado: "retirado",
    recibidoEl: isoDesdeHoy(-2, 10, 0), recibidoPor: RECEPCION.nombre,
    retiradoEl: isoDesdeHoy(-2, 20, 12), retiradoPor: "Nicolás Duarte", entregadoPor: RECEPCION.nombre },
];

/* ── Pase QR (R07) ───────────────────────────────────────────────── */
export const PASE = {
  visita: "Martín López",
  unidad: `Unidad ${RESIDENTE.unidad}`,
  horario: "Hoy · 18:30–23:30",
  codigo: "CT 7D 4821",
  vence: "El pase se activa 30 minutos antes y vence a las 23:30.",
};

/* ── Vistas ──────────────────────────────────────────────────────────
   Los IDs salen de 04_MAPEO_IDS_A_PATRONES.md. Los que no existían en
   ese documento (expensas y votaciones) están marcados abajo. */

export type Vista =
  | "r01" | "r02" | "r03" | "mas" | "r05" | "r06" | "r07" | "r08" | "r09"
  | "g10" | "g11" | "g15" | "r13" | "r14" | "r15" | "r16" | "r17" | "r18" | "r19"
  | "r20" | "r21" | "r22" | "r23" | "r24"
  | "f01" | "f02" | "f03";

/** Pestañas del destino "Mi edificio" (D-07).
 *  Unidad y consorcio son ámbitos de permisos distintos: comparten destino
 *  pero no se mezclan. Por eso son pestañas y no una lista sola. */
export const PESTANAS_EDIFICIO: { id: Vista; rotulo: string }[] = [
  { id: "r02", rotulo: "Unidad" },
  { id: "g15", rotulo: "Edificio" },
  { id: "r14", rotulo: "Documentos" },
];

export const ROTULOS: Record<Vista, string> = {
  r01: "R01 Inicio residente",
  r02: "R02 Mi unidad",
  r03: "R03 Notificaciones",
  mas: "R04 Más",
  r05: "R05 Reservar espacio",
  r06: "R06 Mis visitas",
  r07: "R07 Pase QR",
  r08: "R08 Entregas",
  r09: "R09 Reclamos",
  g10: "G10 Reclamo · detalle",
  g11: "G11 Entrega · detalle",
  g15: "G15 Mi edificio",
  r13: "R13 Espacio común",
  r14: "R14 Documentos",
  r15: "R15 Preferencias",
  r16: "R16 Autorización · detalle",
  r17: "R17 Historial de la unidad",
  r18: "R18 Mis reservas",
  r19: "R19 Preguntas y reglamento",
  r20: "R20 Expensa del mes",
  r21: "R21 Gastos del consorcio",
  r22: "R22 Medios de pago",
  r23: "R23 Estado de cuenta",
  r24: "R24 Votaciones",
  f01: "F01 Autorizar visita",
  f02: "F02 Nuevo reclamo",
  f03: "F03 Informar un pago",
};

/** Permisos por vista. Un residente ve su unidad y nada más. Esto no es
 *  decorativo: la vista lo usa para decidir si muestra el contenido o el
 *  estado "sin permiso". */
export const PERMISO_VISTA: Record<Vista, Perfil[]> = Object.fromEntries(
  (Object.keys(ROTULOS) as Vista[]).map((v) => [v, ["residente"] as Perfil[]])
) as Record<Vista, Perfil[]>;

/** Placeholder de los perfiles operativos mientras no estén diseñados.
 *  Se reemplaza por los shells reales en las fases 4 y 5. */
export const PENDIENTES: Record<Exclude<Perfil, "residente">, {
  tag: string; h: string; s: string; destinos: [string, string][];
}> = {
  recepcion: {
    tag: "P01 · Pendiente de diseño",
    h: "Inicio de recepción",
    s: "La pantalla operativa de recepción todavía no está diseñada. El mapa de navegación ya define sus destinos y permisos.",
    destinos: [["Validar acceso", "P04"], ["Registrar paquete", "P05"], ["Buscar unidad", "P02"], ["Reportar incidente", "P07"]],
  },
  administracion: {
    tag: "A01 · Pendiente de diseño",
    h: "Inicio de administración",
    s: "El panel de administración todavía no está diseñado. El mapa de navegación ya define sus destinos y permisos.",
    destinos: [["Pendientes del día", "A01"], ["Edificios", "A02"], ["Reclamos", "A12"], ["Reservas", "A10"], ["Personas", "A06"]],
  },
};

/* ── Vistas de recepción (P) y de administración (A) ─────────────────
   IDs de 04_MAPEO_IDS_A_PATRONES.md. */

export type VistaP = "p01" | "p02" | "p03" | "p04" | "p05" | "p07" | "p08";

export const ROTULOS_P: Record<VistaP, string> = {
  p01: "P01 Inicio de recepción",
  p02: "P02 Unidades y búsqueda",
  p03: "P03 Escáner",
  p04: "P04 Validar acceso",
  p05: "P05 Entregas",
  p07: "P07 Incidencias",
  p08: "P08 Agenda operativa",
};

export type VistaA =
  | "a01" | "a02" | "a03" | "a04" | "a05" | "a06" | "a07"
  | "a08" | "a09" | "a10" | "a12" | "a13"
  | "a15" | "a16" | "a17";

export const ROTULOS_A: Record<VistaA, string> = {
  a01: "A01 Inicio de administración",
  a02: "A02 Edificios",
  a03: "A03 Edificio",
  a04: "A04 Unidades",
  a05: "A05 Unidad · detalle e historial",
  a06: "A06 Personas",
  a07: "A07 Persona",
  a08: "A08 Accesos",
  a09: "A09 Entregas",
  a10: "A10 Reservas",
  a12: "A12 Reclamos",
  a13: "A13 Documentos",
  a15: "A15 Expensas · períodos",
  a16: "A16 Cargar gastos",
  a17: "A17 Cobranza",
};
