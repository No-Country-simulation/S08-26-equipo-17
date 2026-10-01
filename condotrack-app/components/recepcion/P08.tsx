"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { CalendarioMes } from "../ui/CalendarioMes";
import { Hoja } from "../ui/Hoja";
import { Segmentado } from "../sistema/Segmentado";
import { StatusTag, type Tono } from "../sistema/Estado";
import { VolverA } from "./ReceptionPage";
import { ESPACIOS, RECURSOS, type VistaP } from "@/lib/data";
import { ROTULO_AGENDA, type TipoAgenda } from "@/lib/edificio";
import { soloHora } from "@/lib/formato";
import { agendaOperativa, mismoDiaOperativo, type EventoAgendaOperativa } from "@/lib/recepcion";
import { useApp, type Estado } from "@/lib/estado";
import { sinMovimiento } from "@/lib/movimiento";

/** P08 · Agenda. Referencia primaria: U01 Planner (U08 sólo para el detalle).
 *
 *  USER GOAL: saber qué pasa hoy y qué viene, y abrir lo que hay que operar.
 *  Columna izquierda hundida, como el Planner: primero los filtros (lo que
 *  querés ver), después el mes. Sin reloj: la hora ya está en el eje. A la
 *  derecha el día: fecha, el próximo evento como una línea, el eje horario
 *  y los eventos, todos del mismo material. El detalle es una tercera
 *  columna que entra desde la derecha sin tapar el calendario ni el evento
 *  elegido; en tablet y móvil es una hoja. Si una acción lleva a otra
 *  pantalla, allá hay "Volver a Agenda". */

const PX_MIN = 1.4;                    // 84 px por hora
const TIPOS: { id: "todos" | TipoAgenda; rotulo: string; icono: NombreIcono }[] = [
  { id: "todos", rotulo: "Toda la jornada", icono: "lista" },
  { id: "visita", rotulo: "Visitas", icono: "persona" },
  { id: "proveedor", rotulo: "Proveedores", icono: "herramienta" },
  { id: "reserva", rotulo: "Reservas", icono: "casa" },
  { id: "mudanza", rotulo: "Mudanzas", icono: "caja" },
  { id: "tarea", rotulo: "Tareas", icono: "check" },
];

function estadoDe(a: EventoAgendaOperativa): { rotulo: string; tono: Tono } {
  if (a.hecho) return { rotulo: "Hecho", tono: "hecho" };
  const v = a.estadoVisible;
  if (!v) return { rotulo: "Programado", tono: "pendiente" };
  if (v === "Aprobada" || v === "Dentro del edificio") return { rotulo: v, tono: "ok" };
  return { rotulo: v, tono: "hecho" };
}
const lugarDe = (a: EventoAgendaOperativa) => (a.unidad ? `Unidad ${a.unidad}` : ROTULO_AGENDA[a.tipo]);

/** Lo que el detalle sabe de cada evento: imagen de contexto (sólo assets
 *  aprobados del proyecto), datos operativos y una única acción. */
