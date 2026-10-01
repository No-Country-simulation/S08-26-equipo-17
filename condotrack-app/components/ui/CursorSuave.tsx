"use client";
import { useEffect, useRef, type RefObject } from "react";
import { sinMovimiento } from "@/lib/movimiento";

/** SYS-MOTION-INPUT-001 · cursor que se desliza al escribir.
 *
 *  Fuente: `condotrack-motion-lab/components/ui/skiper-ui/skiper106.tsx`
 *  (SmoothInput), el único candidato de input del laboratorio. Allá usa
 *  Framer Motion (`useSpring` con stiffness 500, damping 30, mass 0.5) y
 *  DialKit; acá se reimplementa el mismo resorte con requestAnimationFrame
 *  para no sumar dependencias. El cursor nativo se oculta (caret-color:
 *  transparent) y una barra de 2 px sigue la posición real de inserción:
 *  se mide el texto antes del cursor con un span invisible del mismo
 *  estilo. Con selección el cursor se oculta, igual que en el original.
 *  Con movimiento reducido salta al lugar sin resorte. */
const RIGIDEZ = 500, AMORTIGUACION = 30, MASA = 0.5;
const PUNTO = "•";

export function CursorSuave({ input }: { input: RefObject<HTMLInputElement> }) {
  const barra = useRef<HTMLSpanElement>(null);
  const medida = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = input.current, c = barra.current, m = medida.current;
    if (!el || !c || !m) return;
    let x = 0, v = 0, objetivo = 0, raf = 0, ultimo = 0, primera = true;

    const pintar = () => { c.style.transform = `translate3d(${x.toFixed(2)}px,-50%,0)`; };
    const paso = (t: number) => {
      const dt = Math.min(0.032, (t - (ultimo || t)) / 1000 || 0.016);
      ultimo = t;
      const fuerza = -RIGIDEZ * (x - objetivo) - AMORTIGUACION * v;
      v += (fuerza / MASA) * dt;
      x += v * dt;
      pintar();
      if (Math.abs(x - objetivo) > 0.1 || Math.abs(v) > 0.1) raf = requestAnimationFrame(paso);
      else { x = objetivo; v = 0; pintar(); raf = 0; ultimo = 0; }
    };

    const medir = () => {
      const cs = getComputedStyle(el);
      m.style.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      m.style.letterSpacing = cs.letterSpacing;
      /* Si el tipo de input no expone la selección, el cursor va al final. */
      const ini = el.selectionStart ?? el.value.length, fin = el.selectionEnd ?? el.value.length;
      const i = el.selectionDirection === "backward" ? ini : fin;
      const antes = el.type === "password" ? PUNTO.repeat(i) : el.value.slice(0, i);
      m.textContent = antes;
      const ancho = antes ? m.getBoundingClientRect().width : 0;
      const pl = parseFloat(cs.paddingLeft) || 0;
      const destino = el.offsetLeft + pl + ancho - el.scrollLeft;
      const max = el.offsetLeft + el.clientWidth - (parseFloat(cs.paddingRight) || 0);
      objetivo = Math.min(destino, max);
      const activo = document.activeElement === el && ini === fin;
      c.style.opacity = activo ? "1" : "0";
      if (primera || sinMovimiento() || !activo) {
        x = objetivo; v = 0; primera = false; pintar();
        if (raf) { cancelAnimationFrame(raf); raf = 0; ultimo = 0; }
        return;
      }
      if (!raf) raf = requestAnimationFrame(paso);
    };
    const pronto = () => requestAnimationFrame(medir);
    const alCambiarSeleccion = () => { if (document.activeElement === el) pronto(); };

    const alFoco = () => { primera = true; pronto(); };
    el.addEventListener("input", pronto);
    el.addEventListener("focus", alFoco);
    el.addEventListener("blur", medir);
    el.addEventListener("keyup", pronto);
    el.addEventListener("pointerup", pronto);
    el.addEventListener("scroll", pronto);
    document.addEventListener("selectionchange", alCambiarSeleccion);
    void document.fonts?.ready.then(medir);
    medir();
    return () => {
      el.removeEventListener("input", pronto);
      el.removeEventListener("focus", alFoco);
      el.removeEventListener("blur", medir);
      el.removeEventListener("keyup", pronto);
      el.removeEventListener("pointerup", pronto);
      el.removeEventListener("scroll", pronto);
      document.removeEventListener("selectionchange", alCambiarSeleccion);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [input]);

  return (
    <>
      <span ref={medida} className="cursor-medida" aria-hidden="true" />
      <span ref={barra} className="cursor-suave" aria-hidden="true" />
    </>
  );
}
