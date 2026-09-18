"use client";
import { useState, type ReactNode } from "react";
import { Icon, type NombreIcono } from "./Icon";

/** Primary Context Widget (04 · sistema de componentes).
 *
 *  Un solo bloque arriba del home que responde "cómo estoy" en cuatro
 *  estados: Expensas, Visitas, Entregas, Reservas. Los tabs viven ADENTRO
 *  del widget, no arriba —eso es lo que se extrae de REF_02—, y la cifra
 *  grande no lleva card propia: se apoya sobre el campo tonal del fondo.
 *  Debajo, a lo sumo tres datos chicos.
 *
 *  Motion (05): al cambiar de pestaña, crossfade con un desplazamiento
 *  corto en X, 180 ms, ease-out. El sentido sale de hacia dónde te
 *  moviste. Con prefers-reduced-motion el contenido cambia sin
 *  desplazamiento, pero cambia igual. */

export type EstadoWidget = {
  id: string;
  /** Lo que dice el tab. Corto: entran cuatro en 390 px. */
  rotulo: string;
  volanta: string;
  /** La cifra o el dato grande. Es texto ya formateado. */
  titular: string;
  detalle?: string;
  pastilla?: { texto: string; icono?: NombreIcono; apagada?: boolean };
  /** Hasta tres. El cuarto no se muestra. */
  datos?: { k: string; v: string }[];
  accion?: { rotulo: string; icono?: NombreIcono; onIr: () => void };
  /** Escotilla para un estado que no entra en la forma de arriba. */
  extra?: ReactNode;
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
  const [sentido, setSentido] = useState<"izq" | "der" | null>(null);
  if (estados.length === 0) return null;
  const act = estados[Math.min(n, estados.length - 1)];

  function elegir(i: number) {
    if (i === n) return;
    setSentido(i > n ? "izq" : "der");
    setN(i);
  }

  return (
    <section className="widget" aria-label={etiqueta}>
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
            onClick={() => elegir(i)}
          >
            {e.rotulo}
          </button>
        ))}
      </div>

      <div
        key={act.id}
        className={"widget-panel" + (sentido ? " cruza-" + sentido : "")}
        role="tabpanel"
        id={"wp-" + act.id}
        aria-labelledby={"wt-" + act.id}
        tabIndex={0}
      >
        <span className="vol">
          <span>{act.volanta}</span>
          {act.pastilla && (
            <span className={"pastilla" + (act.pastilla.apagada ? " gris" : "")}>
              {act.pastilla.icono && <Icon n={act.pastilla.icono} s={13} w={2.2} />}
              {act.pastilla.texto}
            </span>
          )}
        </span>

        <b className="cifra">{act.titular}</b>
        {act.detalle && <i className="det">{act.detalle}</i>}

        {act.datos && act.datos.length > 0 && (
          <div className="widget-datos">
            {act.datos.slice(0, 3).map((d) => (
              <span key={d.k}>
                <span className="k">{d.k}</span>
                <b>{d.v}</b>
              </span>
            ))}
          </div>
        )}

        {act.extra}

        {act.accion && (
          <button className="widget-accion" type="button" onClick={act.accion.onIr}>
            <Icon n={act.accion.icono ?? "documento"} s={17} w={1.8} />
            <i>{act.accion.rotulo}</i>
            <Icon n="chevron" s={16} w={2.2} />
          </button>
        )}
      </div>
    </section>
  );
}
