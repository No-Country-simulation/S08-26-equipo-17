"use client";
import { useEffect, useRef, useState } from "react";
import { RECEPCION, type Perfil } from "@/lib/data";
import { Icon } from "../ui/Icon";
export function ReceptionProfile({ onSalir, onCambiarPerfil }: { onSalir: () => void; onCambiarPerfil?: (p: Perfil) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [detalle, setDetalle] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cerrar = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener("pointerdown", cerrar);
    return () => document.removeEventListener("pointerdown", cerrar);
  }, []);
  function cerrar() { setAbierto(false); caja.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
  return <div ref={caja} className="rec-profile-anchor" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setAbierto(false); }} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); cerrar(); } }}>
    <div className="rec-utility rec-profile"><button type="button" className="rec-utility-trigger" aria-label={`Perfil de ${RECEPCION.nombre}`} aria-expanded={abierto} aria-controls="rec-perfil-panel" onClick={() => setAbierto(!abierto)}><span className="rec-avatar">{RECEPCION.iniciales}</span><span className="rec-profile-name">{RECEPCION.nombre}</span><Icon n="chevron" s={16} /></button>
      {abierto && <div className="rec-utility-panel" id="rec-perfil-panel"><h2>{RECEPCION.nombre}</h2><p>{RECEPCION.turno}</p>
        <button type="button" aria-expanded={detalle} onClick={() => setDetalle(!detalle)}><Icon n="persona" s={20} />Perfil</button>
        {detalle && <p className="rec-profile-detail">Recepción · Edificio asignado<br />{RECEPCION.turno}</p>}
        {onCambiarPerfil && <details><summary>Cambiar perfil / rol</summary>{(["residente", "recepcion", "administracion"] as Perfil[]).map(p => <button key={p} type="button" onClick={() => { setAbierto(false); onCambiarPerfil(p); }}>{p === "administracion" ? "Administración" : p === "recepcion" ? "Recepción" : "Residente"}</button>)}</details>}
        <div className="rec-theme-options" aria-label="Tema de la interfaz">{(["claro", "oscuro"] as const).map(t => <button key={t} type="button" onClick={() => { document.documentElement.setAttribute("data-tema", t); try { localStorage.setItem("condotrack:tema", t); } catch {} }}><Icon n={t === "claro" ? "sol" : "luna"} s={18} />{t === "claro" ? "Claro" : "Oscuro"}</button>)}</div>
        <button type="button" onClick={onSalir}><Icon n="salir" s={20} />Cerrar sesión</button>
      </div>}
    </div>
  </div>;
}
