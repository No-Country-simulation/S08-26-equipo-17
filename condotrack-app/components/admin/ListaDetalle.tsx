"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../ui/Icon";

export type Columna<T> = { id: string; titulo: string; celda: (x: T) => ReactNode; ancho?: string; clase?: string;
  /** Columna secundaria: se retira mientras el detalle está abierto (el detalle ya la muestra). */
  opc?: boolean };

/** Lista → detalle contextual (PDF Admin p.12, U07). El patrón central de
 *  Administración: BUSCAR → FILTRAR → LISTA → ELEGIR → DETALLE, sin salir
 *  de la lista. Filas compactas con filetes, no cards. La fila elegida
 *  queda marcada; el detalle entra por la derecha (280 ms) y Escape o
 *  Cerrar devuelven el foco a la fila. */
export function ListaDetalle<T>({ items, clave, columnas, herramientas, seleccion, onSeleccion, detalle, etiqueta, vacio, pie, filtroClave, rotuloDetalle, marca }: {
  items: T[]; clave: (x: T) => string; columnas: Columna<T>[];
  herramientas?: ReactNode; seleccion: string | null; onSeleccion: (id: string | null) => void;
  detalle: (x: T) => ReactNode; etiqueta: string; vacio: ReactNode; pie?: ReactNode;
  /** Cambia cuando cambian los filtros: la lista se reacomoda como un bloque. */
  filtroClave?: string; rotuloDetalle?: (x: T) => string;
  /** v05 · marca de transición de una fila (ej. "ok" al conciliar, "sale"
   *  mientras se va de la lista) */
  marca?: (x: T) => string | undefined;
}) {
  const panel = useRef<HTMLElement>(null);
  const origen = useRef<string | null>(null);
  const elegido = seleccion ? items.find(x => clave(x) === seleccion) ?? null : null;
  const visibles = elegido ? columnas.filter(c => !c.opc) : columnas;
  const plantilla = visibles.map(c => c.ancho ?? "minmax(0,1fr)").join(" ");

  useEffect(() => { if (elegido) panel.current?.focus({ preventScroll: true }); }, [seleccion]); // eslint-disable-line react-hooks/exhaustive-deps
  function cerrar() {
    const id = origen.current ?? seleccion;
    onSeleccion(null);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-fila="${CSS.escape(id ?? "")}"]`)?.focus({ preventScroll: true }));
  }

  return <div className="ad-ld" data-detalle={Boolean(elegido)}>
    <section className="ad-ld-lista" aria-label={etiqueta}>
      {herramientas && <div className="ad-ld-herr">{herramientas}</div>}
      <div className="ct-tabla-cab" style={{ gridTemplateColumns: plantilla }} aria-hidden="true">{visibles.map(c => <span key={c.id} className={c.clase}>{c.titulo}</span>)}</div>
      <ul key={filtroClave} className="ad-ld-filas ct-refiltra">
        {items.map(x => {
          const id = clave(x);
          return <li key={id}><button type="button" className="ct-fila" data-fila={id} data-marca={marca?.(x)} style={{ gridTemplateColumns: plantilla }}
            aria-expanded={seleccion === id} aria-controls="ad-ld-detalle"
            onClick={() => { origen.current = id; onSeleccion(seleccion === id ? null : id); }}>
            {visibles.map(c => <span key={c.id} className={`ad-celda ${c.clase ?? ""}`}>{c.celda(x)}</span>)}
          </button></li>;
        })}
      </ul>
      {!items.length && <div className="ad-ld-vacio">{vacio}</div>}
      {pie}
    </section>
    {elegido && <aside key={clave(elegido)} className="ad-ld-detalle ct-panel" id="ad-ld-detalle" ref={panel} tabIndex={-1}
      aria-label={rotuloDetalle ? rotuloDetalle(elegido) : "Detalle"} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); cerrar(); } }}>
      <div className="ad-ld-barra"><span className="ct-label">Detalle</span><button type="button" className="ct-panel-cerrar" onClick={cerrar}><Icon n="cerrar" s={16} />Cerrar</button></div>
      {detalle(elegido)}
    </aside>}
  </div>;
}

/** Campo de búsqueda de las listas. */
export function BuscarEnLista({ valor, onCambio, placeholder, etiqueta }: { valor: string; onCambio: (v: string) => void; placeholder: string; etiqueta: string }) {
  return <label className="ad-buscar"><Icon n="buscar" s={18} /><span className="solo-lectores">{etiqueta}</span>
    <input type="search" value={valor} onChange={e => onCambio(e.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false} />
    {valor && <button type="button" aria-label="Borrar búsqueda" onClick={() => onCambio("")}><Icon n="cerrar" s={14} /></button>}
  </label>;
}

/** Filas clave–valor del detalle. */
export function Datos({ filas }: { filas: [string, ReactNode][] }) {
  return <dl className="ad-datos">{filas.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

export const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
