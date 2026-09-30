"use client";
import { Icon } from "../ui/Icon";
import { Aviso } from "../ui/Estados";
import { type VistaP } from "@/lib/data";
import { AGENDA, ROTULO_AGENDA } from "@/lib/edificio";
import { soloHora } from "@/lib/formato";

/** P08 · Agenda operativa del día.
 *  Lo que va a pasar en el turno, en orden. Lo que ya pasó queda tachado
 *  para que se vea de un vistazo por dónde va el día. */
export function P08({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const ahora = new Date();
  const proximo = AGENDA.find((a) => new Date(a.hora) >= ahora);
  const pendientes = AGENDA.filter((a) => new Date(a.hora) >= ahora).length;

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Agenda del día</h1>
          <p>
            {pendientes === 0
              ? "No queda nada programado para hoy."
              : pendientes === 1 ? "Queda 1 cosa programada." : `Quedan ${pendientes} cosas programadas.`}
          </p>
        </div>
        <div className="der">
          <button className="btn-desk" type="button" onClick={() => ir("p04")}>
            <Icon n="credencial" s={16} w={1.9} />Validar acceso
          </button>
        </div>
      </div>

      <div className="agenda">
        {AGENDA.map((a) => {
          const pasado = new Date(a.hora) < ahora;
          return (
            <div key={a.id}
              className={"agenda-f" + (a.hecho || pasado ? " hecha" : "") + (a.id === proximo?.id ? " ahora" : "")}>
              <span className="h">{soloHora(a.hora)}</span>
              <span className="et">{ROTULO_AGENDA[a.tipo]}</span>
              <span className="d">
                <b>{a.titulo}{a.unidad ? ` · Unidad ${a.unidad}` : ""}</b>
                {a.detalle && <i>{a.detalle}</i>}
              </span>
              {a.hecho || pasado ? (
                <span className="pastilla gris">Hecho</span>
              ) : a.id === proximo?.id ? (
                <span className="pastilla">Lo que viene</span>
              ) : null}
            </div>
          );
        })}
      </div>

      <Aviso icono="info">
        La agenda se arma sola con lo que ya está cargado: reservas de espacios,
        visitas autorizadas, mudanzas y proveedores del edificio. Recepción no la
        escribe a mano.
      </Aviso>
    </>
  );
}
