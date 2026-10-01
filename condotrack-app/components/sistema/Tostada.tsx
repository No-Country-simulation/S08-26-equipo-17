"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";

/** Feedback de una acción que cambió algo (audit v03 · principio F).
 *
 *  Dice QUÉ cambió, no "éxito": "Pago conciliado", "Entrega registrada ·
 *  unidad avisada", "Comprobante descargado". No bloquea: aparece abajo,
 *  se lee y se va sola a los 3,6 s (o antes con la cruz). Es una región
 *  `status`, así que el lector de pantalla la anuncia sin mover el foco.
 *
 *  Cualquier pantalla la dispara con `avisar(...)`; cada shell monta una
 *  sola <Tostada />. Con movimiento reducido entra y sale sin desplazarse. */

export type AvisoTostada = { titulo: string; detalle?: string; icono?: NombreIcono; tono?: "ok" | "neutro" | "mal" };
const EVENTO = "ct:tostada";

export function avisar(a: AvisoTostada) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AvisoTostada>(EVENTO, { detail: a }));
}

export function Tostada({ clase = "" }: { clase?: string }) {
  const [aviso, setAviso] = useState<(AvisoTostada & { n: number }) | null>(null);
  const [saliendo, setSaliendo] = useState(false);
  const reloj = useRef<number[]>([]);
  const limpiar = () => { reloj.current.forEach((t) => window.clearTimeout(t)); reloj.current = []; };

  useEffect(() => {
    let n = 0;
    const al = (e: Event) => {
      limpiar();
      setSaliendo(false);
      setAviso({ ...(e as CustomEvent<AvisoTostada>).detail, n: ++n });
      reloj.current.push(window.setTimeout(() => setSaliendo(true), 3600));
      reloj.current.push(window.setTimeout(() => { setAviso(null); setSaliendo(false); }, 3860));
    };
    window.addEventListener(EVENTO, al);
    return () => { window.removeEventListener(EVENTO, al); limpiar(); };
  }, []);

  const cerrar = () => { limpiar(); setSaliendo(true); reloj.current.push(window.setTimeout(() => { setAviso(null); setSaliendo(false); }, 240)); };

  return (
    <div className={"ct-tostada-zona " + clase} role="status" aria-live="polite">
      {aviso && (
        <div key={aviso.n} className={"ct-tostada" + (saliendo ? " sale" : "") + (aviso.tono ? " " + aviso.tono : "")}>
          <span className="ic" aria-hidden="true"><Icon n={aviso.icono ?? (aviso.tono === "mal" ? "alerta" : "check")} s={16} w={2.4} /></span>
          <span className="tx"><b>{aviso.titulo}</b>{aviso.detalle && <small>{aviso.detalle}</small>}</span>
          <button type="button" className="x" aria-label="Cerrar aviso" onClick={cerrar}><Icon n="cerrar" s={14} /></button>
        </div>
      )}
    </div>
  );
}
