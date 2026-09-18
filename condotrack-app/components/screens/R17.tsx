"use client";
import { useMemo, useState } from "react";
import { TopBar } from "../ui/TopBar";
import { Icon, type NombreIcono } from "../ui/Icon";
import { Hoja } from "../ui/Hoja";
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
  const [abreFiltro, setAbreFiltro] = useState(false);

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
  const rotuloFiltro = FILTROS.find((x) => x.id === f)?.rotulo ?? "Todo";

  return (
    <div className="vista" id="r17">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit">
        <h1>Historial de la unidad</h1>
        <p>Todo lo que pasó en la {RESIDENTE.unidad}, con quién lo hizo.</p>
      </div>

      {/* El filtro era una tira de cinco pastillas amarillas peleando con
          el contenido. Cinco opciones entran en una hoja; lo que queda
          arriba es una línea que dice qué estás mirando y cuánto hay. */}
      <button className="selector" type="button" onClick={() => setAbreFiltro(true)}
        aria-haspopup="dialog">
        <span className="d">
          <span className="k">Mostrando</span>
          <b>{f === "todo" ? "Todos los movimientos" : rotuloFiltro}</b>
        </span>
        <span className="n">{lista.length}</span>
        <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
      </button>

      {lista.length === 0 ? (
        <Vacio icono="lista" titulo="No hay movimientos de este tipo"
          texto="Cambiá el filtro o mirá todo el historial de la unidad." />
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

      <p className="apunte-pie">
        Cada línea la escribe quien hizo la operación: residente, recepción o
        administración. Lo que hagas en cualquiera de los tres perfiles aparece
        acá, con su hora y su responsable.
      </p>

      {abreFiltro && (
        <Hoja titulo="Qué querés ver" onCancelar={() => setAbreFiltro(false)}
          cerrarRotulo="Cerrar" sinAcciones>
          <div className="opciones-hoja" role="radiogroup" aria-label="Filtro del historial">
            {FILTROS.map((o) => {
              const cuantos = o.id === "todo"
                ? todos.length
                : todos.filter((e) => GRUPO[o.id].includes(e.tipo)).length;
              return (
                <button key={o.id} type="button" role="radio" aria-checked={o.id === f}
                  onClick={() => { setF(o.id); setAbreFiltro(false); }}>
                  <span className="d">
                    <b>{o.rotulo}</b>
                    <i>{cuantos === 1 ? "1 movimiento" : `${cuantos} movimientos`}</i>
                  </span>
                  {o.id === f && <Icon n="check" s={17} w={2.4} />}
                </button>
              );
            })}
          </div>
          <div style={{ height: 14 }} />
        </Hoja>
      )}
    </div>
  );
}
