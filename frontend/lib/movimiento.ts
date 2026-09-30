"use client";
import { useEffect, useState } from "react";

/** ¿Hay que quedarse quieto? Sí si el sistema pide reducir el movimiento,
 *  salvo que la URL traiga motionforce=1 (demo). El CSS sigue la misma
 *  regla con :root:not([data-movimiento="forzado"]). */
export function sinMovimiento() {
  if (typeof window === "undefined") return false;
  if (document.documentElement.dataset.movimiento === "forzado") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSinMovimiento() {
  const [quieto, setQuieto] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setQuieto(sinMovimiento());
    leer();
    mq.addEventListener("change", leer);
    const obs = new MutationObserver(leer);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-movimiento"] });
    return () => { mq.removeEventListener("change", leer); obs.disconnect(); };
  }, []);
  return quieto;
}
