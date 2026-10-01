"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { OperationalSearchField } from "./ReceptionSearch";
import { ReceptionPage } from "./ReceptionPage";
import { Segmentado } from "../sistema/Segmentado";
import { useApp } from "@/lib/estado";
import { actividadRegistrada, mismoDiaOperativo, type ActividadTurno } from "@/lib/recepcion";
import { soloHora } from "@/lib/formato";

/** P09 · Actividad. Referencia primaria: U09 Timeline Journey.
 *
 *  USER GOAL: saber qué pasó, cuándo, a quién y de qué tipo, sin tener que
 *  pasar el mouse. Arriba el recorrido (U09): un carril por tipo, cada
 *  movimiento es una píldora con su hora y su acción escritas. Abajo, la
 *  bitácora legible en reposo: el día como ancla, y en cada fila hora ·
 *  tipo · qué pasó · a quién · quién lo registró. El detalle extra se
 *  despliega; nada depende del hover. */

const CATEGORIAS: { id: ActividadTurno["categoria"]; rotulo: string; singular: string; icono: NombreIcono }[] = [
  { id: "accesos", rotulo: "Accesos", singular: "Acceso", icono: "credencial" },
  { id: "entregas", rotulo: "Entregas", singular: "Entrega", icono: "caja" },
  { id: "incidencias", rotulo: "Incidencias", singular: "Incidencia", icono: "alerta" },
];
const CAT = Object.fromEntries(CATEGORIAS.map(c => [c.id, c])) as Record<ActividadTurno["categoria"], (typeof CATEGORIAS)[number]>;
/** La acción en dos palabras, para la píldora. */
const corto = (t: string) => t.replace("registrado", "").replace("registrada", "").replace("Entrega ", "").trim().replace(/^./, c => c.toUpperCase());

