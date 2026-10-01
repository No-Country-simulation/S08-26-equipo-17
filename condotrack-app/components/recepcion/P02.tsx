"use client";
import { useEffect, useRef, useState } from "react";
import { ReceptionPage } from "./ReceptionPage";
import { OperationalSearchField } from "./ReceptionSearch";
import { Icon } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { EDIFICIO, RESIDENTE, type VistaP } from "@/lib/data";
import { UNIDADES, buscarUnidades, unidadPorCodigo } from "@/lib/edificio";
import { ROTULO_PERMISO } from "@/lib/unidad";
import { hace } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** P02 · Unidades. Referencia primaria: U07 Timepiece.
 *
 *  USER GOAL: encontrar una unidad y saber quién vive, quién la visita y
 *  qué espera en recepción. Es el benchmark de Recepción: se conserva la
 *  composición y se suma una cabecera de identidad en la ficha (foto del
 *  edificio aprobada, unidad y piso) para que el detalle no sea un vacío.
 *
 *  Un solo marco partido por filetes, como U07: dos tercios para el
 *  directorio y un tercio para lo que se está mirando. La columna derecha
 *  nunca queda vacía ni cambia la grilla: sin unidad elegida muestra lo
 *  que el mostrador tiene pendiente por unidad; con una elegida, su ficha.
 *  Recepción no ve cuenta, saldo, deuda ni metros: sólo lo operativo. */
