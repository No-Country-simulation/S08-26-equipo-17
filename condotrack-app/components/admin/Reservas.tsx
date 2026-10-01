"use client";
import { sinMovimiento } from "@/lib/movimiento";
import { Rail } from "../ui/Rail";
import { avisar } from "../sistema/Tostada";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../ui/Icon";
import { CalendarioMes } from "../ui/CalendarioMes";
import { ExitoProtagonista } from "../ui/Estados";
import { StatusTag, type Tono } from "../sistema/Estado";
import { AdminPagina } from "./AdminMarco";
import { Datos } from "./ListaDetalle";
import { useApp } from "@/lib/estado";
import { ADMINISTRACION, type Reserva, type VistaA } from "@/lib/data";
import { espacioDeRecurso, nombreRecurso, type SolicitudReserva } from "@/lib/admin";
import { fechaHora, soloHora } from "@/lib/formato";

type Ir = (v: VistaA, ref?: string) => void;
type Item = { id: string; tipo: "reserva" | "solicitud"; recursoId: string; unidad: string; inicio: string; fin: string; estado: string; tono: Tono; r?: Reserva; s?: SolicitudReserva };
const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const seSuperpone = (a: { recursoId: string; inicio: string; fin: string }, b: { recursoId: string; inicio: string; fin: string }) =>
  a.recursoId === b.recursoId && new Date(a.inicio) < new Date(b.fin) && new Date(b.inicio) < new Date(a.fin);
const lunesDe = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const masDias = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dos = (n: number) => String(n).padStart(2, "0");

/** A10 · Reservas (Admin Correction Pack v01 · A10-01…06).
 *
 *  De arriba hacia abajo, como pide el pack:
 *   1. dos controles claros —Por decidir y Ocupación del día— con su cifra;
 *   2. la navegación temporal horizontal: dos semanas de días con lo que
 *      tiene cada uno, y el mes entero a un toque (el calendario con los
 *      estados de Residente: barra = reservas, filo amarillo = pedido);
 *   3. los resultados como cards separadas (referencia de composición:
 *      My Orders), con la decisión en la misma card;
 *   4. el detalle entra a la derecha sólo cuando se elige algo: ya no hay
 *      un panel enorme vacío.
 *  Aprobar termina en la pantalla de éxito de Residente, una vez, con la
 *  acción siguiente. Sin pedidos, un vacío diseñado, no un rectángulo. */
