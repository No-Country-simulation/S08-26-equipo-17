"use client";
import { cambiarTema } from "@/lib/movimiento";
import { useRef, useState, type ReactNode } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { useIndicador } from "./useIndicador";
import { usePopover } from "./usePopover";
import { useNovedad } from "./Novedad";
import type { Perfil } from "@/lib/data";

/* ── navegación principal · una sola capa, indicador que se desliza ── */
export type DestinoNav = { id: string; label: string; activo: boolean; onClick: () => void };
export function NavPrincipal({ destinos, etiqueta }: { destinos: DestinoNav[]; etiqueta: string }) {
  const caja = useRef<HTMLElement>(null);
  const activo = destinos.find(d => d.activo)?.id ?? "";
  const { medido, estilo } = useIndicador(caja, '[aria-current="page"]', [activo, destinos.length]);
  return <nav ref={caja} className="ct-nav" aria-label={etiqueta} data-medido={medido ? "" : undefined} style={estilo}>
    <span className="ct-nav-ind" aria-hidden="true" />
    {destinos.map(d => <button key={d.id} type="button" aria-current={d.activo ? "page" : undefined} onClick={d.onClick}>{d.label}</button>)}
  </nav>;
}

/* ── avisos · filas actor/evento + contexto + hora (Figma 23204:134646) ── */
export type Aviso = { id: string; actor: string; evento: string; contexto?: string; hora: string; icono?: NombreIcono; noLeido?: boolean; onAbrir: () => void };
export type GrupoAvisos = { titulo: string; avisos: Aviso[] };
export function Avisos({ grupos, vacio = "No hay avisos pendientes." }: { grupos: GrupoAvisos[]; vacio?: string }) {
  const pop = usePopover();
  const novedad = useNovedad();
  const total = grupos.reduce((n, g) => n + g.avisos.length, 0);
  const noLeidos = grupos.reduce((n, g) => n + g.avisos.filter(a => a.noLeido).length, 0);
  const etiqueta = `Notificaciones: ${novedad.cuenta ? `${novedad.cuenta} ${novedad.cuenta === 1 ? "novedad" : "novedades"}, ` : ""}${total} ${total === 1 ? "aviso" : "avisos"}`;
  return <div className="ct-ancla" {...pop.props}>
    <button ref={pop.disparador} type="button" className="ct-icono-btn ct-novedad" data-pulso={novedad.pulso}
      aria-label={etiqueta} aria-expanded={pop.abierto} onClick={() => pop.setAbierto(!pop.abierto)}>
      <Icon n="campana" s={20} />
      {(noLeidos > 0 || novedad.cuenta > 0) && <span className="ct-novedad-punto" aria-hidden="true" />}
      {novedad.cuenta > 0 && <span className="ct-novedad-cuenta" aria-hidden="true">{novedad.cuenta}</span>}
    </button>
    {pop.abierto && <div className="ct-pop ct-avisos" role="dialog" aria-label="Notificaciones">
      <header><h2>Notificaciones</h2>{novedad.cuenta > 0 && <button type="button" onClick={novedad.marcarVistas}>Marcar como vistas</button>}</header>
      {total === 0 && <p className="ct-avisos-vacio">{vacio}</p>}
      {grupos.filter(g => g.avisos.length).map(g => <section key={g.titulo}>
        <h3>{g.titulo}</h3>
        <ul>{g.avisos.map(a => <li key={a.id}>
          <button type="button" className="ct-aviso" data-no-leido={a.noLeido ? "" : undefined} onClick={() => { pop.cerrar(false); a.onAbrir(); }}>
            <span className="ct-aviso-icono" aria-hidden="true">{a.icono && <Icon n={a.icono} s={18} />}</span>
            <span className="ct-aviso-txt"><b>{a.actor}</b> {a.evento}{a.contexto && <small>{a.contexto}</small>}</span>
            <time>{a.hora}</time>
            {a.noLeido && <span className="solo-lectores">No leído</span>}
          </button>
        </li>)}</ul>
      </section>)}
    </div>}
  </div>;
}

