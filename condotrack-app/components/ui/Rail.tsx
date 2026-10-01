"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Rail horizontal: se arrastra con el dedo y también con el mouse.
 *
 *  El gesto se toma recién a los 8 px, así un toque sigue eligiendo lo que
 *  tocaste y no se come el click. Se usa para el rail de fechas y para el
 *  de espacios: un solo comportamiento para todo lo que se recorre de
 *  costado. */
export function Rail({
  className = "", etiqueta, rol, children,
}: { className?: string; etiqueta?: string; rol?: string; children: ReactNode }) {
  /* La rueda: React registra onWheel como pasivo, así que el scroll vertical
     de la página se frena en un listener nativo, sólo cuando el riel lo
     consume. */
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const al = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY) || el.scrollWidth <= el.clientWidth) return;
      const alInicio = el.scrollLeft <= 0, alFinal = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if ((e.deltaY < 0 && alInicio) || (e.deltaY > 0 && alFinal)) return;
      e.preventDefault();
    };
    el.addEventListener("wheel", al, { passive: false });
    return () => el.removeEventListener("wheel", al);
  }, []);
  const gesto = useRef<{ x: number; scroll: number; activo: boolean } | null>(null);
  const arrastro = useRef(false);

  return (
    <div
      ref={caja}
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
      /* RES-R05-01 · la rueda del mouse también recorre el riel: un giro
         vertical se traduce a horizontal mientras quede riel para ese lado
         (en los extremos la página sigue scrolleando). El trackpad y el
         dedo ya mueven el riel de costado solos. */
      onWheel={(e) => {
        const el = e.currentTarget;
        if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY) || el.scrollWidth <= el.clientWidth) return;
        const alInicio = el.scrollLeft <= 0, alFinal = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
        if ((e.deltaY < 0 && alInicio) || (e.deltaY > 0 && alFinal)) return;
        el.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }}
      onClickCapture={(e) => {
        if (arrastro.current) { e.preventDefault(); e.stopPropagation(); arrastro.current = false; }
      }}
    >
      {children}
    </div>
  );
}
