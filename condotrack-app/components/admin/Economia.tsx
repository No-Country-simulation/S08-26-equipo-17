"use client";
import { sinMovimiento } from "@/lib/movimiento";
import { avisar } from "../sistema/Tostada";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { StatusTag, type Tono } from "../sistema/Estado";
import { AdminPagina } from "./AdminMarco";
import { Plegable } from "./Plegable";
import { ListaDetalle, BuscarEnLista, Datos, normalizar } from "./ListaDetalle";
import { useApp } from "@/lib/estado";
import { ADMINISTRACION, RESIDENTE, type VistaA } from "@/lib/data";
import { UNIDADES } from "@/lib/edificio";
import { GASTOS, PERIODO, PERIODOS_GASTOS, RUBROS, TOTAL_POR_PERIODO, rubroPorId, type GastoDetalle } from "@/lib/expensas";
import { fechaCorta, fechaHora, periodoLargo, pesos } from "@/lib/formato";

type Ir = (v: VistaA, ref?: string) => void;
const YO = ADMINISTRACION.nombre;
const MEDIO: Record<string, string> = { transferencia: "Transferencia", debito: "Débito automático", presencial: "Presencial" };

/* ══ A15 · Expensas · tablero financiero (A15-01…05) ════════════════════
   Se mantiene la lógica período → detalle; arriba, tres módulos con datos
   que ya existen: el período en preparación (el único acento amarillo),
   la evolución del gasto de los últimos seis períodos y el rubro que más
   pesa. Nada inventado: totales por período y rubros del período actual. */
