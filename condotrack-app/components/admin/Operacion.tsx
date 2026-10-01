"use client";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { StatusTag, Severidad, type Tono } from "../sistema/Estado";
import { AdminPagina } from "./AdminMarco";
import { ListaDetalle, BuscarEnLista, Datos, normalizar } from "./ListaDetalle";
import { useApp } from "@/lib/estado";
import { ADMINISTRACION, ROTULO_TIPO_VISITA, type Visita, type Entrega, type VistaA } from "@/lib/data";
import { ROTULO_GRAVEDAD, type Incidencia, type Gravedad } from "@/lib/edificio";
import { ROTULO_RECLAMO, rotuloCategoria, type Reclamo } from "@/lib/gestiones";
import { ROTULO_PERMISO } from "@/lib/unidad";
import { RESPONSABLES } from "@/lib/admin";
import { fechaHora, hace, soloHora } from "@/lib/formato";

type Ir = (v: VistaA, ref?: string) => void;
const YO = ADMINISTRACION.nombre;

/* ══ A12 · Casos · U06 Security ═══════════════════════════════════════════
   Reclamos de residentes e incidencias de recepción en una sola cola.
   Severidad ≠ estado ≠ responsable ≠ categoría: cada uno tiene su columna
   y su forma. La acción (asignar, derivar, cerrar) vive en el detalle. */
type Caso = { id: string; origen: "Recepción" | "Residente"; titulo: string; lugar: string; unidad?: string; gravedad?: Gravedad; categoria?: string;
  estado: string; tono: Tono; abierto: boolean; responsable: string | null; cuando: string; reporto: string;
  inc?: Incidencia; rec?: Reclamo };

function casos(incidencias: Incidencia[], reclamos: Reclamo[]): Caso[] {
  return [
    ...incidencias.map((i): Caso => ({ id: i.id, origen: "Recepción", titulo: i.titulo, lugar: i.lugar, gravedad: i.gravedad,
      estado: i.estado === "abierta" ? "Sin derivar" : i.estado === "derivada" ? "Derivada" : "Cerrada",
      tono: i.estado === "abierta" ? "pendiente" : i.estado === "derivada" ? "curso" : "hecho", abierto: i.estado !== "cerrada",
      responsable: i.responsable ?? i.derivadaA ?? null, cuando: i.cuando, reporto: i.reportadaPor, inc: i })),
    ...reclamos.map((r): Caso => ({ id: r.id, origen: "Residente", titulo: `${r.codigo} · ${r.descripcion.split(".")[0]}`, lugar: r.ubicacion, unidad: r.unidad,
      categoria: rotuloCategoria(r.categoria), estado: ROTULO_RECLAMO[r.estado], tono: r.estado === "resuelto" || r.estado === "cerrado" ? "hecho" : r.estado === "nuevo" ? "pendiente" : "curso",
      abierto: r.estado !== "resuelto" && r.estado !== "cerrado", responsable: r.responsable ?? null, cuando: r.creadoEl, reporto: r.creadoPor, rec: r })),
  ].sort((a, b) => Number(b.abierto) - Number(a.abierto) || ["alta", "media", "baja", undefined].indexOf(a.gravedad) - ["alta", "media", "baja", undefined].indexOf(b.gravedad) || b.cuando.localeCompare(a.cuando));
}

