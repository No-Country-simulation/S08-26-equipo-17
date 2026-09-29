"use client";
import { PENDIENTES, type Perfil } from "@/lib/data";

export function Pendiente({ perfil, onSalir }:
  { perfil: Exclude<Perfil, "residente">; onSalir: () => void }) {
  const d = PENDIENTES[perfil];
  return (
    <section className="screen pend" aria-label="Pantalla pendiente de diseño">
      <div className="marco">
        <span className="tag">{d.tag}</span>
        <h1>{d.h}</h1>
        <p className="sub">{d.s}</p>
        <ul>
          {d.destinos.map(([nombre, id]) => (
            <li key={id}><span>{nombre}</span><small>{id}</small></li>
          ))}
        </ul>
        <button className="salir" type="button" onClick={onSalir}>Cerrar sesión</button>
      </div>
    </section>
  );
}
