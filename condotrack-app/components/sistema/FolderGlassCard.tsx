"use client";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

/* useLayoutEffect en el servidor avisa y no hace nada: acá mide antes de
   pintar en el cliente y en el servidor queda como efecto común. */
const useMedida = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Contorno de carpeta: rectángulo arquitectónico con una solapa arriba a la
 *  izquierda que baja en una curva suave hacia el cuerpo. Radios fijos en
 *  px: el contorno se recalcula con el tamaño, nunca se estira. */
export function contornoCarpeta(w: number, h: number, pestana = 16, radio = 20, anchoPestana?: number, espejo = false) {
  const rt = 10;
  const tw = anchoPestana ?? Math.max(112, Math.min(w * 0.38, 210));
  const c = 24;
  const r = Math.min(radio, (h - pestana) / 2, w / 2);
  const p = pestana;
  /* Espejo: la solapa pasa a la derecha, del lado del riel que la abrió. */
  const x = (v: number) => +(espejo ? w - v : v).toFixed(2);
  return [
    `M${x(0)} ${rt}`, `Q${x(0)} 0 ${x(rt)} 0`, `L${x(tw - c)} 0`,
    `C${x(tw - c * 0.42)} 0 ${x(tw - c * 0.58)} ${p} ${x(tw)} ${p}`,
    `L${x(w - r)} ${p}`, `Q${x(w)} ${p} ${x(w)} ${p + r}`,
    `L${x(w)} ${h - r}`, `Q${x(w)} ${h} ${x(w - r)} ${h}`,
    `L${x(r)} ${h}`, `Q${x(0)} ${h} ${x(0)} ${h - r}`, "Z",
  ].join(" ");
}

type Props = HTMLAttributes<HTMLElement> & {
  /** Rótulo de la solapa: el nombre del módulo o su conteo. */
  pestana?: ReactNode;
  /** `denso` sube la opacidad para listas que se leen de corrido. */
  material?: "vidrio" | "denso" | "overlay";
  /** `der` pone la solapa a la derecha (panel que abre un riel derecho). */
  lado?: "izq" | "der";
  as?: "section" | "div" | "article" | "aside";
  children: ReactNode;
};

/** FolderGlassCard · la superficie firma de CondoTrack.
 *
 *  Vidrio real (translucidez + desenfoque del fondo + filo interno), con la
 *  silueta de carpeta. La sombra es un SVG hermano del cuerpo y no un
 *  filtro del contenedor: un filtro o una opacidad en un ancestro apagan el
 *  backdrop-filter del cuerpo. Por lo mismo, las animaciones de entrada
 *  mueven el contenedor (transform) y funden el cuerpo, nunca al revés. */
export const FolderGlassCard = forwardRef<HTMLElement, Props>(function FolderGlassCard(
  { pestana, material = "vidrio", lado = "izq", as: Tag = "section", className = "", children, style, ...resto }, ref) {
  const caja = useRef<HTMLElement | null>(null);
  const [m, setM] = useState<{ w: number; h: number } | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const alto = pestana ? 20 : 15;

  useMedida(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      setM(prev => prev && prev.w === w && prev.h === h ? prev : { w, h });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const d = m && m.w > 40 && m.h > 40 ? contornoCarpeta(m.w, m.h, alto, 20, undefined, lado === "der") : null;
  return (
    <Tag
      {...resto}
      ref={(el: HTMLElement | null) => { caja.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
      className={`ct-folder ${className}`}
      data-medido={d ? "" : undefined}
      data-material={material}
      data-lado={lado}
      style={{ ...style, "--pestana": `${alto}px` } as CSSProperties}
    >
      {d && m && <svg className="ct-folder-sombra" width={m.w} height={m.h} viewBox={`0 0 ${m.w} ${m.h}`} aria-hidden="true">
        <defs><filter id={`s${uid}`} x="-25%" y="-25%" width="150%" height="170%"><feGaussianBlur stdDeviation="16" /></filter></defs>
        <path d={d} transform="translate(0 12) scale(.97 .94)" style={{ transformOrigin: "50% 50%" }} filter={`url(#s${uid})`} />
      </svg>}
      <div className="ct-folder-cuerpo" style={d ? { clipPath: `path('${d}')` } : undefined}>
        {d && m && <svg className="ct-folder-filo" viewBox={`0 0 ${m.w} ${m.h}`} preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id={`f${uid}`} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" style={{ stopColor: "var(--glass-edge)" }} />
            <stop offset="0.45" style={{ stopColor: "var(--glass-edge)", stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: "var(--glass-edge-low)" }} />
          </linearGradient></defs>
          <path d={d} stroke={`url(#f${uid})`} />
        </svg>}
        {pestana && <span className="ct-folder-pestana">{pestana}</span>}
        <div className="ct-folder-contenido">{children}</div>
      </div>
    </Tag>
  );
});