export function A12({ refe }: { ir: Ir; refe?: string }) {
  const { estado, hacer } = useApp();
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"abiertos" | "altas" | "sin" | "cerrados" | "todos">("abiertos");
  const [origen, setOrigen] = useState<"todos" | "Recepción" | "Residente">("todos");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  useEffect(() => { if (refe) { setSel(refe); setCorte("todos"); } }, [refe]);
  const todos = casos(estado.incidencias, estado.reclamos);
  const lista = todos
    .filter(c => corte === "todos" || (corte === "abiertos" ? c.abierto : corte === "altas" ? c.abierto && c.gravedad === "alta" : corte === "sin" ? c.abierto && !c.responsable : !c.abierto))
    .filter(c => origen === "todos" || c.origen === origen)
    .filter(c => normalizar(`${c.titulo} ${c.lugar} ${c.responsable ?? ""} ${c.unidad ?? ""}`).includes(normalizar(q)));
  const abiertos = todos.filter(c => c.abierto);
  const filtrado = corte !== "abiertos" || origen !== "todos" || q.trim() !== "";
  const limpiar = () => { setCorte("abiertos"); setOrigen("todos"); setQ(""); };

  /* ADM-015 · el resumen de cuatro KPI grandes pasa a ser los filtros
     mismos, con su conteo: cada número filtra de verdad y el activo se ve.
     Sin cifras que sólo decoran. */
  return <AdminPagina titulo="Casos" descripcion="Reclamos de residentes e incidencias de recepción: clasificar, asignar y seguir hasta cerrar." clase="ad-a12">
    <ListaDetalle<Caso> etiqueta="Casos" items={lista} clave={c => c.id} seleccion={sel} onSeleccion={setSel} filtroClave={`${corte}-${origen}`}
      rotuloDetalle={c => c.titulo}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Caso, lugar, unidad o responsable" etiqueta="Buscar casos" />
        <Segmentado etiqueta="Estado de los casos" valor={corte} onCambio={setCorte}
          opciones={[{ id: "abiertos", label: "Abiertos", cuenta: abiertos.length },
            { id: "altas", label: "Gravedad alta", cuenta: abiertos.filter(c => c.gravedad === "alta").length },
            { id: "sin", label: "Sin responsable", cuenta: abiertos.filter(c => !c.responsable).length },
            { id: "cerrados", label: "Cerrados", cuenta: todos.length - abiertos.length },
            { id: "todos", label: "Todos", cuenta: todos.length }]} />
        <Segmentado etiqueta="Origen" valor={origen} onCambio={setOrigen}
          opciones={[{ id: "todos", label: "Todo origen" },
            { id: "Recepción", label: "Recepción", cuenta: todos.filter(c => c.origen === "Recepción").length },
            { id: "Residente", label: "Residentes", cuenta: todos.filter(c => c.origen === "Residente").length }]} />
        <span className="ad-conteo-lista" aria-live="polite">{lista.length} de {todos.length}</span>
        {filtrado && <button type="button" className="ct-btn ct-btn--texto" onClick={limpiar}>Limpiar filtros</button>}
      </>}
      vacio={<div className="ad-vacio"><p>No hay casos con estos filtros.</p>{filtrado && <button type="button" className="ct-btn ct-btn--texto" onClick={limpiar}>Limpiar filtros</button>}</div>}
      columnas={[
        { id: "sev", titulo: "Gravedad", ancho: "110px", celda: c => c.gravedad ? <Severidad g={c.gravedad}>{ROTULO_GRAVEDAD[c.gravedad]}</Severidad> : <span className="ad-sin">Sin clasificar</span> },
        { id: "caso", titulo: "Caso · dónde", celda: c => <span className="ad-dos"><b>{c.titulo}</b><small>{c.origen} · {c.lugar}{c.unidad ? ` · Unidad ${c.unidad}` : ""} · {hace(c.cuando)}</small></span> },
        { id: "resp", opc: true, titulo: "Responsable", ancho: "minmax(120px,190px)", celda: c => c.responsable ? <span className="ad-resp"><Icon n="persona" s={15} />{c.responsable}</span> : <em className="ad-sin">Sin responsable</em> },
        { id: "est", titulo: "Estado", ancho: "120px", celda: c => <StatusTag tono={c.tono}>{c.estado}</StatusTag> },
      ]}
      detalle={c => <DetalleCaso c={c} hacer={hacer} />} />
  </AdminPagina>;
}

