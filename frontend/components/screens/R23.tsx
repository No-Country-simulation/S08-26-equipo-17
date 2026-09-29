"use client";
import { TopBar } from "../ui/TopBar";
import { Descarga } from "../ui/Descarga";
import { type Vista } from "@/lib/data";
import { EXPENSAS, archivoEstadoCuenta, saldoUnidad } from "@/lib/expensas";
import { pesos, periodoLargo, diaMes } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R23 · Estado de cuenta (ronda fuerte).
 *
 *  El saldo, solo, con el lenguaje del campo del home: la fachada atrás,
 *  luz cálida, "Saldo" y el monto. Fin.
 *  Movimientos en filas de una línea: período, fecha, monto; el estado
 *  aparece sólo cuando no está pagada. */
export function R23({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const saldo = saldoUnidad();
  const proxima = EXPENSAS.find((e) => e.estado !== "pagada");

  /* Movimientos de la unidad, no sólo las expensas: lo que se debe y lo
     que se informó pagado, en una sola línea de tiempo. */
  const movimientos = [
    ...EXPENSAS.map((e) => {
      const informado = estado.pagos.find((p) => p.periodo === e.periodo);
      const pendiente = e.estado !== "pagada";
      return {
        id: e.id,
        tipo: "expensa" as const,
        titulo: periodoLargo(e.periodo),
        cuando: pendiente ? e.vencimiento : e.pagadaEl!,
        importe: e.total,
        estado: !pendiente ? undefined
          : informado ? "Informado" : e.estado === "vencida" ? "Vencida" : "Pendiente",
        tono: e.estado === "vencida" ? "vencido" : "curso",
      };
    }),
    ...estado.pagos.map((p) => ({
      id: p.id,
      tipo: "pago" as const,
      titulo: "Pago informado · " + periodoLargo(p.periodo),
      cuando: p.fecha,
      importe: p.importe,
      estado: p.estado === "confirmado" ? "Confirmado" : "A confirmar",
      tono: p.estado === "confirmado" ? "ok" : "curso",
    })),
  ].sort((a, b) => b.cuando.localeCompare(a.cuando));

  return (
    <div className="vista" id="r23">
      <TopBar volverA="r20" ir={ir} />

      <section className={"saldo-card" + (saldo > 0 ? " debe" : "")} aria-label="Saldo">
        <img className="campo-foto" src="/img/fachada.jpg" alt="" aria-hidden="true" />
        <span className="k">Saldo</span>
        <b>{pesos(saldo)}</b>
        {proxima && <span className="pie">Vence el {diaMes(proxima.vencimiento)}</span>}
      </section>

      <h2 className="sec">Movimientos</h2>
      <div className="tabla movs">
        {movimientos.map((m) => (
          <div className={"tabla-f" + (m.tipo === "pago" ? " mov-pago" : "")} key={m.id}>
            <span className="d">
              <b>{m.titulo}</b>
              <i>
                {diaMes(m.cuando)}
                {m.estado && <span className={"est-t " + m.tono}>{" · "}{m.estado}</span>}
              </i>
            </span>
            <span className="n">{m.tipo === "pago" ? "− " : ""}{pesos(m.importe)}</span>
          </div>
        ))}
      </div>

      <div className="pie-descarga">
        <Descarga chico rotulo="Estado de cuenta" archivo={archivoEstadoCuenta()} />
      </div>
    </div>
  );
}
