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
import { PASOS_RECLAMO, ROTULO_RECLAMO, rotuloCategoria, type EstadoReclamo } from "@/lib/gestiones";
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
  /* Entrar a una pestaña vacía teniendo reclamos en otra hacía ver la
     pantalla como si no hubiera nada: abre en la primera con contenido. */
  const [f, setF] = useState<Filtro>(() => {
    const con = (x: Filtro) => estado.reclamos.some((r) => ESTADOS_DE[x].includes(r.estado));
    return con("abiertos") ? "abiertos" : con("seguimiento") ? "seguimiento" : "abiertos";
  });
  const [abre, setAbre] = useState(false);
  const [nuevo, setNuevo] = useState<string | null>(null);

  const cuantos = (x: Filtro) =>
    estado.reclamos.filter((r) => ESTADOS_DE[x].includes(r.estado)).length;
  const lista = estado.reclamos.filter((r) => ESTADOS_DE[f].includes(r.estado));

  return (
    <div className="vista" id="r09">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Reclamos</h1></div>

      {/* Hacer un reclamo sube desde abajo: es una tarea corta que no
          justifica salir de la lista donde después lo vas a seguir. */}
      <button className="entrar" type="button" onClick={() => setAbre(true)} style={{ marginTop: 18 }}>
        <Icon n="mas" s={20} w={2.4} />Hacer un reclamo
      </button>

      {nuevo && (
        <Aviso icono="check">
          Reclamo {nuevo} creado.
        </Aviso>
      )}

      <SubNav etiqueta="Estado de los reclamos"
        opciones={FILTROS.map((o) => ({ ...o, contador: cuantos(o.id) }))}
        valor={f} onCambio={setF} />

      {lista.length === 0 ? (
        <Vacio icono="chat"
          titulo={f === "abiertos" ? "Sin reclamos abiertos"
            : f === "seguimiento" ? "Nada en seguimiento"
            : "Sin reclamos cerrados"} />
      ) : (
        <>
          {lista.map((r) => {
            const ultima = r.acciones[r.acciones.length - 1];
            const cerrado = r.estado === "resuelto" || r.estado === "cerrado";
            return (
              /* El estado no depende de la pastilla: lleva un filo del color
                 del estado, el ícono, y el avance en cuatro pasos con su
                 texto. Se lee de lejos y se lee sin color. */
              <button className={"reclamo-f est-" + (cerrado ? "ok" : r.estado === "nuevo" ? "nuevo" : "curso")}
                type="button" key={r.id} onClick={() => ir("g10", r.id)}>
                <div className="arr">
                  <span className="cod">{r.codigo}</span>
                  <span className="estado-r">
                    <Icon n={cerrado ? "check" : r.estado === "nuevo" ? "reloj" : "herramienta"} s={13} />
                    {ROTULO_RECLAMO[r.estado]}
                  </span>
                </div>
                <h3>{rotuloCategoria(r.categoria)}</h3>
                {(() => {
                  const i = Math.max(0, PASOS_RECLAMO.indexOf(r.estado === "cerrado" ? "resuelto" : r.estado));
                  return (
                    <span className="avance-mini" aria-label={"Paso " + (i + 1) + " de " + PASOS_RECLAMO.length}>
                      {PASOS_RECLAMO.map((p, n) => (
                        <i key={p} className={n < i ? "hecho" : n === i ? "ahora" : ""} />
                      ))}
                    </span>
                  );
                })()}
                <p className="ub"><Icon n="pin" s={16} />{r.ubicacion}</p>
                <p className="ult">{ultima.texto}</p>
                <span className="pie">
                  {ultima.autor} · {hace(ultima.cuando)}
                  <span className="flech"><Icon n="chevron" s={16} w={2.2} /></span>
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
