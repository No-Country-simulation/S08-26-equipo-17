"use client";
import { useEffect } from "react";
import { sinMovimiento } from "@/lib/movimiento";

/** Scroll suave de toda la app (v05 · "el scroll sigue tosco… algo como en
 *  Framer"). Como Lenis: la rueda del mouse no salta, fija un objetivo y el
 *  contenedor lo persigue con lerp 0,1. El scroll sigue siendo el nativo:
 *  el dedo, el teclado y la barra no se tocan; los paneles internos que
 *  todavía pueden scrollear se respetan, y un riel horizontal que ya usó la
 *  rueda (preventDefault) también.
 *
 *  Además publica `--sy` (el scroll en px, sin unidad) en cada contenedor,
 *  para los parallax sutiles del CSS. Con movimiento reducido: nativo. */

const CONTENEDORES = ".vista, .desk-main, .ad-main";
const LERP = 0.1;

type Estado = { objetivo: number; puesto: number; raf: number };
const estados = new WeakMap<HTMLElement, Estado>();

function puedeScrollear(el: HTMLElement, dy: number) {
  const oy = getComputedStyle(el).overflowY;
  if (oy !== "auto" && oy !== "scroll") return false;
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  return dy < 0 ? el.scrollTop > 0 : el.scrollTop < el.scrollHeight - el.clientHeight - 1;
}

export function ScrollSuave() {
  useEffect(() => {
    const alRueda = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || sinMovimiento()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const blanco = e.target as HTMLElement | null;
      const cont = blanco?.closest?.(CONTENEDORES) as HTMLElement | null;
      if (!cont) return;
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * cont.clientHeight : e.deltaY;
      if (!d) return;
      /* un panel interno que todavía puede moverse se lleva la rueda */
      for (let el = blanco; el && el !== cont; el = el.parentElement) {
        if (puedeScrollear(el, d)) return;
      }
      const max = cont.scrollHeight - cont.clientHeight;
      if (max <= 0) return;
      e.preventDefault();
      let s = estados.get(cont);
      if (!s || !s.raf) {
        s = { objetivo: cont.scrollTop, puesto: cont.scrollTop, raf: 0 };
        estados.set(cont, s);
      }
      s.objetivo = Math.max(0, Math.min(max, s.objetivo + d));
      const est = s;
      const paso = () => {
        /* si algo movió el scroll por otro lado (barra, teclado, un
           scrollTo), se suelta y no se pelea con eso */
        if (Math.abs(cont.scrollTop - est.puesto) > 3) { est.raf = 0; return; }
        const sig = est.puesto + (est.objetivo - est.puesto) * LERP;
        est.puesto = Math.abs(est.objetivo - sig) < 0.5 ? est.objetivo : sig;
        cont.scrollTo({ top: est.puesto, behavior: "instant" as ScrollBehavior });
        est.raf = est.puesto === est.objetivo ? 0 : requestAnimationFrame(paso);
      };
      if (!est.raf) est.raf = requestAnimationFrame(paso);
    };
    /* --sy para los parallax (sólo si el contenedor lo pide) */
    let pedido = 0;
    const pendientes = new Set<HTMLElement>();
    const alScroll = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!(el instanceof HTMLElement) || !el.matches(CONTENEDORES)) return;
      pendientes.add(el);
      if (!pedido) pedido = requestAnimationFrame(() => {
        pedido = 0;
        pendientes.forEach((c) => c.style.setProperty("--sy", String(Math.round(c.scrollTop))));
        pendientes.clear();
      });
    };
    window.addEventListener("wheel", alRueda, { passive: false });
    document.addEventListener("scroll", alScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("wheel", alRueda);
      document.removeEventListener("scroll", alScroll, { capture: true } as EventListenerOptions);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);
  return null;
}