function DetalleCaso({ c, hacer }: { c: Caso; hacer: ReturnType<typeof useApp>["hacer"] }) {
  const [resp, setResp] = useState(c.responsable ?? "");
  const [nota, setNota] = useState("");
  const [tocado, setTocado] = useState(false);
  const historia = c.inc
    ? [...(c.inc.acciones ?? []).slice().reverse().map(a => ({ cuando: a.cuando, texto: a.texto, quien: `${a.autor} · ${a.rol}` })),
       { cuando: c.inc.cuando, texto: "Reportada por recepción", quien: `${c.inc.reportadaPor} · Recepción` }]
    : (c.rec?.acciones ?? []).slice().reverse().map(a => ({ cuando: a.cuando, texto: a.texto, quien: `${a.autor} · ${a.rol}` }));
  function asignar() {
    if (!resp || resp === c.responsable) return;
    if (c.inc) hacer({ t: "incidencia/actualizar", id: c.id, responsable: resp, estado: c.inc.estado === "abierta" ? "derivada" : c.inc.estado, texto: `Asignada a ${resp}.`, por: YO });
    else hacer({ t: "reclamo/asignar", id: c.id, responsable: resp, autor: YO });
  }
  function cerrar() {
    setTocado(true);
    if (!nota.trim()) return;
    if (c.inc) hacer({ t: "incidencia/actualizar", id: c.id, estado: "cerrada", texto: `Cerrada: ${nota.trim()}`, por: YO });
    else hacer({ t: "reclamo/avanzar", id: c.id, estado: "resuelto", texto: nota.trim(), autor: YO });
    setNota(""); setTocado(false);
  }
  return <div className="ad-det">
    <h2 className="ad-det-titulo">{c.titulo}</h2>
    <Datos filas={[
      ["Origen", c.origen === "Recepción" ? `Recepción · reportó ${c.reporto}` : `Residente · ${c.reporto} · Unidad ${c.unidad}`],
      ["Gravedad", c.gravedad ? <Severidad g={c.gravedad}>{ROTULO_GRAVEDAD[c.gravedad]}</Severidad> : <span className="ad-sin">Sin clasificar</span>],
      ["Estado", <StatusTag key="e" tono={c.tono}>{c.estado}</StatusTag>],
      ["Responsable", c.responsable ? <span className="ad-resp"><Icon n="persona" s={15} />{c.responsable}</span> : <em className="ad-sin">Sin responsable</em>],
      ["Lugar", <span key="l" className="ad-resp"><Icon n="pin" s={15} />{c.lugar}</span>],
      ...(c.categoria ? [["Categoría", c.categoria] as [string, string]] : []),
    ]} />
    {(c.inc?.detalle || c.rec?.descripcion) && <p className="ad-det-texto">{c.inc?.detalle || c.rec?.descripcion}</p>}
    {c.abierto && <section className="ad-det-accion">
      <h3 className="ct-label">Asignar responsable</h3>
      <div className="ad-fila-form">
        <div className="ct-campo"><label className="solo-lectores" htmlFor={`resp-${c.id}`}>Responsable</label>
          <select id={`resp-${c.id}`} value={resp} onChange={e => setResp(e.target.value)}><option value="">Elegí a quién</option>{RESPONSABLES.map(r => <option key={r}>{r}</option>)}</select></div>
        <button type="button" className="ct-btn ct-btn--fuerte" disabled={!resp || resp === c.responsable} onClick={asignar}>Asignar</button>
      </div>
      <h3 className="ct-label">Cerrar el caso</h3>
      <div className="ct-campo"><label className="solo-lectores" htmlFor={`nota-${c.id}`}>Resolución</label>
        <textarea id={`nota-${c.id}`} rows={2} value={nota} onChange={e => setNota(e.target.value)} placeholder="Qué se hizo. Queda en el historial." aria-invalid={tocado && !nota.trim()} />
        {tocado && !nota.trim() && <p className="ct-campo-error">Para cerrar hace falta contar qué se hizo.</p>}</div>
      <button type="button" className="ct-btn ct-btn--secundario" onClick={cerrar}>Cerrar con esta resolución</button>
    </section>}
    <h3 className="ct-label">Historial</h3>
    <ol className="ct-tl ad-tl">{historia.map((h, n) => <li key={n}><time>{soloHora(h.cuando)}</time><i aria-hidden="true" /><span><b>{h.texto}</b><small>{fechaHora(h.cuando)} · {h.quien}</small></span></li>)}</ol>
  </div>;
}

