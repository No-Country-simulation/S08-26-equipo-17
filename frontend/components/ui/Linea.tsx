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
  /** Cómo se sabe que pasó (D-17, preparado para cuando exista el dato):
   *  registrado lo capturó un sistema, declarado lo afirma una persona,
   *  pendiente todavía no pasó. Cambia la forma del nodo y lleva texto:
   *  nunca sólo el color. Si no viene, es registrado. */
  certeza?: "registrado" | "declarado" | "pendiente";
};

const ROTULO_CERTEZA = { registrado: "", declarado: "Declarado", pendiente: "Pendiente" };

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
    /* Con la hora sola (lista agrupada por día), la hora va en su propia
       columna a la izquierda de la línea: es lo primero que se escanea en
       un historial, antes que el evento (ronda visual 01, §12). */
    <ol className={"linea-t" + (soloLaHora ? " con-hora" : "")}>
      {hitos.map((h) => {
        const certeza = h.certeza ?? "registrado";
        const hora = relativo ? hace(h.cuando) : soloLaHora ? soloHora(h.cuando) : fechaHora(h.cuando);
        return (
          <li key={h.id} className={"hito " + certeza + (h.destacado ? " on" : "")}>
            {soloLaHora && <time className="hora-col" dateTime={h.cuando}>{hora}</time>}
            <span className="marca" aria-hidden="true">
              <Icon n={h.icono} s={14} />
            </span>
            <div className="c">
              <div className="arr">
                <b>{h.titulo}</b>
                {!soloLaHora && <time dateTime={h.cuando}>{hora}</time>}
              </div>
              {h.detalle && <p>{h.detalle}</p>}
              <span className="quien">
                {ROTULO_CERTEZA[certeza] && <em className="certeza">{ROTULO_CERTEZA[certeza]} · </em>}
                {h.autor} · {h.rol}
              </span>
            </div>
          </li>
        );
      })}
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
