"use client";
import {
  useCallback, useEffect, useRef, useState, type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/** Hoja: panel que sube desde abajo.
 *
 *  Existe para que deje de haber pantallas enteras donde alcanza un panel:
 *  medios de pago, informar un pago, el detalle de un rubro, elegir
 *  período, confirmar una reserva, el detalle de una entrega. Menos
 *  pantallas, menos navegación, menos vuelta.
 *
 *  Sin librerías. Hace lo que tiene que hacer una hoja:
 *   · bloquea el scroll del fondo mientras está abierta
 *   · cierra con Escape, tocando afuera o arrastrando hacia abajo
 *   · atrapa el foco adentro y lo devuelve al salir
 *   · anima la entrada y la salida
 *   · respeta prefers-reduced-motion */

const SALIDA = 220;         // ms de la animación de salida
const UMBRAL = 96;          // px de arrastre para que cierre

export function Hoja({
  titulo, texto, confirmar, onConfirmar, onCancelar, peligro, children,
  cerrarRotulo = "Cancelar", sinAcciones = false, alto,
}: {
  titulo: string;
  texto?: string;
  confirmar?: string;
  onConfirmar?: () => void;
  onCancelar: () => void;
  peligro?: boolean;
  children?: ReactNode;
  cerrarRotulo?: string;
  /** Para hojas que sólo muestran información y se cierran solas. */
  sinAcciones?: boolean;
  /** "alta" cuando el contenido es largo y conviene ocupar casi todo. */
  alto?: "auto" | "alta";
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  /* La hoja se dibuja en el marco de la pantalla, no adentro de la vista.
     Si cuelga de la vista —que es la que scrollea— el velo se posiciona
     contra el contenido scrolleado: con la pantalla bajada, la hoja
     aparecía a mitad de camino y el velo tapaba media pantalla. */
  const [marco, setMarco] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setMarco((document.querySelector(".device") as HTMLElement) ?? document.body);
  }, []);
  const [cerrando, setCerrando] = useState(false);
  const [arrastre, setArrastre] = useState(0);
  const inicio = useRef<number | null>(null);
  const relojes = useRef<number[]>([]);

  /* cerrar y confirmarYCerrar tienen que ser ESTABLES (lock V02, A2).
     Antes dependían de `cerrando` y de los callbacks del padre: al empezar
     a cerrar cambiaban de identidad, el efecto del foco se re-ejecutaba y
     su limpieza borraba el temporizador que desmonta la hoja. Resultado:
     la hoja se veía cerrada pero el velo invisible quedaba encima de la
     pantalla comiéndose los toques. "Se traba" era esto. Los callbacks se
     leen de refs y el estado de cierre también. */
  const alCancelar = useRef(onCancelar);
  alCancelar.current = onCancelar;
  const alConfirmar = useRef(onConfirmar);
  alConfirmar.current = onConfirmar;
  const yaCerrando = useRef(false);

  const cerrar = useCallback(() => {
    if (yaCerrando.current) return;
    yaCerrando.current = true;
    setCerrando(true);
    relojes.current.push(window.setTimeout(() => alCancelar.current(), SALIDA));
  }, []);

  const confirmarYCerrar = useCallback(() => {
    if (yaCerrando.current || !alConfirmar.current) return;
    yaCerrando.current = true;
    setCerrando(true);
    relojes.current.push(window.setTimeout(() => alConfirmar.current?.(), SALIDA));
  }, []);

  /* Bloqueo del scroll del fondo. El contenedor que scrollea no es el body
     sino la vista o el cuerpo del escritorio, así que se busca el que
     corresponda en vez de asumirlo. */
  useEffect(() => {
    const fondo = document.querySelector<HTMLElement>(".vista, .desk-cuerpo");
    const antes = fondo?.style.overflow ?? "";
    if (fondo) fondo.style.overflow = "hidden";
    return () => { if (fondo) fondo.style.overflow = antes; };
  }, []);

  /* Foco: entra al primer control y vuelve al que lo abrió. */
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const primero = caja.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    primero?.focus();

    const onTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); cerrar(); return; }
      if (e.key !== "Tab" || !caja.current) return;
      const foco = caja.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!foco.length) return;
      const a = foco[0], z = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onTecla);
    const t = relojes.current;
    return () => {
      document.removeEventListener("keydown", onTecla);
      t.forEach((x) => window.clearTimeout(x));
      previo?.focus?.();
    };
  }, [cerrar]);

  /* Arrastre hacia abajo. Sólo desde el agarre y la cabecera: si tomara
     toda la hoja, no se podría scrollear su contenido. */
  /* La captura del puntero se toma recién cuando el gesto baja más de
     8 px. Si se tomaba al apoyar el dedo, el click posterior quedaba
     redirigido a la zona de arrastre y la X de cerrar —que vive adentro—
     nunca se enteraba: la hoja no cerraba con la X. Mismo bug que BUG-01
     en el calendario, con la misma solución. */
  const capturado = useRef(false);
  function tomar(e: React.PointerEvent) {
    inicio.current = e.clientY;
    capturado.current = false;
  }
  function mover(e: React.PointerEvent) {
    if (inicio.current == null) return;
    const dy = e.clientY - inicio.current;
    if (!capturado.current) {
      if (dy < 8) return;
      capturado.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setArrastre(Math.max(0, dy));
  }
  function soltar(e: React.PointerEvent) {
    if (inicio.current == null) return;
    inicio.current = null;
    const el = e.currentTarget as HTMLElement;
    if (capturado.current && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    capturado.current = false;
    if (arrastre >= UMBRAL) { setArrastre(0); cerrar(); }
    else setArrastre(0);
  }

  if (!marco) return null;

  return createPortal(
    <div className={"velo" + (cerrando ? " sale" : "")}
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div
        className={"hoja" + (cerrando ? " sale" : "") + (alto === "alta" ? " alta" : "")}
        role="dialog" aria-modal="true" aria-label={titulo} ref={caja}
        style={arrastre ? { transform: `translateY(${arrastre}px)`, transition: "none" } : undefined}
      >
        <div className="tirador" onPointerDown={tomar} onPointerMove={mover}
          onPointerUp={soltar} onPointerCancel={soltar}>
          <span className="agarre" aria-hidden="true" />
          <div className="hoja-cab">
            <h2>{titulo}</h2>
            <button className="circulo cerrar" type="button" onClick={cerrar} aria-label="Cerrar">
              <span className="cruz" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="hoja-cuerpo">
          {texto && <p className="hoja-txt">{texto}</p>}
          {children}
        </div>

        {!sinAcciones && (
          <div className="hoja-acciones">
            {confirmar && onConfirmar && (
              <button className={"entrar" + (peligro ? " peligro" : "")} type="button"
                onClick={confirmarYCerrar}>
                {confirmar}
              </button>
            )}
            <button className="btn-ter" type="button" onClick={cerrar}>{cerrarRotulo}</button>
          </div>
        )}
      </div>
    </div>,
    marco
  );
}
