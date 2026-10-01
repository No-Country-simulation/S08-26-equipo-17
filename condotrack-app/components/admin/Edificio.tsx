"use client";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { Segmentado } from "../sistema/Segmentado";
import { StatusTag, type Tono } from "../sistema/Estado";
import { AdminPagina } from "./AdminMarco";
import { ListaDetalle, BuscarEnLista, Datos, normalizar } from "./ListaDetalle";
import { useApp } from "@/lib/estado";
import { ADMINISTRACION, EDIFICIO, ESPACIOS, REGLAS, RESIDENTE, type VistaA } from "@/lib/data";
import { EDIFICIOS, UNIDADES, type Edificio as TEdificio, type Unidad } from "@/lib/edificio";
import { HISTORIAL, ROTULO_EVENTO } from "@/lib/unidad";
import { ROTULO_DOC } from "@/lib/gestiones";
import { EQUIPO, personasDelEdificio, ROTULO_VINCULO, type PersonaAdmin, type DocumentoAdmin } from "@/lib/admin";
import { fechaCorta, fechaHora, pesos, soloHora } from "@/lib/formato";

type Ir = (v: VistaA, ref?: string) => void;
const cuenta = (u: Unidad): { rotulo: string; tono: Tono } =>
  u.cuenta === "al-dia" ? { rotulo: "Al día", tono: "ok" } : u.cuenta === "informado" ? { rotulo: "Pago informado", tono: "curso" } : { rotulo: `Debe ${pesos(u.saldo)}`, tono: "error" };

