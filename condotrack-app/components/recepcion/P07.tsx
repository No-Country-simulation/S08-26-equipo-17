"use client";
import { avisar } from "../sistema/Tostada";
import { useEffect, useRef, useState } from "react";
import { ReceptionPage } from "./ReceptionPage";
import { Icon } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { StatusTag, Severidad, type Tono } from "../sistema/Estado";
import { RECEPCION, type VistaP } from "@/lib/data";
import { LUGARES, ROTULO_GRAVEDAD, type EstadoIncidencia, type Gravedad, type Incidencia } from "@/lib/edificio";
import { fechaHora, hace, soloHora } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { sinMovimiento } from "@/lib/movimiento";

/** P07 · Incidencias. Referencia primaria: U06 Security.
 *
 *  USER GOAL: dejar asentado lo que pasa y seguir lo que está abierto.
 *  Un solo resumen compacto (gravedad y estado, que además filtran) y la
 *  cola como protagonista. El reporte es un panel lateral que se abre
 *  cuando hace falta, con "Qué pasó" como campo principal. El detalle
 *  separa cuatro cosas que no se mezclan: gravedad (barras), estado del
 *  caso (marca + palabra), responsable (persona/proveedor) y lugar. */

const GRAVEDADES: { id: Gravedad; rotulo: string }[] = [{ id: "alta", rotulo: "Alta" }, { id: "media", rotulo: "Media" }, { id: "baja", rotulo: "Baja" }];
const ESTADOS: { id: EstadoIncidencia; rotulo: string }[] = [{ id: "abierta", rotulo: "Sin derivar" }, { id: "derivada", rotulo: "Derivada" }, { id: "cerrada", rotulo: "Cerrada" }];
const tonoEstado: Record<EstadoIncidencia, Tono> = { abierta: "pendiente", derivada: "curso", cerrada: "hecho" };
const responsableDe = (i: Incidencia) => i.responsable ?? i.derivadaA ?? null;

