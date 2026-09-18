"use client";
import {
  useCallback, useEffect, useRef, useState, type ReactNode,
} from "react";

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
  const [cerrando, setCerrando] = useState(false);
  const [arrastre, setArrastre] = useState(0);
  const inicio = useRef<number | null>(null);
  const relojes = useRef<number[]>([]);

  const cerrar = useCallback(() => {
    if (cerrando) return;
    setCerrando(true);
    relojes.current.push(window.setTimeout(onCancelar, SALIDA));
  }, [cerrando, onCancelar]);

  const confirmarYCerrar = useCallback(() => {
    if (cerrando || !onConfirmar) return;
    setCerrando(true);
    relojes.current.push(window.setTimeout(onConfirmar, SALIDA));
  }, [cerrando, onConfirmar]);

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
  function tomar(e: React.PointerEvent) {
    inicio.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function mover(e: React.PointerEvent) {
    if (inicio.current == null) return;
    setArrastre(Math.max(0, e.clientY - inicio.current));
  }
  function soltar() {
    if (inicio.current == null) return;
    inicio.current = null;
    if (arrastre >= UMBRAL) { setArrastre(0); cerrar(); }
    else setArrastre(0);
  }

  return (
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
              <button className={peligro ? "peligro" : "entrar"} type="button"
                onClick={confirmarYCerrar}>
                {confirmar}
              </button>
            )}
            <button className="volver-txt" type="button" onClick={cerrar}>{cerrarRotulo}</button>
          </div>
        )}
      </div>
    </div>
  );
}
