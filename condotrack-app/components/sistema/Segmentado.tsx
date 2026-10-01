"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";

const useMedida = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type OpcionSeg<T extends string> = { id: T; label: ReactNode; cuenta?: number; icono?: NombreIcono; aria?: string };

/** FilterControl del sistema. Un grupo de radios con un indicador que se
 *  traslada al elegido (transform, 250 ms): la selección se mueve, no
 *  parpadea. Flechas recorren y eligen, como un radiogroup nativo.
 *  Funciona en fila, en columna o en grilla: el indicador mide x, y, ancho
 *  y alto del elegido. */
export function Segmentado<T extends string>({ opciones, valor, onCambio, etiqueta, className = "", bloque = false, elevado = false }: {
  opciones: OpcionSeg<T>[]; valor: T | null; onCambio: (v: T) => void; etiqueta: string; className?: string; bloque?: boolean;
  /** El elegido se eleva (superficie + sombra, como U01) en vez de invertirse. */
  elevado?: boolean;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useMedida(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      const activo = el.querySelector<HTMLElement>('[aria-checked="true"]');
      if (!activo) { setInd(null); return; }
      setInd({ x: activo.offsetLeft, y: activo.offsetTop, w: activo.offsetWidth, h: activo.offsetHeight });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [valor, opciones.length]);

  function teclas(e: KeyboardEvent<HTMLDivElement>) {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const i = opciones.findIndex(o => o.id === valor);
    const n = e.key === "Home" ? 0 : e.key === "End" ? opciones.length - 1 : (Math.max(i, 0) + dir + opciones.length) % opciones.length;
    onCambio(opciones[n].id);
    requestAnimationFrame(() => caja.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[n]?.focus());
  }

  const estilo = ind ? { "--ind-x": `${ind.x}px`, "--ind-y": `${ind.y}px`, "--ind-w": `${ind.w}px`, "--ind-h": `${ind.h}px` } as CSSProperties : undefined;
  return (
    <div ref={caja} className={`ct-seg ${bloque ? "ct-seg--bloque" : ""} ${elevado ? "ct-seg--elevado" : ""} ${className}`} role="radiogroup" aria-label={etiqueta}
      data-medido={ind ? "" : undefined} style={estilo} onKeyDown={teclas}>
      <span className="ct-seg-ind" aria-hidden="true" />
      {opciones.map(o => {
        const activo = o.id === valor;
        return <button key={o.id} type="button" role="radio" aria-checked={activo} tabIndex={activo || (valor === null && o === opciones[0]) ? 0 : -1}
          aria-label={o.aria} onClick={() => onCambio(o.id)}>
          {o.icono && <Icon n={o.icono} s={18} />}<span>{o.label}</span>{o.cuenta !== undefined && <small>{o.cuenta}</small>}
        </button>;
      })}
    </div>
  );
}
