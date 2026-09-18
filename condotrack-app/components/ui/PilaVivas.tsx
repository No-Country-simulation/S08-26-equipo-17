"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Pila de live cards (D-09).
 *
 *  Apilan SOLO objetos equivalentes: visitas de hoy, próxima reserva,
 *  paquete para retirar, estado del edificio. No apilan nunca expensas,
 *  botones, contactos ni categorías distintas — apilar cosas que no son
 *  de la misma familia es lo que hacía que la pantalla pareciera un
 *  template.
 *
 *  La card de abajo asoma 20–30 px y no hay que presionar para
 *  seleccionar. La pila se mueve sola (05 · motion): la relación entre
 *  objetos equivalentes es justamente lo que la animación explica. Se
 *  frena cuando el puntero está encima o cuando hay foco adentro, así el
 *  movimiento nunca te saca una card de abajo del dedo. */

export type Viva = { id: string; nodo: ReactNode };

const DESPLAZAMIENTO = 13;   // px que baja cada capa
const ESCALA = 0.035;        // cuánto se angosta cada capa

export function PilaVivas({
  items,
  etiqueta,
  intervalo = 5600,
}: {
  items: Viva[];
  etiqueta: string;
  intervalo?: number;
}) {
  const [n, setN] = useState(0);
  const [quieta, setQuieta] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  /* prefers-reduced-motion apaga el giro solo: es decorativo. Lo que no se
     apaga es poder tocar una card de atrás para traerla adelante. */
  const [sinMovimiento, setSinMovimiento] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setSinMovimiento(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  useEffect(() => {
    if (items.length < 2 || quieta || sinMovimiento) return;
    const t = window.setTimeout(() => setN((x) => (x + 1) % items.length), intervalo);
    return () => window.clearTimeout(t);
  }, [n, quieta, sinMovimiento, items.length, intervalo]);

  /* Las capas de atrás no se tabulan: son la misma información en espera,
     no controles nuevos. El inert va en el contenido, no en la capa: si no,
     también apagaría el botón que la trae adelante. */
  useEffect(() => {
    const contenidos = caja.current?.querySelectorAll(".pila-cnt");
    contenidos?.forEach((nodo) => {
      const el = nodo as HTMLElement & { inert: boolean };
      const atras = el.parentElement?.dataset.pos !== "0";
      el.inert = atras;
      if (atras) el.setAttribute("aria-hidden", "true");
      else el.removeAttribute("aria-hidden");
    });
  }, [n, items.length]);

  if (items.length === 0) return null;
  if (items.length === 1) return <div className="pila una">{items[0].nodo}</div>;

  return (
    <div
      className="pila"
      role="group"
      aria-label={etiqueta}
      ref={caja}
      onPointerEnter={() => setQuieta(true)}
      onPointerLeave={() => setQuieta(false)}
      onFocusCapture={() => setQuieta(true)}
      onBlurCapture={() => setQuieta(false)}
    >
      {items.map((it, i) => {
        const pos = (i - n + items.length) % items.length;
        return (
          <div
            key={it.id}
            className="pila-c"
            data-pos={pos}
            style={{
              zIndex: items.length - pos,
              transform:
                "translateY(" + pos * DESPLAZAMIENTO + "px) scaleX(" +
                (1 - pos * ESCALA).toFixed(3) + ")",
              opacity: pos > 2 ? 0 : 1,
            }}
          >
            <div className="pila-cnt">{it.nodo}</div>
            {pos > 0 && (
              <button
                className="pila-traer"
                type="button"
                onClick={() => setN(i)}
                aria-label={"Traer adelante la tarjeta " + (pos + 1) + " de " + items.length}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
