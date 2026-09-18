"use client";
import { Icon, type NombreIcono } from "./Icon";
import { fechaHora, hace, soloHora } from "@/lib/formato";

/** Timeline / audit log — template 5 del 06_UX_UI_SCOPE.
 *  Quién hizo qué, cuándo y en qué estado quedó. Es el mismo componente
 *  para el historial de la unidad, el de un reclamo y el de una entrega:
 *  si cada uno tuviera el suyo, terminarían contando la historia distinto. */

export type Hito = {
  id: string;
  cuando: string;          // ISO
  icono: NombreIcono;
  titulo: string;
  detalle?: string;
  autor: string;
  rol: string;
  destacado?: boolean;
};

export function Linea({
  hitos, relativo = false, soloLaHora = false,
}: {
  hitos: Hito[];
  relativo?: boolean;
  /** Cuando la lista ya viene agrupada por día, repetir la fecha en cada
   *  hito es ruido: alcanza con la hora. */
  soloLaHora?: boolean;
}) {
  return (
    <ol className="linea-t">
      {hitos.map((h) => (
        <li key={h.id} className={h.destacado ? "hito on" : "hito"}>
          <span className="marca" aria-hidden="true">
            <Icon n={h.icono} s={15} w={1.9} />
          </span>
          <div className="c">
            <div className="arr">
              <b>{h.titulo}</b>
              <time dateTime={h.cuando}>
                {relativo ? hace(h.cuando) : soloLaHora ? soloHora(h.cuando) : fechaHora(h.cuando)}
              </time>
            </div>
            {h.detalle && <p>{h.detalle}</p>}
            <span className="quien">
              {h.autor} · {h.rol}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Barra de avance de un workflow. El estado nunca depende sólo del color:
 *  el paso actual también está escrito. */
export function Avance({
  pasos, actual, rotulos,
}: { pasos: string[]; actual: string; rotulos: Record<string, string> }) {
  const i = Math.max(0, pasos.indexOf(actual));
  const cerrado = i < 0;
  return (
    <div className="avance" role="group" aria-label="Estado del reclamo">
      <ol>
        {pasos.map((p, n) => (
          <li key={p} className={n < i ? "hecho" : n === i ? "ahora" : ""}>
            <span className="pt" aria-hidden="true" />
            <span className="rt">{rotulos[p]}</span>
          </li>
        ))}
      </ol>
      <p className="avance-txt">
        {cerrado ? rotulos[actual] : `Ahora: ${rotulos[actual]}`}
        {" · "}paso {i + 1} de {pasos.length}
      </p>
    </div>
  );
}
