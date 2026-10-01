"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSinMovimiento } from "@/lib/movimiento";
import { FinLista } from "./FinLista";

/** En tu edificio · el mazo (v04 · A1, pulido v05).
 *
 *  v04 dejó el mazo sin huecos: la escena entera (el campo + el mazo) queda
 *  trabada con `position: sticky` mientras se reparten las cards, así la
 *  pantalla está siempre llena. v05 · Felipe: "más smooth, más continuo,
 *  más laminar, una card pasando por encima de la otra suavemente".
 *
 *  · El movimiento es continuo: sigue al scroll (que ya llega suavizado por
 *    ScrollSuave, lerp 0,1); no hay saltos de a una card ni imanes.
 *  · La siguiente asoma abajo (un filo) y SUBE POR ENCIMA de la dominante,
 *    que se va hacia atrás: se achica un poco, se apaga y queda laminada
 *    arriba como un filo. Las anteriores forman la pila de filos.
 *  · Para que no se sienta que la página "secuestra" el scroll, el campo de
 *    arriba acompaña con un parallax leve y un indicador dice en qué card
 *    vas (sección trabada a la vista, no un scroll muerto).
 *
 *  Con movimiento reducido: lista quieta, cards enteras, scroll nativo. */

export type Viva = { id: string; nodo: ReactNode; rotulo?: string };

const PASO = 170;        // scroll que consume cada card
const FILO_ARRIBA = 10;  // lo que asoma cada card de atrás, arriba
const FILO_ABAJO = 14;   // lo que asoma la siguiente, abajo
const SEPARA = 6;        // aire entre la dominante y la que asoma abajo
const ACHICA = 0.045;    // escala que pierde cada nivel de la pila

/* suave en los extremos: la card arranca y llega sin golpe */
const suave = (t: number) => t * t * (3 - 2 * t);

