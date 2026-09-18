"use client";
import { useState } from "react";
import { TopBar } from "../ui/TopBar";
import { PanelReclamo } from "../paneles/PanelReclamo";
import { Confirmacion } from "../ui/Estados";
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
        <Confirmacion
          titulo="Reclamo creado"
          principal={hecho}
          secundario="Administración lo ve ahora en su panel"
          registro="Cada cambio de estado te va a llegar como aviso y queda en el historial del reclamo."
          accion="Seguir el reclamo"
          onAccion={() => ir("r09")}
          alterna="Volver a Más"
          onAlterna={() => ir("mas")}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="f02">
      <TopBar volverA="r09" ir={ir} />
      <div className="tit">
        <h1>Hacer un reclamo</h1>
        <p>Contá qué pasa y dónde. Lo vas a poder seguir.</p>
      </div>

      <PanelReclamo onListo={setHecho} onCancelar={() => ir("r09")} />
    </div>
  );
}
