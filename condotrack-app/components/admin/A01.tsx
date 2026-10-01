"use client";
import { useEffect, useRef, useState } from "react";
import { useDesborde } from "./useDesborde";
import { Icon, type NombreIcono } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { AdminPagina } from "./AdminMarco";
import { Plegable } from "./Plegable";
import { useApp } from "@/lib/estado";
import { ADMINISTRACION, type VistaA } from "@/lib/data";
import { ROTULO_AGENDA, UNIDADES } from "@/lib/edificio";
import { colaDeAtencion, type ItemAtencion } from "@/lib/admin";
import { agendaOperativa, actividadRegistrada, mismoDiaOperativo } from "@/lib/recepcion";
import { soloHora } from "@/lib/formato";

const ICONO: Record<ItemAtencion["tipo"], NombreIcono> = { caso: "alerta", reclamo: "chat", reserva: "calendario", pago: "banco", entrega: "caja", mudanza: "caja" };
const TIPO: Record<ItemAtencion["tipo"], string> = { caso: "Incidencia", reclamo: "Reclamo", reserva: "Reserva", pago: "Pago", entrega: "Entrega", mudanza: "Mudanza" };
const dos = (n: number) => String(n).padStart(2, "0");

/** A01 · Inicio de administración. Referencia primaria: U03 Sleep Editorial.
 *
 *  USER GOAL: entender qué requiere atención y actuar.
 *  Una gran jerarquía: el titular dice cuántas cosas esperan una decisión y
 *  sus cortes (críticas, sin responsable, de hoy) filtran la cola. La cola
 *  dice qué es, de quién es y qué acción corresponde. Al lado, lo próximo
 *  (módulo carbón, como el "Próximo" del borrador) y lo que cambió. Sin
 *  grilla de KPIs: los números existen sólo porque abren trabajo. */