export function PilaVivas({
  items,
  etiqueta,
  titulo,
  arriba,
}: {
  items: Viva[];
  etiqueta: string;
  titulo?: string;
  /** Lo que va arriba del mazo y queda trabado con él (el campo del Inicio). */
  arriba?: ReactNode;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const quieto = useSinMovimiento();
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const m = marco.current;
    const scroller = m?.closest(".vista") as HTMLElement | null;
    const escena = m?.querySelector<HTMLElement>(".pila-escena");
    const recorrido = m?.querySelector<HTMLElement>(".pila-recorrido");
    const pila = m?.querySelector<HTMLElement>(".pila");
    const primero = escena?.firstElementChild as HTMLElement | null;
    const campo = primero && !primero.classList.contains("pila-grupo") ? primero : null;
    const resto = m?.parentElement?.querySelector<HTMLElement>(".pila-resto");
    if (!m || !scroller || !escena || !recorrido || !pila) return;
    const cards = Array.from(m.querySelectorAll<HTMLElement>(".pila-c"));
    const n = cards.length;
    const limpiar = () => {
      m.classList.remove("mazo");
      escena.style.removeProperty("top");
      recorrido.style.removeProperty("height");
      pila.style.removeProperty("height");
      resto?.style.removeProperty("min-height");
      campo?.style.removeProperty("transform");
      campo?.style.removeProperty("opacity");
      cards.forEach((c) => {
        ["transform", "opacity", "z-index", "visibility", "--velo", "top"].forEach((p) => c.style.removeProperty(p));
        c.removeAttribute("data-frente");
      });
    };
    if (quieto || n < 2) { limpiar(); return; }

    let inicio = 0;   // scroll en el que la escena se traba
    let alto = 0;     // alto de una card
    let pedido = 0;
    let ultimo = -1;

    const pintar = () => {
      pedido = 0;
      const p = Math.max(0, Math.min(n - 1, (scroller.scrollTop - inicio) / PASO));
      const reposo = alto + SEPARA;   // dónde espera la siguiente (asoma abajo)
      cards.forEach((c, i) => {
        const e = i - p;              // ≤ 0: ya llegó · 0..1: subiendo · > 1: espera
        let y = 0, s = 1, o = 1, velo = 0;
        if (e <= 0) {
          /* en la pila: la de adelante entera; las de atrás, filos arriba */
          const k = Math.min(-e, 3);
          y = -FILO_ARRIBA * k;
          s = 1 - ACHICA * k;
          velo = Math.min(1, k) * 0.5 + Math.max(0, k - 1) * 0.12;
          o = -e > 3.2 ? 0 : 1;
        } else if (e < 1) {
          /* la que sube por encima de la dominante */
          y = reposo * suave(e);
        } else {
          /* la que espera: más abajo, fuera del recorte */
          y = reposo + (e - 1) * (FILO_ABAJO + SEPARA + 8);
          o = e > 2 ? 0 : 1;
        }
        c.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${s.toFixed(4)})`;
        c.style.opacity = o.toFixed(3);
        c.style.zIndex = String(i + 1);
        c.style.setProperty("--velo", velo.toFixed(3));
        c.style.visibility = o < 0.01 ? "hidden" : "";
        c.toggleAttribute("data-frente", Math.abs(e) < 0.5);
      });
      /* el campo acompaña: un parallax leve mientras se reparte el mazo */
      if (campo) {
        const t = p / Math.max(1, n - 1);
        campo.style.transform = `translate3d(0,${(-14 * t).toFixed(2)}px,0)`;
        campo.style.opacity = (1 - 0.1 * t).toFixed(3);
      }
      const k = Math.round(p);
      if (k !== ultimo) { ultimo = k; setActual(k); }
    };

    const medir = () => {
      m.classList.add("mazo");
      resto?.style.removeProperty("min-height");
      alto = cards[0].offsetHeight;
      cards.forEach((c) => { c.style.top = `${FILO_ARRIBA * 3}px`; });
      /* la pila: filos arriba + la card + el aire + el filo de la que espera */
      pila.style.height = `${FILO_ARRIBA * 3 + alto + SEPARA + FILO_ABAJO}px`;
      recorrido.style.height = `${PASO * (n - 1)}px`;
      /* la escena se traba cuando su borde de abajo llega al borde útil de
         la pantalla (arriba de la barra); si entra entera, desde el inicio */
      escena.style.removeProperty("top");
      const rs = scroller.getBoundingClientRect();
      const y0 = m.getBoundingClientRect().top - rs.top + scroller.scrollTop;
      const util = scroller.clientHeight - (parseFloat(getComputedStyle(scroller).paddingBottom) || 0) + 8;
      const top = Math.min(y0, util - escena.offsetHeight);
      escena.style.top = `${Math.round(top)}px`;
      inicio = Math.max(0, y0 - top);
      m.dataset.inicio = String(Math.round(inicio));
      const falta = inicio + PASO * (n - 1) + 1 - (scroller.scrollHeight - scroller.clientHeight);
      if (resto && falta > 0) resto.style.minHeight = `${Math.ceil(resto.offsetHeight + falta)}px`;
      ultimo = -1;
      pintar();
    };

    /* con el teclado: la card que recibe el foco pasa adelante */
    const alFoco = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (i < 0) return;
      scroller.scrollTo({ top: inicio + i * PASO, behavior: "smooth" });
    };

    const alScroll = () => { if (!pedido) pedido = requestAnimationFrame(pintar); };
    medir();
    scroller.addEventListener("scroll", alScroll, { passive: true });
    m.addEventListener("focusin", alFoco);
    const obs = new ResizeObserver(() => medir());
    obs.observe(scroller);
    obs.observe(escena);
    return () => {
      scroller.removeEventListener("scroll", alScroll);
      m.removeEventListener("focusin", alFoco);
      obs.disconnect();
      if (pedido) cancelAnimationFrame(pedido);
      limpiar();
    };
  }, [items.length, quieto]);

  if (items.length === 0) return <>{arriba}</>;

  return (
    <>
      <div className="pila-marco" ref={marco}>
        <div className="pila-escena">
          {arriba}
          <div className="pila-grupo">
            {titulo && <div className="pila-cab">
              <h2 className="sec">{titulo}</h2>
              {/* en qué card vas: la sección trabada se lee como tal */}
              {!quieto && items.length > 1 && <span className="pila-pasos" aria-hidden="true">
                {items.map((it, i) => <i key={it.id} data-on={i === actual || undefined} />)}
              </span>}
            </div>}
            <div className="pila" role="group" aria-label={etiqueta}>
              {items.map((it, i) => (
                <div key={it.id} className="pila-c" style={{ "--i": i } as CSSProperties}>
                  <div className="pila-cnt">{it.nodo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* el scroll que consume el mazo mientras la escena está trabada */}
        <div className="pila-recorrido" aria-hidden="true" />
      </div>
      {/* el cierre de la lista: llega normal, después del mazo */}
      <div className="pila-resto"><div className="pila-cierre"><FinLista texto="Todo en orden" /></div></div>
    </>
  );
}
