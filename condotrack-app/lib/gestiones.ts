/** Reclamos, votaciones, documentos y textos de apoyo.
 *  Reclamo usa el patrón Detalle + Timeline del 06_UX_UI_SCOPE (G10). */

import { RESIDENTE } from "./data";
import { isoDesdeHoy } from "./formato";
import type { RolResponsable } from "./unidad";

/* ── reclamos ────────────────────────────────────────────────────── */

export type EstadoReclamo = "nuevo" | "en-gestion" | "asignado" | "resuelto" | "cerrado";

export const ROTULO_RECLAMO: Record<EstadoReclamo, string> = {
  nuevo: "Nuevo",
  "en-gestion": "En gestión",
  asignado: "Asignado",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

/** El orden importa: es el avance del workflow del scope (7. Workflow /
 *  request state). La barra de progreso del detalle lo usa. */
export const PASOS_RECLAMO: EstadoReclamo[] = ["nuevo", "en-gestion", "asignado", "resuelto"];

export type AccionReclamo = {
  id: string;
  cuando: string;
  estado: EstadoReclamo;
  texto: string;
  autor: string;
  rol: RolResponsable;
};

export type CategoriaReclamo =
  | "sin-definir"
  | "ascensores" | "humedad" | "ruidos" | "limpieza"
  | "electricidad" | "plomeria" | "seguridad" | "otro";

/** "Todavía no sé" es la opción por defecto, y es deliberada (D-12): el
 *  residente no tiene por qué saber si una mancha es humedad o plomería.
 *  La categoría se completa del lado de administración antes de cerrar el
 *  reclamo, que es donde la trazabilidad hace falta de verdad. */
export const CATEGORIAS: { id: CategoriaReclamo; rotulo: string }[] = [
  { id: "sin-definir", rotulo: "Todavía no sé" },
  { id: "ascensores", rotulo: "Ascensores" },
  { id: "humedad", rotulo: "Humedad o filtración" },
  { id: "electricidad", rotulo: "Electricidad" },
  { id: "plomeria", rotulo: "Plomería" },
  { id: "limpieza", rotulo: "Limpieza" },
  { id: "ruidos", rotulo: "Ruidos molestos" },
  { id: "seguridad", rotulo: "Seguridad" },
  { id: "otro", rotulo: "Otro" },
];

/** En el formulario la opción se llama "Todavía no sé", porque se la está
 *  eligiendo. Una vez creado el reclamo, el mismo valor se lee como
 *  "Sin clasificar": ahí ya no es una decisión, es un estado. */
export const rotuloCategoria = (c: CategoriaReclamo) =>
  c === "sin-definir"
    ? "Sin clasificar"
    : CATEGORIAS.find((x) => x.id === c)?.rotulo ?? "Sin clasificar";

export const UBICACIONES = [
  "Mi unidad", "Palier del piso", "Hall de entrada", "Ascensor Torre A",
  "Ascensor Torre B", "Terraza", "SUM", "Cowork", "Lavandería",
  "Subsuelo / cocheras", "Fachada", "Otro",
];

export type Reclamo = {
  id: string;
  codigo: string;
  categoria: CategoriaReclamo;
  ubicacion: string;
  descripcion: string;
  foto?: string;
  estado: EstadoReclamo;
  responsable?: string;
  creadoPor: string;
  creadoEl: string;
  unidad: string;
  acciones: AccionReclamo[];
};

export const RECLAMOS: Reclamo[] = [
  {
    id: "rc1", codigo: "RC-0231", categoria: "ascensores", ubicacion: "Ascensor Torre A",
    descripcion: "El ascensor se frena entre el 6 y el 7 y hay que apretar dos veces el botón para que siga.",
    estado: "asignado", responsable: "Ascensores Milano",
    creadoPor: RESIDENTE.nombre, creadoEl: isoDesdeHoy(-9, 20, 15), unidad: RESIDENTE.unidad,
    acciones: [
      { id: "a1", cuando: isoDesdeHoy(-9, 20, 15), estado: "nuevo", texto: "Reclamo creado desde la app.", autor: RESIDENTE.nombre, rol: "Residente" },
      { id: "a2", cuando: isoDesdeHoy(-8, 9, 40), estado: "en-gestion", texto: "Recibido. Pedimos visita técnica al proveedor del abono.", autor: "Mariana Ferrari", rol: "Administración" },
      { id: "a3", cuando: isoDesdeHoy(-4, 11, 15), estado: "asignado", texto: "Asignado a Ascensores Milano. Visita prevista para esta semana.", autor: "Mariana Ferrari", rol: "Administración" },
    ],
  },
  {
    id: "rc2", codigo: "RC-0224", categoria: "humedad", ubicacion: "Mi unidad",
    descripcion: "Mancha de humedad en el techo del baño, abajo de la bajada del 8D.",
    foto: "adjunto-bano.jpg",
    estado: "resuelto", responsable: "Clima Sur SRL",
    creadoPor: RESIDENTE.nombre, creadoEl: isoDesdeHoy(-41, 18, 5), unidad: RESIDENTE.unidad,
    acciones: [
      { id: "b1", cuando: isoDesdeHoy(-41, 18, 5), estado: "nuevo", texto: "Reclamo creado desde la app con foto adjunta.", autor: RESIDENTE.nombre, rol: "Residente" },
      { id: "b2", cuando: isoDesdeHoy(-39, 10, 0), estado: "en-gestion", texto: "Verificado por el encargado. Viene de una junta del 8D.", autor: "Raúl Giménez", rol: "Administración" },
      { id: "b3", cuando: isoDesdeHoy(-33, 15, 30), estado: "asignado", texto: "Asignado a Clima Sur SRL.", autor: "Mariana Ferrari", rol: "Administración" },
      { id: "b4", cuando: isoDesdeHoy(-24, 17, 0), estado: "resuelto", texto: "Junta sellada y pintura retocada. Queda en observación 30 días.", autor: "Clima Sur SRL", rol: "Administración" },
    ],
  },
];

export const reclamoPorId = (id: string) => RECLAMOS.find((r) => r.id === id);

/* ── votaciones ──────────────────────────────────────────────────── */

export type EstadoVotacion = "abierta" | "cerrada" | "proxima";

export type OpcionVotacion = { id: string; texto: string; votos: number };

export type Votacion = {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoVotacion;
  abre: string;
  cierra: string;
  opciones: OpcionVotacion[];
  miVoto?: string;
  padron: number;        // unidades habilitadas
  quorum: number;        // unidades necesarias
};

export const VOTACIONES: Votacion[] = [
  {
    id: "v1",
    titulo: "Recambio de luminarias a LED en palieres",
    descripcion: "Presupuesto de $2.480.000 en tres cuotas, con ahorro estimado del 40% en la luz de espacios comunes. Se vota incluirlo en la expensa de los próximos tres períodos.",
    estado: "abierta",
    abre: isoDesdeHoy(-4, 9), cierra: isoDesdeHoy(6, 23, 59),
    opciones: [
      { id: "si", texto: "A favor", votos: 11 },
      { id: "no", texto: "En contra", votos: 3 },
      { id: "abst", texto: "Abstención", votos: 1 },
    ],
    padron: 24, quorum: 13,
  },
  {
    id: "v2",
    titulo: "Horario de uso de la parrilla los domingos",
    descripcion: "Se propone extender el uso de la parrilla los domingos hasta las 01:00 en vez de las 00:00.",
    estado: "proxima",
    abre: isoDesdeHoy(9, 9), cierra: isoDesdeHoy(19, 23, 59),
    opciones: [
      { id: "si", texto: "A favor", votos: 0 },
      { id: "no", texto: "En contra", votos: 0 },
    ],
    padron: 24, quorum: 13,
  },
  {
    id: "v3",
    titulo: "Contratación del seguro integral 2026",
    descripcion: "Se votó entre tres compañías con cobertura equivalente.",
    estado: "cerrada",
    abre: isoDesdeHoy(-64, 9), cierra: isoDesdeHoy(-50, 23, 59),
    opciones: [
      { id: "seg", texto: "La Segunda", votos: 14 },
      { id: "san", texto: "Sancor", votos: 5 },
      { id: "riv", texto: "Rivadavia", votos: 2 },
    ],
    miVoto: "seg",
    padron: 24, quorum: 13,
  },
];

export const votosDe = (v: Votacion) => v.opciones.reduce((a, o) => a + o.votos, 0);

/* ── documentos (R14) ────────────────────────────────────────────── */

export type Documento = {
  id: string;
  titulo: string;
  tipo: "reglamento" | "acta" | "rendicion" | "seguro" | "plano";
  peso: string;
  fecha: string;
  archivo: string;
};

export const DOCUMENTOS: Documento[] = [
  { id: "d1", titulo: "Reglamento interno de convivencia", tipo: "reglamento", peso: "412 KB",
    fecha: isoDesdeHoy(-380, 10), archivo: "CondoTrack_Reglamento_Araoz1280.pdf" },
  { id: "d2", titulo: "Acta de asamblea ordinaria", tipo: "acta", peso: "1,2 MB",
    fecha: isoDesdeHoy(-95, 10), archivo: "CondoTrack_Acta_Asamblea_Araoz1280.pdf" },
  { id: "d3", titulo: "Rendición del período anterior", tipo: "rendicion", peso: "860 KB",
    fecha: isoDesdeHoy(-30, 10), archivo: "CondoTrack_Rendicion_Araoz1280_anterior.pdf" },
  { id: "d4", titulo: "Póliza del seguro integral", tipo: "seguro", peso: "640 KB",
    fecha: isoDesdeHoy(-210, 10), archivo: "CondoTrack_Poliza_LaSegunda_Araoz1280.pdf" },
  { id: "d5", titulo: "Plano de evacuación", tipo: "plano", peso: "2,4 MB",
    fecha: isoDesdeHoy(-520, 10), archivo: "CondoTrack_PlanoEvacuacion_Araoz1280.pdf" },
];

export const ROTULO_DOC: Record<Documento["tipo"], string> = {
  reglamento: "Reglamento",
  acta: "Acta",
  rendicion: "Rendición",
  seguro: "Seguro",
  plano: "Plano",
};

/* ── preguntas frecuentes y reglamento (R19) ─────────────────────── */

export const FAQ: { p: string; r: string }[] = [
  { p: "¿Cómo autorizo una visita?",
    r: "Desde Inicio o desde Mi unidad, tocá Autorizar visita. Cargás el nombre, el día y la franja horaria, y el pase queda disponible al instante. Recepción lo ve en su pantalla sin que tengas que avisar." },
  { p: "¿Qué pasa si mi visita llega antes del horario?",
    r: "El pase se activa 30 minutos antes de la franja que pusiste. Si llega antes, recepción te llama para confirmar el ingreso." },
  { p: "¿Puedo cancelar una reserva?",
    r: "Sí, hasta 30 minutos antes de que empiece, desde Mis reservas. Después de esa hora el turno queda tomado." },
  { p: "¿Quién puede entrar sin que yo autorice cada vez?",
    r: "Solamente las personas con permiso permanente. Están listadas en Mi unidad y las podés dar de baja cuando quieras: la baja es inmediata y queda registrada." },
  { p: "¿Cuándo vencen las expensas?",
    r: "El día 20 de cada mes. Si pagás por transferencia, informá el pago desde la app para que administración lo concilie más rápido." },
  { p: "¿Qué hago si no estoy para recibir un paquete?",
    r: "Recepción lo recibe y lo guarda. Te llega un aviso y lo retirás cuando puedas: queda registrado quién lo dejó, quién lo retiró y a qué hora." },
];

export const REGLAMENTO: { titulo: string; puntos: string[] }[] = [
  { titulo: "Convivencia",
    puntos: [
      "El horario de silencio es de 22:00 a 08:00 de domingo a jueves, y de 00:00 a 09:00 viernes y sábados.",
      "Las mudanzas se hacen de lunes a viernes de 09:00 a 18:00 y se avisan con 48 horas de anticipación.",
      "No se pueden dejar objetos personales en palieres ni en escaleras.",
    ] },
  { titulo: "Espacios comunes",
    puntos: [
      "El SUM se entrega y se devuelve limpio. Música permitida hasta las 23:00.",
      "La parrilla se apaga a las 00:00. El carbón y los utensilios son a cargo del residente.",
      "En la lavandería se reserva una máquina por turno. Hay que retirar la ropa al terminar el ciclo.",
    ] },
  { titulo: "Accesos",
    puntos: [
      "Toda visita necesita una autorización vigente de la unidad.",
      "Recepción valida el pase y registra el ingreso como dos acciones distintas. Las dos quedan en el historial de la unidad.",
      "Los permisos permanentes los da el titular de la unidad y se pueden revocar en cualquier momento.",
    ] },
  { titulo: "Expensas",
    puntos: [
      "Vencen el día 20 de cada mes.",
      "Después del vencimiento corre un interés del 1,5% mensual sobre el saldo impago.",
      "La rendición del período está disponible en la app desde el día 5 del mes siguiente.",
    ] },
];