/* ══ A02 · Edificios ═════════════════════════════════════════════════════ */
export function A02({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const abiertos = (e: TEdificio) => e.activo ? estado.incidencias.filter(i => i.estado !== "cerrada").length + estado.reclamos.filter(r => r.estado !== "resuelto" && r.estado !== "cerrado").length : e.reclamosAbiertos;
  const unidades = EDIFICIOS.reduce((a, e) => a + e.unidades, 0);
  const ocupadas = EDIFICIOS.reduce((a, e) => a + e.ocupadas, 0);
  return <AdminPagina titulo="Edificios" descripcion="La cartera de la administración. El prototipo opera Aráoz 1280; los otros se consultan." clase="ad-a02">
    {/* A02-04 · la cabecera de la cartera: la arquitectura como recurso
        (el mismo de Inicio) y los totales que salen de la lista, nada
        inventado */}
    <section className="ad-a02-hero ad-vidrio" aria-label="Resumen de la cartera">
      <img className="ad-hero-foto" src="/img/edificio.jpg" alt="" aria-hidden="true" />
      <dl className="ad-a02-cifras">
        <div><dd className="ct-cifra">{EDIFICIOS.length}</dd><dt>edificios</dt></div>
        <div><dd className="ct-cifra">{ocupadas}<small>/{unidades}</small></dd><dt>unidades ocupadas</dt></div>
        <div><dd className="ct-cifra">{EDIFICIOS.reduce((a, e) => a + abiertos(e), 0)}</dd><dt>casos abiertos</dt></div>
      </dl>
    </section>
    <ListaDetalle<TEdificio> etiqueta="Edificios" items={EDIFICIOS} clave={e => e.id} seleccion={sel} onSeleccion={setSel} rotuloDetalle={e => e.nombre}
      vacio={<p>Sin edificios.</p>}
      columnas={[
        { id: "ed", titulo: "Edificio", celda: e => <span className="ad-dos"><b>{e.nombre}</b><small>{e.direccion}</small></span> },
        { id: "uni", titulo: "Unidades", ancho: "120px", celda: e => <span className="ad-meta"><b className="ad-mono">{e.ocupadas}</b>/{e.unidades} ocupadas</span> },
        { id: "rec", opc: true, titulo: "Recepción", ancho: "minmax(120px,180px)", celda: e => <span className="ad-meta">{e.recepcion}</span> },
        { id: "casos", opc: true, titulo: "Casos abiertos", ancho: "130px", celda: e => <b className={"ad-mono ad-cuenta" + (abiertos(e) > 3 ? " alto" : "")}>{abiertos(e)}</b> },
        { id: "est", titulo: "Estado", ancho: "110px", celda: e => <StatusTag tono={e.activo ? "ok" : "neutro"}>{e.activo ? "Operando" : "Consulta"}</StatusTag> },
      ]}
      detalle={e => <div className="ad-det">
        <div className="ad-banner" style={{ backgroundImage: "url(/img/fachada.jpg)" }} aria-hidden="true" />
        <h2 className="ad-det-titulo">{e.nombre}</h2>
        <Datos filas={[["Dirección", e.direccion], ["Unidades", `${e.ocupadas} ocupadas de ${e.unidades}`], ["Al día", `${e.alDia} unidades`], ["Encargado", e.encargado], ["Recepción", e.recepcion]]} />
        {e.activo ? <button type="button" className="ct-btn ct-btn--fuerte" onClick={() => ir("a03", e.id)}>Abrir la ficha del edificio<Icon n="flechaDer" s={18} /></button>
          : <p className="ad-det-texto">Este edificio no tiene datos operativos en el prototipo.</p>}
      </div>} />
  </AdminPagina>;
}

/* ══ A03 · Edificio ══════════════════════════════════════════════════════ */
export function A03({ ir }: { ir: Ir; refe?: string }) {
  const e = EDIFICIOS[0];
  return <AdminPagina titulo={EDIFICIO.nombreLargo} descripcion={`${EDIFICIO.ciudad} · administra ${EDIFICIO.administracion}`} clase="ad-a03">
    <div className="ad-ficha">
      <section className="ad-bloque ad-ficha-banner"><div className="ad-banner alto" style={{ backgroundImage: "url(/img/edificio.jpg)" }} aria-hidden="true" />
        <Datos filas={[["Unidades", `${e.ocupadas} ocupadas de ${e.unidades}`], ["Encargado", e.encargado], ["Recepción", "Lunes a domingo · dos turnos"], ["Teléfono", EDIFICIO.telefono]]} /></section>
      <section className="ad-bloque"><h2 className="ct-h2">Espacios comunes</h2>
        <ul className="ad-lista-simple">{ESPACIOS.map(s => <li key={s.id}><span className="ad-dos"><b>{s.nombre}</b><small>{s.piso} · {s.capacidad ?? s.descripcion}</small></span>
          <StatusTag tono={s.id === "sum" || s.id === "parrilla" ? "curso" : "ok"}>{s.id === "sum" || s.id === "parrilla" ? "Con aprobación" : "Automática"}</StatusTag></li>)}</ul>
        <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => ir("a10")}>Ver reservas</button></section>
      <section className="ad-bloque"><h2 className="ct-h2">Reglas de reserva</h2>
        <Datos filas={[["Tope por espacio", `${REGLAS.topePorEspacio} reservas activas por unidad`], ["Anticipación", `${REGLAS.anticipacionMin} minutos como mínimo`], ["Ventana", `${REGLAS.ventanaDias} días hacia adelante`]]} />
        <p className="ad-meta">Cambiar reglas afecta a todas las unidades: se confirma y queda auditado. En el prototipo son de lectura.</p></section>
      <section className="ad-bloque"><h2 className="ct-h2">Equipo</h2>
        <ul className="ad-lista-simple">{EQUIPO.map(p => <li key={p.id}><span className="ad-dos"><b>{p.nombre}</b><small>{p.detalle}</small></span><span className="ad-meta">{p.rol}</span></li>)}</ul></section>
    </div>
  </AdminPagina>;
}

