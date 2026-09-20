"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { AVISOS, type Vista } from "@/lib/data";
import { avisosExpensa } from "@/lib/expensas";
import { useApp } from "@/lib/estado";

/* El feed se ordena por día, como cualquier centro de notificaciones:
   lo de hoy primero y lo viejo abajo. El dato que tenemos es relativo
   ("Hace 18 min", "Ayer"), así que el grupo sale de ahí. */
const GRUPOS = [
  { id: "hoy" as const, rotulo: "Hoy" },
  { id: "ayer" as const, rotulo: "Ayer" },
  { id: "antes" as const, rotulo: "Antes" },
];
function grupoDe(cuando: string) {
  const c = cuando.toLowerCase();
  if (c.startsWith("hace") || c.includes("hoy")) return "hoy";
  if (c.includes("ayer")) return "ayer";
  return "antes";
}

type Filtro = "todas" | "sinleer" | "archivada";
const FILTROS = [
  { id: "todas" as const, rotulo: "Todas" },
  { id: "sinleer" as const, rotulo: "No leídas" },
  { id: "archivada" as const, rotulo: "Archivadas" },
];

export function R03({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [f, setF] = useState<Filtro>("todas");

  /* Marcar todo como leído cambia el estado de verdad; si no, el botón es
     un adorno y el contador de Más nunca baja.
     Los avisos de expensa se arman con la fecha de vencimiento real. */
  const avisos = [...avisosExpensa(), ...AVISOS].map((a) =>
    estado.avisosLeidos && a.estado === "sinleer" ? { ...a, estado: "leida" as const } : a
  );
  const lista = avisos.filter((a) =>
    f === "todas" ? a.estado !== "archivada" : a.estado === f);
  const sinLeer = avisos.filter((a) => a.estado === "sinleer").length;

  return (
    <div className="vista" id="r03">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Notificaciones</h1></div>
      <Chips etiqueta="Filtro de notificaciones" opciones={FILTROS} valor={f} onCambio={setF} />

      {lista.length === 0 ? (
        <Vacio icono="campana" titulo="Sin notificaciones" />
      ) : (
        <>
          {GRUPOS.map((g) => {
            const del = lista.filter((a) => grupoDe(a.cuando) === g.id);
            if (del.length === 0) return null;
            return (
              <section key={g.id}>
                <h2 className="dia">{f === "archivada" ? "Archivadas" : g.rotulo}</h2>
                <div className="noti">
                  {del.map((a) => (
                    <button key={a.id} type="button" onClick={() => a.va && ir(a.va)}
                      className={a.estado === "sinleer" ? "nueva" : undefined}>
                      <span className="ic">
                        <Icon n={a.icono} s={20} w={a.icono === "check" ? 2.2 : 1.8} />
                      </span>
                      <span className="d">
                        <span className="h"><b>{a.titulo}</b><time>{a.cuando}</time></span>
                        <span className="desc">{a.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          {sinLeer > 0 && (
            <button className="btn-ter" type="button" onClick={() => hacer({ t: "avisos/leer" })}>
              Marcar todo como leído
            </button>
          )}
          <FinLista texto="No hay más notificaciones" />
        </>
      )}
    </div>
  );
}
