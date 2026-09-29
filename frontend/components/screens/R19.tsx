"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { FinLista } from "../ui/FinLista";
import type { Vista } from "@/lib/data";
import { FAQ, REGLAMENTO } from "@/lib/gestiones";

/** R19 · Preguntas frecuentes y reglamento.
 *  Van juntos porque se leen juntos: la pregunta manda al artículo. */

type Filtro = "faq" | "reglamento";
const FILTROS = [
  { id: "faq" as const, rotulo: "Preguntas frecuentes" },
  { id: "reglamento" as const, rotulo: "Reglamento" },
];

function Pregunta({ p, r }: { p: string; r: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className={"faq-f" + (abierta ? " on" : "")}>
      <button type="button" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        <span>{p}</span>
        <span className="chev" aria-hidden="true"><Icon n="chevron" s={16} w={2.2} /></span>
      </button>
      {abierta && <p>{r}</p>}
    </div>
  );
}

export function R19({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [f, setF] = useState<Filtro>("faq");

  return (
    <div className="vista" id="r19">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit">
        <h1>{f === "faq" ? "Preguntas frecuentes" : "Reglamento"}</h1>
      </div>

      <Chips etiqueta="Preguntas o reglamento" opciones={FILTROS} valor={f} onCambio={setF} />

      {f === "faq" ? (
        <>
          <div className="faq">
            {FAQ.map((q) => <Pregunta key={q.p} p={q.p} r={q.r} />)}
          </div>
          <FinLista texto="No hay más preguntas" />
        </>
      ) : (
        <>
          {REGLAMENTO.map((s) => (
            <section className="regla-s" key={s.titulo}>
              <h2>{s.titulo}</h2>
              <ul>
                {s.puntos.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </section>
          ))}
          <FinLista texto="Fin del reglamento" />
        </>
      )}
    </div>
  );
}