/* ══ A04 · Unidades · U07 ════════════════════════════════════════════════ */
export function A04({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"todas" | "deuda" | "pendientes">("todas");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  useEffect(() => { if (refe) setSel(refe); }, [refe]);
  const pend = (u: Unidad) => estado.entregas.filter(e => e.unidad === u.codigo && e.estado === "retirar").length
    + estado.reclamos.filter(r => r.unidad === u.codigo && r.estado !== "resuelto" && r.estado !== "cerrado").length;
  /* ADM-UNIT-01 · el pendiente dice qué es, no sólo cuántos */
  const queFalta = (u: Unidad) => {
    const ent = estado.entregas.filter(e => e.unidad === u.codigo && e.estado === "retirar").length;
    const rec = estado.reclamos.filter(r => r.unidad === u.codigo && r.estado !== "resuelto" && r.estado !== "cerrado").length;
    return [ent ? `${ent} ${ent === 1 ? "entrega en custodia" : "entregas en custodia"}` : "", rec ? `${rec} ${rec === 1 ? "reclamo abierto" : "reclamos abiertos"}` : ""].filter(Boolean);
  };
  const lista = UNIDADES.filter(u => corte === "todas" || (corte === "deuda" ? u.cuenta !== "al-dia" : pend(u) > 0))
    .filter(u => normalizar(`${u.codigo} ${u.residentes.join(" ")} piso ${u.piso}`).includes(normalizar(q)));
  return <AdminPagina titulo="Unidades" descripcion="Ficha, vínculos, cuenta y pendientes de cada unidad." clase="ad-a04">
    <ListaDetalle<Unidad> etiqueta="Unidades" items={lista} clave={u => u.codigo} seleccion={sel} onSeleccion={setSel} filtroClave={corte} rotuloDetalle={u => `Unidad ${u.codigo}`}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Unidad, residente o piso" etiqueta="Buscar unidades" />
        <Segmentado etiqueta="Qué unidades" valor={corte} onCambio={setCorte}
          opciones={[{ id: "todas", label: "Todas", cuenta: UNIDADES.length }, { id: "deuda", label: "Con saldo", cuenta: UNIDADES.filter(u => u.cuenta !== "al-dia").length }, { id: "pendientes", label: "Con pendientes" }]} />
      </>}
      vacio={<p>Ninguna unidad coincide.</p>}
      columnas={[
        { id: "u", titulo: "Unidad", ancho: "92px", celda: u => <span className="ad-dos"><b className="ad-uni">{u.codigo}</b><small>Piso {u.piso}</small></span> },
        { id: "res", titulo: "Residentes", celda: u => <span className="ad-meta ad-fuerte-txt">{u.residentes.join(", ")}</span> },
        { id: "cta", titulo: "Cuenta", ancho: "minmax(130px,170px)", celda: u => <StatusTag tono={cuenta(u).tono}>{cuenta(u).rotulo}</StatusTag> },
        { id: "pen", opc: true, titulo: "Pendientes", ancho: "minmax(150px,210px)", celda: u => pend(u) ? <span className="ad-pend">{queFalta(u).map(t => <span key={t} className="ad-badge chico">{t}</span>)}</span> : <span className="ad-sin">—</span> },
      ]}
      detalle={u => <div className="ad-det">
        <div className="ad-banner ad-banner-uni" style={{ backgroundImage: "url(/img/edificio.jpg)" }}><span>{EDIFICIO.nombre} · Piso {u.piso}</span><b>{u.codigo}</b></div>
        <Datos filas={[["Residentes", u.residentes.join(", ")], ["Ambientes", `${u.ambientes} · ${u.metros} m²`], ["Cuenta", <StatusTag key="c" tono={cuenta(u).tono}>{cuenta(u).rotulo}</StatusTag>],
          ["Entregas", `${estado.entregas.filter(e => e.unidad === u.codigo && e.estado === "retirar").length} en custodia`], ["Contacto", u.telefono ?? "Sin teléfono cargado"]]} />
        <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={() => ir("a05", u.codigo)}>Ficha e historial<Icon n="flechaDer" s={18} /></button>
          {u.cuenta !== "al-dia" && <button type="button" className="ct-btn ct-btn--secundario" onClick={() => ir("a17")}>Ver cobranza</button>}</div>
      </div>} />
  </AdminPagina>;
}

