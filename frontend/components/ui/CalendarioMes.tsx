"use client";
import { useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { mesDe, mesLargo, mismoDia, numDia, mesCorto, esHoy, type Celda } from "@/lib/reservas";

/** Calendario de mes (D-08 · lock V02).
 *
 *  Un mes, flechas, y un gesto horizontal simple. Nada más.
 *
 *  La ronda visual 01 lo había convertido en un carrusel de meses con
 *  scroll nativo y scroll-snap: se veía bien y se trababa (A2). El lock V02
 *  pide lo contrario: interacción simple aunque la presentación siga
 *  siendo premium. Se sacó el carrusel y toda su lógica de centrado.
 *
 *  El gesto es el de la fase 3, que ya estaba probado: un toque sigue
 *  siendo un toque —la captura del puntero se toma recién pasados 8 px,
 *  así el click del día no se pierde (BUG-01)— y a partir de 60 px de
 *  arrastre cambia el mes. `touch-action: pan-y` deja que el scroll
 *  vertical de la pantalla siga funcionando encima del calendario.
 *
 *  El día elegido lleva una marca del tamaño del número, no el círculo
 *  que ocupaba la celda. La disponibilidad se cuenta con puntos: lleno hay
 *  lugar, hueco quedan pocos, sin punto no hay. */

export type PuntoDia = "lleno" | "poco" | "sin";
export type EstadoDia = {
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
}: {
  /** Primer día del mes que se está mirando. */
  ancla: Date;
  onAncla: (d: Date) => void;
  dia: Date | null;
  onDia: (d: Date) => void;
  estadoDe: (c: Celda) => EstadoDia;
  etiqueta?: string;
  /** Se acepta por compatibilidad; hay una sola versión. */
  grande?: boolean;
}) {
  const [desliz, setDesliz] = useState(0);
  const [lado, setLado] = useState<"" | "entra-izq" | "entra-der">("");
  const gesto = useRef<{ x: number; arrastrando: boolean } | null>(null);
  /* Sin la semana final si es toda del mes siguiente: el calendario no
     tiene por qué comerse la pantalla. */
  const celdas = useMemo(() => {
    const c = mesDe(ancla);
    while (c.length > 35 && c.slice(-7).every((x) => !x.delMes)) c.splice(-7);
    return c;
  }, [ancla]);

  const correrMes = (pasos: number) => {
    setLado(pasos > 0 ? "entra-izq" : "entra-der");
    onAncla(new Date(ancla.getFullYear(), ancla.getMonth() + pasos, 1));
  };

  function tomar(e: React.PointerEvent) {
    gesto.current = { x: e.clientX, arrastrando: false };
  }
  function mover(e: React.PointerEvent) {
    const g = gesto.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.arrastrando) {
      if (Math.abs(dx) < UMBRAL_ARRASTRE) return;
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
    <div className="cal sin-caja">
      <div className="cal-cab">
        <button className="circulo" type="button" aria-label="Mes anterior" onClick={() => correrMes(-1)}>
          <Icon n="volver" s={18} />
        </button>
        <b aria-live="polite">
          <span>{ancla.toLocaleDateString("es-AR", { month: "long" }).replace(/^./, (c) => c.toUpperCase())}</span>
          <em>{ancla.getFullYear()}</em>
        </b>
        <button className="circulo" type="button" aria-label="Mes siguiente" onClick={() => correrMes(1)}>
          <Icon n="flechaDer" s={18} />
        </button>
      </div>

      <div className="cal-sem" aria-hidden="true">
        {DIAS_SEMANA.map((d, n) => <span key={n}>{d}</span>)}
      </div>

      <div className="cal-pista"
        onPointerDown={tomar} onPointerMove={mover}
        onPointerUp={soltar} onPointerCancel={soltar}>
        <div key={ancla.getTime()} className={"cal-grilla " + lado} role="grid" aria-label={etiqueta + ", " + mesLargo(ancla)}
          style={desliz ? { transform: "translateX(" + desliz * 0.3 + "px)" } : undefined}>
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
