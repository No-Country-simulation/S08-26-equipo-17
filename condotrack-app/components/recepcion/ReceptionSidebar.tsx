"use client";
import { Icon, type NombreIcono } from "../ui/Icon";
import { type VistaP } from "@/lib/data";

const grupos: { nombre: string; items: { id: VistaP; texto: string; icono: NombreIcono; ref?: string }[] }[] = [
  { nombre: "Recepción", items: [
    { id: "p01", texto: "Inicio", icono: "casa" },
    { id: "p04", texto: "Accesos", icono: "credencial" },
    { id: "p05", texto: "Entregas", icono: "caja" },
    { id: "p02", texto: "Unidades", icono: "personas" },
  ] },
  { nombre: "Operación", items: [
    { id: "p08", texto: "Agenda", icono: "calendario" },
    { id: "p07", texto: "Incidencias", icono: "alerta" },
    { id: "p09", texto: "Actividad reciente", icono: "lista" },
  ] },
];

export function ReceptionSidebar({ vista, refe, ir }: {
  vista: VistaP; refe?: string; ir: (v: VistaP, ref?: string) => void;
}) {
  return <nav className="cc-menu-destinations" id="rec-navigation" aria-label="Navegación de recepción">
    {grupos.map(g => <div className="rec-nav-group" key={g.nombre}>
      <span className="solo-lectores">{g.nombre}</span>
      {g.items.map(d => {
        const activa = d.ref ? vista === d.id && refe === d.ref :
          d.id === "p01" ? vista === "p01" && refe !== "bitacora" :
          vista === d.id || (d.id === "p04" && vista === "p03");
        return <button type="button" key={d.texto} aria-label={d.texto} title={d.texto} aria-current={activa ? "page" : undefined}
          onClick={() => ir(d.id, d.ref)}><Icon n={d.icono} s={20} /><span>{d.texto}</span>
        </button>;
      })}
    </div>)}
  </nav>;
}