export function P02({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [piso, setPiso] = useState<number | null>(null);
  const [abierta, setAbierta] = useState<string | null>(refe ?? null);
  const detalle = useRef<HTMLElement>(null);
  const origen = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { setAbierta(refe ?? null); }, [refe]);
  useEffect(() => { if (abierta) { detalle.current?.focus({ preventScroll: true }); if (matchMedia("(max-width:900px)").matches) detalle.current?.scrollIntoView({ block: "start" }); } }, [abierta]);
  const resultados = buscarUnidades(q).filter(u => piso === null || u.piso === piso);
  const u = abierta ? unidadPorCodigo(abierta) : undefined;
  const visitas = estado.visitas.filter(v => v.unidad === u?.codigo && v.cuando !== "historial");
  const entregas = estado.entregas.filter(e => e.unidad === u?.codigo);
  const permisos = u?.codigo === RESIDENTE.unidad ? estado.permisos.filter(p => p.activo) : [];
  const conEntregas = UNIDADES.map(x => ({ x, n: estado.entregas.filter(e => e.unidad === x.codigo && e.estado === "retirar").length })).filter(r => r.n > 0);
  const conVisitas = UNIDADES.map(x => ({ x, n: estado.visitas.filter(v => v.unidad === x.codigo && v.cuando === "hoy" && v.estado !== "cancelada").length })).filter(r => r.n > 0);
  function elegir(codigo: string, el?: HTMLButtonElement | null) { if (el) origen.current = el; setAbierta(codigo); }
  function cerrar() { setAbierta(null); origen.current?.focus({ preventScroll: true }); }

  return <ReceptionPage titulo="Unidades" descripcion="Quién vive, quién la visita y qué espera en recepción." icono="personas" clase="op-units un">
    <div className="un-marco">
      <section className="un-directorio" aria-label="Directorio de unidades">
        <div className="un-banda">
          <OperationalSearchField label="Buscar unidad o persona" placeholder="7D, Osorio, piso 7…" value={q} onChange={setQ} />
        </div>
        <div className="un-banda un-pisos"><span aria-hidden="true">Piso</span>
          <Segmentado etiqueta="Filtrar por piso" className="un-pisos-seg" valor={piso === null ? "todos" : String(piso)}
            onCambio={v => setPiso(v === "todos" ? null : Number(v))}
            opciones={[{ id: "todos", label: "Todos" }, ...[...new Set(UNIDADES.map(x => x.piso))].sort((a, b) => a - b).map(p => ({ id: String(p), label: String(p), aria: `Piso ${p}` }))]} />
          <span className="un-cuenta" role="status">{resultados.length} unidades</span>
        </div>
        {(piso !== null || q) && <div className="un-banda op-active-filters">{piso !== null && <button type="button" onClick={() => setPiso(null)}>Piso {piso} ×</button>}{q && <button type="button" onClick={() => setQ("")}>“{q}” ×</button>}</div>}
        <div className="un-tabla ct-refiltra" key={`${piso}-${q}`}>
          <div className="un-fila un-cab" aria-hidden="true"><span>Unidad</span><span>Residentes</span><span>En recepción</span><span /></div>
          {resultados.map(x => {
            const pend = estado.entregas.filter(e => e.unidad === x.codigo && e.estado === "retirar").length;
            const vis = estado.visitas.filter(v => v.unidad === x.codigo && v.cuando === "hoy" && v.estado !== "cancelada").length;
            return <button className="un-fila" type="button" key={x.codigo} aria-expanded={abierta === x.codigo} aria-controls="un-ficha"
              onClick={e => elegir(x.codigo, e.currentTarget)}>
              <span><b>{x.codigo}</b><small>Piso {x.piso}</small></span>
              <span>{x.residentes.join(", ")}</span>
              <span className="un-op">{pend ? `${pend} entrega${pend === 1 ? "" : "s"}` : "Sin entregas"}<small>{vis ? `${vis} visita${vis === 1 ? "" : "s"} hoy` : "Sin visitas hoy"}</small></span>
              <Icon n="chevron" s={18} />
            </button>;
          })}
          {!resultados.length && <p className="un-vacio">Sin coincidencias. Probá con otra unidad o apellido.</p>}
        </div>
      </section>

      <aside className="un-columna" id="un-ficha" ref={detalle} tabIndex={-1}
        aria-label={u ? `Unidad ${u.codigo}` : "Pendientes por unidad"} onKeyDown={e => { if (e.key === "Escape" && u) cerrar(); }}>
        {u ? <div key={u.codigo} className="un-ficha ct-resuelve">
          <section className="un-banner" aria-label={`Unidad ${u.codigo}, piso ${u.piso}`}>
            <span className="un-banner-foto" aria-hidden="true" />
            <div className="un-banner-txt"><span>{EDIFICIO.nombre} · Piso {u.piso}</span><h2>{u.codigo}</h2></div>
            <button type="button" className="ct-panel-cerrar un-cerrar" onClick={cerrar}><Icon n="cerrar" s={16} />Cerrar</button>
          </section>
          <section className="un-bloque un-id">
            <h3>Residentes · {u.residentes.length}</h3>
            <ul className="un-personas">{u.residentes.map(r => <li key={r}>{r}</li>)}</ul>
            {u.telefono && <a className="un-accion" href={`tel:${u.telefono}`}><Icon n="telefono" s={18} />{u.telefono}</a>}
          </section>
          <section className="un-bloque">
            <h3>Visitas · {visitas.length}</h3>
            {visitas.length ? <ul className="un-lista">{visitas.map(v => <li key={v.id}><button type="button" onClick={() => ir("p04", v.codigo)}>
              <span><b>{v.nombre}</b><small>{v.horario} · {v.codigo}</small></span><Icon n="chevron" s={16} /></button></li>)}</ul>
              : <p className="un-nada">Sin visitas autorizadas.</p>}
          </section>
          <section className="un-bloque">
            <h3>Entregas · {entregas.length}</h3>
            {entregas.length ? <ul className="un-lista">{entregas.map(e => <li key={e.id}><span><b>{e.titulo}</b><small>{e.estado === "retirar" ? `${e.avisadoEl ? "Avisado" : "Recibido"} · ${hace(e.recibidoEl)}` : `Retirado por ${e.retiradoPor}`}</small></span></li>)}</ul>
              : <p className="un-nada">Sin entregas registradas.</p>}
            {entregas.some(e => e.estado === "retirar") && <button type="button" className="un-accion" onClick={() => ir("p05")}><Icon n="mas" s={16} />Registrar retiro</button>}
            {permisos.length > 0 && <details className="un-permisos"><summary>Accesos habituales · {permisos.length}</summary>{permisos.map(p => <p key={p.id}><b>{p.nombre}</b><small>{ROTULO_PERMISO[p.tipo]} · {p.detalle}</small></p>)}</details>}
          </section>
        </div> : <div key="directorio" className="un-ficha ct-resuelve">
          <section className="un-bloque un-id">
            {/* REC-UNITS-01/02 · el directorio con presencia: el ícono de
                recepción a la izquierda y el título como título */}
            <header className="un-dir-cab"><span className="un-dir-ic" aria-hidden="true"><Icon n="credencial" s={22} /></span><span className="un-dir-tit">Directorio</span></header>
            <h2>{UNIDADES.length}</h2>
            <p className="un-nada">unidades en {new Set(UNIDADES.map(x => x.piso)).size} pisos. Elegí una para ver quién vive, quién la visita y qué espera.</p>
          </section>
          <section className="un-bloque">
            <h3>Entregas esperando</h3>
            {conEntregas.length ? <ul className="un-lista">{conEntregas.map(({ x, n }) => <li key={x.codigo}><button type="button" onClick={e => elegir(x.codigo, e.currentTarget)}>
              <span><b>Unidad {x.codigo}</b><small>{n} entrega{n === 1 ? "" : "s"} · {x.residentes[0]}</small></span><Icon n="chevron" s={16} /></button></li>)}</ul>
              : <p className="un-nada">No hay entregas esperando.</p>}
          </section>
          <section className="un-bloque">
            <h3>Visitas de hoy</h3>
            {conVisitas.length ? <ul className="un-lista">{conVisitas.map(({ x, n }) => <li key={x.codigo}><button type="button" onClick={e => elegir(x.codigo, e.currentTarget)}>
              <span><b>Unidad {x.codigo}</b><small>{n} visita{n === 1 ? "" : "s"} autorizada{n === 1 ? "" : "s"}</small></span><Icon n="chevron" s={16} /></button></li>)}</ul>
              : <p className="un-nada">Ninguna unidad espera visitas hoy.</p>}
          </section>
        </div>}
      </aside>
    </div>
  </ReceptionPage>;
}