export function A01({ ir }: { ir: (v: VistaA, ref?: string) => void }) {
  const { estado } = useApp();
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(t); }, []);
  const [corte, setCorte] = useState<"todo" | "criticas" | "sin" | "hoy">("todo");

  /* ADM-006 · el total sale del conjunto de entidades accionables únicas
     (por id), no de sumar notificaciones y casos del mismo evento. */
  const cola = colaDeAtencion(estado, ahora).filter((x, n, t) => t.findIndex(y => y.id === x.id) === n);
  const criticas = cola.filter(x => x.critico);
  const sin = cola.filter(x => !x.responsable);
  const deHoy = cola.filter(x => x.hoy);
  const visibles = corte === "criticas" ? criticas : corte === "sin" ? sin : corte === "hoy" ? deHoy : cola;

  const agenda = agendaOperativa(estado).filter(a => mismoDiaOperativo(a.hora, ahora));
  const siguientes = agenda.filter(a => new Date(a.hora) >= ahora);
  const proximo = siguientes[0] ?? agenda.find(a => a.tipo === "mudanza") ?? agenda[0];
  const luego = siguientes.filter(a => a.id !== proximo?.id).slice(0, 3);

  const cambios = [
    ...estado.auditoria.map(e => ({ id: e.id, cuando: e.cuando, texto: e.titulo, quien: `${e.responsable} · ${e.rol}` })),
    ...actividadRegistrada(estado, ahora).map(i => ({ id: i.id, cuando: i.cuando, texto: `${i.titulo} · ${i.contexto}`, quien: `${i.actor} · Recepción` })),
  ].sort((a, b) => b.cuando.localeCompare(a.cuando));
  const [verTodo, setVerTodo] = useState(false);
  const cambiosVisibles = verTodo ? cambios : cambios.slice(0, 6);
  /* ADM-010 · agrupado por día: "Hoy", "Ayer" o la fecha. */
  const diaDe = (iso: string) => {
    if (mismoDiaOperativo(iso, ahora)) return "Hoy";
    const ayer = new Date(ahora); ayer.setDate(ayer.getDate() - 1);
    return mismoDiaOperativo(iso, ayer) ? "Ayer" : new Date(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" });
  };
  const porDia = cambiosVisibles.reduce<{ dia: string; items: typeof cambios }[]>((acc, c) => {
    const d = diaDe(c.cuando);
    const g = acc.find(x => x.dia === d);
    if (g) g.items.push(c); else acc.push({ dia: d, items: [c] });
    return acc;
  }, []);

  const colaRef = useRef<HTMLDivElement>(null);
  const cambiosRef = useRef<HTMLDivElement>(null);
  const desbordeCola = useDesborde(colaRef, [corte, visibles.length]);
  const desbordeCambios = useDesborde(cambiosRef, [verTodo, cambios.length]);

  const saludo = ahora.getHours() < 13 ? "Buen día" : ahora.getHours() < 20 ? "Buenas tardes" : "Buenas noches";
  const fecha = ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const filtrado = corte !== "todo";

  return <AdminPagina titulo="Inicio" clase="ad-a01" volver={false}
    eyebrow={`${saludo}, ${ADMINISTRACION.nombre.split(" ")[0]} · ${fecha}`}>
    <div className="ad-a01-grilla">
      {/* ADM-007 · hero de atención con la arquitectura del edificio a la
          derecha (fachada.jpg, el mismo asset del Home de Residente) que se
          funde en la superficie. El titular y los filtros quedan sobre la
          parte serena; la cola arranca dentro del primer viewport. */}
      <section className="ad-a01-hero" aria-labelledby="ad-a01-h">
        <img className="ad-hero-foto" src="/img/fachada.jpg" alt="" aria-hidden="true" />
        <div className="ad-hero-txt">
          {/* A01-04 · sin "8 cosas requieren atención": la cifra real y una
              palabra operativa. */}
          <div>
            <h2 id="ad-a01-h" className="ad-titular">
              {cola.length
                ? <><Conteo n={cola.length} /> {cola.length === 1 ? "pendiente" : "pendientes"}</>
                : "Sin pendientes"}
            </h2>
            {/* v04 · C1 · sin el copy explicativo: el número ya lo dice */}
            {!cola.length && <p className="ad-hero-sub">Nada espera una decisión.</p>}
          </div>
          {/* ADM-008 · fila compacta de filtros alineada con la cola; con un
              filtro activo aparece Limpiar y la cola dice "n de N". */}
          <div className="ad-filtros">
            <Segmentado etiqueta="Qué mostrar en la cola" valor={corte} onCambio={setCorte} className="ad-cortes"
              opciones={[{ id: "todo", label: "Todo", cuenta: cola.length }, { id: "criticas", label: "Críticas", cuenta: criticas.length }, { id: "sin", label: "Sin responsable", cuenta: sin.length }, { id: "hoy", label: "De hoy", cuenta: deHoy.length }]} />
            {filtrado && <button type="button" className="ct-btn ct-btn--texto ad-limpiar" onClick={() => setCorte("todo")}>Limpiar filtro</button>}
          </div>
        </div>
      </section>

      {/* DEC-005 · la barra de tareas del Home es la cola de Pendientes: un
          único control de plegado y abierta al entrar. Cerrada sigue
          mostrando cuántas quedan y si hay críticas. */}
      {/* A01-05/06 · la cola en cards con jerarquía (título protagonista,
          metadata ordenada, responsable y acción a mano); el resumen es un
          par de badges, no texto flotante. */}
      <Plegable id="ad-a01-cola" titulo="Pendientes" clase="ad-a01-cola"
        critico={criticas.length > 0}
        resumen={<span className="ad-badges">
          <span className="ad-badge">{filtrado ? `${visibles.length} de ${cola.length}` : `${cola.length} en total`}</span>
          {criticas.length > 0 && <span className="ad-badge critico"><i aria-hidden="true" />{criticas.length} {criticas.length === 1 ? "crítica" : "críticas"}</span>}
        </span>}
        cerrado={cola.length > 0 && <div className="ad-cerrado-fila">
          {sin.length > 0 && <span className="ad-badge">{sin.length} sin responsable</span>}
          {deHoy.length > 0 && <span className="ad-badge">{deHoy.length} de hoy</span>}
          <span className="ad-cerrado-txt">Primero: <b>{cola[0].titulo}</b></span>
        </div>}>
        {/* ADM-009 · en escritorio alto la cola scrollea adentro; el fundido
            aparece sólo si hay filas fuera y nunca tapa la última. */}
        <div ref={colaRef} className="ad-scroll" data-desborde={desbordeCola ?? undefined} tabIndex={desbordeCola ? 0 : undefined}
          aria-label={desbordeCola ? "Cola de pendientes, con desplazamiento" : undefined}>
          <ul key={corte} className="ct-refiltra">{visibles.map(x => <li key={x.id} className="ad-cola-fila ad-cola-cols" data-critico={x.critico || undefined}>
            <span className="ad-cola-que"><span className="ad-cola-icono" aria-hidden="true"><Icon n={ICONO[x.tipo]} s={18} /></span>
              <span><span className="ad-cola-tipo">{TIPO[x.tipo]}{x.critico && <span className="ad-badge critico chico">Crítica</span>}</span>
                <b>{x.titulo}</b><small>{x.contexto}</small></span></span>
            <span className="ad-cola-resp">{x.responsable ? <><Icon n="persona" s={15} />{x.responsable}</> : <em className="ad-semaforo" data-tono="atencion">Sin responsable</em>}</span>
            <button type="button" className={`ct-btn ${x.responsable ? "ct-btn--secundario" : "ct-btn--fuerte"} ct-btn--chico`} onClick={() => ir(x.destino.vista, x.destino.ref)}>{x.accion}</button>
          </li>)}</ul>
          {!visibles.length && <div className="ad-vacio"><p>Nada en este corte.</p>{filtrado && <button type="button" className="ct-btn ct-btn--texto" onClick={() => setCorte("todo")}>Ver toda la cola</button>}</div>}
        </div>
      </Plegable>

      <div className="ad-a01-lateral">
        {/* A01-07 · el evento manda: título legible de un vistazo, la hora
            como dato del evento (no un número suelto enorme), su estado como
            badge y una acción clara. */}
        <Plegable id="ad-a01-prox" titulo="Próximo" clase="ad-a01-proximo"
          resumen={<span className={"ad-badge ad-badge-tiempo" + (proximo ? "" : " apagada")}><i aria-hidden="true" />{proximo ? cuandoEs(proximo.hora, ahora) : "Sin eventos"}</span>}
          cerrado={proximo && <p className="ad-cerrado-txt"><time>{soloHora(proximo.hora)}</time> <b>{proximo.titulo}{proximo.unidad ? ` · ${proximo.unidad}` : ""}</b></p>}>
          {proximo ? <>
            <div className="ad-prox-chips">
              <span className="ad-prox-chip"><Icon n="reloj" s={14} />{soloHora(proximo.hora)}</span>
              <span className="ad-prox-chip">{ROTULO_AGENDA[proximo.tipo]}</span>
              {proximo.estadoVisible && <span className="ad-prox-chip amarillo">{proximo.estadoVisible}</span>}
            </div>
            <h3>{proximo.titulo}{proximo.unidad ? ` · ${proximo.unidad}` : ""}</h3>
            {proximo.detalle && <p className="ad-prox-meta">{proximo.detalle}</p>}
            {luego.length > 0 && <ol className="ad-prox-luego">{luego.slice(0, 2).map(e => <li key={e.id}><time>{soloHora(e.hora)}</time>{e.titulo}</li>)}</ol>}
          </> : <p className="ad-prox-meta">Sin eventos en la agenda de hoy.</p>}
          <button type="button" className="ct-btn ct-btn--primario ct-btn--chico ad-prox-accion" onClick={() => ir("a10")}>Ver agenda y reservas<Icon n="flechaDer" s={16} /></button>
        </Plegable>

        {/* v05 · un refuerzo visual útil de CondoTrack: cómo viene la
            cobranza del mes, con su acción. Llena el lateral también cuando
            los paneles están plegados. */}
        {(() => {
          const total = UNIDADES.length;
          const alDia = UNIDADES.filter(u => u.cuenta === "al-dia").length;
          const pct = Math.round(alDia / total * 100);
          const conDeuda = UNIDADES.filter(u => u.cuenta === "debe").length;
          const informados = UNIDADES.filter(u => u.cuenta === "informado").length;
          const mes = new Date().toLocaleDateString("es-AR", { month: "long" });
          return <section className="ad-destacado" aria-labelledby="ad-dest-h">
            <span className="ad-dest-marca" aria-hidden="true"><img src="/brand/CT_FAVICON.svg" alt="" width={18} height={18} />CondoTrack · este mes</span>
            <h3 id="ad-dest-h">Cobranza de {mes}</h3>
            <p className="ad-dest-cifra"><b className="ct-cifra">{pct}<small>%</small></b><span>de las unidades<br />al día</span></p>
            <span className="ad-dest-barra" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
            <p className="ad-dest-sub">{conDeuda} con deuda · {informados} {informados === 1 ? "pago" : "pagos"} por conciliar</p>
            <button type="button" className="ad-dest-ir" onClick={() => ir("a17")}>Ver cobranza<Icon n="flechaDer" s={16} /></button>
          </section>;
        })()}

        {/* DEC-004 (c) · el título "Qué cambió" era lo que Felipe intentaba
            abrir (20:36–20:57): hoy es el control del módulo, y el resto de
            la historia se despliega acá mismo. */}
        <Plegable id="ad-a01-camb" titulo="Qué cambió" clase="ad-a01-cambios"
          resumen={<span className="ad-badge">{cambios.length ? `${cambios.length} ${cambios.length === 1 ? "novedad" : "novedades"}` : "Sin novedades"}</span>}
          cerrado={cambios[0] && <p className="ad-cerrado-txt"><time>{soloHora(cambios[0].cuando)}</time> <b>{cambios[0].texto}</b></p>}>
          <div ref={cambiosRef} className="ad-scroll" data-desborde={desbordeCambios ?? undefined} tabIndex={desbordeCambios ? 0 : undefined}
            aria-label={desbordeCambios ? "Qué cambió, con desplazamiento" : undefined}>
            {porDia.map(g => <section key={g.dia} className="ad-cambios-dia" aria-label={g.dia}>
              <h3 className="ct-label">{g.dia}</h3>
              <ol className="ad-cambios">{g.items.map(c => <li key={c.id}>
                <time>{soloHora(c.cuando)}</time>
                <span><b>{c.texto}</b><small>{c.quien}</small></span>
              </li>)}</ol>
            </section>)}
          </div>
          {cambios.length > 6 && <button type="button" className="ct-btn ct-btn--texto ad-ver-mas" aria-expanded={verTodo}
            onClick={() => setVerTodo(v => !v)}>{verTodo ? "Ver menos" : `Ver ${cambios.length - 6} más`}</button>}
        </Plegable>
      </div>
    </div>
  </AdminPagina>;
}

/** "En 2 h", "En 25 min" o "Hoy": la hora del evento ya está en la card. */
function cuandoEs(iso: string, ahora: Date) {
  const min = Math.round((new Date(iso).getTime() - ahora.getTime()) / 60000);
  const NUM = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];
  if (min > 90) { const h = Math.round(min / 60); return `En ${NUM[h] ?? h} ${h === 1 ? "hora" : "horas"}`; }
  if (min > 0) return `En ${min} min`;
  return "Hoy";
}

/* MOT-009 · la cifra cambia con un fundido corto sólo cuando cambia de
   verdad: volver a la pantalla con el mismo número no la anima. */
let ultimoConteo: number | undefined;
function Conteo({ n }: { n: number }) {
  const [cambia] = useState(() => ultimoConteo !== undefined && ultimoConteo !== n);
  const [clave, setClave] = useState(0);
  const previo = useRef(n);
  useEffect(() => {
    if (previo.current !== n) setClave(k => k + 1);
    previo.current = n;
    ultimoConteo = n;
  }, [n]);
  return <span key={clave} className={"ct-cifra ad-conteo" + (cambia || clave > 0 ? " cambia" : "")}>{n}</span>;
}