/* ══ A08 · Accesos · U06 ══════════════════════════════════════════════════
   Autorizaciones (pases y permisos permanentes) con su estado y la
   presencia real que sale de los movimientos. Auditoría, no operación. */
type Acceso = { id: string; nombre: string; tipo: string; unidad: string; cuando: string; horario: string; estado: string; tono: Tono; presencia: string; v?: Visita; permanente?: boolean; detalle?: string };

export function A08({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"hoy" | "proximos" | "historial" | "permanentes">("hoy");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const hoy = new Date().toDateString();
  const pases: Acceso[] = estado.visitas.map(v => ({ id: v.id, nombre: v.nombre, tipo: ROTULO_TIPO_VISITA[v.tipo], unidad: v.unidad, cuando: v.fecha, horario: `${v.dia ?? "Hoy"} · ${v.horario}`,
    estado: v.estado === "vigente" ? "Vigente" : v.estado === "programada" ? "Programado" : v.estado === "finalizada" ? "Finalizado" : "Cancelado",
    tono: v.estado === "vigente" ? "ok" : v.estado === "programada" ? "pendiente" : v.estado === "cancelada" ? "error" : "hecho",
    presencia: v.egresoEl ? "Salió" : v.ingresoEl ? "Adentro" : "Sin ingreso", v }));
  const permanentes: Acceso[] = estado.permisos.map(p => ({ id: p.id, nombre: p.nombre, tipo: ROTULO_PERMISO[p.tipo], unidad: "7D", cuando: new Date().toISOString(), horario: p.detalle,
    estado: p.activo ? "Activo" : "Dado de baja", tono: p.activo ? "ok" : "hecho", presencia: "—", permanente: true, detalle: p.detalle }));
  const base = corte === "permanentes" ? permanentes : pases.filter(a => corte === "hoy" ? new Date(a.cuando).toDateString() === hoy
    : corte === "proximos" ? new Date(a.cuando) > new Date() && new Date(a.cuando).toDateString() !== hoy : a.v?.estado === "finalizada" || a.v?.estado === "cancelada");
  const lista = base.filter(a => normalizar(`${a.nombre} ${a.unidad} ${a.v?.codigo ?? ""}`).includes(normalizar(q)));
  const adentro = pases.filter(a => a.presencia === "Adentro").length;

  return <AdminPagina titulo="Accesos" descripcion="Autorizaciones, permisos permanentes y movimientos. La operación del día sigue en recepción." clase="ad-a08">
    <dl className="ad-resumen">
      <div><dt>Pases de hoy</dt><dd className="ct-cifra">{String(pases.filter(a => new Date(a.cuando).toDateString() === hoy).length).padStart(2, "0")}</dd>
        {(() => { const p = pases.filter(a => a.v?.estado === "programada" && new Date(a.cuando).toDateString() === hoy)[0]; return p ? <small className="ad-kpi-sub">Próximo {p.horario.split(" · ")[1] ?? ""} · {p.nombre}</small> : null; })()}</div>
      <div><dt>Dentro del edificio</dt><dd className="ct-cifra">{String(adentro).padStart(2, "0")}</dd></div>
      <div><dt>Permisos activos</dt><dd className="ct-cifra">{String(permanentes.filter(p => p.estado === "Activo").length).padStart(2, "0")}</dd></div>
    </dl>
    <ListaDetalle<Acceso> etiqueta="Accesos" items={lista} clave={a => a.id} seleccion={sel} onSeleccion={setSel} filtroClave={corte} rotuloDetalle={a => a.nombre}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Persona, unidad o código de pase" etiqueta="Buscar accesos" />
        <Segmentado etiqueta="Qué accesos" valor={corte} onCambio={v => { setCorte(v); setSel(null); }}
          opciones={[{ id: "hoy", label: "Hoy" }, { id: "proximos", label: "Próximos" }, { id: "historial", label: "Historial" }, { id: "permanentes", label: "Permanentes" }]} />
      </>}
      vacio={<p>No hay accesos en este corte.</p>}
      columnas={[
        { id: "quien", titulo: "Quién", celda: a => <span className="ad-dos"><b>{a.nombre}</b><small>{a.tipo}{a.v ? ` · ${a.v.codigo}` : ""}</small></span> },
        { id: "uni", titulo: "Unidad", ancho: "80px", celda: a => <b className="ad-mono">{a.unidad}</b> },
        /* A03-04 · el día arriba y la franja abajo: agrupado, sin badge gigante */
        { id: "cuando", opc: true, titulo: "Autorizado para", ancho: "minmax(150px,210px)", celda: a => { const [d, h] = a.horario.includes(" · ") ? a.horario.split(" · ") : [a.horario, ""];
          return <span className="ad-cuando"><b>{d}</b>{h && <small>{h}</small>}</span>; } },
        { id: "est", titulo: "Pase", ancho: "130px", celda: a => <StatusTag tono={a.tono}>{a.estado}</StatusTag> },
        /* A03-03 · la presencia también es un estado */
        { id: "pres", opc: true, titulo: "Presencia", ancho: "130px", celda: a => a.presencia === "—" ? <span className="ad-sin">—</span>
          : <StatusTag tono={a.presencia === "Adentro" ? "curso" : a.presencia === "Salió" ? "hecho" : "neutro"}>{a.presencia === "Adentro" ? "En el edificio" : a.presencia}</StatusTag> },
      ]}
      detalle={a => <div className="ad-det">
        <h2 className="ad-det-titulo">{a.nombre}</h2>
        <Datos filas={[["Tipo", a.tipo], ["Unidad", a.unidad], ["Autorizado para", a.horario], ["Estado del pase", <StatusTag key="e" tono={a.tono}>{a.estado}</StatusTag>], ["Presencia", a.presencia],
          ...(a.v ? [["Autorizó", `${a.v.creadaPor} · ${fechaHora(a.v.creadaEl)}`] as [string, string]] : [])]} />
        {a.v && <><h3 className="ct-label">Movimientos</h3>
          <ol className="ct-tl ad-tl">{([["Autorización creada", a.v.creadaEl, a.v.creadaPor], ["Pase validado", a.v.validadaEl, a.v.validadaPor], ["Ingreso registrado", a.v.ingresoEl, a.v.ingresoPor], ["Egreso registrado", a.v.egresoEl, a.v.egresoPor]] as const)
            .filter(([, cuando]) => cuando).reverse().map(([t, cuando, quien]) => <li key={t}><time>{soloHora(cuando!)}</time><i aria-hidden="true" /><span><b>{t}</b><small>{fechaHora(cuando!)} · {quien}</small></span></li>)}</ol></>}
        {a.permanente && <p className="ad-det-texto">Permiso permanente otorgado por la unidad. Suspender o revocar requiere motivo y queda auditado.</p>}
        <button type="button" className="ct-btn ct-btn--secundario" onClick={() => ir("a04", a.unidad)}><Icon n="personas" s={16} />Ver unidad {a.unidad}</button>
      </div>} />
  </AdminPagina>;
}

