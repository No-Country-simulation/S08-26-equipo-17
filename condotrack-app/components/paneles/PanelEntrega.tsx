"use client";
import { useState } from "react";
import { Linea, type Hito } from "../ui/Linea";
import { ROTULO_ENTREGA, type Entrega } from "@/lib/data";
import { fechaHora } from "@/lib/formato";

/** El detalle de una entrega, sin pantalla alrededor. Lo usan la hoja de
 *  R08 y la vista G11, que queda para el enlace directo.
 *
 *  El orden es el de quien mira: en qué estado está, quién la recibió y
 *  cuándo, la foto que sacó recepción si existe, los datos que quedan y
 *  el historial. El tipo y el remitente ya están en el título: repetirlos
 *  en una ficha era decir cuatro veces lo mismo. */
export function PanelEntrega({ e }: { e: Entrega }) {
  const paraRetirar = e.estado === "retirar";
  /* Si la foto no está, no se reserva el lugar: nada de un hueco de 200
     px con el rótulo puesto. */
  const [hayFoto, setHayFoto] = useState(Boolean(e.foto));
  const hitos: Hito[] = [
    e.retiradoEl && { id: "r", cuando: e.retiradoEl, icono: "check" as const,
      titulo: "Entrega retirada",
      detalle: `Retirada por ${e.retiradoPor}. Entregada por ${e.entregadoPor}.`,
      autor: e.entregadoPor ?? "Recepción", rol: "Recepción", destacado: true },
    { id: "c", cuando: e.recibidoEl, icono: "caja" as const,
      titulo: "Recibida en recepción",
      detalle: `${ROTULO_ENTREGA[e.tipo]} de ${e.remitente}`,
      autor: e.recibidoPor, rol: "Recepción", destacado: !e.retiradoEl },
  ].filter(Boolean) as Hito[];

  return (
    <>
      <div className="ent-estado">
        <b className={paraRetirar ? "" : "gris"}>{paraRetirar ? "Para retirar" : "Retirado"}</b>
        <p>
          {paraRetirar
            ? `Recibida por ${e.recibidoPor} · ${fechaHora(e.recibidoEl)}`
            : `Retirada por ${e.retiradoPor} · ${fechaHora(e.retiradoEl!)}`}
        </p>
      </div>

      {/* la foto de recepción, si la sacó; nunca el nombre del archivo */}
      {e.foto && hayFoto && (
        <figure className="ent-foto">
          <img src={"/img/" + e.foto} alt="Foto de la entrega tomada por recepción"
            onError={() => setHayFoto(false)} />
          <figcaption>Foto de recepción</figcaption>
        </figure>
      )}

      <div className="datos-quietos">
        <p><span>Unidad</span><b>{e.unidad}</b></p>
        <p><span>Tipo</span><b>{ROTULO_ENTREGA[e.tipo]}</b></p>
        {e.retiradoPor && <p><span>Retiró</span><b>{e.retiradoPor}</b></p>}
        {e.entregadoPor && <p><span>Entregó</span><b>{e.entregadoPor}</b></p>}
      </div>

      <h2 className="sec">Historial</h2>
      <Linea hitos={hitos} />
    </>
  );
}