/* ══ A05 · Unidad · detalle e historial ══════════════════════════════════ */
export function A05({ ir, refe }: { ir: Ir; refe?: string }) {
  const { estado } = useApp();
  const u = UNIDADES.find(x => x.codigo === (refe ?? RESIDENTE.unidad)) ?? UNIDADES[0];
  const personas = personasDelEdificio().filter(p => p.unidad === u.codigo);
  const eventos = [...(u.codigo === RESIDENTE.unidad ? [...estado.eventos, ...HISTORIAL] : []), ...estado.auditoria.filter(e => e.unidad === u.codigo)]
    .sort((a, b) => b.cuando.localeCompare(a.cuando)).slice(0, 14);
  return <AdminPagina titulo={`Unidad ${u.codigo}`} descripcion={`${EDIFICIO.nombre} · piso ${u.piso} · ${u.ambientes}`} clase="ad-a05">
    <div className="ad-ficha">
      <section className="ad-bloque"><h2 className="ct-h2">Vínculos · {personas.length}</h2>
        <ul className="ad-lista-simple">{personas.map(p => <li key={p.id}><button type="button" className="ad-link-fila" onClick={() => ir("a07", p.id)}><span className="ad-dos"><b>{p.nombre}</b><small>{ROTULO_VINCULO[p.vinculo]}{p.titular ? " · titular" : ""}</small></span><Icon n="chevron" s={16} /></button></li>)}</ul></section>
      <section className="ad-bloque"><h2 className="ct-h2">Cuenta</h2>
        <Datos filas={[["Estado", <StatusTag key="c" tono={cuenta(u).tono}>{cuenta(u).rotulo}</StatusTag>], ["Saldo", pesos(u.saldo)], ["Participación", u.codigo === RESIDENTE.unidad ? "1,897 %" : "Según reglamento"]]} />
        <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => ir("a17")}>Ir a cobranza</button></section>
      <section className="ad-bloque ad-bloque-ancho"><h2 className="ct-h2">Historial</h2>
        {eventos.length ? <ol className="ct-tl ad-tl">{eventos.map(ev => <li key={ev.id}><time>{fechaCorta(ev.cuando)}</time><i aria-hidden="true" /><span><b>{ev.titulo}</b><small>{ROTULO_EVENTO[ev.tipo]} · {ev.responsable} · {ev.rol} · {soloHora(ev.cuando)}</small></span></li>)}</ol>
          : <p className="ad-meta">El prototipo sólo tiene historial cargado para la unidad {RESIDENTE.unidad}.</p>}</section>
    </div>
  </AdminPagina>;
}