export function A10({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado, hacer } = useApp();
  const [corte, setCorte] = useState<"pendientes" | "dia">(estado.solicitudes.some(s => s.estado === "pendiente") ? "pendientes" : "dia");
  const [dia, setDia] = useState(() => new Date());
  const [semana, setSemana] = useState(() => lunesDe(new Date()));
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [verMes, setVerMes] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [tocado, setTocado] = useState(false);
  const [modo, setModo] = useState<"ver" | "rechazar" | "cancelar">("ver");
  const [aprobada, setAprobada] = useState<{ espacio: string; unidad: string; cuando: string; horario: string; pide: string; inicio: string } | null>(null);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => { if (refe) { setSel(refe); const s = estado.solicitudes.find(x => x.id === refe); if (s) { setCorte("pendientes"); } } }, [refe]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setModo("ver"); setMotivo(""); setTocado(false); if (sel) panel.current?.focus({ preventScroll: true }); }, [sel]);

  const reservas: Item[] = estado.reservas.map(r => ({ id: r.id, tipo: "reserva", recursoId: r.recursoId, unidad: r.unidad, inicio: r.inicio, fin: r.fin, r,
    estado: r.estado === "confirmada" ? "Confirmada" : r.estado === "en-curso" ? "En curso" : r.estado === "finalizada" ? "Finalizada" : "Cancelada",
    tono: r.estado === "confirmada" || r.estado === "en-curso" ? "ok" : r.estado === "cancelada" ? "error" : "hecho" }));
  const solicitudes: Item[] = estado.solicitudes.map(s => ({ id: s.id, tipo: "solicitud", recursoId: s.recursoId, unidad: s.unidad, inicio: s.inicio, fin: s.fin, s,
    estado: s.estado === "pendiente" ? "Por decidir" : s.estado === "aprobada" ? "Aprobada" : "Rechazada", tono: s.estado === "pendiente" ? "pendiente" : s.estado === "aprobada" ? "ok" : "error" }));
  const todos = [...solicitudes.filter(s => s.s?.estado !== "aprobada"), ...reservas];
  const pendientes = solicitudes.filter(s => s.s?.estado === "pendiente");
  const delDia = (d: Date) => todos.filter(x => mismoDia(new Date(x.inicio), d));
  const lista = (corte === "pendientes" ? pendientes : delDia(dia)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const elegido = sel ? todos.find(x => x.id === sel) ?? null : null;
  const conflictoDe = (x: Item | null) => x?.tipo === "solicitud" ? estado.reservas.find(r => r.estado !== "cancelada" && seSuperpone(r, x)) : undefined;
  const conflicto = conflictoDe(elegido);
  const cerrar = () => { const id = sel; setSel(null); requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-item="${id}"]`)?.focus()); };
  const fechaTitulo = (d: Date) => d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, c => c.toUpperCase());
  /* ADM-RES-01 · encabezado relativo: Hoy / Mañana / fecha */
  const relativo = (d: Date) => { const h = new Date(); const m = masDias(h, 1);
    return mismoDia(d, h) ? `Hoy · ${d.toLocaleDateString("es-AR", { day: "numeric", month: "long" })}`
      : mismoDia(d, m) ? `Mañana · ${d.toLocaleDateString("es-AR", { day: "numeric", month: "long" })}` : fechaTitulo(d); };
  const mesSig = new Date(mes.getFullYear(), mes.getMonth() + 1, 1);
  /* v04 · C2 · el riel de días se arrastra (mouse, dedo, rueda): seis
     semanas, dos antes y cuatro después de la semana de referencia; las
     flechas lo corren una semana con un deslizamiento suave. */
  const dias = useMemo(() => Array.from({ length: 42 }, (_, i) => masDias(semana, i - 14)), [semana]);
  const riel = useRef<HTMLElement>(null);
  const correr = (n: number) => {
    const r = riel.current?.querySelector<HTMLElement>(".ad-a10-rail");
    const li = r?.querySelector<HTMLElement>("li");
    if (r && li) r.scrollBy({ left: n * (li.offsetWidth + 6), behavior: sinMovimiento() ? "auto" : "smooth" });
  };
  /* al cambiar de referencia o de día elegido, el día queda a la vista */
  useEffect(() => {
    const r = riel.current?.querySelector<HTMLElement>(".ad-a10-rail");
    const b = r?.querySelector<HTMLElement>('button[aria-pressed="true"]') ?? r?.querySelectorAll<HTMLElement>("li")[14];
    if (r && b) {
      const x = b.offsetLeft - (b.closest("li") === r.querySelectorAll("li")[14] ? 4 : (r.clientWidth - b.offsetWidth) / 2);
      r.scrollTo({ left: Math.max(0, x), behavior: "auto" });
    }
  }, [semana]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoy = new Date();

  function aprobar(x: Item) {
    if (!x.s || conflictoDe(x)) return;
    hacer({ t: "solicitud/aprobar", id: x.id, por: ADMINISTRACION.nombre });
    avisar({ titulo: "Reserva aprobada · unidad avisada", detalle: `${nombreRecurso(x.recursoId)} · unidad ${x.unidad}`, icono: "check" });
    setSel(null);
    setAprobada({ espacio: nombreRecurso(x.recursoId), unidad: x.unidad, pide: x.s.pedidaPor, inicio: x.inicio,
      cuando: new Date(x.inicio).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }),
      horario: `${soloHora(x.inicio)} a ${soloHora(x.fin)}` });
  }
  function rechazar() {
    if (!elegido?.s) return;
    setTocado(true);
    if (!motivo.trim()) return;
    hacer({ t: "solicitud/rechazar", id: elegido.id, motivo: motivo.trim(), por: ADMINISTRACION.nombre });
    avisar({ titulo: "Pedido rechazado · unidad notificada", detalle: `${nombreRecurso(elegido.recursoId)} · unidad ${elegido.unidad} · ${motivo.trim()}`, icono: "alerta", tono: "mal" });
  }
  function cancelar() {
    if (!elegido?.r) return;
    setTocado(true);
    if (!motivo.trim()) return;
    hacer({ t: "reserva/cancelarAdmin", id: elegido.id, motivo: motivo.trim(), por: ADMINISTRACION.nombre, rotulo: `${nombreRecurso(elegido.recursoId)} · Unidad ${elegido.unidad}` });
    avisar({ titulo: "Reserva cancelada · unidad avisada", detalle: `${nombreRecurso(elegido.recursoId)} · unidad ${elegido.unidad}`, icono: "check" });
    setModo("ver"); setMotivo(""); setTocado(false);
  }
  const irAlDia = (d: Date) => { setDia(d); setCorte("dia"); setSel(null); setAprobada(null); if (d < masDias(semana, -14) || d >= masDias(semana, 28)) setSemana(lunesDe(d)); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); };
  const lateral = Boolean(elegido || aprobada);

  return <AdminPagina titulo="Reservas" descripcion="Pedidos por decidir, ocupación de los espacios y cancelaciones con motivo." clase="ad-a10">
    <div className="ad-a10-marco" data-lateral={lateral || undefined}>
      <div className="ad-a10-col">
        {/* A10-04 · dos controles claros, no un bloque gris sobre el calendario */}
        <div className="ad-a10-controles" role="radiogroup" aria-label="Qué mostrar">
          <button type="button" role="radio" aria-checked={corte === "pendientes"} className="ad-a10-ctrl ad-card-mov"
            onClick={() => { setCorte("pendientes"); setSel(null); }}>
            <span className="ic" aria-hidden="true"><Icon n="reloj" s={20} /></span>
            <span className="tx"><b>Por decidir</b><small>{pendientes.length ? "Pedidos que esperan aprobación" : "Nada espera una decisión"}</small></span>
            <span className="n ct-cifra">{dos(pendientes.length)}</span>
          </button>
          <button type="button" role="radio" aria-checked={corte === "dia"} className="ad-a10-ctrl ad-card-mov"
            onClick={() => { setCorte("dia"); setSel(null); }}>
            <span className="ic" aria-hidden="true"><Icon n="calendario" s={20} /></span>
            <span className="tx"><b>Ocupación del día</b><small>{relativo(dia)}</small></span>
            <span className="n ct-cifra">{dos(delDia(dia).length)}</span>
          </button>
        </div>

        {/* A10-02/03 · navegación temporal horizontal + el mes a un toque */}
        <section className="ad-a10-tiempo ad-vidrio" aria-label="Elegir un día" ref={riel}>
          <header>
            <h2>{(corte === "dia" ? dia : dias[14]).toLocaleDateString("es-AR", { month: "long", year: "numeric" }).replace(/^./, c => c.toUpperCase())}</h2>
            <div className="acc">
              <button type="button" className="ct-icono-btn" aria-label="Semana anterior" onClick={() => correr(-7)}><Icon n="volver" s={18} /></button>
              <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => { const h = new Date(); irAlDia(h); setSemana(lunesDe(h)); }}>Hoy</button>
              <button type="button" className="ct-icono-btn" aria-label="Semana siguiente" onClick={() => correr(7)}><Icon n="flechaDer" s={18} /></button>
              <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" aria-expanded={verMes} onClick={() => setVerMes(v => !v)}>
                <Icon n="calendario" s={16} />{verMes ? "Cerrar el calendario" : "Elegir otra fecha"}</button>
            </div>
          </header>
          <Rail className="ad-a10-rail" etiqueta="Días">
          <ol className="ad-a10-dias">
            {dias.map(d => {
              const n = delDia(d).length;
              const pide = pendientes.some(x => mismoDia(new Date(x.inicio), d));
              const elegidoDia = corte === "dia" && mismoDia(d, dia);
              return <li key={d.toISOString()}><button type="button" aria-pressed={elegidoDia}
                className={(pide ? "pide" : "") + (mismoDia(d, hoy) ? " hoy" : "")}
                aria-label={`${fechaTitulo(d)}: ${n} ${n === 1 ? "reserva" : "reservas"}${pide ? ", con pedido por decidir" : ""}`}
                onClick={() => irAlDia(d)}>
                <small>{d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</small>
                <b>{d.getDate()}</b>
                <span className="cuenta" aria-hidden="true">{n > 0 ? Array.from({ length: Math.min(n, 3) }, (_, i) => <i key={i} />) : null}</span>
              </button></li>;
            })}
          </ol>
          </Rail>
          <div className="ad-a10-mes" data-abierto={verMes || undefined} {...(!verMes ? { inert: "" as unknown as boolean } : {})}>
            <div className="ad-a10-mes-in">
              {/* ADM-RES-01 · dos meses lado a lado cuando hay ancho; uno en angosto.
                  Las flechas del primero mueven los dos. */}
              <div className="ad-a10-meses">
                <CalendarioMes ancla={mes} onAncla={setMes} dia={corte === "dia" ? dia : null} etiqueta="Reservas"
                  onDia={irAlDia}
                  estadoDe={c => { const n = delDia(c.fecha).length; const p = pendientes.some(x => mismoDia(new Date(x.inicio), c.fecha));
                  return { punto: n ? "lleno" : "sin", ocupacion: Math.min(1, n / 4), marca: p ? "propia" : undefined,
                    detalle: `${n} ${n === 1 ? "reserva" : "reservas"}${p ? ", con pedido por decidir" : ""}` }; }} />
                <div className="ad-a10-mes2"><CalendarioMes ancla={mesSig} onAncla={d => setMes(new Date(d.getFullYear(), d.getMonth() - 1, 1))} dia={corte === "dia" ? dia : null} etiqueta="Reservas, mes siguiente"
                  onDia={irAlDia}
                  estadoDe={c => { const n = delDia(c.fecha).length; const p = pendientes.some(x => mismoDia(new Date(x.inicio), c.fecha));
                  return { punto: n ? "lleno" : "sin", ocupacion: Math.min(1, n / 4), marca: p ? "propia" : undefined,
                    detalle: `${n} ${n === 1 ? "reserva" : "reservas"}${p ? ", con pedido por decidir" : ""}` }; }} /></div>
              </div>
              <p className="ad-a10-clave" aria-hidden="true"><span><i className="k-ocup" />Con reservas</span><span><i className="k-pide" />Pedido por decidir</span></p>
            </div>
          </div>
        </section>

        {/* A10-02 · resultados debajo, en cards */}
        <section className="ad-a10-resultados" aria-label={corte === "pendientes" ? "Pedidos por decidir" : `Reservas del ${fechaTitulo(dia)}`}>
          <header className="ad-a10-res-cab">
            <h2>{corte === "pendientes" ? "Por decidir" : relativo(dia)}</h2>
            <span className="ad-badge">{lista.length} {corte === "pendientes" ? (lista.length === 1 ? "pedido" : "pedidos") : (lista.length === 1 ? "reserva" : "reservas")}</span>
          </header>
          {lista.length ? <ol key={`${corte}-${dia.toDateString()}`} className="ad-a10-cards ct-refiltra">
            {lista.map(x => { const esp = espacioDeRecurso(x.recursoId); const choca = conflictoDe(x);
              return <li key={x.id}><article className="ad-a10-card ad-vidrio ad-card-mov" data-sel={sel === x.id || undefined}>
                <button type="button" className="ad-a10-card-abrir" data-item={x.id} aria-expanded={sel === x.id} aria-controls="ad-a10-det"
                  aria-label={`${nombreRecurso(x.recursoId)} · Unidad ${x.unidad}, ${soloHora(x.inicio)}. Ver detalle`}
                  onClick={() => { setAprobada(null); setSel(sel === x.id ? null : x.id); }} />
                <span className="foto" aria-hidden="true" style={esp?.img ? { backgroundImage: `url(${esp.img})` } : undefined} />
                <span className="cuando"><time>{soloHora(x.inicio)}</time><small>a {soloHora(x.fin)}</small>
                  <small>{new Date(x.inicio).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")}</small></span>
                <span className="que"><b>{nombreRecurso(x.recursoId)} · Unidad {x.unidad}</b>
                  <small>{x.tipo === "solicitud" ? `Pide ${x.s!.pedidaPor}${x.s!.motivo ? ` · ${x.s!.motivo}` : ""}` : `Reservó ${x.r!.creadaPor}`}</small>
                  {choca && <small className="choca"><Icon n="alerta" s={13} />Se superpone con la unidad {choca.unidad}</small>}</span>
                <span className="est"><StatusTag tono={x.tono}>{x.estado}</StatusTag></span>
                {x.s?.estado === "pendiente" && <span className="acc">
                  <button type="button" className="ct-btn ct-btn--primario ct-btn--chico" disabled={Boolean(choca)} onClick={() => aprobar(x)}>Aprobar</button>
                  <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => { setAprobada(null); setSel(x.id); setModo("rechazar"); }}>Rechazar…</button>
                </span>}
              </article></li>; })}
          </ol>
          /* A10-06 · vacío diseñado (v04 · C2: compacto, y debajo lo que viene,
             para no dejar un bloque vacío grande) */
          : <><div className="ad-a10-vacio ad-vidrio" data-v4="">
              <span className="ilus" aria-hidden="true">
                <svg viewBox="0 0 120 120" width="112" height="112">
                  <circle cx="60" cy="60" r="56" className="aro" />
                  <rect x="30" y="34" width="60" height="54" rx="12" className="hoja" />
                  <rect x="30" y="34" width="60" height="15" rx="7.5" className="tope" />
                  <path d="M42 28v12M78 28v12" className="anilla" />
                  <path d="M47 69l9 9 17-18" className="tilde" />
                </svg>
              </span>
              <h3>{corte === "pendientes" ? "No hay reservas por revisar" : "Sin reservas este día"}</h3>
              <p>{corte === "pendientes" ? "Cuando una unidad pida un espacio con aprobación, el pedido aparece acá."
                : (() => { const prox = todos.filter(x => new Date(x.inicio) > dia && x.r?.estado !== "cancelada").sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
                  return prox ? <>Los espacios están libres. La próxima reserva es <b>{nombreRecurso(prox.recursoId)}</b> el {new Date(prox.inicio).toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })} a las {soloHora(prox.inicio)}.</> : "Los espacios están libres y no hay reservas más adelante."; })()}</p>
              {corte === "pendientes" ? <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => irAlDia(new Date())}>Ver la ocupación de hoy</button>
                : (() => { const prox = todos.filter(x => new Date(x.inicio) > dia && x.r?.estado !== "cancelada").sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
                  return prox ? <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => irAlDia(new Date(prox.inicio))}>Ir a ese día</button> : null; })()}
            </div>
            {corte === "dia" && (() => {
              const vienen = todos.filter(x => new Date(x.inicio) > dia && x.r?.estado !== "cancelada" && x.s?.estado !== "rechazada")
                .sort((a, b) => a.inicio.localeCompare(b.inicio)).slice(0, 4);
              return vienen.length ? <div className="ad-a10-vienen">
                <h3>Lo que viene</h3>
                <ol>{vienen.map(x => { const esp = espacioDeRecurso(x.recursoId); return <li key={x.id}>
                  <button type="button" onClick={() => { irAlDia(new Date(x.inicio)); }}>
                    <span className="foto" aria-hidden="true" style={esp?.img ? { backgroundImage: `url(${esp.img})` } : undefined} />
                    <span className="cuando"><b>{new Date(x.inicio).toLocaleDateString("es-AR", { weekday: "short", day: "numeric" }).replace(".", "")}</b><small>{soloHora(x.inicio)}</small></span>
                    <span className="que"><b>{nombreRecurso(x.recursoId)}</b><small>Unidad {x.unidad}</small></span>
                    <StatusTag tono={x.tono}>{x.estado}</StatusTag>
                  </button></li>; })}</ol>
              </div> : null;
            })()}</>}
        </section>
      </div>

      {/* A10-01 · aprobar tiene su éxito: el patrón de Residente, una vez */}
      {aprobada && !elegido && <aside className="ad-a10-lateral ad-a10-exito" aria-label="Reserva aprobada">
        <ExitoProtagonista
          titulo="Reserva aprobada"
          resumen={<><b>{aprobada.espacio}</b> · Unidad {aprobada.unidad}</>}
          detalle={<dl className="exito-datos">
            <div><dt>Cuándo</dt><dd>{aprobada.cuando}</dd></div>
            <div><dt>Horario</dt><dd>{aprobada.horario}</dd></div>
            <div><dt>Pidió</dt><dd>{aprobada.pide}</dd></div>
          </dl>}
          nota="La unidad recibe el aviso y la reserva ya ocupa el espacio."
          accion={pendientes.length ? "Seguir con el próximo pedido" : "Ver la ocupación de ese día"}
          onAccion={() => { if (pendientes.length) { setAprobada(null); setSel(pendientes[0].id); } else irAlDia(new Date(aprobada.inicio)); }}
          alterna={pendientes.length ? "Ver la ocupación de ese día" : "Cerrar"}
          onAlterna={() => { if (pendientes.length) irAlDia(new Date(aprobada.inicio)); else setAprobada(null); }}
        />
      </aside>}

      {elegido && <aside className="ad-a10-lateral agd-detalle" id="ad-a10-det" ref={panel} tabIndex={-1} aria-label={`${nombreRecurso(elegido.recursoId)} · Unidad ${elegido.unidad}`}
        onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); cerrar(); } }}>
        <div className="agd-det-barra"><span className="ct-label">{elegido.tipo === "solicitud" ? "Pedido de reserva" : "Reserva"}</span>
          <button type="button" className="ct-panel-cerrar" onClick={cerrar}><Icon n="cerrar" s={16} />Cerrar</button></div>
        {espacioDeRecurso(elegido.recursoId)?.img && <div className="agd-banner" style={{ backgroundImage: `url(${espacioDeRecurso(elegido.recursoId)!.img})` }} aria-hidden="true" />}
        <p className="agd-det-tipo"><time>{soloHora(elegido.inicio)}–{soloHora(elegido.fin)}</time> · {new Date(elegido.inicio).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h2 className="agd-det-titulo">{nombreRecurso(elegido.recursoId)}</h2>
        <StatusTag tono={elegido.tono}>{elegido.estado}</StatusTag>
        <Datos filas={elegido.s ? [["Unidad", elegido.unidad], ["Pide", `${elegido.s.pedidaPor} · ${fechaHora(elegido.s.pedidaEl)}`], ...(elegido.s.motivo ? [["Motivo", elegido.s.motivo] as [string, string]] : []),
          ["Disponibilidad", conflicto ? `Se superpone con la reserva de la unidad ${conflicto.unidad}` : "Sin superposición"], ...(elegido.s.decision ? [["Decisión", `${elegido.s.decision.por} · ${fechaHora(elegido.s.decision.cuando)}${elegido.s.decision.motivo ? ` · ${elegido.s.decision.motivo}` : ""}`] as [string, string]] : [])]
          : [["Unidad", elegido.unidad], ["Reservó", `${elegido.r!.creadaPor} · ${fechaHora(elegido.r!.creadaEl)}`]]} />

        {elegido.s?.estado === "pendiente" && (modo === "rechazar"
          ? <div className="ad-decision"><div className="ct-campo"><label htmlFor="motivo-r">Motivo del rechazo</label>
              <textarea id="motivo-r" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Lo lee la unidad que pidió." aria-invalid={tocado && !motivo.trim()} />
              {tocado && !motivo.trim() && <p className="ct-campo-error">El rechazo necesita un motivo.</p>}</div>
              <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={rechazar}>Rechazar el pedido</button><button type="button" className="ct-btn ct-btn--texto" onClick={() => setModo("ver")}>Volver</button></div></div>
          : <div className="ad-decision">{conflicto && <p className="ad-aviso-error" role="alert"><Icon n="alerta" s={16} />No se puede aprobar: el horario ya está tomado.</p>}
              <button type="button" className="ct-btn ct-btn--primario ct-btn--ancho" disabled={Boolean(conflicto)} onClick={() => aprobar(elegido)}>Aprobar la reserva</button>
              <button type="button" className="ct-btn ct-btn--secundario ct-btn--ancho" onClick={() => setModo("rechazar")}>Rechazar…</button></div>)}

        {elegido.r?.estado === "confirmada" && new Date(elegido.inicio) > new Date() && (modo === "cancelar"
          ? <div className="ad-decision"><div className="ct-campo"><label htmlFor="motivo-c">Motivo de la cancelación</label>
              <textarea id="motivo-c" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej.: mantenimiento del espacio. Se avisa a la unidad." aria-invalid={tocado && !motivo.trim()} />
              {tocado && !motivo.trim() && <p className="ct-campo-error">Cancelar necesita un motivo.</p>}</div>
              <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={cancelar}>Cancelar la reserva</button><button type="button" className="ct-btn ct-btn--texto" onClick={() => setModo("ver")}>Volver</button></div></div>
          : <button type="button" className="ct-btn ct-btn--secundario" onClick={() => setModo("cancelar")}>Cancelar con motivo…</button>)}
        <button type="button" className="ct-btn ct-btn--texto" onClick={() => ir("a04", elegido.unidad)}>Ver la unidad {elegido.unidad}</button>
      </aside>}
    </div>
  </AdminPagina>;
}
