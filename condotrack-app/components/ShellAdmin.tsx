"use client";
import { useCallback, useRef, useState } from "react";
import { Icon } from "./ui/Icon";
import { AdminMenu, ROTULO_CORTO_A } from "./admin/AdminMarco";
import { A01 } from "./admin/A01";
import { A02, A03, A04, A05, A06, A07, A13 } from "./admin/Edificio";
import { A08, A09, A12 } from "./admin/Operacion";
import { A10 } from "./admin/Reservas";
import { A15, A16, A17 } from "./admin/Economia";
import { TransicionVista } from "./sistema/TransicionVista";
import { Tostada } from "./sistema/Tostada";
import { ProveedorNovedad, useNovedad } from "./sistema/Novedad";
import { Buscador, type ResultadoBusqueda } from "./sistema/Buscador";
import { Avisos, MenuPerfil, PanelHeader, type GrupoAvisos } from "./sistema/Cabecera";
import { useApp } from "@/lib/estado";
import { useSinMovimiento } from "@/lib/movimiento";
import { ADMINISTRACION, EDIFICIO, type Perfil, type VistaA } from "@/lib/data";
import { EDIFICIOS, UNIDADES } from "@/lib/edificio";
import { nombreRecurso, personasDelEdificio } from "@/lib/admin";
import { soloHora } from "@/lib/formato";
import { normalizar } from "./admin/ListaDetalle";

type Resultado = ResultadoBusqueda & { vista: VistaA; ref?: string };

/** Escritorio de Administración. Mismo producto que Recepción: los mismos
 *  tokens, el mismo header de utilidades (edificio, avisos, perfil,
 *  búsqueda), la misma transición de contenido. Cambia la densidad: menú
 *  lateral estable con grupos y listas → detalle contextual. */
export function ShellAdmin({
  vista, refe, ir, onSalir, onCambiarPerfil,
}: {
  vista: VistaA; refe?: string;
  ir: (v: VistaA, ref?: string) => void;
  onSalir: () => void;
  onCambiarPerfil?: (p: Perfil) => void;
}) {
  const { estado } = useApp();
  const claves = [...estado.incidencias.map(i => `i:${i.id}`), ...estado.reclamos.map(r => `r:${r.id}`), ...estado.solicitudes.map(s => `s:${s.id}`),
    ...estado.cobranza.map(p => `p:${p.id}`), ...estado.pagos.map(p => `p7:${p.id}`)];
  return <ProveedorNovedad claves={claves}><Escritorio vista={vista} refe={refe} ir={ir} onSalir={onSalir} onCambiarPerfil={onCambiarPerfil} /></ProveedorNovedad>;
}

