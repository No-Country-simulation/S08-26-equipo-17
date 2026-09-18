"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { SubNav } from "../ui/SubNav";
import { Vacio } from "../ui/Vacio";
import { Hoja } from "../ui/Hoja";
import { PanelReclamo } from "../paneles/PanelReclamo";
import { Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import type { Vista } from "@/lib/data";
import { ROTULO_RECLAMO, rotuloCategoria, type EstadoReclamo } from "@/lib/gestiones";
import { hace } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R09 · Reclamos. Lista mobile; el detalle es G10, con su timeline. */

/* Las tres pestañas son las que fija la IA para este ámbito. "Abiertos"
   es lo que todavía no tomó nadie; "En seguimiento" es lo que ya tiene
   responsable y avanza; "Cerrados" es lo terminado. Un reclamo asignado no
   es lo mismo que uno que nadie miró, y esa es justamente la diferencia
   que el residente quiere ver. */
type Filtro = "abiertos" | "seguimiento" | "cerrados";
const ESTADOS_DE: Record<Filtro, EstadoReclamo[]> = {
  abiertos: ["nuevo"],
  seguimiento: ["en-gestion", "asignado"],
  cerrados: ["resuelto", "cerrado"],
};
const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "abiertos", rotulo: "Abiertos" },
  { id: "seguimiento", rotulo: "En seguimiento" },
  { id: "cerrados", rotulo: "Cerrados" },
];

export function R09({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const [f, setF] = useState<Filtro>("abiertos");
  const [abre, setAbre] = useState(false);
  const [nuevo, setNuevo] = useState<string | null>(null);

  const cuantos = (x: Filtro) =>
    estado.reclamos.filter((r) => ESTADOS_DE[x].includes(r.estado)).length;
  const lista = estado.reclamos.filter((r) => ESTADOS_DE[f].includes(r.estado));

  return (
    <div className="vista" id="r09">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Reclamos</h1><p>Lo que pediste y en qué quedó.</p></div>

      {/* Hacer un reclamo sube desde abajo: es una tarea corta que no
          justifica salir de la lista donde después lo vas a seguir. */}
      <button className="entrar" type="button" onClick={() => setAbre(true)} style={{ marginTop: 18 }}>
        <Icon n="mas" s={17} w={2.4} />Hacer un reclamo
      </button>

      {nuevo && (
        <Aviso icono="check">
          Listo: el reclamo {nuevo} quedó creado y administración ya lo ve en su
          panel. Te avisamos cada vez que cambie de estado.
        </Aviso>
      )}

      <SubNav etiqueta="Estado de los reclamos"
        opciones={FILTROS.map((o) => ({ ...o, contador: cuantos(o.id) }))}
        valor={f} onCambio={setF} />

      {lista.length === 0 ? (
        <Vacio icono="chat"
          titulo={f === "abiertos" ? "No hay reclamos sin tomar"
            : f === "seguimiento" ? "No hay nada en seguimiento"
            : "Todavía no cerraste ningún reclamo"}
          texto={f === "abiertos"
            ? "Cuando haya algo roto o algo que no funciona, contalo acá y lo vas a poder seguir."
            : f === "seguimiento"
            ? "Acá vas a ver los reclamos que administración ya tomó y está resolviendo."
            : "Los reclamos resueltos quedan acá, con todo lo que pasó desde que los hiciste."}
          accion={f === "cerrados" ? undefined : "Hacer un reclamo"}
          onAccion={() => setAbre(true)} />
      ) : (
        <>
          {lista.map((r) => {
            const ultima = r.acciones[r.acciones.length - 1];
            const cerrado = r.estado === "resuelto" || r.estado === "cerrado";
            return (
              <button className="reclamo-f" type="button" key={r.id} onClick={() => ir("g10", r.id)}>
                <div className="arr">
                  <span className="cod">{r.codigo}</span>
                  <span className={"pastilla" + (cerrado ? " gris" : "")}>
                    <Icon n={cerrado ? "check" : "reloj"} s={12} w={2.2} />
                    {ROTULO_RECLAMO[r.estado]}
                  </span>
                </div>
                <h3>{rotuloCategoria(r.categoria)}</h3>
                <p className="ub"><Icon n="pin" s={15} />{r.ubicacion}</p>
                <p className="ult">{ultima.texto}</p>
                <span className="pie">
                  {ultima.autor} · {hace(ultima.cuando)}
                  <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
                </span>
              </button>
            );
          })}
          <FinLista texto="No hay más reclamos acá" />
        </>
      )}

      {abre && (
        <Hoja titulo="Hacer un reclamo" onCancelar={() => setAbre(false)}
          cerrarRotulo="Cerrar" sinAcciones alto="alta">
          <PanelReclamo
            rotuloCancelar="Dejarlo para después"
            onCancelar={() => setAbre(false)}
            onListo={(codigo) => { setNuevo(codigo); setAbre(false); setF("abiertos"); }}
          />
          <div style={{ height: 12 }} />
        </Hoja>
      )}
    </div>
  );
}
