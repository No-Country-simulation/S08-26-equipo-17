"use client";
import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const useMedida = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Mide el elemento activo dentro de un contenedor y devuelve variables CSS
 *  para un indicador que se traslada (--ind-x/-y/-w/-h). Lo usan la
 *  navegación del header, el menú lateral de Administración y los
 *  segmentados: la selección se mueve de un lugar a otro, no aparece. */
export function useIndicador(caja: RefObject<HTMLElement>, selector: string, deps: unknown[]) {
  const [ind, setInd] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useMedida(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      const activo = el.querySelector<HTMLElement>(selector);
      setInd(activo ? { x: activo.offsetLeft, y: activo.offsetTop, w: activo.offsetWidth, h: activo.offsetHeight } : null);
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    /* un contenido que se pliega con transición mueve al activo sin cambiar
       el tamaño del contenedor: se vuelve a medir al terminar */
    const alTerminar = (e: TransitionEvent) => { if (e.propertyName === "height" || e.propertyName === "grid-template-rows") medir(); };
    el.addEventListener("transitionend", alTerminar);
    return () => { obs.disconnect(); el.removeEventListener("transitionend", alTerminar); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  const estilo = ind ? { "--ind-x": `${ind.x}px`, "--ind-y": `${ind.y}px`, "--ind-w": `${ind.w}px`, "--ind-h": `${ind.h}px` } as CSSProperties : undefined;
  return { medido: Boolean(ind), estilo };
}
