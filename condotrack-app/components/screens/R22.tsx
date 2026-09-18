"use client";
import { TopBar } from "../ui/TopBar";
import { FinLista } from "../ui/FinLista";
import { PanelMedios } from "../paneles/PanelMedios";
import type { Vista } from "@/lib/data";

/** R22 · Medios de pago.
 *  En la app se abre como hoja desde la expensa. Esta vista existe para el
 *  enlace directo (?v=r22) y comparte exactamente el mismo panel, así no
 *  hay dos versiones del mismo CBU. */
export function R22({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  return (
    <div className="vista" id="r22">
      <TopBar volverA="r20" ir={ir} />
      <div className="tit">
        <h1>Medios de pago</h1>
        <p>Cómo pagar la expensa del consorcio.</p>
      </div>

      <PanelMedios />

      <button className="entrar" type="button" onClick={() => ir("f03")} style={{ marginTop: 16 }}>
        Informar un pago
      </button>

      <FinLista texto="No hay más medios de pago" />
    </div>
  );
}
