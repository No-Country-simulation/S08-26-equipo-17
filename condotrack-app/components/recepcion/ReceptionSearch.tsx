"use client";
import { useId, useState } from "react";
import { Icon } from "../ui/Icon";
import { useApp } from "@/lib/estado";
import { buscarOperacion } from "@/lib/recepcion";
import type { VistaP } from "@/lib/data";

export function ReceptionSearch({ ir, autoFocus = false }: { autoFocus?: boolean; ir: (v: VistaP, ref?: string) => void }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const resultados = buscarOperacion(q, estado);
  const visible = abierto && Boolean(q.trim());
  return (
    <div className="rec-search" data-motion="search-reveal" onBlur={e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setAbierto(false);
    }} onKeyDown={e => {
      if (e.key === "Escape") { e.currentTarget.querySelector<HTMLInputElement>("input")?.focus(); setAbierto(false); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const filas = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>(".rec-search-results li button"));
        if (!filas.length) return;
        e.preventDefault();
        const actual = filas.indexOf(document.activeElement as HTMLButtonElement);
        filas[actual < 0 ? (e.key === "ArrowDown" ? 0 : filas.length - 1) : (actual + (e.key === "ArrowDown" ? 1 : filas.length - 1)) % filas.length]?.focus();
      }
    }}>
      <form role="search" onSubmit={e => { e.preventDefault(); setAbierto(true); }}>
        <label className="solo-lectores" htmlFor={id}>Buscar unidad, residente, visitante, proveedor o código</label>
        <input id={id} autoFocus={autoFocus} type="search" value={q} autoComplete="off"
          placeholder="Buscar unidad, persona o código"
          onFocus={() => setAbierto(true)} onChange={e => { setQ(e.target.value); setAbierto(true); }}
          aria-controls={visible ? `${id}-results` : undefined} />
        <button type="submit" aria-label="Buscar"><Icon n="buscar" s={24} /></button>
      </form>
      {visible && <div className="rec-search-results" id={`${id}-results`}>
        <p role="status">{resultados.length ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}` : "Sin coincidencias. Probá con un nombre o unidad."}</p>
        <ul>{resultados.map((r, index) => <li key={r.id}>
          {(index === 0 || resultados[index - 1].destino.vista !== r.destino.vista) && <h3>{r.destino.vista === "p02" ? "Unidades y residentes" : r.destino.vista === "p04" ? "Pases y visitantes" : "Agenda y proveedores"}</h3>}
          <button type="button" onClick={() => { setAbierto(false); ir(r.destino.vista, r.destino.ref); }}>
            <span><b>{r.titulo}</b><small>{r.detalle}</small></span><Icon n="chevron" s={16} />
          </button>
        </li>)}</ul>
      </div>}
    </div>
  );
}

export function OperationalSearchField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return <div className="op-search-field"><Icon n="buscar" s={20} /><input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />{value && <button type="button" aria-label="Borrar búsqueda" onClick={() => onChange("")}>×</button>}</div>;
}
