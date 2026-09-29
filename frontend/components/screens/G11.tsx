"use client";
import { TopBar } from "../ui/TopBar";
import { FinLista } from "../ui/FinLista";
import { Error as ErrorEstado } from "../ui/Estados";
import { PanelEntrega } from "../paneles/PanelEntrega";
import { type Vista } from "@/lib/data";
import { useApp } from "@/lib/estado";

/** G11 · Entrega, detalle + historial.
 *  En la app se abre como hoja desde R08. Esta vista queda para el enlace
 *  directo y usa el mismo panel. */
export function G11({ ir, refe }: { ir: (v: Vista, r?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const e = estado.entregas.find((x) => x.id === refe);

  if (!e) {
    return (
      <div className="vista" id="g11">
        <TopBar volverA="r08" ir={ir} />
        <ErrorEstado
          titulo="No encontramos esa entrega"
          onReintentar={() => ir("r08")}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="g11">
      <TopBar volverA="r08" ir={ir} />

      <div className="cabecera-ent">
        <span className="et">Entrega</span>
        <h1>{e.remitente}</h1>
      </div>

      <PanelEntrega e={e} />

      <FinLista texto="Fin del historial de la entrega" />
    </div>
  );
}
