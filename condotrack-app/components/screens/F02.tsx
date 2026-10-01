"use client";
import { useState } from "react";
import { TopBar } from "../ui/TopBar";
import { PanelReclamo } from "../paneles/PanelReclamo";
import { ExitoReclamo } from "../paneles/PanelReclamo";
import { type Vista } from "@/lib/data";

/** F02 · Nuevo reclamo.
 *
 *  La pantalla existe por el enlace directo. El camino normal es la hoja
 *  que sube desde Reclamos: el formulario es el mismo componente, así que
 *  no hay dos versiones que validen distinto. */
export function F02({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [hecho, setHecho] = useState<string | null>(null);

  if (hecho) {
    return (
      <div className="vista" id="f02">
        <TopBar volverA="r09" ir={ir} />
        <ExitoReclamo codigo={hecho} ir={ir} alterna="Volver a Más" onAlterna={() => ir("mas")} />
      </div>
    );
  }

  return (
    <div className="vista" id="f02">
      <TopBar volverA="r09" ir={ir} />
      <div className="tit"><h1>Hacer un reclamo</h1></div>

      <PanelReclamo onListo={setHecho} onCancelar={() => ir("r09")} />
    </div>
  );
}
