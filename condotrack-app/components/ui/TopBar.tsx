"use client";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { useNavegacion } from "@/lib/navegacion";
import { CONTEXTO, type Vista } from "@/lib/data";

/** Barra de las vistas de segundo nivel.
 *  La campana salió de acá: las notificaciones tienen su acceso en Más y el
 *  círculo del home es ahora el perfil. Lo que queda es volver y contexto,
 *  que es lo que hace falta para no perderse.
 *
 *  `volverA` ya no es el destino: es el destino **de reserva**. Si hay
 *  pantalla anterior, volver vuelve ahí (BUG-02, BUG-03). */
export function TopBar({
  volverA, ir, contexto = CONTEXTO, accion,
}: {
  volverA: Vista;
  ir: (v: Vista, ref?: string) => void;
  contexto?: string;
  accion?: ReactNode;
}) {
  const nav = useNavegacion();
  return (
    <div className="topbar">
      <button className="redondo" type="button" aria-label="Volver"
        onClick={() => (nav?.hayVuelta ? nav.volver() : ir(volverA))}>
        <Icon n="volver" s={19} w={2.1} />
      </button>
      <span className="ctx">{contexto}</span>
      {accion}
    </div>
  );
}