function fichaDe(a: EventoAgendaOperativa, estado: Estado) {
  const visita = estado.visitas.find(v => `visita-${v.id}` === a.id);
  const reserva = estado.reservas.find(r => `reserva-${r.id}` === a.id);
  const espacio = reserva ? ESPACIOS.find(e => e.id === RECURSOS.find(r => r.id === reserva.recursoId)?.espacioId) : undefined;
  const datos: [string, string][] = [];
  let imagen: string | undefined;
  let accion: { rotulo: string; detalle?: string; icono: NombreIcono; destino: { vista: VistaP; ref?: string } } | null = null;
  if (visita) {
    imagen = visita.tipo === "visita" ? "/img/hero_araoz.jpg" : "/img/fachada.jpg";
    datos.push(["Horario", visita.horario], ["Autoriza", `${visita.creadaPor} · Unidad ${visita.unidad}`], ["Pase", visita.codigo]);
    if (visita.nota) datos.push(["Nota", visita.nota]);
    if (visita.ingresoEl) datos.push(["Ingreso", `${soloHora(visita.ingresoEl)} · ${visita.ingresoPor ?? "Recepción"}`]);
    accion = { rotulo: "Abrir pase", detalle: visita.codigo, icono: "qr", destino: { vista: "p04", ref: visita.codigo } };
  } else if (reserva) {
    imagen = espacio?.img;
    datos.push(["Espacio", `${espacio?.nombre ?? a.titulo}${espacio?.piso ? ` · ${espacio.piso}` : ""}`], ["Horario", `${soloHora(reserva.inicio)}–${soloHora(reserva.fin)}`], ["Reserva", `Unidad ${reserva.unidad}`]);
    accion = { rotulo: `Ver unidad ${reserva.unidad}`, icono: "personas", destino: { vista: "p02", ref: reserva.unidad } };
  } else {
    if (a.detalle) datos.push(["Detalle", a.detalle]);
    if (a.tipo === "mudanza") datos.push(["Aprobación", "Administración · recepción acompaña el horario y el ascensor"]);
    if (a.unidad) accion = { rotulo: `Ver unidad ${a.unidad}`, icono: "personas", destino: { vista: "p02", ref: a.unidad } };
  }
  return { datos, imagen, accion };
}

function useAncho(minimo: number) {
  const [ancho, setAncho] = useState(true);
  useEffect(() => {
    const mq = matchMedia(`(min-width: ${minimo}px)`);
    const cambiar = () => setAncho(mq.matches);
    cambiar();
    mq.addEventListener("change", cambiar);
    return () => mq.removeEventListener("change", cambiar);
  }, [minimo]);
  return ancho;
}

