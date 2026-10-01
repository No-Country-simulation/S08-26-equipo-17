"use client";
import { Icon } from "../ui/Icon";
import { soloHora } from "@/lib/formato";
import type { ActividadTurno } from "@/lib/recepcion";

export function ShiftActivity({ items }: { items: ActividadTurno[] }) {
  return <section className="rec-activity" aria-labelledby="rec-bitacora" >
    <header className="rec-section-heading"><div>
      
      <h2 id="rec-bitacora" tabIndex={-1}>Actividad reciente</h2>
    </div><Icon n="lista" s={20} /></header>
    {items.length === 0 ? <p className="rec-empty">Sin movimientos registrados hoy.</p> :
      <ol>{items.slice(0, 3).map(i => <li key={i.id}>
        <time dateTime={i.cuando}>{soloHora(i.cuando)}</time>
        <span className="rec-activity-icon"><Icon n={i.icono} s={18} /></span>
        <div><b>{i.titulo}</b><p>{i.contexto}</p><small>{i.actor}</small></div>
      </li>)}</ol>}
    <p className="rec-preview-caption">Últimos {Math.min(items.length, 3)} de {items.length} movimientos de hoy</p>
  </section>;
}
