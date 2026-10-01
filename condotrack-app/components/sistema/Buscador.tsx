"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../ui/Icon";

export type ResultadoBusqueda = { id: string; titulo: string; detalle: string; grupo: string };

/** Búsqueda del header (U11 + Figma 23204:129953), igual en los tres roles.
 *
 *  Cerrada es un control chico. Abierta, el mismo control se estira hacia
 *  la izquierda (250 ms) sobre las utilidades —que se retiran—, sin tocar
 *  la marca ni la navegación. El campo toma el foco; los resultados son
 *  una superficie secundaria que llega después. Flechas recorren, Enter
 *  abre, Escape cierra y devuelve el foco a la lupa. Las instrucciones de
 *  teclado viven para lectores de pantalla, no ocupan la vista. */
export function Buscador({ abierto, onAbrir, onCerrar, buscar, alElegir, placeholder, etiqueta = "Buscar" }: {
  abierto: boolean; onAbrir: () => void; onCerrar: () => void;
  buscar: (q: string) => ResultadoBusqueda[]; alElegir: (r: ResultadoBusqueda) => void;
  placeholder: string; etiqueta?: string;
}) {
  const [q, setQ] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lupa = useRef<HTMLButtonElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const resultados = abierto && q.trim() ? buscar(q) : [];

  useEffect(() => {
    if (abierto) campo.current?.focus({ preventScroll: true });
    else setQ("");
  }, [abierto]);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) onCerrar(); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto, onCerrar]);

  const cerrar = () => { onCerrar(); requestAnimationFrame(() => lupa.current?.focus()); };

  function teclas(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && abierto) { e.stopPropagation(); cerrar(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const filas = Array.from(caja.current?.querySelectorAll<HTMLButtonElement>(".ct-buscar-res button") ?? []);
    if (!filas.length) return;
    e.preventDefault();
    const i = filas.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) { (e.key === "ArrowDown" ? filas[0] : filas[filas.length - 1]).focus(); return; }
    const n = i + (e.key === "ArrowDown" ? 1 : -1);
    if (n < 0) campo.current?.focus(); else filas[n % filas.length].focus();
  }

  return (
    <div ref={caja} className="ct-buscar" data-abierto={abierto} onKeyDown={teclas}>
      <div className="ct-buscar-campo" role="search">
        <button ref={lupa} type="button" className="ct-buscar-lupa" aria-label={abierto ? "Buscar" : etiqueta}
          aria-expanded={abierto} aria-controls={`b${id}`} onClick={() => abierto ? campo.current?.focus() : onAbrir()}>
          <Icon n="buscar" s={20} />
        </button>
        <label htmlFor={`b${id}`} className="solo-lectores">{etiqueta}</label>
        <input ref={campo} id={`b${id}`} type="search" autoComplete="off" spellCheck={false} placeholder={placeholder}
          value={q} onChange={e => setQ(e.target.value)} tabIndex={abierto ? 0 : -1} aria-hidden={!abierto}
          aria-describedby={`a${id}`} aria-controls={resultados.length ? `r${id}` : undefined} />
        <button type="button" className="ct-buscar-cerrar" aria-label="Cerrar búsqueda" tabIndex={abierto ? 0 : -1}
          aria-hidden={!abierto} onClick={cerrar}><Icon n="cerrar" s={18} /></button>
      </div>
      <p id={`a${id}`} className="solo-lectores">Con las flechas recorrés los resultados, Enter abre y Escape cierra la búsqueda.</p>
      {abierto && q.trim() !== "" && <div className="ct-buscar-res" id={`r${id}`}>
        <p className="ct-buscar-estado" role="status">{resultados.length ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}` : "Sin coincidencias. Probá con un nombre, una unidad o un código."}</p>
        {resultados.length > 0 && <ul>{resultados.map((r, i) => <li key={r.id}>
          {(i === 0 || resultados[i - 1].grupo !== r.grupo) && <h3>{r.grupo}</h3>}
          <button type="button" onClick={() => { onCerrar(); alElegir(r); }}>
            <span><b>{r.titulo}</b><small>{r.detalle}</small></span><Icon n="chevron" s={16} />
          </button>
        </li>)}</ul>}
      </div>}
    </div>
  );
}