export function P08({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const escritorio = useAncho(901);
  const [ahora, setAhora] = useState(() => new Date());
  const [dia, setDia] = useState(() => new Date());
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  useEffect(() => { const id = window.setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(id); }, []);
  const eventos = useMemo(() => agendaOperativa(estado), [estado]);
  const [filtro, setFiltro] = useState<"todos" | TipoAgenda>("todos");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [agregar, setAgregar] = useState(false);
  const [saliendo, setSaliendo] = useState<EventoAgendaOperativa | null>(null);
  const eje = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const volverA = useRef<string | null>(null);
  const salida = useRef<ReturnType<typeof setTimeout>>();

  /* Enlace directo (notificación, Home): ?v=p08&ref=<evento> abre ese evento. */
  useEffect(() => {
    if (refe && eventos.some(e => e.id === refe)) {
      const ev = eventos.find(e => e.id === refe)!;
      setDia(new Date(ev.hora)); setSeleccionado(refe); volverA.current = refe;
      window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`[data-evento="${refe}"]`);
        if (el && eje.current) eje.current.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: "instant" as ScrollBehavior });
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refe]);

  const delDia = eventos.filter(a => mismoDiaOperativo(a.hora, dia));
  const visibles = delDia.filter(a => filtro === "todos" || a.tipo === filtro);
  const abierto = delDia.find(e => e.id === seleccionado) ?? null;
  const detalle = abierto ?? saliendo;

  const minutos = (iso: string) => { const d = new Date(iso); return d.getHours() * 60 + d.getMinutes(); };
  const inicio = Math.min(8 * 60, ...visibles.map(a => Math.floor(minutos(a.hora) / 60) * 60));
  const fin = Math.max(23 * 60, ...visibles.map(a => (a.fin ? minutos(a.fin) : minutos(a.hora) + 60)));
  const bloques = visibles.map(a => ({
    a, desde: minutos(a.hora),
    hasta: Math.max(minutos(a.hora) + 60, a.fin ? minutos(a.fin) : a.tipo === "mudanza" ? 18 * 60 : minutos(a.hora) + 60),
    lane: 0, columns: 1,
  }));
  /* Los solapamientos comparten ancho sólo dentro de su grupo temporal. */
  let grupo: typeof bloques = []; let finGrupo = -1;
  const repartir = () => {
    const finales: number[] = [];
    for (const b of grupo) { let l = finales.findIndex(f => f <= b.desde); if (l < 0) l = finales.length; finales[l] = b.hasta; b.lane = l; }
    grupo.forEach(b => { b.columns = finales.length; });
  };
  for (const b of bloques) { if (b.desde >= finGrupo) { repartir(); grupo = []; } grupo.push(b); finGrupo = Math.max(b.hasta, grupo.length === 1 ? b.hasta : finGrupo); }
  repartir();

  const esHoy = mismoDiaOperativo(ahora.toISOString(), dia);
  const siguiente = esHoy ? delDia.find(a => !a.hecho && (!a.estadoVisible || a.estadoVisible === "Aprobada") && new Date(a.hora) >= ahora) : undefined;
  const minAhora = minutos(ahora.toISOString());
  const muestraAhora = esHoy && minAhora >= inicio && minAhora <= fin;

  /* El eje arranca una hora antes de lo que importa: ahora si es hoy, si no
     el primer evento. Sólo al cambiar de día o filtro. */
  useLayoutEffect(() => {
    const e = eje.current; if (!e || refe) return;
    const foco = esHoy ? minAhora : visibles[0] ? minutos(visibles[0].hora) : inicio;
    e.scrollTo({ top: Math.max(0, (foco - inicio - 60) * PX_MIN), behavior: "instant" as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, filtro]);

  function abrir(id: string) {
    clearTimeout(salida.current); setSaliendo(null);
    volverA.current = id;
    if (seleccionado === id) { cerrar(); return; }
    setSeleccionado(id);
  }
  function cerrar() {
    const antes = delDia.find(e => e.id === seleccionado) ?? null;
    setSeleccionado(null);
    if (antes && escritorio && !sinMovimiento()) { setSaliendo(antes); salida.current = setTimeout(() => setSaliendo(null), 170); }
    const id = volverA.current;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-evento="${id}"]`)?.focus({ preventScroll: true }));
  }
  useEffect(() => () => clearTimeout(salida.current), []);
  useEffect(() => { if (abierto && escritorio) panel.current?.focus({ preventScroll: true }); }, [abierto?.id, escritorio]); // eslint-disable-line react-hooks/exhaustive-deps

  function irAlSiguiente() {
    if (!siguiente) return;
    if (filtro !== "todos" && siguiente.tipo !== filtro) setFiltro("todos");
    abrir(siguiente.id);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-evento="${siguiente.id}"]`);
      if (el && eje.current) eje.current.scrollTo({ top: Math.max(0, el.offsetTop - 60), behavior: sinMovimiento() ? "instant" as ScrollBehavior : "smooth" });
    });
  }
  const volverAHoy = () => { const d = new Date(); setDia(d); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); cerrar(); };

  const fechaTitulo = dia.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, c => c.toUpperCase());
  const conteo = (t: "todos" | TipoAgenda) => delDia.filter(a => t === "todos" || a.tipo === t).length;
  const ficha = detalle ? fichaDe(detalle, estado) : null;
  const est = detalle ? estadoDe(detalle) : null;
  const columna = Boolean(detalle && escritorio);

  const cuerpoDetalle = detalle && ficha && est && <>
    {ficha.imagen && <div className="agd-banner" style={{ backgroundImage: `url(${ficha.imagen})` }} aria-hidden="true" />}
    <p className="agd-det-tipo"><time>{soloHora(detalle.hora)}</time> · {ROTULO_AGENDA[detalle.tipo]}</p>
    <h2 className="agd-det-titulo">{detalle.titulo}</h2>
    <p className="agd-det-lugar"><Icon n="pin" s={16} />{lugarDe(detalle)}</p>
    <StatusTag tono={est.tono}>{est.rotulo}</StatusTag>
    {ficha.datos.length > 0 && <dl className="agd-det-datos">{ficha.datos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
  </>;

  return <div className="op-page rx-pagina agd" onKeyDown={e => { if (e.key === "Escape" && abierto) { e.stopPropagation(); cerrar(); } }}>
    {/* REC-AGENDA-03 · los filtros pasan a una fila horizontal alineada con
        el encabezado; la columna izquierda queda para el calendario (04) y el
        resumen del día (05). */}
    <header className="ct-cabecera agd-cabecera">
      <div><VolverA excepto="p08" /><span className="ct-eyebrow"><Icon n="calendario" s={16} />Recepción</span><h1 className="ct-h1">Agenda</h1></div>
      {/* REC-AGENDA-03 · agregar desde la agenda: abre los flujos que ya
          existen (no hay un alta de eventos inventada) */}
      <div className="ct-cabecera-acciones">
        {!esHoy && <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={volverAHoy}>Volver a hoy</button>}
        <div className="agd-agregar">
          <button type="button" className="ct-btn ct-btn--primario ct-btn--chico" aria-expanded={agregar} aria-haspopup="menu" onClick={() => setAgregar(a => !a)}><Icon n="mas" s={18} />Agregar</button>
          {agregar && <div className="agd-agregar-menu" role="menu" onKeyDown={e => { if (e.key === "Escape") setAgregar(false); }}>
            {([["Validar un acceso", "Cargar el código de un pase", "qr", "p04", undefined], ["Registrar una entrega", "Unidad, remitente y foto", "caja", "p05", "registrar"], ["Reportar una incidencia", "Queda a tu nombre", "alerta", "p07", "nueva"]] as const)
              .map(([t, d, ic, v, r]) => <button key={t} type="button" role="menuitem" onClick={() => { setAgregar(false); ir(v, r); }}>
                <span className="ic" aria-hidden="true"><Icon n={ic} s={18} /></span><span><b>{t}</b><small>{d}</small></span></button>)}
          </div>}
        </div>
      </div>
    </header>
    <div className="agd-filtros-fila">
      <Segmentado etiqueta="Qué mostrar en el día" className="agd-filtros-h" valor={filtro}
        onCambio={v => { setFiltro(v); cerrar(); }}
        opciones={TIPOS.map(t => ({ id: t.id, icono: t.icono, label: t.rotulo, cuenta: conteo(t.id) }))} />
    </div>

    <div className="agd-marco" data-detalle={columna}>
      <aside className="agd-planner" aria-label="Calendario y resumen del día">
        <section className="agd-mod agd-mes" aria-label="Calendario">
          <CalendarioMes ancla={mes} onAncla={setMes} dia={dia} etiqueta="Agenda operativa"
            onDia={d => { setDia(d); cerrar(); }}
            estadoDe={c => { const n = eventos.filter(a => mismoDiaOperativo(a.hora, c.fecha)).length; return { punto: n ? "lleno" : "sin", detalle: n === 1 ? "1 evento" : `${n} eventos` }; }} />
        </section>
        {/* REC-AGENDA-05 · el espacio liberado muestra el resumen del día
            (sólo lo que ya está en la agenda) y filtra al tocarlo */}
        <section className="agd-mod agd-resumen" aria-label="Resumen del día">
          <h3>Resumen del día</h3>
          {/* REC-AGENDA-02 · la jornada en una frase, con el próximo evento */}
          <p className="agd-resumen-frase">{delDia.length === 0 ? "Sin eventos este día."
            : siguiente ? <>Quedan <b>{delDia.filter(a => !a.hecho).length}</b> de {delDia.length}. El próximo es <b>{siguiente.titulo}</b> a las <b>{soloHora(siguiente.hora)}</b>.</>
            : esHoy ? <>No quedan eventos por venir: {delDia.filter(a => a.hecho).length} ya se hicieron.</>
            : <>{delDia.length} {delDia.length === 1 ? "evento" : "eventos"} en el día.</>}</p>
          <p className="agd-resumen-cifras"><b className="ct-cifra">{String(delDia.filter(a => a.hecho).length).padStart(2, "0")}</b> hechos
            <span aria-hidden="true">·</span><b className="ct-cifra">{String(delDia.filter(a => !a.hecho && (!esHoy || new Date(a.hora) >= ahora)).length).padStart(2, "0")}</b> por venir</p>
          {/* v04 · B2 · la lista por categoría repetía los filtros de arriba:
              ahora el espacio dice cómo va la jornada y qué sigue, y cada
              evento abre su detalle */}
          {/* v05 · la jornada en un mini gráfico: eventos por hora, lo que
              ya pasó en carbón, lo que viene claro y la hora actual marcada */}
          {delDia.length > 0 && (() => {
            const horas = Array.from({ length: 17 }, (_, i) => i + 7);
            const porHora = horas.map(h => delDia.filter(a => new Date(a.hora).getHours() === h).length);
            const tope = Math.max(1, ...porHora);
            const hAhora = ahora.getHours();
            return <figure className="agd-jornada" aria-label={`${delDia.length} eventos entre las 07 y las 23`}>
              <span className="agd-jornada-barras">{horas.map((h, i) => <i key={h} style={{ height: `${porHora[i] ? 22 + porHora[i] / tope * 78 : 8}%` }}
                data-pasado={(esHoy && h < hAhora) || undefined} data-ahora={(esHoy && h === hAhora) || undefined} data-vacio={!porHora[i] || undefined} />)}</span>
              <figcaption><span>07</span><span>15</span><span>23</span></figcaption>
            </figure>;
          })()}
          {(() => {
            const sigue = delDia.filter(a => !a.hecho && (!esHoy || new Date(a.hora) >= ahora)).slice(0, 3);
            return sigue.length ? <div className="agd-sigue">
              <h4>Lo que sigue</h4>
              <ol>{sigue.map(a => <li key={a.id}>
                <button type="button" onClick={() => abrir(a.id)} aria-label={`${soloHora(a.hora)}, ${a.titulo}, ${ROTULO_AGENDA[a.tipo]}. Ver el detalle`}>
                  <time className="ct-cifra">{soloHora(a.hora)}</time>
                  <span><b>{a.titulo}</b><small>{ROTULO_AGENDA[a.tipo]}{a.unidad ? ` · Unidad ${a.unidad}` : ""}</small></span>
                  <Icon n="chevron" s={14} />
                </button></li>)}</ol>
            </div> : null;
          })()}
        </section>
      </aside>

      <section className="agd-dia" aria-label={`Agenda del ${fechaTitulo}`}>
        <header className="agd-dia-cab">
          <div><span className="ct-eyebrow">{esHoy ? "Hoy" : "Día elegido"}</span><h2>{fechaTitulo}</h2></div>
          <p className="agd-dia-cuenta"><b className="ct-cifra">{String(delDia.length).padStart(2, "0")}</b> {delDia.length === 1 ? "evento" : "eventos"}</p>
        </header>
        {/* REC-AGENDA-01 · el próximo como bloque compacto con intención */}
        {siguiente && <button type="button" className="agd-proximo agd-proximo-v2" onClick={irAlSiguiente}>
          <span className="agd-prox-et"><i aria-hidden="true" />Próximo</span><time>{soloHora(siguiente.hora)}</time>
          <span className="agd-proximo-txt"><b>{siguiente.titulo}</b><small>{ROTULO_AGENDA[siguiente.tipo]} · {lugarDe(siguiente)}</small></span><span className="agd-prox-ir"><Icon n="flechaDer" s={16} /></span>
        </button>}
        <div className="agd-eje" ref={eje}>
          {visibles.length === 0 ? <p className="agd-vacio">{delDia.length ? "Nada de este tipo en el día." : "Sin eventos para este día."}</p> :
          <div key={`${dia.toDateString()}-${filtro}`} className="agd-grilla ct-refiltra" style={{ height: (fin - inicio) * PX_MIN + 28 }}>
            {Array.from({ length: Math.ceil((fin - inicio) / 60) + 1 }, (_, i) => <div className="agd-hora" key={i} style={{ top: i * 60 * PX_MIN }}>
              {!(muestraAhora && Math.abs(inicio + i * 60 - minAhora) < 14) && <time>{String(inicio / 60 + i).padStart(2, "0")}:00</time>}</div>)}
            {muestraAhora && <div className="agd-ahora" style={{ top: (minAhora - inicio) * PX_MIN }}><time>{soloHora(ahora.toISOString())}</time><span className="solo-lectores">Ahora</span></div>}
            <div className="agd-eventos">
              {bloques.map(({ a, desde, hasta, lane, columns }) => {
                const e = estadoDe(a);
                const corto = hasta - desde < 50;
                return <button key={a.id} type="button" className="agd-ev" data-evento={a.id} data-corto={corto || undefined}
                  data-proximo={a.id === siguiente?.id || undefined} data-hecho={a.hecho || undefined}
                  aria-expanded={seleccionado === a.id} aria-controls="agd-detalle"
                  onClick={() => abrir(a.id)}
                  style={{ top: (desde - inicio) * PX_MIN + 3, height: (hasta - desde) * PX_MIN - 6, left: `${lane * 100 / columns}%`,
                    width: "fit-content", maxWidth: `calc(${100 / columns}% - 8px)`, minWidth: `min(${columns === 1 ? 260 : 150}px, calc(${100 / columns}% - 8px))` } as CSSProperties}>
                  <span className="agd-ev-cab"><time>{soloHora(a.hora)}</time><span className="agd-ev-tipo"><Icon n={TIPOS.find(t => t.id === a.tipo)?.icono ?? "calendario"} s={13} />{ROTULO_AGENDA[a.tipo]}</span></span>
                  <b>{a.titulo}</b>
                  {!corto && <span className="agd-ev-pie">{a.unidad && <span>Unidad {a.unidad}</span>}<StatusTag tono={e.tono}>{e.rotulo}</StatusTag></span>}
                </button>;
              })}
            </div>
          </div>}
        </div>
      </section>

      {columna && detalle && ficha && <aside className="agd-detalle" id="agd-detalle" ref={panel} tabIndex={-1} data-fase={abierto ? "entra" : "sale"}
        aria-label={`Detalle: ${detalle.titulo}`}>
        <div className="agd-det-barra"><span className="ct-label">Detalle del evento</span>
          <button type="button" className="ct-panel-cerrar" onClick={cerrar}><Icon n="cerrar" s={16} />Cerrar</button></div>
        {cuerpoDetalle}
        {ficha.accion && <button type="button" className="agd-accion" onClick={() => ir(ficha.accion!.destino.vista, ficha.accion!.destino.ref)}>
          <span className="agd-accion-icono"><Icon n={ficha.accion.icono} s={22} /></span>
          <span><b>{ficha.accion.rotulo}</b>{ficha.accion.detalle && <small>{ficha.accion.detalle}</small>}</span>
          <Icon n="flechaDer" s={20} />
        </button>}
      </aside>}
    </div>

    {abierto && !escritorio && ficha && <Hoja titulo={`${soloHora(abierto.hora)} · ${ROTULO_AGENDA[abierto.tipo]}`}
      confirmar={ficha.accion ? (ficha.accion.detalle ? `${ficha.accion.rotulo} ${ficha.accion.detalle}` : ficha.accion.rotulo) : undefined}
      onConfirmar={ficha.accion ? () => ir(ficha.accion!.destino.vista, ficha.accion!.destino.ref) : undefined}
      onCancelar={() => setSeleccionado(null)} cerrarRotulo="Cerrar">
      <div className="agd-hoja">{cuerpoDetalle}</div>
    </Hoja>}
  </div>;
}
