"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Descarga } from "../ui/Descarga";
import { FinLista } from "../ui/FinLista";
import { RESIDENTE, type Vista } from "@/lib/data";
import { EXPENSAS, archivoEstadoCuenta, saldoUnidad } from "@/lib/expensas";
import { pesos, periodoLargo, fechaCorta } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R23 · Estado de cuenta de la unidad. */
export function R23({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const saldo = saldoUnidad();

  return (
    <div className="vista" id="r23">
      <TopBar volverA="r20" ir={ir} />
      <div className="tit">
        <h1>Estado de cuenta</h1>
        <p>Unidad {RESIDENTE.unidad} · todos los períodos.</p>
      </div>

      <div className={"saldo" + (saldo > 0 ? " debe" : "")}>
        <span className="k">Saldo</span>
        <b>{pesos(saldo)}</b>
        <span className="p">
          {saldo > 0
            ? "Es lo que queda por pagar del período en curso."
            : "No tenés deuda con el consorcio."}
        </span>
      </div>

      <div className="subtit"><h2>Movimientos</h2><span>{EXPENSAS.length}</span></div>

      <div className="tabla">
        {EXPENSAS.map((e) => {
          const informado = estado.pagos.find((p) => p.periodo === e.periodo);
          return (
            <div className="tabla-f alto" key={e.id}>
              <span className="d">
                <b>{periodoLargo(e.periodo)}</b>
                <i>
                  {e.estado === "pagada"
                    ? `Pagada el ${fechaCorta(e.pagadaEl!)} · ${e.medioPago}`
                    : informado
                      ? "Pago informado · pendiente de confirmación"
                      : `Vence el ${fechaCorta(e.vencimiento)}`}
                </i>
                <span className={"pastilla" + (e.estado === "pagada" ? " gris" : "")} style={{ marginTop: 8 }}>
                  <Icon n={e.estado === "pagada" ? "check" : "reloj"} s={12} w={2.2} />
                  {e.estado === "pagada" ? "Pagada" : e.estado === "vencida" ? "Vencida" : "Pendiente"}
                </span>
              </span>
              <span className="n">{pesos(e.total)}</span>
            </div>
          );
        })}
      </div>

      <Descarga rotulo="Descargar el estado de cuenta" archivo={archivoEstadoCuenta()} peso="128 KB" />

      <button className="entrar" type="button" onClick={() => ir("f03")} style={{ marginTop: 14 }}>
        Informar un pago
      </button>

      <FinLista texto="No hay más movimientos" />
    </div>
  );
}
