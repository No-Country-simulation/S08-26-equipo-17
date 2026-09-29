"use client";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { HojaPagar } from "../paneles/HojaPagar";
import { ZonaContexto } from "../ui/ZonaContexto";
import { Aviso } from "../ui/Estados";
import { type Vista } from "@/lib/data";
import { expensaDelMes } from "@/lib/expensas";
import { pesos, diaMes } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { useNavegacion } from "@/lib/navegacion";

/** R20 · Expensa del mes (lock V02, fase 3).
 *
 *  Sólo el primer nivel, y nada compite con él:
 *
 *    cuánto · cuándo vence · en qué estado está · [Pagar]
 *    Ver composición · Ver movimientos
 *
 *  La composición —gráfico, rubros, tu parte y el cupón— vive en R21 y se
 *  llega en un toque. Antes estaba también acá abajo, en paneles, y el
 *  menú "Pagos y papeles" repetía Movimientos y "Ya pagué", que ya están
 *  en la hoja de Pagar y en R23.
 *
 *  "Pagar" abre la hoja con los medios y termina en "Ya pagué", que lleva a
 *  informar el pago. Con `refe="pagar"` la hoja abre sola (el botón del
 *  home). */
export function R20({ ir, refe }: { ir: (v: Vista, ref?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const [pagar, setPagar] = useState(refe === "pagar");
  const exp = expensaDelMes();
  const pagada = exp.estado === "pagada";
  const informado = estado.pagos.find((p) => p.periodo === exp.periodo);

  /* "pagar" es una orden de un solo uso: se cumple al entrar y no queda en
     el historial. Si quedara, al volver de informar el pago la hoja se
     volvía a abrir sola (A5). */
  const nav = useNavegacion();
  useEffect(() => {
    if (refe === "pagar") nav?.reemplazarRef(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="vista" id="r20">
      <ZonaContexto
        ir={ir}
        volverA="r01"
        foto="/img/fachada.jpg"
        volanta="Expensas"
        titulo={pesos(exp.total)}
        cifra
        dato={
          <span className="linea-estado">
            {pagada ? "Pagada" : "Vence " + diaMes(exp.vencimiento)}
            {!pagada && (
              <span className={"estado-punto" + (exp.estado === "vencida" ? " vencido" : "")}>
                {exp.estado === "vencida" ? "Vencida" : "Pendiente"}
              </span>
            )}
          </span>
        }
      >
        {!pagada && (
          <button className="entrar zc-cta" type="button" onClick={() => setPagar(true)}>
            Pagar
          </button>
        )}
        <span className="zc-enlaces">
          <button className="btn-sec claro" type="button" onClick={() => ir("r21")}><Icon n="torta" s={16} />Composición</button>
          <button className="btn-sec claro" type="button" onClick={() => ir("r23")}><Icon n="lista" s={16} />Movimientos</button>
        </span>
      </ZonaContexto>

      {informado && (
        <Aviso icono="reloj">
          Pago de {pesos(informado.importe)} informado · a confirmar.
        </Aviso>
      )}

      {pagar && (
        <HojaPagar onCerrar={() => setPagar(false)}
          onInformar={() => { setPagar(false); ir("f03"); }} />
      )}
    </div>
  );
}
