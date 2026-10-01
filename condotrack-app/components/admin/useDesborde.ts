"use client";
import { useEffect, useState, type RefObject } from "react";

/** MOT-005 · ¿Hay contenido fuera de la región? Devuelve hacia dónde:
 *  "abajo", "arriba", "ambos" o null. El fundido de borde se pinta sólo
 *  cuando hay algo escondido de ese lado y desaparece al llegar al extremo,
 *  así nunca tapa la última fila ni su acción. */
export function useDesborde(ref: RefObject<HTMLElement>, deps: unknown[] = []) {
  const [lado, setLado] = useState<"abajo" | "arriba" | "ambos" | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      const arriba = el.scrollTop > 4;
      const abajo = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
      setLado(arriba && abajo ? "ambos" : abajo ? "abajo" : arriba ? "arriba" : null);
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    if (el.firstElementChild) obs.observe(el.firstElementChild);
    return () => { el.removeEventListener("scroll", medir); obs.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return lado;
}
