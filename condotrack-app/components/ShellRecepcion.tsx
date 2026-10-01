"use client";
import { useCallback, useEffect, useRef } from "react";
import { ReceptionNovelty } from "./recepcion/ReceptionNovelty";
import { ReceptionHeader } from "./recepcion/ReceptionHeader";
import { P01 } from "./recepcion/P01";
import { P02 } from "./recepcion/P02";
import { P03 } from "./recepcion/P03";
import { P04 } from "./recepcion/P04";
import { P05 } from "./recepcion/P05";
import { P07 } from "./recepcion/P07";
import { P09 } from "./recepcion/P09";
import { P08 } from "./recepcion/P08";
import { TransicionVista } from "./sistema/TransicionVista";
import { Tostada } from "./sistema/Tostada";
import { useSinMovimiento } from "@/lib/movimiento";
import { type Perfil, type VistaP } from "@/lib/data";

/** Shell de Recepción. El header es estable: cambiar de destino sólo mueve
 *  la región de contenido (TransicionVista). Un solo scroll. */
export function ShellRecepcion({
  vista, refe, ir, onSalir, onCambiarPerfil,
}: {
  vista: VistaP; refe?: string;
  ir: (v: VistaP, ref?: string) => void;
  onSalir: () => void;
  onCambiarPerfil?: (p: Perfil) => void;
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  const quieto = useSinMovimiento();
  const alCambiar = useCallback(() => caja.current?.scrollTo(0, 0), []);
  useEffect(() => {
    if (vista === "p01" && refe === "bitacora") {
      const bitacora = caja.current?.querySelector<HTMLElement>("#rec-bitacora");
      bitacora?.focus({ preventScroll: true });
      bitacora?.scrollIntoView({ block: "start" });
    }
  }, [vista, refe]);

  /* REC-SCROLL-01 · parallax sólo del fondo decorativo (la elipse del
     Home): sube a un 12 % de la velocidad del scroll. Nada más se mueve y
     con movimiento reducido queda quieto. */
  useEffect(() => {
    const el = caja.current;
    if (!el || quieto) { el?.style.removeProperty("--paralaje"); return; }
    let pedido = 0;
    const al = () => { if (!pedido) pedido = requestAnimationFrame(() => { pedido = 0; el.style.setProperty("--paralaje", `${(el.scrollTop * 0.12).toFixed(1)}px`); }); };
    el.addEventListener("scroll", al, { passive: true });
    return () => { el.removeEventListener("scroll", al); if (pedido) cancelAnimationFrame(pedido); };
  }, [quieto]);

  const bitacora = vista === "p01" && refe === "bitacora";
  return (
    <ReceptionNovelty><section className="desk recepcion rec-command-center ct-desk" aria-label="CondoTrack recepción" data-reduced={quieto}>
      <div className="desk-main" ref={caja}>
        <ReceptionHeader vista={bitacora ? "p09" : vista} refe={refe} ir={ir} onSalir={onSalir} onCambiarPerfil={onCambiarPerfil} />
        <TransicionVista clave={bitacora ? "p09" : vista} alCambiar={alCambiar} className="desk-cuerpo">
          {vista === "p01" && !bitacora && <P01 ir={ir} />}
          {(vista === "p09" || bitacora) && <P09 />}
          {vista === "p02" && <P02 ir={ir} refe={refe} />}
          {vista === "p03" && <P03 ir={ir} />}
          {vista === "p04" && <P04 ir={ir} refe={refe} />}
          {vista === "p05" && <P05 ir={ir} refe={refe} />}
          {vista === "p07" && <P07 ir={ir} refe={refe} />}
          {vista === "p08" && <P08 ir={ir} refe={refe} />}
        </TransicionVista>
      </div>
      <Tostada clase="escritorio" />
    </section></ReceptionNovelty>
  );
}
