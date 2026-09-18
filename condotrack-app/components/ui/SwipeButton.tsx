"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/** Botón deslizable: arrastrás el pulgar y el amarillo va llenando la píldora.
 *  Si soltás antes del umbral vuelve solo. Con teclado (Enter/Espacio) o click
 *  simple también dispara, para no dejar afuera a nadie. */
export function SwipeButton({
  rotulo, pista = "", onConfirm,
}: { rotulo: string; pista?: string; onConfirm: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);          // 0 → 1
  const [soltando, setSoltando] = useState(false);
  const arrastre = useRef<{ x0: number; max: number } | null>(null);
  const listo = useRef(false);

  const recorrido = useCallback(() => {
    const el = ref.current;
    return el ? Math.max(1, el.offsetWidth - 64) : 1;   // 48 pulgar + 8+8 margen
  }, []);

  const confirmar = useCallback(() => {
    if (listo.current) return;
    listo.current = true;
    setSoltando(true);
    setP(1);
    window.setTimeout(onConfirm, 190);
  }, [onConfirm]);

  const mover = useCallback((clientX: number) => {
    const a = arrastre.current;
    if (!a) return;
    const v = Math.min(1, Math.max(0, (clientX - a.x0) / a.max));
    setP(v);
  }, []);

  const soltar = useCallback(() => {
    if (!arrastre.current) return;
    arrastre.current = null;
    setSoltando(true);
    setP((v) => {
      if (v >= 0.82) { confirmar(); return 1; }
      return 0;
    });
  }, [confirmar]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => mover(e.clientX);
    const onUp = () => soltar();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [mover, soltar]);

  const empezar = (clientX: number) => {
    if (listo.current) return;
    setSoltando(false);
    arrastre.current = { x0: clientX, max: recorrido() };
  };

  return (
    <div
      ref={ref}
      className={"swipe" + (soltando ? " suelta" : "")}
      data-avance={p > 0.55 ? "1" : "0"}
      style={{ "--p": p, "--x": `${p * recorrido()}px` } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`${rotulo}. Deslizá hacia la derecha o presioná Enter.`}
      onPointerDown={(e) => empezar(e.clientX)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); confirmar(); }
      }}
      onClick={(e) => {
        // click simple sin arrastre: también avanza
        if (!arrastre.current && p === 0 && e.detail > 0) confirmar();
      }}
    >
      <span className="relleno" aria-hidden="true" />
      <span className="rotulo">{rotulo}</span>
      {pista ? <span className="pista" aria-hidden="true">{pista}</span> : null}
      <span className="pulgar" aria-hidden="true"><Icon n="flechaDer" s={19} w={2.2} color="#111614" /></span>
    </div>
  );
}
