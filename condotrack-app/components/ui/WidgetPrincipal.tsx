"use client";
import { useState } from "react";
import { Icon, type NombreIcono } from "./Icon";

/** Primary Context Widget (ronda visual 01, §4).
 *
 *  No es una card: es el campo. Vive adentro de la zona oscura de arriba
 *  del home, y la cifra se apoya directo sobre ella, centrada, sin caja.
 *
 *  Cada cara responde UNA pregunta y trae UNA acción primaria:
 *    Expensas → cuánto debo, cuándo vence, qué hago
 *    Visitas  → cuántas, cuál es el pase que importa
 *    Entregas → qué tengo para retirar
 *    Reservas → cuál es la próxima
 *  Debajo, a lo sumo dos enlaces. Nada de métricas sueltas: los
 *  subtotales y porcentajes viven en el detalle (§5.2).
 *
 *  Los tabs son un control segmentado en vidrio, que acá sí tiene algo
 *  detrás (§1.5). Lo activo se marca con relleno y peso, no con amarillo:
 *  el amarillo es de la acción. */

export type EstadoWidget = {
  id: string;
  rotulo: string;
  volanta: string;
  titular: string;
  /** El titular es un nombre y no una cifra: baja un escalón. */
  titularTexto?: boolean;
  detalle?: string;
  pastilla?: { texto: string; icono?: NombreIcono; apagada?: boolean };
  primaria?: { rotulo: string; icono?: NombreIcono; onIr: () => void };
  /** Hasta dos. El tercero no se muestra. */
  enlaces?: { rotulo: string; icono?: NombreIcono; onIr: () => void }[];
};

export function WidgetPrincipal({
  estados,
  etiqueta = "Estado de tu unidad",
  inicial = 0,
}: {
  estados: EstadoWidget[];
  etiqueta?: string;
  inicial?: number;
}) {
  const [n, setN] = useState(Math.min(inicial, Math.max(0, estados.length - 1)));
  const [cruce, setCruce] = useState("");
  if (estados.length === 0) return null;
  const act = estados[Math.min(n, estados.length - 1)];

  return (
    <section className="widget en-campo" aria-label={etiqueta}>
      <div className="widget-tabs" role="tablist" aria-label={etiqueta}>
        {estados.map((e, i) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            id={"wt-" + e.id}
            aria-selected={i === n}
            aria-controls={"wp-" + e.id}
            tabIndex={i === n ? 0 : -1}
            onClick={() => { if (i !== n) setCruce(i > n ? "cruza-izq" : "cruza-der"); setN(i); }}
          >
            {e.rotulo}
          </button>
        ))}
      </div>

      <div key={act.id} className={"widget-panel " + cruce} role="tabpanel"
        id={"wp-" + act.id} aria-labelledby={"wt-" + act.id} tabIndex={0}>
        {act.volanta && <span className="vol">{act.volanta}</span>}
        <b className={"cifra" + (act.titularTexto ? " texto" : "")}>{act.titular}</b>

        {(act.detalle || act.pastilla) && (
          <span className="det">
            {act.detalle && <span>{act.detalle}</span>}
            {act.pastilla && (
              <span className={"pastilla" + (act.pastilla.apagada ? " gris" : "")}>
                {act.pastilla.icono && <Icon n={act.pastilla.icono} s={12} />}
                {act.pastilla.texto}
              </span>
            )}
          </span>
        )}

        {act.primaria && (
          <button className="entrar compacto" type="button" onClick={act.primaria.onIr}>
            {act.primaria.icono && <Icon n={act.primaria.icono} s={20} />}
            {act.primaria.rotulo}
          </button>
        )}

        {act.enlaces && act.enlaces.length > 0 && (
          <span className="widget-enlaces">
            {act.enlaces.slice(0, 2).map((e) => (
              <button key={e.rotulo} className="btn-sec claro" type="button" onClick={e.onIr}>
                {e.icono && <Icon n={e.icono} s={16} />}
                {e.rotulo}
              </button>
            ))}
          </span>
        )}
      </div>
    </section>
  );
}
