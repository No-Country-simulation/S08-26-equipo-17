"use client";
import { Icon, type NombreIcono } from "./Icon";

export function Vacio({ icono, titulo, texto, accion, onAccion }:
  { icono: NombreIcono; titulo: string; texto: string; accion?: string; onAccion?: () => void }) {
  return (
    <div className="vacio">
      <span className="glifo"><Icon n={icono} s={24} w={1.9} /></span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {accion && (
        <button className="cta" type="button" onClick={onAccion}>
          <Icon n="mas" s={17} w={2.4} />{accion}
        </button>
      )}
    </div>
  );
}