function Escritorio({ vista, refe, ir, onSalir, onCambiarPerfil }: { vista: VistaA; refe?: string; ir: (v: VistaA, ref?: string) => void; onSalir: () => void; onCambiarPerfil?: (p: Perfil) => void }) {
  const { estado } = useApp();
  const novedad = useNovedad();
  const quieto = useSinMovimiento();
  const [buscando, setBuscando] = useState(false);
  const [menu, setMenu] = useState(false);
  const cerrarBusqueda = useCallback(() => setBuscando(false), []);
  const caja = useRef<HTMLDivElement>(null);
  const alCambiar = useCallback(() => caja.current?.scrollTo(0, 0), []);

  const sinResponsable = estado.incidencias.filter(i => i.estado !== "cerrada" && !(i.responsable ?? i.derivadaA)).length
    + estado.reclamos.filter(r => (r.estado === "nuevo" || r.estado === "en-gestion") && !r.responsable).length;
  const pendientesReserva = estado.solicitudes.filter(s => s.estado === "pendiente");
  const informados = [...estado.cobranza.filter(p => p.estado === "informado"), ...estado.pagos.filter(p => p.estado === "informado")];
  const cuentas: Partial<Record<VistaA, number>> = { a12: sinResponsable, a10: pendientesReserva.length, a17: informados.length };
  const nuevas = new Set(novedad.nuevas);
  const grupos: GrupoAvisos[] = [
    { titulo: "Requieren decisión", avisos: [
      ...pendientesReserva.map(s => ({ id: s.id, icono: "calendario" as const, actor: `Unidad ${s.unidad}`, evento: `· pide ${nombreRecurso(s.recursoId)}`, contexto: `${s.pedidaPor} · ${new Date(s.inicio).toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })} ${soloHora(s.inicio)}`, hora: soloHora(s.pedidaEl), noLeido: nuevas.has(`s:${s.id}`), onAbrir: () => ir("a10", s.id) })),
      ...estado.cobranza.filter(p => p.estado === "informado").map(p => ({ id: p.id, icono: "banco" as const, actor: `Unidad ${p.unidad}`, evento: "· informó un pago", contexto: `${p.informadoPor} · sin conciliar`, hora: soloHora(p.informadoEl), noLeido: nuevas.has(`p:${p.id}`), onAbrir: () => ir("a17", p.id) })),
      ...estado.incidencias.filter(i => i.estado !== "cerrada" && !(i.responsable ?? i.derivadaA)).map(i => ({ id: i.id, icono: "alerta" as const, actor: i.titulo, evento: "", contexto: `${i.lugar} · sin responsable`, hora: soloHora(i.cuando), noLeido: nuevas.has(`i:${i.id}`), onAbrir: () => ir("a12", i.id) })),
    ] },
  ];
  const buscar = (q: string): Resultado[] => {
    const t = normalizar(q);
    if (!t) return [];
    return [
      ...UNIDADES.filter(u => normalizar(`${u.codigo} ${u.residentes.join(" ")}`).includes(t)).slice(0, 4).map(u => ({ id: `u${u.codigo}`, titulo: `Unidad ${u.codigo}`, detalle: u.residentes.join(" · "), grupo: "Unidades", vista: "a04" as VistaA, ref: u.codigo })),
      ...personasDelEdificio().filter(p => normalizar(p.nombre).includes(t)).slice(0, 4).map(p => ({ id: `p${p.id}`, titulo: p.nombre, detalle: `Unidad ${p.unidad}`, grupo: "Personas", vista: "a06" as VistaA, ref: p.id })),
      ...estado.incidencias.filter(i => normalizar(`${i.titulo} ${i.lugar}`).includes(t)).slice(0, 3).map(i => ({ id: `i${i.id}`, titulo: i.titulo, detalle: i.lugar, grupo: "Casos", vista: "a12" as VistaA, ref: i.id })),
      ...estado.reclamos.filter(r => normalizar(`${r.codigo} ${r.descripcion}`).includes(t)).slice(0, 3).map(r => ({ id: `r${r.id}`, titulo: r.codigo, detalle: r.descripcion, grupo: "Casos", vista: "a12" as VistaA, ref: r.id })),
      ...estado.documentos.filter(d => normalizar(d.titulo).includes(t)).slice(0, 3).map(d => ({ id: `d${d.id}`, titulo: d.titulo, detalle: `Documento · ${d.estado}`, grupo: "Documentos", vista: "a13" as VistaA, ref: d.id })),
    ].slice(0, 10);
  };

  return <section className="desk admin ad-shell rec-command-center ct-desk" aria-label="CondoTrack administración" data-reduced={quieto}>
    <AdminMenu vista={vista} ir={ir} cuentas={cuentas} abierto={menu} onCerrar={() => setMenu(false)} />
    {menu && <button type="button" className="ad-velo" aria-label="Cerrar menú" onClick={() => setMenu(false)} />}
    <div className="ad-main" ref={caja}>
      <header className="ct-top ad-top" data-buscando={buscando}>
        <div className="ad-top-contexto">
          <button type="button" className="ct-icono-btn ad-menu-abrir" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu(true)}><Icon n="lista" s={20} /></button>
          <PanelHeader clase="ct-edificio" alineado="izquierda" etiqueta={`Edificio: ${EDIFICIO.nombre}. Cambiar edificio`} boton={<><Icon n="banco" s={18} /><span>{EDIFICIO.nombre}</span><Icon n="chevron" s={12} /></>}>
            {cerrar => <div className="ad-edificios-pop"><span className="ct-label">Tus edificios · {EDIFICIOS.length}</span>
              {/* A01-03 · cada edificio es una card: más aire y profundidad, y
                  el actual con marca amarilla, badge y tilde */}
              <ul>{EDIFICIOS.map(e => <li key={e.id}><button type="button" aria-current={e.activo ? "true" : undefined}
                onClick={() => { cerrar(); ir(e.activo ? "a03" : "a02", e.id); }}>
                <span className="ad-ed-ic" aria-hidden="true"><Icon n="obra" s={18} /></span>
                <span className="ad-ed-tx"><b>{e.nombre}</b><small>{e.direccion} · {e.unidades} unidades</small></span>
                {e.activo ? <span className="ad-ed-actual"><Icon n="check" s={13} w={2.6} />Actual</span> : <Icon n="chevron" s={14} />}</button></li>)}</ul>
              <p>El prototipo opera {EDIFICIO.nombre}; los demás se consultan.</p></div>}
          </PanelHeader>
          <span className="ad-top-ruta" aria-hidden="true">/ {ROTULO_CORTO_A[vista]}</span>
        </div>
        <span />
        <div className="ct-utilidades">
          <Avisos grupos={grupos} vacio="Nada espera una decisión." />
          <MenuPerfil nombre={ADMINISTRACION.nombre} iniciales={ADMINISTRACION.iniciales} rol="Administración" detalle={ADMINISTRACION.estudio} perfil="administracion" onSalir={onSalir} onCambiarPerfil={onCambiarPerfil} />
          <Buscador abierto={buscando} onAbrir={() => setBuscando(true)} onCerrar={cerrarBusqueda} etiqueta="Buscar unidad, persona, caso o documento" placeholder="Unidad, persona, caso…"
            buscar={buscar} alElegir={r => { const x = r as Resultado; ir(x.vista, x.ref); }} />
        </div>
      </header>
      <TransicionVista clave={vista} alCambiar={alCambiar} className="ad-cuerpo">
        {vista === "a01" && <A01 ir={ir} />}
        {vista === "a02" && <A02 ir={ir} refe={refe} />}
        {vista === "a03" && <A03 ir={ir} refe={refe} />}
        {vista === "a04" && <A04 ir={ir} refe={refe} />}
        {vista === "a05" && <A05 ir={ir} refe={refe} />}
        {vista === "a06" && <A06 ir={ir} refe={refe} />}
        {vista === "a07" && <A07 ir={ir} refe={refe} />}
        {vista === "a08" && <A08 ir={ir} refe={refe} />}
        {vista === "a09" && <A09 ir={ir} refe={refe} />}
        {vista === "a10" && <A10 ir={ir} refe={refe} />}
        {vista === "a12" && <A12 ir={ir} refe={refe} />}
        {vista === "a13" && <A13 ir={ir} refe={refe} />}
        {vista === "a15" && <A15 ir={ir} refe={refe} />}
        {vista === "a16" && <A16 ir={ir} refe={refe} />}
        {vista === "a17" && <A17 ir={ir} refe={refe} />}
      </TransicionVista>
    </div>
    <Tostada clase="escritorio" />
  </section>;
}
