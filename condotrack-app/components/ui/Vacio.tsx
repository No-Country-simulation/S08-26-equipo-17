"use client";
import { Icon, type NombreIcono } from "./Icon";

export function Vacio({ icono, titulo, texto, accion, onAccion }:
  { icono: NombreIcono; titulo: string; texto?: string; accion?: string; onAccion?: () => void }) {
  return (
    /* Un vacío también es un lugar de la app: lleva el isotipo grande y
       casi invisible detrás, y el ícono en un círculo. La acción es
       secundaria: la primaria de la pantalla ya está arriba. */
    <div className="vacio">
      <span className="vacio-iso" aria-hidden="true" />
      <span className="glifo"><Icon n={icono} s={24} /></span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {accion && (
        <button className="cta btn-sec" type="button" onClick={onAccion}>
          <Icon n="mas" s={16} w={2.4} />{accion}
        </button>
      )}
    </div>
  );
}