export function P09() {
  const { estado } = useApp();
  const [tipo, setTipo] = useState<"todos" | ActividadTurno["categoria"]>("todos");
  const [periodo, setPeriodo] = useState<"hoy" | "semana" | "todo">("hoy");
  const [q, setQ] = useState("");
  const [marcada, setMarcada] = useState<string | null>(null);
  /* REC-ACT-04 · el evento del recorrido se abre para leer su detalle */
  const [abierto, setAbierto] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(id); }, []);
  const desde = new Date(ahora); desde.setDate(desde.getDate() - 6); desde.setHours(0, 0, 0, 0);
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const todos = actividadRegistrada(estado, ahora);
  /* Lo que existía al entrar es la base: lo que llega después entra marcado. */
  const conocidos = useRef<Set<string> | null>(null);
  if (!conocidos.current) conocidos.current = new Set(todos.map(i => i.id));
  const items = todos.filter(i => (tipo === "todos" || i.categoria === tipo) && (periodo === "todo" || (periodo === "hoy" ? mismoDiaOperativo(i.cuando, ahora) : new Date(i.cuando) >= desde)) && normalizar(`${i.titulo} ${i.contexto} ${i.actor}`).includes(normalizar(q)));
  const dias = [...new Set(items.map(i => new Date(i.cuando).toDateString()))];

  const porHora = periodo === "hoy";
  const horas = items.map(i => new Date(i.cuando).getHours());
  const hIni = porHora ? Math.min(7, ...horas) : 0;
  const hFin = porHora ? Math.max(hIni + 8, Math.min(24, Math.max(ahora.getHours() + 1, ...horas.map(h => h + 1)))) : 0;
  const diasEje = porHora ? [] : [...dias].reverse().slice(-8);
  const columnas = porHora ? hFin - hIni : Math.max(1, diasEje.length);
  const posicion = (i: ActividadTurno) => {
    const d = new Date(i.cuando);
    if (porHora) return ((d.getHours() + d.getMinutes() / 60) - hIni) / columnas * 100;
    const k = diasEje.indexOf(d.toDateString());
    return (k + 0.5) / columnas * 100;
  };
  const carriles = CATEGORIAS.filter(c => tipo === "todos" || c.id === tipo);
  const quitarFiltros = () => { setTipo("todos"); setPeriodo("todo"); setQ(""); };

  function irA(id: string) {
    setMarcada(id);
    const fila = document.getElementById(`act-${id}`);
    fila?.scrollIntoView({ block: "center", behavior: "smooth" });
    fila?.focus({ preventScroll: true });
  }
  const rotuloDia = (d: string) => mismoDiaOperativo(new Date(d).toISOString(), ahora) ? "Hoy"
    : new Date(d).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, c => c.toUpperCase());

  return <ReceptionPage titulo="Actividad" descripcion="Bitácora del edificio: accesos, entregas e incidencias, con hora y responsable." icono="lista" clase="act2">
    <div className="act2-filtros">
      <Segmentado etiqueta="Tipo de actividad" valor={tipo} onCambio={setTipo}
        opciones={[{ id: "todos", label: "Todo" }, ...CATEGORIAS.map(c => ({ id: c.id, label: c.rotulo, icono: c.icono }))]} />
      <Segmentado etiqueta="Período" valor={periodo} onCambio={setPeriodo}
        opciones={[{ id: "hoy", label: "Hoy" }, { id: "semana", label: "7 días" }, { id: "todo", label: "Todo" }]} />
      <OperationalSearchField label="Buscar en actividad" placeholder="Persona, unidad o movimiento" value={q} onChange={setQ} />
    </div>

    {/* REC-ACT-01/02/03/04 · título operativo, eventos más grandes que se
        abren, nunca afuera del contenedor, vacío con su acción a la vista */}
    <section className="act2-recorrido act2-v2" aria-label="Recorrido del período">
      <header><h2 className="ct-h2">{porHora ? "Movimientos de hoy" : periodo === "semana" ? "Últimos 7 días" : "Todo el registro"}</h2>
        <p><b className="ct-cifra">{String(items.length).padStart(2, "0")}</b> {items.length === 1 ? "movimiento" : "movimientos"}</p></header>
      {items.length > 0 ? <div className="act2-eje" key={`${tipo}-${periodo}`}>
        <div className="act2-guias" aria-hidden="true">{Array.from({ length: columnas + 1 }, (_, k) => <i key={k} style={{ left: `${k / columnas * 100}%` }} />)}</div>
        {carriles.map(c => {
          const fila: number[] = [];
          const puestos = items.filter(i => i.categoria === c.id).map(i => ({ i, x: posicion(i) })).sort((a, b) => a.x - b.x)
            .map(p => { let f = fila.findIndex(fin => fin <= p.x); if (f < 0) f = fila.length; fila[f] = p.x + 22; return { ...p, f }; });
          return <div className="act2-carril" key={c.id} style={{ ["--filas" as string]: Math.max(1, fila.length) }}>
            <span className="act2-carril-rot"><span className="ic" aria-hidden="true"><Icon n={c.icono} s={16} /></span>{c.rotulo}<small>{puestos.length}</small></span>
            <div className="act2-pista">{puestos.map(({ i, x, f }) => {
              const abiertoEste = abierto === i.id;
              return <div key={i.id} className="act2-ev" data-marcada={marcada === i.id || undefined} data-abierto={abiertoEste || undefined}
                style={{ left: `${x}%`, top: f * 64, ["--x" as string]: `${x}%` }}>
                <button type="button" className="act2-ev-cab" aria-expanded={abiertoEste} aria-controls={`act-ev-${i.id}`}
                  onClick={() => setAbierto(abiertoEste ? null : i.id)}
                  aria-label={`${soloHora(i.cuando)} · ${i.titulo} · ${i.contexto}`}>
                  <time>{porHora ? soloHora(i.cuando) : `${new Date(i.cuando).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · ${soloHora(i.cuando)}`}</time>
                  <b>{corto(i.titulo)}</b>
                </button>
                <div className="act2-ev-det" id={`act-ev-${i.id}`} hidden={!abiertoEste}>
                  <p className="t">{i.titulo}</p>
                  <p>{i.contexto}</p>
                  <p className="quien">{i.actor}</p>
                  <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => irA(i.id)}>Ver en la bitácora</button>
                </div>
              </div>; })}</div>
          </div>;
        })}
        <div className="act2-escala" aria-hidden="true">{porHora
          ? Array.from({ length: columnas + 1 }, (_, k) => <span key={k} style={{ left: `${k / columnas * 100}%` }}>{String(hIni + k).padStart(2, "0")}:00</span>)
          : diasEje.map((d, k) => <span key={d} style={{ left: `${(k + 0.5) / columnas * 100}%` }}>{new Date(d).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}</span>)}</div>
      </div> : <div className="act2-vacio act2-vacio-v2">
        <span className="ic" aria-hidden="true"><Icon n="lista" s={26} /></span>
        <h3>{periodo === "hoy" && tipo === "todos" && !q ? "Todavía no hubo movimientos hoy" : "Nada con estos filtros"}</h3>
        <p>{periodo === "hoy" ? "Los accesos, entregas e incidencias del turno aparecen acá a medida que se registran." : "Probá con otro tipo o con otro período."}</p>
        <button type="button" className="ct-btn ct-btn--fuerte ct-btn--chico" onClick={quitarFiltros}>Ver todo el registro<Icon n="flechaDer" s={16} /></button>
      </div>}
    </section>

    <section className="act2-bitacora" aria-label="Bitácora">
      <div className="ct-tabla-cab act2-cols" aria-hidden="true"><span>Hora</span><span>Tipo</span><span>Qué pasó</span><span>Registró</span></div>
      {dias.map(d => <section className="act2-dia" key={d} aria-label={rotuloDia(d)}>
        <h3>{rotuloDia(d)}<small>{items.filter(i => new Date(i.cuando).toDateString() === d).length} movimientos</small></h3>
        <ol>{items.filter(i => new Date(i.cuando).toDateString() === d).map(i => <li key={i.id} id={`act-${i.id}`} tabIndex={-1}
          className={`act2-fila act2-cols${conocidos.current!.has(i.id) ? "" : " ct-insertado"}`} data-marcada={marcada === i.id || undefined}>
          <time dateTime={i.cuando}>{soloHora(i.cuando)}</time>
          <span className="act2-tipo"><span className="act2-icono" aria-hidden="true"><Icon n={i.icono} s={16} /></span>{CAT[i.categoria].singular}</span>
          <span className="act2-que"><b>{i.titulo}</b><small>{i.contexto}</small></span>
          <span className="act2-quien">{i.actor}</span>
        </li>)}</ol>
      </section>)}
    </section>
  </ReceptionPage>;
}