/* ══ A06 · Personas ══════════════════════════════════════════════════════ */
export function A06({ ir, refe }: { ir: Ir; refe?: string }) {
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"todas" | "titulares" | "sin">("todas");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const todas = personasDelEdificio();
  const lista = todas.filter(p => corte === "todas" || (corte === "titulares" ? p.titular : p.app !== "activa"))
    .filter(p => normalizar(`${p.nombre} ${p.unidad}`).includes(normalizar(q)));
  const tonoApp: Record<PersonaAdmin["app"], Tono> = { activa: "ok", invitada: "pendiente", "sin cuenta": "neutro" };
  return <AdminPagina titulo="Personas" descripcion="Quién vive en cada unidad, con qué vínculo y si usa la app." clase="ad-a06">
    <ListaDetalle<PersonaAdmin> etiqueta="Personas" items={lista} clave={p => p.id} seleccion={sel} onSeleccion={setSel} filtroClave={corte} rotuloDetalle={p => p.nombre}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Nombre o unidad" etiqueta="Buscar personas" />
        <Segmentado etiqueta="Qué personas" valor={corte} onCambio={setCorte}
          opciones={[{ id: "todas", label: "Todas", cuenta: todas.length }, { id: "titulares", label: "Titulares" }, { id: "sin", label: "Sin app activa" }]} />
      </>}
      vacio={<p>Nadie coincide.</p>}
      columnas={[
        { id: "n", titulo: "Persona", celda: p => <span className="ad-dos"><b>{p.nombre}</b><small>{ROTULO_VINCULO[p.vinculo]}{p.titular ? " · titular" : ""}</small></span> },
        { id: "u", titulo: "Unidad", ancho: "80px", celda: p => <b className="ad-mono">{p.unidad}</b> },
        { id: "c", opc: true, titulo: "Contacto", ancho: "minmax(140px,190px)", celda: p => <span className="ad-meta">{p.contacto ?? "—"}</span> },
        { id: "a", opc: true, titulo: "App", ancho: "110px", celda: p => <StatusTag tono={tonoApp[p.app]}>{p.app === "activa" ? "Activa" : p.app === "invitada" ? "Invitada" : "Sin cuenta"}</StatusTag> },
      ]}
      detalle={p => <div className="ad-det">
        <h2 className="ad-det-titulo">{p.nombre}</h2>
        <Datos filas={[["Unidad", p.unidad], ["Vínculo", `${ROTULO_VINCULO[p.vinculo]}${p.titular ? " · titular" : ""}`], ["Contacto", p.contacto ?? "Sin contacto cargado"], ["App", p.app === "activa" ? "Activa" : p.app === "invitada" ? "Invitación enviada" : "Sin cuenta"]]} />
        <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={() => ir("a07", p.id)}>Ficha de la persona<Icon n="flechaDer" s={18} /></button>
          <button type="button" className="ct-btn ct-btn--secundario" onClick={() => ir("a04", p.unidad)}>Unidad {p.unidad}</button></div>
      </div>} />
  </AdminPagina>;
}

/* ══ A07 · Persona ═══════════════════════════════════════════════════════ */
export function A07({ ir, refe }: { ir: Ir; refe?: string }) {
  const p = personasDelEdificio().find(x => x.id === refe) ?? personasDelEdificio()[0];
  const capacidades: [string, boolean][] = [["Autorizar visitas", true], ["Reservar espacios", true], ["Informar pagos", p.titular], ["Representar a la unidad en votaciones", p.titular], ["Gestionar convivientes", p.titular]];
  return <AdminPagina titulo={p.nombre} descripcion={`${ROTULO_VINCULO[p.vinculo]} · Unidad ${p.unidad}`} clase="ad-a07">
    <div className="ad-ficha">
      <section className="ad-bloque"><h2 className="ct-h2">Vínculo</h2>
        <Datos filas={[["Unidad", p.unidad], ["Vínculo", ROTULO_VINCULO[p.vinculo]], ["Titular", p.titular ? "Sí" : "No"], ["Desde", p.desde ? fechaCorta(p.desde) : "Sin fecha cargada"], ["Contacto", p.contacto ?? "—"]]} />
        <button type="button" className="ct-btn ct-btn--secundario ct-btn--chico" onClick={() => ir("a05", p.unidad)}>Ver la unidad {p.unidad}</button></section>
      <section className="ad-bloque"><h2 className="ct-h2">Capacidades</h2>
        <ul className="ad-lista-simple">{capacidades.map(([c, si]) => <li key={c}><span>{c}</span><StatusTag tono={si ? "ok" : "neutro"}>{si ? "Habilitada" : "No habilitada"}</StatusTag></li>)}</ul>
        <p className="ad-meta">Ser propietario o conviviente no habilita todo: cada capacidad se concede aparte. Cambiarlas queda auditado.</p></section>
    </div>
  </AdminPagina>;
}