/* ── perfil · menú real: identidad, rol, tema y salida ── */
export function MenuPerfil({ nombre, iniciales, rol, detalle, perfil, onSalir, onCambiarPerfil }: {
  nombre: string; iniciales: string; rol: string; detalle: string; perfil: Perfil;
  onSalir: () => void; onCambiarPerfil?: (p: Perfil) => void;
}) {
  const pop = usePopover();
  const [tema, setTema] = useState<"claro" | "oscuro" | "noche">("claro");
  const leerTema = () => {
    const t = document.documentElement.getAttribute("data-tema");
    setTema(t === "noche" ? "noche" : t === "oscuro" || (!t && matchMedia("(prefers-color-scheme: dark)").matches) ? "oscuro" : "claro");
  };
  const poner = (t: "claro" | "oscuro" | "noche") => { cambiarTema(() => document.documentElement.setAttribute("data-tema", t)); try { localStorage.setItem("condotrack:tema", t); } catch { /* modo privado */ } setTema(t); };
  const roles: { id: Perfil; label: string }[] = [{ id: "residente", label: "Residente" }, { id: "recepcion", label: "Recepción" }, { id: "administracion", label: "Administración" }];
  return <div className="ct-ancla" {...pop.props}>
    <button ref={pop.disparador} type="button" className="ct-avatar" aria-label={`Perfil de ${nombre}`} aria-expanded={pop.abierto} onClick={() => { leerTema(); pop.setAbierto(!pop.abierto); }}>{iniciales}</button>
    {pop.abierto && <div className="ct-pop ct-perfil" role="dialog" aria-label={`Perfil de ${nombre}`}>
      <header><span className="ct-avatar grande" aria-hidden="true">{iniciales}</span><div><h2>{nombre}</h2><p>{rol}</p><small>{detalle}</small></div></header>
      {onCambiarPerfil && <section><h3>Cambiar de rol</h3><div className="ct-perfil-roles">{roles.map(r => <button key={r.id} type="button" aria-current={r.id === perfil ? "true" : undefined}
        disabled={r.id === perfil} onClick={() => { pop.cerrar(false); onCambiarPerfil(r.id); }}>{r.label}{r.id === perfil && <small>actual</small>}</button>)}</div></section>}
      <section><h3>Tema</h3><div className="ct-perfil-tema tres">{(["claro", "oscuro", "noche"] as const).map(t => <button key={t} type="button" aria-pressed={tema === t} onClick={() => poner(t)}><Icon n={t === "claro" ? "sol" : t === "oscuro" ? "luna" : "chispa"} s={18} />{t === "claro" ? "Claro" : t === "oscuro" ? "Oscuro" : "Luz nocturna"}</button>)}</div></section>
      <button type="button" className="ct-perfil-salir" onClick={onSalir}><Icon n="salir" s={18} />Cerrar sesión</button>
    </div>}
  </div>;
}

/* ── ancla genérica para un panel del header (edificio, menú) ── */
export function PanelHeader({ boton, etiqueta, children, clase = "", claseBoton = "ct-header-btn", alineado = "derecha" }: {
  boton: ReactNode; etiqueta: string; children: (cerrar: () => void) => ReactNode; clase?: string; claseBoton?: string; alineado?: "izquierda" | "derecha";
}) {
  const pop = usePopover();
  return <div className={`ct-ancla ${clase}`} {...pop.props}>
    <button ref={pop.disparador} type="button" className={claseBoton} aria-label={etiqueta} aria-expanded={pop.abierto} onClick={() => pop.setAbierto(!pop.abierto)}>{boton}</button>
    {pop.abierto && <div className="ct-pop" data-alineado={alineado} role="dialog" aria-label={etiqueta}>{children(() => pop.cerrar())}</div>}
  </div>;
}
