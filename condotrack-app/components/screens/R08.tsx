"use client";
import { CardEntrega } from "../paneles/PanelEntrega";
import { TopBar } from "../ui/TopBar";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { RESIDENTE, type Vista } from "@/lib/data";
import { useApp } from "@/lib/estado";

/** R08 · Entregas.
 *
 *  Ronda 2 · el mismo lenguaje que el seguimiento (G11): cada entrega es la
 *  card de seguimiento en chico —de quién, qué día, el estado y el
 *  recorrido— y tocarla abre esa misma card en grande. Antes eran filas de
 *  texto que abrían una hoja con otro diseño: dos partes distintas para lo
 *  mismo. La que está para retirar va en carbón; las retiradas, apagadas. */
export function R08({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const lista = estado.entregas
    .filter((e) => e.unidad === RESIDENTE.unidad)
    .sort((a, b) => b.recibidoEl.localeCompare(a.recibidoEl));

  return (
    <div className="vista" id="r08">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit"><h1>Entregas</h1></div>

      {lista.length === 0 ? (
        <Vacio icono="caja" titulo="Sin entregas" />
      ) : (
        <>
          <div className="ent-lista">
            {lista.map((e) => <CardEntrega key={e.id} e={e} onAbrir={() => ir("g11", e.id)} />)}
          </div>
          <FinLista texto="Nada más para mostrar" />
        </>
      )}
    </div>
  );
}