/* ══ A13 · Documentos ════════════════════════════════════════════════════ */
export function A13({ refe }: { ir: Ir; refe?: string }) {
  const { estado, hacer } = useApp();
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState<"publicado" | "borrador" | "archivado" | "todos">("publicado");
  const [sel, setSel] = useState<string | null>(refe ?? null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const lista = estado.documentos.filter(d => corte === "todos" || d.estado === corte).filter(d => normalizar(d.titulo).includes(normalizar(q)));
  const tono: Record<DocumentoAdmin["estado"], Tono> = { publicado: "ok", borrador: "pendiente", archivado: "hecho" };
  return <AdminPagina titulo="Documentos" descripcion="Versiones, audiencia y publicación. Lo publicado lo ven los residentes en Mi edificio." clase="ad-a13">
    <ListaDetalle<DocumentoAdmin> etiqueta="Documentos" items={lista} clave={d => d.id} seleccion={sel} onSeleccion={id => { setSel(id); setConfirmar(null); }} filtroClave={corte} rotuloDetalle={d => d.titulo}
      herramientas={<>
        <BuscarEnLista valor={q} onCambio={setQ} placeholder="Título del documento" etiqueta="Buscar documentos" />
        <Segmentado etiqueta="Estado" valor={corte} onCambio={v => { setCorte(v); setSel(null); }}
          opciones={[{ id: "publicado", label: "Publicados" }, { id: "borrador", label: "Borradores", cuenta: estado.documentos.filter(d => d.estado === "borrador").length }, { id: "archivado", label: "Archivados" }, { id: "todos", label: "Todos" }]} />
      </>}
      vacio={<p>Nada en este corte.</p>}
      columnas={[
        { id: "t", titulo: "Documento", celda: d => <span className="ad-dos"><b>{d.titulo}</b><small>{ROTULO_DOC[d.tipo]} · {d.peso} · v{d.version}</small></span> },
        { id: "a", opc: true, titulo: "Audiencia", ancho: "130px", celda: d => <span className="ad-meta">{d.audiencia}</span> },
        { id: "f", opc: true, titulo: "Actualizado", ancho: "120px", celda: d => <span className="ad-meta">{fechaCorta(d.fecha)}</span> },
        { id: "e", titulo: "Estado", ancho: "120px", celda: d => <StatusTag tono={tono[d.estado]}>{d.estado === "publicado" ? "Publicado" : d.estado === "borrador" ? "Borrador" : "Archivado"}</StatusTag> },
      ]}
      detalle={d => <div className="ad-det">
        <h2 className="ad-det-titulo">{d.titulo}</h2>
        <Datos filas={[["Tipo", ROTULO_DOC[d.tipo]], ["Audiencia", d.audiencia], ["Versión", `v${d.version}`], ["Archivo", d.archivo], ["Actualizado", fechaHora(d.fecha)]]} />
        {d.estado === "borrador" && <button type="button" className="ct-btn ct-btn--primario" onClick={() => hacer({ t: "documento/estado", id: d.id, estado: "publicado", por: ADMINISTRACION.nombre })}>Publicar para {d.audiencia.toLowerCase()}</button>}
        {d.estado === "publicado" && (confirmar === d.id
          ? <div className="ad-confirmar" role="alert"><p>Al archivarlo deja de verse en Mi edificio. La versión queda en el historial.</p>
              <div className="ad-acciones"><button type="button" className="ct-btn ct-btn--fuerte" onClick={() => { hacer({ t: "documento/estado", id: d.id, estado: "archivado", por: ADMINISTRACION.nombre }); setConfirmar(null); }}>Archivar</button>
                <button type="button" className="ct-btn ct-btn--texto" onClick={() => setConfirmar(null)}>Cancelar</button></div></div>
          : <button type="button" className="ct-btn ct-btn--secundario" onClick={() => setConfirmar(d.id)}>Archivar…</button>)}
        {d.estado === "archivado" && <button type="button" className="ct-btn ct-btn--secundario" onClick={() => hacer({ t: "documento/estado", id: d.id, estado: "publicado", por: ADMINISTRACION.nombre })}>Volver a publicar</button>}
      </div>} />
  </AdminPagina>;
}
