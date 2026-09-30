"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { sinMovimiento } from "@/lib/movimiento";

/** En tu edificio · pila vertical gobernada por el scroll.
 *
 *  El home se recorre para abajo: cada card queda pegada arriba y la
 *  siguiente la va tapando. Mientras la tapa, la de atrás se achica y se
 *  apaga —eso es lo que hace que se lea como una pila y no como una
 *  lista—. El apilado lo hace `position:sticky`; la profundidad, una
 *  variable por card que se recalcula en el scroll. Sin gesto
 *  horizontal, sin puntos y sin "1 de 4": cada card abre su destino al
 *  tocarla. */

export type Viva = { id: string; nodo: ReactNode; rotulo?: string };

export function PilaVivas({
  items,
  etiqueta,
  titulo,
}: {
  items: Viva[];
  etiqueta: string;
  titulo?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cont = caja.current;
    const scroller = cont?.closest(".vista") as HTMLElement | null;
    if (!cont || !scroller) return;
    let pedido = 0;

    const pintar = () => {
      pedido = 0;
      const quieto = sinMovimiento();
      const cards = Array.from(cont.querySelectorAll<HTMLElement>(".pila-c"));
      cards.forEach((c, i) => {
        const sig = cards[i + 1];
        let tapada = 0;
        if (sig && !quieto) {
          const r = c.getBoundingClientRect();
          const rs = sig.getBoundingClientRect();
          /* cuánto de esta card se comió la siguiente, de 0 a 1 */
          tapada = Math.min(1, Math.max(0, (r.bottom - rs.top) / (r.height || 1)));
        }
        c.style.setProperty("--tapada", tapada.toFixed(3));
      });
    };

    const alScroll = () => { if (!pedido) pedido = requestAnimationFrame(pintar); };
    pintar();
    scroller.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      scroller.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <>
      {titulo && <div className="pila-cab"><h2 className="sec">{titulo}</h2></div>}
      <div className="pila" role="group" aria-label={etiqueta} ref={caja}>
        {items.map((it, i) => (
          <div key={it.id} className="pila-c" style={{ "--i": i } as CSSProperties}>
            <div className="pila-cnt">{it.nodo}</div>
          </div>
        ))}
      </div>
    </>
  );
}
