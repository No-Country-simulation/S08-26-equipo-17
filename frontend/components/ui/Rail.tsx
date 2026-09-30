"use client";
import { useRef, type ReactNode } from "react";

/** Rail horizontal: se arrastra con el dedo y también con el mouse.
 *
 *  El gesto se toma recién a los 8 px, así un toque sigue eligiendo lo que
 *  tocaste y no se come el click. Se usa para el rail de fechas y para el
 *  de espacios: un solo comportamiento para todo lo que se recorre de
 *  costado. */
export function Rail({
  className = "", etiqueta, rol, children,
}: { className?: string; etiqueta?: string; rol?: string; children: ReactNode }) {
  const gesto = useRef<{ x: number; scroll: number; activo: boolean } | null>(null);
  const arrastro = useRef(false);

  return (
    <div
      className={"rail " + className}
      role={rol}
      aria-label={etiqueta}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") return;      // el touch ya scrollea solo
        gesto.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft, activo: false };
        arrastro.current = false;
      }}
      onPointerMove={(e) => {
        const g = gesto.current;
        if (!g) return;
        const dx = e.clientX - g.x;
        if (!g.activo) {
          if (Math.abs(dx) < 8) return;
          g.activo = true;
          arrastro.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        e.currentTarget.scrollLeft = g.scroll - dx;
      }}
      onPointerUp={(e) => {
        const g = gesto.current;
        gesto.current = null;
        if (g?.activo && e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => { gesto.current = null; }}
      onClickCapture={(e) => {
        if (arrastro.current) { e.preventDefault(); e.stopPropagation(); arrastro.current = false; }
      }}
    >
      {children}
    </div>
  );
}
