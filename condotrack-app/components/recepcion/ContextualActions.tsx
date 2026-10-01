"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { FolderGlassCard } from "../sistema/FolderGlassCard";
import { sinMovimiento } from "@/lib/movimiento";

export type AccionRiel = {
  id: string; nombre: string; icono: NombreIcono; pestana: string;
  contenido: ReactNode; cta: string; onCta: () => void;
  secundaria?: { label: string; onClick: () => void };
  principal?: boolean;
};

/** Riel contextual del Home (U02). Cada control abre SU carpeta al lado:
 *  hover con intención (350 ms) la muestra, click la fija, Escape o click
 *  afuera la cierran y el foco vuelve al control. La carpeta sale del lado
 *  del riel —la solapa mira hacia él— y al cerrarse vuelve hacia él, así se
 *  lee qué control abrió qué contenido. Nada queda abierto de entrada: el
 *  espacio vacío del héroe es aire, no un hueco que llenar. */
export function ContextualActions({ lado, acciones, etiqueta }: { lado: "left" | "right"; acciones: AccionRiel[]; etiqueta: string }) {
  const [activa, setActiva] = useState<number | null>(null);
  const [saliendo, setSaliendo] = useState<number | null>(null);
  const [fijada, setFijada] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout>>();
  const salida = useRef<ReturnType<typeof setTimeout>>();
  const caja = useRef<HTMLDivElement>(null);

  const cancelar = () => clearTimeout(reloj.current);
  const abrir = (i: number) => { clearTimeout(salida.current); setSaliendo(null); setActiva(i); };
  const cerrar = (foco = false) => {
    cancelar();
    const antes = activa;
    setFijada(false);
    if (antes === null) return;
    if (foco) caja.current?.querySelectorAll<HTMLButtonElement>(".rx-riel-control")[antes]?.focus();
    if (sinMovimiento()) { setActiva(null); return; }
    setSaliendo(antes); setActiva(null);
    salida.current = setTimeout(() => setSaliendo(null), 170);
  };
  const intencion = (i: number) => { cancelar(); if (!fijada) reloj.current = setTimeout(() => abrir(i), 350); };

  useEffect(() => {
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) { cancelar(); setFijada(false); setActiva(null); } };
    document.addEventListener("pointerdown", fuera);
    return () => { document.removeEventListener("pointerdown", fuera); clearTimeout(reloj.current); clearTimeout(salida.current); };
  }, []);

  const mostrada = activa ?? saliendo;
  const a = mostrada === null ? null : acciones[mostrada];
  const id = `rx-riel-${lado}`;
  return <div ref={caja} className="rx-riel" data-side={lado} role="group" aria-label={etiqueta}
    style={{ ["--rx-total" as string]: acciones.length }}
    onPointerLeave={() => { cancelar(); if (!fijada) reloj.current = setTimeout(() => { if (!caja.current?.contains(document.activeElement)) cerrar(); }, 220); }}
    onPointerEnter={() => { if (activa !== null) cancelar(); }}
    onKeyDown={e => { if (e.key === "Escape" && activa !== null) { e.stopPropagation(); cerrar(true); } }}>
    <div className="rx-riel-controles">
      {acciones.map((accion, i) => <button key={accion.id} type="button" className="rx-riel-control" data-principal={accion.principal ? "" : undefined}
        aria-label={accion.nombre} aria-expanded={activa === i} aria-controls={id}
        onPointerEnter={() => intencion(i)}
        onClick={() => { cancelar(); if (activa === i && fijada) cerrar(); else { abrir(i); setFijada(true); } }}>
        <Icon n={accion.icono} s={28} />
        <span className="rx-riel-rot" aria-hidden="true">{accion.nombre}</span>
      </button>)}
    </div>
    {a && <FolderGlassCard key={a.id} id={id} as="section" className="rx-riel-panel" data-fase={activa === null ? "sale" : "entra"}
      lado={lado === "right" ? "der" : "izq"} material="overlay" aria-label={a.nombre}
      style={{ ["--rx-fila" as string]: acciones.indexOf(a) }}>
      <h2 className="ct-h2">{a.nombre}</h2>
      <div className="rx-riel-contenido">{a.contenido}</div>
      <div className="rx-riel-acciones">
        <button type="button" className={`ct-btn ${a.principal ? "ct-btn--primario" : "ct-btn--fuerte"} ct-btn--ancho`} onClick={a.onCta}>{a.cta}<Icon n="flechaDer" s={18} /></button>
        {a.secundaria && <button type="button" className="ct-btn ct-btn--texto" onClick={a.secundaria.onClick}>{a.secundaria.label}</button>}
      </div>
    </FolderGlassCard>}
  </div>;
}