/* ══ A09 · Entregas · supervisión ════════════════════════════════════════ */
export function A09({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"sin" | "retiradas" | "todas">("sin");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const est = (e: Entrega) => e.estado === "retirado" ? "Retirado" : e.avisadoEl ? "Avisado" : "Recibido";
  /* nunca negativa: una entrega cargada con hora posterior a ahora no tiene custodia todavía */
  const horas = (e: Entrega) => Math.max(0, Math.round(((e.retiradoEl ? new Date(e.retiradoEl) : new Date()).getTime() - new Date(e.recibidoEl).getTime()) / 3600000));
  const lista = estado.entregas.filter(e => corte === "todas" || (corte === "sin" ? e.estado === "retirar" : e.estado === "retirado"))
    .filter(e => normalizar(`${e.titulo} ${e.remitente} ${e.unidad}`).includes(normalizar(q)))
    .sort((a, b) => b.recibidoEl.localeCompare(a.recibidoEl));
  const sin = estado.entregas.filter(e => e.estado === "retirar");
  return <AdminPagina titulo="Entregas" descripcion="Supervisión y trazabilidad de la custodia. Registrar y entregar sigue en recepción." clase="ad-a09">
    <dl className="ad-resumen">
      <div><dt>En custodia</dt><dd className="ct-cifra">{String(sin.length).padStart(2, "0")}</dd></div>
      <div><dt>Más de 24 h</dt><dd className="ct-cifra">{String(sin.filter(e => horas(e) > 24).length).padStart(2, "0")}</dd></div>
      <div><dt>Retiradas</dt><dd className="ct-cifra">{String(estado.entregas.length - sin.length).padStart(2, "0")}</dd></div>
    </dl>
    <ListaDetalle<Entrega> etiqueta="Entregas" items={lista} clave={e => e.id} seleccion={sel} onSeleccion={setSel} filtroClave={corte} rotuloDetalle={e => e.titulo}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Remitente, unidad o paquete" etiqueta="Buscar entregas" />
        <Segmentado etiqueta="Qué entregas" valor={corte} onCambio={v => { setCorte(v); setSel(null); }}
          opciones={[{ id: "sin", label: "En custodia", cuenta: sin.length }, { id: "retiradas", label: "Retiradas" }, { id: "todas", label: "Todas" }]} />
      </>}
      vacio={<p>Nada en este corte.</p>}
      columnas={[
        { id: "que", titulo: "Entrega", celda: e => <span className="ad-dos"><b>{e.titulo}</b><small>{e.remitente}</small></span> },
        { id: "uni", titulo: "Unidad", ancho: "80px", celda: e => <b className="ad-mono">{e.unidad}</b> },
        { id: "est", titulo: "Estado", ancho: "110px", celda: e => <StatusTag tono={e.estado === "retirado" ? "ok" : e.avisadoEl ? "curso" : "pendiente"}>{est(e)}</StatusTag> },
        { id: "cust", opc: true, titulo: "Custodia", ancho: "110px", celda: e => <span className={horas(e) > 24 && e.estado === "retirar" ? "ad-fuerte" : "ad-meta"}>{horas(e)} h</span> },
      ]}
      detalle={e => <div className="ad-det">
        <h2 className="ad-det-titulo">{e.titulo}</h2>
        <Datos filas={[["Unidad", e.unidad], ["Remitente", e.remitente], ["Estado", <StatusTag key="e" tono={e.estado === "retirado" ? "ok" : "curso"}>{est(e)}</StatusTag>], ["En custodia", `${horas(e)} h`]]} />
        <h3 className="ct-label">Trazabilidad</h3>
        <ol className="ct-tl ad-tl">{([["Retirada", e.retiradoEl, e.retiradoPor ? `retiró ${e.retiradoPor} · entregó ${e.entregadoPor}` : ""], ["Aviso a la unidad", e.avisadoEl, "automático al registrar"], ["Recibida en recepción", e.recibidoEl, e.recibidoPor]] as const)
          .filter(([, c]) => c).map(([t, c, quien]) => <li key={t}><time>{soloHora(c!)}</time><i aria-hidden="true" /><span><b>{t}</b><small>{fechaHora(c!)} · {quien}</small></span></li>)}</ol>
        <button type="button" className="ct-btn ct-btn--secundario" onClick={() => ir("a04", e.unidad)}><Icon n="personas" s={16} />Ver unidad {e.unidad}</button>
      </div>} />
  </AdminPagina>;
}
