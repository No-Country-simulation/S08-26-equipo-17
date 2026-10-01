"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Abrir/cerrar un panel anclado: click afuera cierra, Escape cierra y
 *  devuelve el foco al disparador. Un solo comportamiento para perfil,
 *  avisos, edificio y menú en los tres roles. */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [abierto, setAbierto] = useState(false);
  const ancla = useRef<T>(null);
  const disparador = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => { if (!ancla.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);
  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false);
    if (devolverFoco) requestAnimationFrame(() => disparador.current?.focus());
  }, []);
  const props = {
    ref: ancla,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Escape" && abierto) { e.stopPropagation(); cerrar(); } },
    onBlur: (e: React.FocusEvent) => { if (abierto && !e.currentTarget.contains(e.relatedTarget as Node)) setAbierto(false); },
  };
  return { abierto, setAbierto, cerrar, ancla, disparador, props };
}
