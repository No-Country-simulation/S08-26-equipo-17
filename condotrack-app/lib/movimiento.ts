"use client";
import { useEffect, useState } from "react";

/** ¿Hay que quedarse quieto? Tres modos, una sola regla para los tres roles:
 *   · ?motionreduce=0 → <html data-movimiento="forzado">: movimiento normal
 *     aunque el sistema pida reducirlo (QA y demo);
 *   · ?motionreduce=1 → <html data-movimiento="reducido">: reducido aunque
 *     el sistema no lo pida (QA);
 *   · sin parámetro → manda prefers-reduced-motion del sistema.
 *  El CSS sigue exactamente la misma regla (globals.css + sistema.css). */
export function sinMovimiento() {
  if (typeof window === "undefined") return false;
  const modo = document.documentElement.dataset.movimiento;
  if (modo === "forzado") return false;
  if (modo === "reducido") return true;
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

/** Modo pedido por URL. `null` = respetar el sistema. motionforce=1 se
 *  acepta por compatibilidad con enlaces anteriores. */
export function modoDeUrl(q: URLSearchParams): "forzado" | "reducido" | null {
  const r = q.get("motionreduce");
  if (r === "1") return "reducido";
  if (r === "0" || q.get("motionforce") === "1") return "forzado";
  return null;
}

/** SYS-MOTION-THEME-001 · cambio de tema con un fundido de la página entera
 *  (View Transitions): superficies, texto y cards pasan juntos del claro al
 *  oscuro, sin destello ni rebote. Con movimiento reducido, o si el
 *  navegador no lo soporta, el cambio es instantáneo. */
export function cambiarTema(aplicar: () => void) {
  const doc = typeof document !== "undefined" ? (document as Document & { startViewTransition?: (cb: () => void) => unknown }) : null;
  if (!doc?.startViewTransition || sinMovimiento()) { aplicar(); return; }
  document.documentElement.classList.add("tema-cambia");
  const t = doc.startViewTransition(aplicar) as { finished?: Promise<void> } | undefined;
  t?.finished?.finally(() => document.documentElement.classList.remove("tema-cambia"));
}