export function P07({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  void ir;
  const { estado, hacer } = useApp();
  const lista = estado.incidencias;
  const [panel, setPanel] = useState<"form" | "detalle" | null>(refe === "nueva" ? "form" : refe ? "detalle" : null);
  const [elegida, setElegida] = useState<string | null>(refe && refe !== "nueva" ? refe : null);
  const [titulo, setTitulo] = useState("");
  const [lugar, setLugar] = useState(LUGARES[0]);
  const [detalle, setDetalle] = useState("");
  const [gravedad, setGravedad] = useState<Gravedad>("media");
  const [tocado, setTocado] = useState(false);
  const [recien, setRecien] = useState<string | null>(null);
  const [filtroG, setFiltroG] = useState<Gravedad | null>(null);
  const [filtroE, setFiltroE] = useState<EstadoIncidencia | null>(null);
  const campo = useRef<HTMLInputElement>(null);
  const aside = useRef<HTMLElement>(null);
  const origen = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (refe === "nueva") { setPanel("form"); requestAnimationFrame(() => campo.current?.focus()); }
    else if (refe) { setElegida(refe); setPanel("detalle"); }
  }, [refe]);
  useEffect(() => { if (panel === "detalle") aside.current?.focus({ preventScroll: true }); }, [panel, elegida]);

  const abiertas = lista.filter((i) => i.estado !== "cerrada");
  const altas = abiertas.filter((i) => i.gravedad === "alta");
  const sinDerivar = lista.filter((i) => i.estado === "abierta");
  const visibles = lista
    .filter((i) => (filtroE ? i.estado === filtroE : i.estado !== "cerrada"))
    .filter((i) => !filtroG || i.gravedad === filtroG)
    .sort((a, b) => ["alta", "media", "baja"].indexOf(a.gravedad) - ["alta", "media", "baja"].indexOf(b.gravedad) || b.cuando.localeCompare(a.cuando));
  const base = lista.filter((i) => (filtroE ? i.estado === filtroE : i.estado !== "cerrada"));
  const errTitulo = !titulo.trim() ? "Escribí en una línea qué pasó." : undefined;
  const sel = elegida ? lista.find((i) => i.id === elegida) ?? null : null;

  function abrirForm() { setPanel("form"); setElegida(null); requestAnimationFrame(() => campo.current?.focus()); }
  function cerrarPanel() { setPanel(null); setElegida(null); requestAnimationFrame(() => origen.current?.focus({ preventScroll: true })); }
  function ver(i: Incidencia, el: HTMLElement) {
    origen.current = el;
    if (elegida === i.id && panel === "detalle") { cerrarPanel(); return; }
    setElegida(i.id); setPanel("detalle");
  }
  function reportar() {
    setTocado(true);
    if (errTitulo) { campo.current?.focus(); return; }
    const id = `in-${Date.now()}`;
    hacer({ t: "incidencia/crear", incidencia: { id, titulo: titulo.trim(), lugar, detalle: detalle.trim(), gravedad, estado: "abierta", cuando: new Date().toISOString(), reportadaPor: RECEPCION.nombre } });
    avisar({ titulo: "Incidencia reportada · administración avisada", detalle: `${titulo.trim()} · ${lugar}`, icono: "alerta" });
    setTitulo(""); setDetalle(""); setGravedad("media"); setTocado(false);
    setFiltroE(null); setFiltroG(null); setPanel(null); setRecien(id);
    window.setTimeout(() => setRecien(null), sinMovimiento() ? 4000 : 4000);
  }

  const historia = (i: Incidencia) => [
    ...(i.acciones ?? []).slice().reverse(),
    ...(i.estado === "derivada" && i.derivadaA && !(i.acciones ?? []).length ? [{ cuando: i.cuando, texto: `Derivada a ${i.derivadaA}`, autor: i.reportadaPor, rol: "Recepción" }] : []),
    { cuando: i.cuando, texto: "Reportada", autor: i.reportadaPor, rol: "Recepción" },
  ];

  return (
    <ReceptionPage titulo="Incidencias" descripcion="Lo que pasa en el edificio y hay que dejar asentado." icono="alerta" clase="inc2"
      acciones={panel !== "form" ? <button className="ct-btn ct-btn--primario rx-cta-grande" type="button" onClick={abrirForm}><Icon n="mas" s={20} />Nuevo reporte</button> : undefined}>
      <section className="inc2-resumen" aria-label="Resumen de incidencias">
        <div className="inc2-total"><b className="ct-cifra">{String(abiertas.length).padStart(2, "0")}</b><span>abiertas<small>{altas.length ? `${altas.length} de gravedad alta · ` : ""}{sinDerivar.length} sin derivar</small></span></div>
        <div className="inc2-grupo"><span className="ct-label">Gravedad</span>
          <div className="inc2-toggles" role="group" aria-label="Filtrar por gravedad">{GRAVEDADES.map(g => {
            const n = base.filter((i) => i.gravedad === g.id).length;
            return <button key={g.id} type="button" aria-pressed={filtroG === g.id} data-g={g.id} onClick={() => setFiltroG(filtroG === g.id ? null : g.id)}>
              <Severidad g={g.id}>{g.rotulo}</Severidad><b>{n}</b></button>;
          })}</div></div>
        <div className="inc2-grupo"><span className="ct-label">Estado</span>
          <div className="inc2-toggles" role="group" aria-label="Filtrar por estado">{ESTADOS.map(e => {
            const n = lista.filter((i) => i.estado === e.id).length;
            return <button key={e.id} type="button" aria-pressed={filtroE === e.id} onClick={() => setFiltroE(filtroE === e.id ? null : e.id)}>
              <StatusTag tono={tonoEstado[e.id]}>{e.rotulo}</StatusTag><b>{n}</b></button>;
          })}</div></div>
      </section>

      <div className="inc2-marco" data-panel={panel ?? "no"}>
        <section className="inc2-cola" aria-labelledby="inc2-cola-t">
          <header><h2 id="inc2-cola-t" className="ct-h2">{filtroE === "cerrada" ? "Cerradas" : "Cola abierta"}</h2>
            <span role="status" className="ct-meta">{visibles.length} {visibles.length === 1 ? "caso" : "casos"}{(filtroG || filtroE) && <button type="button" className="ct-btn ct-btn--texto" onClick={() => { setFiltroG(null); setFiltroE(null); }}>Quitar filtros</button>}</span></header>
          <div className="ct-tabla-cab inc2-cols" aria-hidden="true"><span>Gravedad</span><span>Qué pasó · dónde</span><span>Responsable</span><span>Estado</span></div>
          <ul className="inc2-lista ct-refiltra" key={`${filtroG}-${filtroE}`}>
            {visibles.map((i) => <li key={i.id} className={recien === i.id ? "ct-insertado" : undefined}>
              <button type="button" className="ct-fila inc2-cols" aria-expanded={panel === "detalle" && elegida === i.id} aria-controls="inc2-panel" onClick={(e) => ver(i, e.currentTarget)}>
                <Severidad g={i.gravedad}>{ROTULO_GRAVEDAD[i.gravedad]}</Severidad>
                <span className="inc2-que"><b>{i.titulo}</b><small><Icon n="pin" s={13} />{i.lugar} · {hace(i.cuando)}</small></span>
                <span className="inc2-resp">{responsableDe(i) ? <><Icon n={i.derivadaA && !i.responsable ? "herramienta" : "persona"} s={15} />{responsableDe(i)}</> : <em>Sin responsable</em>}</span>
                <StatusTag tono={tonoEstado[i.estado]}>{i.estado === "abierta" ? "Sin derivar" : i.estado === "derivada" ? "Derivada" : "Cerrada"}</StatusTag>
              </button>
            </li>)}
          </ul>
          {!visibles.length && <p className="inc2-vacio">{lista.length ? "Nada con estos filtros." : "No hay nada abierto. Buen turno."}</p>}
          {recien && <p className="inc2-aviso ct-resuelve" role="status"><Icon n="check" s={16} />Incidencia reportada a las {soloHora(new Date().toISOString())}. Ya está en la cola y en la bitácora.</p>}
        </section>

        {panel && <aside className="inc2-panel ct-panel" id="inc2-panel" ref={aside} tabIndex={-1}
          aria-label={panel === "form" ? "Reportar una incidencia" : `Incidencia: ${sel?.titulo ?? ""}`}
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); cerrarPanel(); } }}>
          <div className="inc2-panel-barra"><span className="ct-label">{panel === "form" ? "Nuevo reporte" : "Detalle"}</span>
            <button type="button" className="ct-panel-cerrar" onClick={cerrarPanel}><Icon n="cerrar" s={16} />Cerrar</button></div>

          {panel === "form" && <form className="inc2-form" onSubmit={(e) => { e.preventDefault(); reportar(); }} autoComplete="off" noValidate>
            <div className="ct-campo">
              <label htmlFor="inc2-que">Qué pasó</label>
              <input ref={campo} id="inc2-que" name="incidencia-que-paso" className="inc2-que-campo" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej.: Pérdida de agua en el subsuelo" autoComplete="off" aria-invalid={tocado && Boolean(errTitulo)} aria-describedby={tocado && errTitulo ? "inc2-err" : undefined} />
              {tocado && errTitulo && <p id="inc2-err" className="ct-campo-error">{errTitulo}</p>}
            </div>
            <div className="ct-campo">
              <label htmlFor="inc2-donde">Dónde</label>
              <select id="inc2-donde" name="incidencia-lugar" value={lugar} onChange={(e) => setLugar(e.target.value)}>{LUGARES.map((l) => <option key={l}>{l}</option>)}</select>
            </div>
            <div className="ct-campo">
              <span className="ct-campo-rot" id="inc2-grav">Gravedad</span>
              <Segmentado etiqueta="Gravedad" valor={gravedad} onCambio={setGravedad} bloque className="inc2-grav-seg"
                opciones={[...GRAVEDADES].reverse().map((g) => ({ id: g.id, label: g.rotulo }))} />
              <p className="ct-meta">Alta es lo que no puede esperar al turno siguiente.</p>
            </div>
            <div className="ct-campo">
              <label htmlFor="inc2-det">Detalle <small>opcional</small></label>
              <textarea id="inc2-det" name="incidencia-detalle" value={detalle} onChange={(e) => setDetalle(e.target.value)} rows={4} autoComplete="off"
                placeholder="Qué viste, desde cuándo, si alguien lo está mirando." />
            </div>
            <div className="inc2-evidencia"><Icon n="camara" s={18} /><span><b>Foto</b><small>Opcional · se adjunta desde la cámara del mostrador</small></span></div>
            <button className="ct-btn ct-btn--primario ct-btn--ancho" type="submit">Reportar incidencia</button>
          </form>}

          {panel === "detalle" && sel && <div key={sel.id} className="inc2-detalle ct-resuelve">
            <h3 className="inc2-det-titulo">{sel.titulo}</h3>
            <dl className="inc2-det-datos">
              <div><dt>Gravedad</dt><dd><Severidad g={sel.gravedad}>{ROTULO_GRAVEDAD[sel.gravedad]}</Severidad></dd></div>
              <div><dt>Estado del caso</dt><dd><StatusTag tono={tonoEstado[sel.estado]}>{sel.estado === "abierta" ? "Sin derivar" : sel.estado === "derivada" ? "Derivada" : "Cerrada"}</StatusTag></dd></div>
              <div><dt>Responsable</dt><dd className="inc2-det-resp">{responsableDe(sel) ? <><Icon n={sel.derivadaA && !sel.responsable ? "herramienta" : "persona"} s={16} />{responsableDe(sel)}</> : <em>Esperando que administración asigne</em>}</dd></div>
              <div><dt>Lugar</dt><dd><Icon n="pin" s={16} />{sel.lugar}</dd></div>
            </dl>
            {sel.detalle && <p className="inc2-det-texto">{sel.detalle}</p>}
            <h4 className="ct-label">Historial</h4>
            <ol className="ct-tl inc2-tl">{historia(sel).map((h, n) => <li key={n}><time>{soloHora(h.cuando)}</time><i aria-hidden="true" /><span><b>{h.texto}</b><small>{fechaHora(h.cuando)} · {h.autor} · {h.rol}</small></span></li>)}</ol>
          </div>}
        </aside>}
      </div>
    </ReceptionPage>
  );
}
