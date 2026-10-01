"use client";
import { forwardRef, type ReactNode } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { useNavegacion } from "@/lib/navegacion";
import { ROTULO_CORTO_P } from "@/lib/recepcion";
import type { VistaP } from "@/lib/data";

/** Volver con nombre. Si llegaste a esta pantalla desde otra (una acción
 *  del detalle de Agenda, una fila de Unidades), el camino de vuelta queda
 *  explícito arriba del título: nunca te quedás en una pantalla sin salida. */
export function VolverA({ excepto }: { excepto?: VistaP }) {
  const nav = useNavegacion();
  const previa = nav?.anterior?.v as VistaP | undefined;
  if (!nav?.hayVuelta || !previa || previa === excepto || !ROTULO_CORTO_P[previa]) return null;
  return <button type="button" className="ct-volver" onClick={nav.volver}><Icon n="volver" s={16} />Volver a {ROTULO_CORTO_P[previa]}</button>;
}

/** Cabecera de pantalla afuera de toda superficie: el título hace la
 *  jerarquía, no una card. */
export function ReceptionPage({ titulo, descripcion, icono, acciones, children, clase = "", volver = true }: { titulo: string; descripcion?: string; icono: NombreIcono; acciones?: ReactNode; children: ReactNode; clase?: string; volver?: boolean }) {
  return <div className={`op-page rx-pagina ${clase}`}>
    <header className="ct-cabecera">
      <div>{volver && <VolverA />}<span className="ct-eyebrow"><Icon n={icono} s={16} />Recepción</span><h1 className="ct-h1">{titulo}</h1>{descripcion && <p>{descripcion}</p>}</div>
      {acciones && <div className="ct-cabecera-acciones">{acciones}</div>}
    </header>
    {children}
  </div>;
}

export const ReceptionPanel = forwardRef<HTMLElement, { titulo: string; icono: NombreIcono; cantidad?: number; children: ReactNode; clase?: string }>(function ReceptionPanel({ titulo, icono, cantidad, children, clase = "" }, ref) {
  return <section ref={ref} className={`op-panel ${clase}`}><header className="op-panel-heading"><h2><Icon n={icono} s={22} />{titulo}</h2>{cantidad !== undefined && <span>{cantidad.toString().padStart(2, "0")}</span>}</header>{children}</section>;
});
