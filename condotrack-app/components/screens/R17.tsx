"use client";
import { useMemo, useState } from "react";
import { TopBar } from "../ui/TopBar";
import { type NombreIcono } from "../ui/Icon";
import { Linea, type Hito } from "../ui/Linea";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { RESIDENTE, type Vista } from "@/lib/data";
import { fechaLarga } from "@/lib/formato";
import { historialOrdenado, ICONO_EVENTO, type TipoEvento } from "@/lib/unidad";
import { useApp } from "@/lib/estado";

/** R17 · Historial de la unidad.
 *
 *  Es el criterio de éxito del producto puesto en una sola pantalla: qué
 *  pasó, quién está involucrado, en qué estado quedó y quién lo gestionó,
 *  sin ir a buscar a otro lado. Todo lo que hacen los tres perfiles en el
 *  prototipo aterriza acá. */

type Filtro = "todo" | "acceso" | "entrega" | "reserva" | "expensa";
const FILTROS = [
  { id: "todo" as const, rotulo: "Todo" },
  { id: "acceso" as const, rotulo: "Accesos" },
  { id: "entrega" as const, rotulo: "Entregas" },
  { id: "reserva" as const, rotulo: "Reservas" },
  { id: "expensa" as const, rotulo: "Expensas" },
];

/* Accesos agrupa lo que tiene que ver con quién entró: autorizaciones,
   ingresos y permisos permanentes. Separarlos obligaría a mirar tres
   filtros para responder una sola pregunta. */
const GRUPO: Record<Filtro, TipoEvento[]> = {
  todo: [],
  acceso: ["acceso", "autorizacion", "permiso"],
  entrega: ["entrega"],
  reserva: ["reserva"],
  expensa: ["expensa"],
};

/** Los movimientos se agrupan por día. Sin esto el historial es una tira
 *  de treinta líneas iguales: la fecha completa repetida en cada una y
 *  ninguna división real entre ayer y la semana pasada. */
function porDia(eventos: { id: string; cuando: string }[]) {
  const grupos: { clave: string; rotulo: string; ids: string[] }[] = [];
  const hoy = new Date().toDateString();
  const ayer = new Date(Date.now() - 86400000).toDateString();
  for (const e of eventos) {
    const d = new Date(e.cuando).toDateString();
    const rotulo = d === hoy ? "Hoy" : d === ayer ? "Ayer" : fechaLarga(e.cuando);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.clave === d) ultimo.ids.push(e.id);
    else grupos.push({ clave: d, rotulo, ids: [e.id] });
  }
  return grupos;
}

export function R17({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const [f, setF] = useState<Filtro>("todo");

  const todos = useMemo(() => historialOrdenado(estado.eventos), [estado.eventos]);
  const lista = f === "todo" ? todos : todos.filter((e) => GRUPO[f].includes(e.tipo));

  /* La hora sola alcanza: el día lo dice el encabezado del grupo. */
  const hitos: Hito[] = lista.map((e) => ({
    id: e.id,
    cuando: e.cuando,
    icono: ICONO_EVENTO[e.tipo] as NombreIcono,
    titulo: e.titulo,
    detalle: e.detalle,
    autor: e.responsable,
    rol: e.rol,
  }));
  const porId = new Map(hitos.map((h) => [h.id, h]));
  const grupos = porDia(lista);
  const cuantosDe = (id: Filtro) => (id === "todo" ? todos.length : todos.filter((e) => GRUPO[id].includes(e.tipo)).length);
  /* El evento más reciente lleva la marca amarilla: es "lo último que pasó". */
  if (hitos[0]) hitos[0] = { ...hitos[0], destacado: true };

  return (
    <div className="vista" id="r17" data-filtro={f}>
      <TopBar volverA="r02" ir={ir} />
      <div className="tit">
        <h1>Historial de la unidad</h1>
      </div>

      {/* H01-01 · cinco opciones entran a la vista: filtros compactos con
          su conteo, elegidos con un toque (antes abrían una hoja "¿Qué
          querés ver?" para algo que se resuelve en una fila). */}
      <div className="hist-filtros" role="radiogroup" aria-label="Filtrar el historial">
        {FILTROS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === f}
            onClick={() => setF(o.id)}>
            {o.rotulo}<span className="n">{cuantosDe(o.id)}</span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <Vacio icono="lista" titulo="Sin movimientos" />
      ) : (
        <>
          {grupos.map((g) => (
            <section className="grupo-dia" key={g.clave}>
              <div className="dia">
                {g.rotulo}
                <span>{g.ids.length === 1 ? "1 movimiento" : `${g.ids.length} movimientos`}</span>
              </div>
              <Linea hitos={g.ids.map((id) => porId.get(id)!)} soloLaHora />
            </section>
          ))}
          <FinLista texto="Principio del historial de la unidad" />
        </>
      )}



    </div>
  );
}