type Periodo = { id: string; total: number; estado: "preparacion" | "publicada"; gastos: number; variacion: number | null };
const mesCorto = (p: string) => periodoLargo(p).split(" ")[0].slice(0, 3);
const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`;

export function A15({ ir }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const [sel, setSel] = useState<string | null>(PERIODO);
  const cargados = estado.gastosCargados.reduce((a, g) => a + g.monto, 0);
  const totalDe = (p: string) => TOTAL_POR_PERIODO[p] + (p === PERIODO ? cargados : 0);
  const periodos: Periodo[] = PERIODOS_GASTOS.map((p, i) => {
    const prev = PERIODOS_GASTOS[i + 1];
    return { id: p, total: totalDe(p), estado: p === PERIODO ? "preparacion" : "publicada", gastos: p === PERIODO ? GASTOS.length + estado.gastosCargados.length : 0,
      variacion: prev ? ((totalDe(p) - totalDe(prev)) / totalDe(prev)) * 100 : null };
  });
  const actual = periodos[0];
  const cronologico = [...periodos].reverse();
  const max = Math.max(...periodos.map(p => p.total));
  const min = Math.min(...periodos.map(p => p.total));
  const primero = cronologico[0];
  const enSeis = ((actual.total - primero.total) / primero.total) * 100;
  const rubros = RUBROS.map(r => ({ ...r, v: r.monto + estado.gastosCargados.filter(g => g.rubroId === r.id).reduce((a, g) => a + g.monto, 0) }))
    .sort((a, b) => b.v - a.v);
  const dominante = rubros[0];
  const tono = (p: Periodo): Tono => p.estado === "preparacion" ? "pendiente" : "ok";
  const rotulo = (p: Periodo) => p.estado === "preparacion" ? "En preparación" : "Publicada";

  return <AdminPagina titulo="Expensas" descripcion="Períodos del edificio: los gastos cargados en cada uno y lo que ya se publicó a las unidades." clase="ad-a15">
    <div className="ad-a15-tablero">
      {/* A15-04 · el acento de identidad: el período abierto */}
      <section className="ad-a15-periodo ad-card-mov" aria-label="Período en preparación">
        <span className="ad-a15-eyebrow"><i aria-hidden="true" />Período en preparación</span>
        <h2>{periodoLargo(actual.id)}</h2>
        <p className="ad-a15-total ct-cifra">{pesos(actual.total)}</p>
        <div className="ad-a15-datos">
          {actual.variacion !== null && <span className="ad-a15-var">{signo(actual.variacion)} <small>vs {periodoLargo(periodos[1].id).split(" ")[0].toLowerCase()}</small></span>}
          <span>Vence el 20 de {periodoLargo(actual.id).split(" ")[0].toLowerCase()}</span>
          <span>{actual.gastos} gastos cargados</span>
        </div>
        <button type="button" className="ct-btn ct-btn--fuerte ct-btn--chico" onClick={() => ir("a16", "cargar")}>Cargar gastos<Icon n="flechaDer" s={16} /></button>
      </section>

      {/* A15-02 · evolución: seis períodos, el elegido marcado */}
      <section className="ad-a15-tendencia ad-vidrio ad-card-mov" aria-label="Evolución del gasto">
        <header><div><h2>Evolución del gasto</h2><p>Últimos {periodos.length} períodos</p></div>
          <span className="ad-badge">{signo(enSeis)} en {periodos.length} meses</span></header>
        <ol className="ad-a15-barras">
          {cronologico.map(p => { const h = 26 + ((p.total - min) / Math.max(1, max - min)) * 74;
            return <li key={p.id}><button type="button" aria-pressed={sel === p.id} onClick={() => setSel(p.id)}
              aria-label={`${periodoLargo(p.id)}: ${pesos(p.total)}${p.variacion !== null ? `, ${signo(p.variacion)} respecto del anterior` : ""}`}>
              <span className="valor ct-cifra">{pesos(p.total).replace(/\.\d{3}$/, " mil").replace("$ ", "$")}</span>
              <span className="pista"><i style={{ height: `${h}%` }} /></span>
              <small>{mesCorto(p.id)}</small>
            </button></li>; })}
        </ol>
      </section>

      {/* A15-05 · el rubro que más pesa en el período abierto */}
      <section className="ad-a15-rubro ad-vidrio ad-card-mov" aria-label="Rubro dominante">
        <h2>Rubro principal</h2>
        <p className="ad-a15-rubro-nom">{dominante.nombre}</p>
        <p className="ad-a15-rubro-pc ct-cifra">{porcentaje(dominante.v, actual.total)}</p>
        <div className="ad-a15-mezcla" aria-hidden="true">
          {rubros.slice(0, 4).map((r, i) => <i key={r.id} style={{ flexGrow: r.v, opacity: 1 - i * 0.2 }} />)}
          <i className="resto" style={{ flexGrow: rubros.slice(4).reduce((a, r) => a + r.v, 0) }} />
        </div>
        <ul className="ad-a15-top">{rubros.slice(1, 4).map(r => <li key={r.id}><span>{r.nombre}</span><b className="ct-num">{porcentaje(r.v, actual.total)}</b></li>)}</ul>
      </section>
    </div>

    <ListaDetalle<Periodo> etiqueta="Períodos" items={periodos} clave={p => p.id} seleccion={sel} onSeleccion={setSel} rotuloDetalle={p => periodoLargo(p.id)}
      vacio={<p>Sin períodos.</p>}
      columnas={[
        { id: "p", titulo: "Período", celda: p => <span className="ad-dos"><b>{periodoLargo(p.id)}</b><small>{p.estado === "preparacion" ? `${p.gastos} gastos cargados` : "Liquidado y publicado"}</small></span> },
        { id: "t", titulo: "Gastos del período", ancho: "170px", celda: p => <b className="ad-mono">{pesos(p.total)}</b> },
        { id: "v", opc: true, titulo: "Variación", ancho: "110px", celda: p => p.variacion === null ? <span className="ad-sin">—</span> : <span className={"ad-var" + (p.variacion > 0 ? " sube" : " baja")}>{signo(p.variacion)}</span> },
        { id: "e", titulo: "Estado", ancho: "160px", celda: p => <StatusTag tono={tono(p)}>{rotulo(p)}</StatusTag> },
      ]}
      detalle={p => <div className="ad-det">
        {/* A15-03 · el detalle con peso: estado, total, vencimiento, rubros y la acción */}
        <StatusTag tono={tono(p)}>{rotulo(p)}</StatusTag>
        <h2 className="ad-det-titulo">{periodoLargo(p.id)}</h2>
        <p className="ad-det-importe ct-cifra">{pesos(p.total)}</p>
        <Datos filas={[["Vencimiento", `20 de ${periodoLargo(p.id).split(" ")[0].toLowerCase()}`],
          ["Variación", p.variacion === null ? "Primer período del registro" : `${signo(p.variacion)} respecto del anterior`],
          ["Gastos", p.estado === "preparacion" ? `${p.gastos} cargados` : "Liquidado y publicado"]]} />
        {p.estado === "preparacion" ? <>
          {/* ADM-EXP-02 · el módulo largo se pliega y se reabre con el mismo
              control; el estado se conserva mientras dura la sesión */}
          <Plegable id={`ad-a15-rubros-${p.id}`} titulo="Por rubro" clase="ad-a15-plegable"
            resumen={<span className="ad-badge">{rubros.length} rubros</span>}
            cerrado={<p className="ad-cerrado-txt">Mayor gasto: <b>{rubros[0].nombre}</b> · {porcentaje(rubros[0].v, p.total)}</p>}>
          <ul className="ad-rubros ad-rubros-v2">{rubros.map((r, i) => {
            const pc = r.v / p.total * 100;
            return <li key={r.id} data-top={i === 0 || undefined}><span className="nb">{r.nombre}</span><b className="ad-mono">{pesos(r.v)}</b>
              <i style={{ ["--p" as string]: `${pc}%` }} aria-hidden="true" /><small className="ct-num">{porcentaje(r.v, p.total)}</small></li>; })}</ul>
          </Plegable>
          <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--primario" onClick={() => ir("a16", "cargar")}>Cargar gastos<Icon n="flechaDer" s={18} /></button></div>
          <p className="ad-det-texto">Liquidar por unidad y publicar necesita el motor de expensas, que no está en el prototipo. Acá se ve lo que ya está cargado.</p>
        </> : <p className="ad-det-texto">Del período publicado el prototipo guarda el total; el detalle de facturas no está cargado.</p>}
      </div>} />
  </AdminPagina>;
}
const porcentaje = (v: number, total: number) => `${(v / total * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`;

/* ══ A16 · Cargar gastos ═════════════════════════════════════════════════ */
export function A16({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado, hacer } = useApp();
  const [q, setQ] = useState("");
  const [rubro, setRubro] = useState<string>("todos");
  const [sel, setSel] = useState<string | null>(null);
  /* ADM-EXP-05 · desde Expensas "Cargar gastos" llega con ref=cargar y
     abre el formulario directamente */
  const [form, setForm] = useState(refe === "cargar");
  const [f, setF] = useState({ rubroId: RUBROS[0].id, proveedor: "", concepto: "", monto: "", comprobante: "" });
  const [tocado, setTocado] = useState(false);
  const [recien, setRecien] = useState<{ id: string; proveedor: string; monto: number } | null>(null);
  const primero = useRef<HTMLSelectElement>(null);
  const gastos = [...estado.gastosCargados, ...GASTOS];
  const lista = gastos.filter(g => rubro === "todos" || g.rubroId === rubro).filter(g => normalizar(`${g.proveedor} ${g.concepto} ${g.comprobante ?? ""}`).includes(normalizar(q)));
  const monto = Number(f.monto.replace(/\./g, "").replace(",", "."));
  const errores = { proveedor: !f.proveedor.trim() ? "Falta el proveedor." : "", concepto: !f.concepto.trim() ? "Falta el concepto." : "", monto: !(monto > 0) ? "Poné un importe mayor a cero." : "" };
  useEffect(() => { if (form) primero.current?.focus(); }, [form]);
  function cargar() {
    setTocado(true);
    if (errores.proveedor || errores.concepto || errores.monto) return;
    const id = `gc-${Date.now()}`;
    const gasto: GastoDetalle = { id, rubroId: f.rubroId, proveedor: f.proveedor.trim(), concepto: f.concepto.trim(), monto, fecha: new Date().toISOString(), comprobante: f.comprobante.trim() || undefined };
    hacer({ t: "gasto/cargar", gasto, por: YO });
    avisar({ titulo: "Gasto cargado al período", detalle: `${gasto.proveedor} · ${pesos(monto)}`, icono: "check" });
    /* La fila nueva tiene que verse: se limpian búsqueda y rubro si la
       dejaban afuera, y el total del período se recalcula con ella. */
    setQ(""); setRubro("todos");
    setF({ rubroId: f.rubroId, proveedor: "", concepto: "", monto: "", comprobante: "" }); setTocado(false);
    setRecien({ id, proveedor: gasto.proveedor, monto }); setForm(false);
  }
  const totalPeriodo = gastos.reduce((a, g) => a + g.monto, 0);
  return <AdminPagina titulo="Gastos del período" descripcion={`${periodoLargo(PERIODO)} · en preparación. Cada gasto que cargás queda registrado en el período y suma a su total. El reparto por unidad no se calcula en este prototipo.`} clase="ad-a16"
    acciones={!form ? <button type="button" className="ct-btn ct-btn--primario" onClick={() => { setForm(true); setSel(null); }}><Icon n="mas" s={18} />Cargar gasto</button> : undefined}>
    {/* Gastos · herencia de la banda de métricas: lo que ya está cargado */}
    <dl className="ad-resumen">
      <div><dt>Total del período</dt><dd className="ct-cifra ad-importe">{pesos(totalPeriodo)}</dd></div>
      <div><dt>Gastos cargados</dt><dd className="ct-cifra">{String(gastos.length).padStart(2, "0")}</dd></div>
      <div><dt>Mayor gasto del período</dt><dd className="ad-texto">{(() => { const t = RUBROS.map(r => ({ r, v: gastos.filter(g => g.rubroId === r.id).reduce((a, g) => a + g.monto, 0) })).sort((x, y) => y.v - x.v)[0]; return t ? t.r.nombre : "—"; })()}</dd></div>
    </dl>
    {recien && <p className="ad-ok ct-resuelve" role="status"><Icon n="check" s={16} />Cargado: {recien.proveedor} · {pesos(recien.monto)}. El total de {periodoLargo(PERIODO)} ahora es {pesos(totalPeriodo)}.</p>}
    <div className="ad-a16-marco" data-form={form}>
      <ListaDetalle<GastoDetalle> etiqueta="Gastos" items={lista} clave={g => g.id} seleccion={sel} onSeleccion={id => { setSel(id); if (id) setForm(false); }} filtroClave={rubro} rotuloDetalle={g => g.concepto}
        herramientas={<>
          <BuscarEnLista valor={q} onCambio={setQ} placeholder="Proveedor, concepto o comprobante" etiqueta="Buscar gastos" />
          <div className="ct-campo ad-select-chico"><label className="solo-lectores" htmlFor="ad-rubro">Rubro</label>
            <select id="ad-rubro" value={rubro} onChange={e => setRubro(e.target.value)}><option value="todos">Todos los rubros</option>{RUBROS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div>
          <span className="ad-meta">{lista.length} gastos · {pesos(lista.reduce((a, g) => a + g.monto, 0))}</span>
        </>}
        vacio={<p>Nada con estos filtros.</p>}
        columnas={[
          { id: "p", titulo: "Proveedor · concepto", celda: g => <span className={`ad-dos${recien?.id === g.id ? " ct-insertado" : ""}`}><b>{g.proveedor}</b><small>{g.concepto}</small></span> },
          { id: "r", opc: true, titulo: "Rubro", ancho: "minmax(120px,180px)", celda: g => <span className="ad-meta">{rubroPorId(g.rubroId)?.nombre}</span> },
          { id: "f", opc: true, titulo: "Fecha", ancho: "128px", celda: g => <span className="ad-meta ad-nowrap">{fechaCorta(g.fecha)}</span> },
          { id: "m", titulo: "Importe", ancho: "140px", clase: "ad-der", celda: g => <b className="ad-mono">{pesos(g.monto)}</b> },
        ]}
        detalle={g => <div className="ad-det">
          <h2 className="ad-det-titulo">{g.concepto}</h2>
          <Datos filas={[["Proveedor", g.proveedor], ["Rubro", rubroPorId(g.rubroId)?.nombre ?? g.rubroId], ["Importe", pesos(g.monto)], ["Fecha", fechaCorta(g.fecha)], ["Comprobante", g.comprobante ?? "Sin comprobante"], ["Estado", estado.gastosCargados.some(x => x.id === g.id) ? "Borrador · cargado hoy" : "Validado"]]} />
          <button type="button" className="ct-btn ct-btn--secundario" onClick={() => ir("a15")}>Ver el período</button>
        </div>} />
      {form && <aside className="ad-form ct-panel" aria-label="Cargar un gasto" onKeyDown={e => { if (e.key === "Escape") setForm(false); }}>
        <div className="ad-ld-barra"><span className="ct-label">Nuevo gasto</span><button type="button" className="ct-panel-cerrar" onClick={() => setForm(false)}><Icon n="cerrar" s={16} />Cerrar</button></div>
        <form onSubmit={e => { e.preventDefault(); cargar(); }} autoComplete="off" noValidate className="ad-form-campos">
          {/* Período y moneda a la vista: el gasto se guarda con ellos. */}
          <dl className="ad-form-fijos">
            <div><dt>Período</dt><dd>{periodoLargo(PERIODO)}</dd></div>
            <div><dt>Moneda</dt><dd>Pesos (ARS)</dd></div>
          </dl>
          <div className="ct-campo"><label htmlFor="g-rubro">Rubro</label><select ref={primero} id="g-rubro" value={f.rubroId} onChange={e => setF({ ...f, rubroId: e.target.value })}>{RUBROS.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select></div>
          <div className="ct-campo"><label htmlFor="g-prov">Proveedor</label><input id="g-prov" name="gasto-proveedor" value={f.proveedor} onChange={e => setF({ ...f, proveedor: e.target.value })} placeholder="Ej.: Clima Sur SRL" aria-invalid={tocado && Boolean(errores.proveedor)} aria-describedby={tocado && errores.proveedor ? "g-prov-e" : undefined} />{tocado && errores.proveedor && <p className="ct-campo-error" id="g-prov-e"><Icon n="alerta" s={14} />{errores.proveedor}</p>}</div>
          <div className="ct-campo"><label htmlFor="g-con">Concepto</label><input id="g-con" name="gasto-concepto" value={f.concepto} onChange={e => setF({ ...f, concepto: e.target.value })} placeholder="Qué se pagó" aria-invalid={tocado && Boolean(errores.concepto)} aria-describedby={tocado && errores.concepto ? "g-con-e" : undefined} />{tocado && errores.concepto && <p className="ct-campo-error" id="g-con-e"><Icon n="alerta" s={14} />{errores.concepto}</p>}</div>
          <div className="ct-campo"><label htmlFor="g-mon">Importe <small>en pesos</small></label><input id="g-mon" name="gasto-importe" inputMode="decimal" value={f.monto} onChange={e => setF({ ...f, monto: e.target.value })} placeholder="$ 0" aria-invalid={tocado && Boolean(errores.monto)} aria-describedby={tocado && errores.monto ? "g-mon-e" : "g-mon-a"} />
            {tocado && errores.monto ? <p className="ct-campo-error" id="g-mon-e"><Icon n="alerta" s={14} />{errores.monto}</p>
              : <p className="ct-campo-ayuda" id="g-mon-a">{monto > 0 ? `Se va a cargar ${pesos(monto)}.` : "Sin puntos ni signo: 125000 o 125.000."}</p>}</div>
          <div className="ct-campo"><label htmlFor="g-cmp">Comprobante <small>opcional</small></label><input id="g-cmp" name="gasto-comprobante" value={f.comprobante} onChange={e => setF({ ...f, comprobante: e.target.value })} placeholder="Número de factura" /></div>
          <button type="submit" className="ct-btn ct-btn--primario ct-btn--ancho">Cargar al período</button>
        </form>
      </aside>}
    </div>
  </AdminPagina>;
}

/* ══ A17 · Cobranza ══════════════════════════════════════════════════════ */
type Cobro = { id: string; origen: "unidad" | "residente"; unidad: string; periodo: string; importe: number; fecha: string; medio: string; comprobante?: string;
  informadoEl: string; informadoPor: string; estado: "informado" | "conciliado" | "rechazado"; decision?: { por: string; cuando: string; motivo?: string } };
export function A17({ refe }: { ir: Ir; refe?: string }) {
  const { estado, hacer } = useApp();
  const [corte, setCorte] = useState<"informado" | "conciliado" | "rechazado">("informado");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const [q, setQ] = useState("");
  const [motivo, setMotivo] = useState("");
  const [rechazando, setRechazando] = useState(false);
  const [recordados, setRecordados] = useState<string[]>([]);
  const [saliendo, setSaliendo] = useState<{ id: string; ok: boolean; fase: "marca" | "sale" } | null>(null);
  const [tocado, setTocado] = useState(false);
  useEffect(() => { setRechazando(false); setMotivo(""); setTocado(false); }, [sel]);
  const cobros: Cobro[] = [
    ...estado.cobranza.map(p => ({ ...p, origen: "unidad" as const, medio: MEDIO[p.medio] })),
    ...estado.pagos.map(p => ({ id: p.id, origen: "residente" as const, unidad: RESIDENTE.unidad, periodo: p.periodo, importe: p.importe, fecha: p.fecha, medio: MEDIO[p.medio],
      comprobante: p.comprobante, informadoEl: p.informadoEl, informadoPor: RESIDENTE.nombre, estado: p.estado === "confirmado" ? "conciliado" as const : p.estado })),
  ];
  const lista = cobros.filter(c => c.estado === corte).filter(c => normalizar(`${c.unidad} ${c.informadoPor}`).includes(normalizar(q))).sort((a, b) => b.informadoEl.localeCompare(a.informadoEl));
  const tono: Record<Cobro["estado"], Tono> = { informado: "pendiente", conciliado: "ok", rechazado: "error" };
  const conSaldo = UNIDADES.filter(u => u.cuenta !== "al-dia");
  /* v05 · "conciliado es muy rápida la animación": la decisión se ve antes
     de que el pago deje la lista (900 ms con el estado nuevo, 350 ms de
     pliegue). Con movimiento reducido es inmediata. */
  function decidir(c: Cobro, ok: boolean) {
    if (!ok) { setTocado(true); if (!motivo.trim()) return; }
    if (saliendo) return;
    const mot = motivo.trim();
    const aplicar = () => {
      if (c.origen === "unidad") hacer({ t: "cobro/decidir", id: c.id, decision: ok ? "conciliado" : "rechazado", motivo: ok ? undefined : mot, por: YO });
      else if (ok) hacer({ t: "pago/confirmar", id: c.id, por: YO });
      else hacer({ t: "pago/rechazar", id: c.id, motivo: mot, por: YO });
      avisar(ok
        ? { titulo: "Pago conciliado", detalle: `Unidad ${c.unidad} · ${pesos(c.importe)} · el saldo queda verificado`, icono: "check" }
        : { titulo: "Pago rechazado · residente notificado", detalle: `Unidad ${c.unidad} · motivo: ${mot}`, icono: "alerta", tono: "mal" });
      setSaliendo(null);
    };
    if (sinMovimiento()) { aplicar(); return; }
    setSaliendo({ id: c.id, ok, fase: "marca" });
    window.setTimeout(() => setSaliendo(s => (s && s.id === c.id ? { ...s, fase: "sale" } : s)), 900);
    window.setTimeout(aplicar, 1250);
  }
  const transita = (c: Cobro) => saliendo?.id === c.id ? saliendo : null;
  return <AdminPagina titulo="Cobranza" descripcion="Pagos informados por las unidades: verificar el comprobante y conciliar o rechazar con motivo." clase="ad-a17">
    <p className="ad-nota"><Icon n="info" s={16} />Sin integración bancaria: conciliar en el prototipo marca el pago como verificado y queda auditado. No mueve dinero ni recalcula saldos.</p>
    <dl className="ad-resumen">
      <div><dt>Por conciliar</dt><dd className="ct-cifra">{String(cobros.filter(c => c.estado === "informado").length).padStart(2, "0")}</dd></div>
      <div><dt>Informado sin conciliar</dt><dd className="ct-cifra ad-importe">{pesos(cobros.filter(c => c.estado === "informado").reduce((a, c) => a + c.importe, 0))}</dd></div>
      <div><dt>Unidades con saldo</dt><dd className="ct-cifra">{String(conSaldo.length).padStart(2, "0")}</dd></div>
    </dl>
    <ListaDetalle<Cobro> etiqueta="Pagos informados" items={lista} clave={c => c.id} seleccion={sel} onSeleccion={setSel} filtroClave={corte} rotuloDetalle={c => `Pago de la unidad ${c.unidad}`}
      marca={c => { const t = transita(c); return t ? (t.fase === "sale" ? "sale" : t.ok ? "ok" : "mal") : undefined; }}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Unidad o persona" etiqueta="Buscar pagos" />
        <Segmentado etiqueta="Estado" valor={corte} onCambio={v => { setCorte(v); setSel(null); }}
          opciones={[{ id: "informado", label: "Por conciliar", cuenta: cobros.filter(c => c.estado === "informado").length }, { id: "conciliado", label: "Conciliados" }, { id: "rechazado", label: "Rechazados" }]} />
      </>}
      vacio={<p>{corte === "informado" ? "No hay pagos esperando conciliación." : "Nada en este corte."}</p>}
      pie={corte === "informado" && conSaldo.length > 0 && <div className="ad-saldos"><h3 className="ct-label">Unidades con saldo</h3>
        <ul>{conSaldo.map(u => <li key={u.codigo}><b className="ad-mono ad-saldos-cod">{u.codigo}</b>
          <span className="ad-saldos-quien"><span className="ad-saldos-nom" title={u.residentes[0]}>{u.residentes[0]}</span><StatusTag tono={u.cuenta === "informado" ? "curso" : "error"}>{u.cuenta === "informado" ? "Pago informado" : "Con deuda"}</StatusTag></span>
          <b className="ad-mono ad-saldos-monto">{pesos(u.saldo)}</b>
          {u.cuenta !== "informado" && <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico ad-recordar" disabled={recordados.includes(u.codigo)}
            onClick={() => { setRecordados(r => [...r, u.codigo]); avisar({ titulo: `Recordatorio enviado a la unidad ${u.codigo}`, detalle: `${u.residentes[0]} lo ve en sus notificaciones · saldo ${pesos(u.saldo)}`, icono: "campana" }); }}
            aria-label={recordados.includes(u.codigo) ? `Recordatorio enviado a la unidad ${u.codigo}` : `Enviar recordatorio a la unidad ${u.codigo}`}>
            <Icon n={recordados.includes(u.codigo) ? "check" : "campana"} s={15} />{recordados.includes(u.codigo) ? "Enviado" : <span><span className="larga">Enviar </span>recordatorio</span>}</button>}
          {u.cuenta === "informado" && <span aria-hidden="true" />}</li>)}</ul></div>}
      columnas={[
        { id: "u", titulo: "Unidad", ancho: "80px", celda: c => <b className="ad-mono">{c.unidad}</b> },
        { id: "q", titulo: "Informó", celda: c => <span className="ad-dos"><b>{c.informadoPor}</b><small>{c.medio} · {fechaHora(c.informadoEl)}</small></span> },
        { id: "p", opc: true, titulo: "Período", ancho: "140px", celda: c => <span className="ad-meta">{periodoLargo(c.periodo)}</span> },
        { id: "i", titulo: "Importe", ancho: "130px", clase: "ad-der", celda: c => <b className="ad-mono">{pesos(c.importe)}</b> },
        { id: "e", titulo: "Estado", ancho: "120px", celda: c => { const t = transita(c);
          return t ? <StatusTag tono={t.ok ? "ok" : "error"}>{t.ok ? "Conciliado" : "Rechazado"}</StatusTag>
            : <StatusTag tono={tono[c.estado]}>{c.estado === "informado" ? "Informado" : c.estado === "conciliado" ? "Conciliado" : "Rechazado"}</StatusTag>; } },
      ]}
      detalle={c => { const u = UNIDADES.find(x => x.codigo === c.unidad); return <div className="ad-det">
        <p className="ad-det-importe ct-cifra">{pesos(c.importe)}</p>
        <h2 className="ad-det-titulo">Unidad {c.unidad} · {periodoLargo(c.periodo)}</h2>
        <Datos filas={[["Informó", `${c.informadoPor} · ${fechaHora(c.informadoEl)}`], ["Medio", c.medio], ["Fecha del pago", fechaCorta(c.fecha)], ["Comprobante", c.comprobante ?? "Sin adjunto"],
          ["Saldo de la unidad", u ? pesos(u.saldo) : "—"], ...(c.decision ? [["Decisión", `${c.decision.por} · ${fechaHora(c.decision.cuando)}${c.decision.motivo ? ` · ${c.decision.motivo}` : ""}`] as [string, string]] : [])]} />
        {c.estado === "informado" && (transita(c) ? <div className="ad-decision ad-decidido" data-ok={transita(c)!.ok || undefined} role="status">
              <Icon n={transita(c)!.ok ? "check" : "alerta"} s={18} />{transita(c)!.ok ? "Pago conciliado" : "Pago rechazado"}</div>
          : rechazando
          ? <div className="ad-decision"><div className="ct-campo"><label htmlFor="mot-p">Motivo del rechazo</label>
              <textarea id="mot-p" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej.: el comprobante no coincide con el importe." aria-invalid={tocado && !motivo.trim()} />
              {tocado && !motivo.trim() && <p className="ct-campo-error">Rechazar necesita un motivo: la unidad lo recibe.</p>}</div>
              <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={() => decidir(c, false)}>Rechazar el pago</button><button type="button" className="ct-btn ct-btn--texto" onClick={() => setRechazando(false)}>Volver</button></div></div>
          : <div className="ad-decision"><button type="button" className="ct-btn ct-btn--primario ct-btn--ancho" onClick={() => decidir(c, true)}>Conciliar el pago</button>
              <button type="button" className="ct-btn ct-btn--secundario ct-btn--ancho" onClick={() => setRechazando(true)}>Rechazar…</button></div>)}
      </div>; }} />
  </AdminPagina>;
}
