"use client";
import { useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { mesDe, mesLargo, mismoDia, numDia, mesCorto, esHoy, type Celda } from "@/lib/reservas";

/** Calendario de mes (D-08).
 *
 *  Grilla de mes completa, no una tira. El día elegido va en círculo
 *  sólido y la disponibilidad se cuenta con puntos abajo del número, no
 *  con texto. Navegación de mes con flechas, y además se puede deslizar.
 *
 *  BUG-01 — por qué el gesto está escrito así: la versión anterior tomaba
 *  el puntero con setPointerCapture apenas apoyabas el dedo. Con la
 *  captura puesta, el click posterior se redirige al contenedor que
 *  capturó y nunca llega al botón del día: el calendario se veía bien y no
 *  se podía elegir nada. Acá la captura se toma recién cuando el gesto se
 *  convirtió en arrastre —más de UMBRAL_ARRASTRE px—, así que un toque
 *  sigue siendo un toque.
 *
 *  El componente no sabe de reservas: quién está libre lo decide la
 *  pantalla y llega por estadoDe(). */

export type PuntoDia = "lleno" | "poco" | "sin";
export type EstadoDia = {
  /** Cuántos turnos quedan, traducido a punto. */
  punto: PuntoDia;
  deshabilitado?: boolean;
  /** Lo que lee un lector de pantalla además de la fecha. */
  detalle?: string;
};

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];
const UMBRAL_MES = 60;        // px de arrastre para cambiar de mes
const UMBRAL_ARRASTRE = 8;    // px a partir de los cuales esto es un gesto

export function CalendarioMes({
  ancla,
  onAncla,
  dia,
  onDia,
  estadoDe,
  etiqueta = "Calendario",
  grande = true,
}: {
  /** Primer día del mes que se está mirando. */
  ancla: Date;
  onAncla: (d: Date) => void;
  dia: Date | null;
  onDia: (d: Date) => void;
  estadoDe: (c: Celda) => EstadoDia;
  etiqueta?: string;
  grande?: boolean;
}) {
  const [desliz, setDesliz] = useState(0);
  const [sentido, setSentido] = useState<"izq" | "der" | null>(null);
  const gesto = useRef<{ x: number; arrastrando: boolean } | null>(null);
  const celdas = useMemo(() => mesDe(ancla), [ancla]);

  function correrMes(pasos: number) {
    setSentido(pasos > 0 ? "izq" : "der");
    onAncla(new Date(ancla.getFullYear(), ancla.getMonth() + pasos, 1));
    window.setTimeout(() => setSentido(null), 280);
  }

  function tomar(e: React.PointerEvent) {
    gesto.current = { x: e.clientX, arrastrando: false };
  }
  function mover(e: React.PointerEvent) {
    const g = gesto.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.arrastrando) {
      if (Math.abs(dx) < UMBRAL_ARRASTRE) return;
      /* Recién acá es un arrastre: ahora sí conviene capturar, para no
         perder el gesto si el dedo se va del calendario. */
      g.arrastrando = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setDesliz(dx);
  }
  function soltar(e: React.PointerEvent) {
    const g = gesto.current;
    gesto.current = null;
    if (!g) return;
    if (g.arrastrando) {
      const el = e.currentTarget as HTMLElement;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (desliz <= -UMBRAL_MES) correrMes(1);
      else if (desliz >= UMBRAL_MES) correrMes(-1);
    }
    setDesliz(0);
  }

  return (
    <div className={"cal" + (grande ? " grande" : "")}>
      <div className="cal-cab">
        <button className="circulo" type="button" aria-label="Mes anterior"
          onClick={() => correrMes(-1)}>
          <Icon n="volver" s={18} w={2.1} />
        </button>
        <b>{mesLargo(ancla)}</b>
        <button className="circulo" type="button" aria-label="Mes siguiente"
          onClick={() => correrMes(1)}>
          <Icon n="flechaDer" s={18} w={2.1} />
        </button>
      </div>

      <div className="cal-sem" aria-hidden="true">
        {DIAS_SEMANA.map((d, n) => <span key={n}>{d}</span>)}
      </div>

      <div className="cal-pista"
        onPointerDown={tomar} onPointerMove={mover}
        onPointerUp={soltar} onPointerCancel={soltar}>
        <div className={"cal-grilla" + (sentido ? " entra-" + sentido : "")}
          role="grid" aria-label={etiqueta + ", " + mesLargo(ancla)}
          style={desliz ? { transform: "translateX(" + desliz * 0.35 + "px)" } : undefined}>
          {celdas.map((c, i) => {
            const est = estadoDe(c);
            const sel = dia ? mismoDia(c.fecha, dia) : false;
            const clase = "cal-dia" + (c.delMes ? "" : " fuera") + (sel ? " sel" : "")
              + (esHoy(c.fecha) ? " hoy" : "");
            return (
              <button key={i} type="button" role="gridcell" className={clase}
                disabled={est.deshabilitado}
                aria-current={sel ? "date" : undefined}
                aria-label={numDia(c.fecha) + " de " + mesCorto(c.fecha)
                  + (est.detalle ? ". " + est.detalle : "")}
                onClick={() => onDia(c.fecha)}>
                <b>{numDia(c.fecha)}</b>
                <span className={"pto" + (est.punto === "poco" ? " poco" : est.punto === "sin" ? " sin" : "")}
                  aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
