"use client";
import { avisar } from "../sistema/Tostada";
import { useCallback, useState } from "react";
import { EDIFICIO, RECEPCION, type Perfil, type VistaP } from "@/lib/data";
import { AGENDA, EDIFICIOS } from "@/lib/edificio";
import { useApp } from "@/lib/estado";
import { buscarOperacion, type DestinoOperativo } from "@/lib/recepcion";
import { soloHora, hace } from "@/lib/formato";
import { ReceptionSidebar } from "./ReceptionSidebar";
import { Icon } from "../ui/Icon";
import { Buscador, type ResultadoBusqueda } from "../sistema/Buscador";
import { Avisos, MenuPerfil, NavPrincipal, PanelHeader, type GrupoAvisos } from "../sistema/Cabecera";
import { useNovedad } from "../sistema/Novedad";

const GRUPO: Partial<Record<VistaP, string>> = { p02: "Unidades y residentes", p04: "Pases y visitantes", p08: "Agenda y proveedores" };
type Resultado = ResultadoBusqueda & { destino: DestinoOperativo };

/** Header de Recepción: una sola capa. Marca (abre el menú general),
 *  navegación con indicador que se desliza, y utilidades sin cajas
 *  individuales. La búsqueda se estira hacia la izquierda sobre las
 *  utilidades; la marca y la navegación no se mueven. */
export function ReceptionHeader({ vista, refe, ir, onSalir, onCambiarPerfil }: { vista: VistaP; refe?: string; ir: (v: VistaP, ref?: string) => void; onSalir: () => void; onCambiarPerfil?: (p: Perfil) => void }) {
  const { estado } = useApp();
  const novedad = useNovedad();
  const [buscando, setBuscando] = useState(false);
  const cerrarBusqueda = useCallback(() => setBuscando(false), []);

  const abiertas = estado.incidencias.filter(i => i.estado !== "cerrada");
  const hoy = new Date().toDateString();
  const mudanzas = AGENDA.filter(a => a.tipo === "mudanza" && new Date(a.hora).toDateString() === hoy);
  const recientes = [...estado.entregas].filter(e => e.estado === "retirar").sort((a, b) => b.recibidoEl.localeCompare(a.recibidoEl)).slice(0, 2);
  const nuevas = new Set(novedad.nuevas);
  const grupos: GrupoAvisos[] = [
    { titulo: "Hoy", avisos: [
      ...mudanzas.map(m => ({ id: m.id, icono: "caja" as const, actor: `Unidad ${m.unidad}`, evento: "· mudanza aprobada",
        contexto: m.detalle, hora: soloHora(m.hora), noLeido: nuevas.has(`m:${m.id}`), onAbrir: () => ir("p08", m.id) })),
      ...recientes.map(e => ({ id: e.id, icono: "caja" as const, actor: e.remitente, evento: `· entrega para ${e.unidad}`,
        contexto: `Recibida ${hace(e.recibidoEl)} · sin retirar`, hora: soloHora(e.recibidoEl), noLeido: nuevas.has(`e:${e.id}`), onAbrir: () => ir("p05") })),
    ] },
    { titulo: `Incidencias abiertas · ${abiertas.length}`, avisos: abiertas.slice(0, 3).map(i => ({ id: i.id, icono: "alerta" as const,
      actor: i.titulo, evento: "", contexto: `${i.lugar} · ${i.estado === "derivada" ? `derivada a ${i.derivadaA}` : "sin derivar"}`,
      hora: soloHora(i.cuando), noLeido: nuevas.has(`i:${i.id}`), onAbrir: () => ir("p07", i.id) })) },
  ];

  const destinos = ([{ id: "p01", label: "Inicio" }, { id: "p08", label: "Agenda" }, { id: "p02", label: "Unidades" }, { id: "p09", label: "Actividad" }] as const)
    .map(d => ({ id: d.id, label: d.label, activo: vista === d.id && (d.id !== "p01" || refe !== "bitacora"), onClick: () => ir(d.id) }));

  return <header className="ct-top rx-top" data-buscando={buscando}>
    <PanelHeader clase="ct-top-marca" claseBoton="ct-marca-btn" etiqueta="Abrir menú general" alineado="izquierda"
      boton={<><img className="rec-logo-light" src="/brand/CT_LOGO_LIGHT_V2.png" alt="CondoTrack" width={196} height={52} /><img className="rec-logo-dark" src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" width={196} height={52} /><Icon n="chevron" s={14} /></>}>
      {cerrar => <div className="ct-menu">
        <ReceptionSidebar vista={vista} refe={refe} ir={(v, r) => { cerrar(); ir(v, r); }} />
        <footer><b>{RECEPCION.nombre}</b><small>{RECEPCION.turno}</small></footer>
      </div>}
    </PanelHeader>

    <NavPrincipal destinos={destinos} etiqueta="Destinos de recepción" />

    <div className="ct-utilidades">
      <PanelHeader clase="ct-edificio" etiqueta={`Edificio ${EDIFICIO.nombre}`} boton={<><Icon n="banco" s={18} /><span>{EDIFICIO.nombre}</span><Icon n="chevron" s={12} /></>}>
        {cerrar => <div className="ct-edificio-pop rx-edificio-pop"><span className="ct-label">Edificio asignado</span>
          <ul className="rx-edificios">{EDIFICIOS.map(e => <li key={e.id}><button type="button" aria-current={e.activo ? "true" : undefined}
            onClick={() => { cerrar(); if (!e.activo) avisar({ titulo: `${e.nombre}: sólo consulta`, detalle: `Tu turno opera ${EDIFICIO.nombre}. Cambiar de edificio lo asigna administración.`, icono: "info", tono: "neutro" }); }}>
            <span className="ic" aria-hidden="true"><Icon n="banco" s={18} /></span>
            <span className="tx"><b>{e.nombre}</b><small>{e.direccion}</small></span>
            {e.activo ? <span className="actual"><Icon n="check" s={13} w={2.6} />Actual</span> : <Icon n="chevron" s={14} />}
          </button></li>)}</ul></div>}
      </PanelHeader>
      <Avisos grupos={grupos} />
      <MenuPerfil nombre={RECEPCION.nombre} iniciales={RECEPCION.iniciales} rol="Recepción" detalle={RECEPCION.turno} perfil="recepcion" onSalir={onSalir} onCambiarPerfil={onCambiarPerfil} />
      <Buscador abierto={buscando} onAbrir={() => setBuscando(true)} onCerrar={cerrarBusqueda} etiqueta="Buscar unidad, persona o código"
        placeholder="Unidad, persona o código"
        buscar={(q): Resultado[] => buscarOperacion(q, estado).map(r => ({ id: r.id, titulo: r.titulo, detalle: r.detalle, grupo: GRUPO[r.destino.vista] ?? "Resultados", destino: r.destino }))}
        alElegir={r => { const d = (r as Resultado).destino; ir(d.vista, d.ref); }} />
    </div>
  </header>;
}
