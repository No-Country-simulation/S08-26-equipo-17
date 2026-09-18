"use client";
import { Icon } from "../ui/Icon";
import { Ficha, Dato } from "../ui/Panel";
import { Linea, type Hito } from "../ui/Linea";
import { Aviso } from "../ui/Estados";
import { ROTULO_ENTREGA, type Entrega } from "@/lib/data";
import { fechaHora } from "@/lib/formato";

/** El detalle de una entrega, sin pantalla alrededor: cuatro datos y un
 *  historial de dos líneas. Lo usan la hoja de R08 y la vista G11, que
 *  queda para el enlace directo. */
export function PanelEntrega({ e }: { e: Entrega }) {
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
      <div className="estado-exp" style={{ marginTop: 4 }}>
        <span className={"pastilla" + (e.estado === "retirar" ? "" : " gris")}>
          <Icon n={e.estado === "retirar" ? "reloj" : "check"} s={13} w={2.2} />
          {e.estado === "retirar" ? "Para retirar" : "Retirado"}
        </span>
        <span className="v">{e.remitente}</span>
      </div>

      <Ficha>
        <Dato k="Unidad" v={e.unidad} />
        <Dato k="Tipo" v={ROTULO_ENTREGA[e.tipo]} />
        <Dato k="Recibió" v={e.recibidoPor} />
        <Dato k="Recibido" v={fechaHora(e.recibidoEl)} />
        {e.retiradoPor && <Dato k="Retiró" v={e.retiradoPor} />}
        {e.entregadoPor && <Dato k="Entregó" v={e.entregadoPor} />}
        {e.foto && <Dato k="Foto" v={`${e.foto} · tomada por recepción`} ancho />}
      </Ficha>

      {e.estado === "retirar" && (
        <Aviso icono="info">
          El retiro lo registra recepción cuando te la entrega: no hace falta que
          hagas nada acá.
        </Aviso>
      )}

      <h2 className="sec" style={{ fontSize: 15 }}>Historial</h2>
      <Linea hitos={hitos} />
    </>
  );
}
