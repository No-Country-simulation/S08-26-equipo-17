"use client";
import { Icon } from "../ui/Icon";
import { Hoja } from "../ui/Hoja";
import { PanelMedios } from "./PanelMedios";
import { expensaDelMes } from "@/lib/expensas";
import { pesos, diaMes } from "@/lib/formato";

/** La hoja de Pagar: cuánto, cuándo vence, los medios y "Ya pagué".
 *
 *  Vive donde se toca el botón —el home, la expensa del mes— y no manda a
 *  otra pantalla: pagar es una acción, no un destino. */
export function HojaPagar({ onCerrar, onInformar }:
  { onCerrar: () => void; onInformar: () => void }) {
  const exp = expensaDelMes();
  const pagada = exp.estado === "pagada";

  return (
    <Hoja titulo="Pagar" onCancelar={onCerrar} cerrarRotulo="Cerrar" sinAcciones alto="alta">
      <div className="pagar-resumen">
        <b>{pesos(exp.total)}</b>
        <span>{pagada ? "Pagada" : "Vence el " + diaMes(exp.vencimiento)}</span>
      </div>
      <PanelMedios />
      <button className="entrar" type="button" style={{ marginTop: 18, width: "100%" }}
        onClick={onInformar}>
        <Icon n="check" s={20} />Ya pagué
      </button>
      <div style={{ height: 16 }} />
    </Hoja>
  );
}
