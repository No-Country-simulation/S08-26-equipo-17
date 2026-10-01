"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sinMovimiento } from "@/lib/movimiento";

/** Cambio de destino con continuidad. El shell (header, menú) no se toca:
 *  sólo la región de contenido sale rápido (130 ms, ease-in) y la nueva
 *  entra (320 ms, 12 px). Durante la salida se sigue mostrando la vista
 *  anterior tal como estaba. Sin movimiento, el cambio es inmediato.
 *  `alCambiar` corre en el momento del reemplazo (ej. volver el scroll
 *  arriba) para que la vista que sale no salte. */
export function TransicionVista({ clave, children, alCambiar, className = "" }: {
  clave: string; children: ReactNode; alCambiar?: () => void; className?: string;
}) {
  const [mostrada, setMostrada] = useState<{ clave: string; nodo: ReactNode }>({ clave, nodo: children });
  const [fase, setFase] = useState<"entra" | "sale">("entra");
  const ultimo = useRef(children);
  ultimo.current = children;
  const cambio = useRef(alCambiar);
  cambio.current = alCambiar;

  useEffect(() => {
    if (clave === mostrada.clave) return;
    const reemplazar = () => { setMostrada({ clave, nodo: ultimo.current }); setFase("entra"); cambio.current?.(); };
    if (sinMovimiento()) { reemplazar(); return; }
    setFase("sale");
    const t = window.setTimeout(reemplazar, 130);
    return () => window.clearTimeout(t);
  }, [clave, mostrada.clave]);

  const nodo = clave === mostrada.clave ? children : mostrada.nodo;
  return <div key={mostrada.clave} className={`ct-vista ${className}`} data-fase={fase}>{nodo}</div>;
}
