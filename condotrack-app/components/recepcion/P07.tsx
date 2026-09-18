"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Texto, Area, Elegir, Segmentos } from "../ui/Formulario";
import { Aviso } from "../ui/Estados";
import { RECEPCION, type VistaP } from "@/lib/data";
import {
  INCIDENCIAS, LUGARES, ROTULO_GRAVEDAD, type Gravedad, type Incidencia,
} from "@/lib/edificio";
import { fechaHora, hace } from "@/lib/formato";

/** P07 · Incidencias de recepción.
 *  Lo que se rompe o pasa en el edificio y hay que dejar asentado. Es una
 *  lista operativa: se reporta rápido y se deriva. */

const GRAVEDADES: { id: Gravedad; rotulo: string }[] = [
  { id: "baja", rotulo: "Baja" },
  { id: "media", rotulo: "Media" },
  { id: "alta", rotulo: "Alta" },
];

export function P07({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const [lista, setLista] = useState<Incidencia[]>(INCIDENCIAS);
  const [titulo, setTitulo] = useState("");
  const [lugar, setLugar] = useState(LUGARES[0]);
  const [detalle, setDetalle] = useState("");
  const [gravedad, setGravedad] = useState<Gravedad>("media");
  const [tocado, setTocado] = useState(false);
  const [hecho, setHecho] = useState(false);

  const abiertas = lista.filter((i) => i.estado !== "cerrada");
  const cerradas = lista.filter((i) => i.estado === "cerrada");
  const errTitulo = !titulo.trim() ? "Escribí en una línea qué pasó." : undefined;

  function reportar() {
    setTocado(true);
    if (errTitulo) return;
    setLista([
      {
        id: `in-${Date.now()}`, titulo: titulo.trim(), lugar,
        detalle: detalle.trim(), gravedad, estado: "abierta",
        cuando: new Date().toISOString(), reportadaPor: RECEPCION.nombre,
      },
      ...lista,
    ]);
    setTitulo(""); setDetalle(""); setTocado(false); setHecho(true);
  }

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Incidencias</h1>
          <p>Lo que pasa en el edificio y hay que dejar asentado.</p>
        </div>
      </div>

      <div className="columnas dos">
        <section className="tarjeta">
          <h2><Icon n="alerta" s={17} w={1.9} />Abiertas<span className="cnt">{abiertas.length}</span></h2>
          <div className="cuerpo">
            {abiertas.length === 0 ? (
              <p className="mensaje-vacio">No hay nada abierto. Buen turno.</p>
            ) : (
              abiertas.map((i) => (
                <div className="fila-op" key={i.id}>
                  <span className="ic"><Icon n="alerta" s={18} w={1.9} /></span>
                  <span className="d">
                    <b>{i.titulo}</b>
                    <i>
                      {i.lugar} · {hace(i.cuando)} · {i.reportadaPor}
                      {i.derivadaA && ` · derivada a ${i.derivadaA}`}
                    </i>
                  </span>
                  <span className="der">
                    <span className={"pastilla" + (i.gravedad === "alta" ? "" : " gris")}>
                      {ROTULO_GRAVEDAD[i.gravedad]}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>

          {cerradas.length > 0 && (
            <>
              <h2 style={{ borderTop: "1px solid var(--borde)" }}>
                <Icon n="check" s={17} w={2.2} />Cerradas<span className="cnt">{cerradas.length}</span>
              </h2>
              <div className="cuerpo">
                {cerradas.map((i) => (
                  <div className="fila-op" key={i.id}>
                    <span className="ic"><Icon n="check" s={18} w={2.2} /></span>
                    <span className="d">
                      <b>{i.titulo}</b>
                      <i>{i.lugar} · {fechaHora(i.cuando)}</i>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="tarjeta">
          <h2><Icon n="mas" s={17} w={2.4} />Reportar un incidente</h2>
          <div className="cuerpo">
            {hecho && (
              <Aviso icono="check">
                Reportado. Administración lo ve en su panel y queda con tu nombre y la hora.
              </Aviso>
            )}

            <Texto etiqueta="Qué pasó" valor={titulo} onCambio={setTitulo}
              placeholder="Pérdida de agua en el subsuelo" icono="alerta"
              error={tocado ? errTitulo : undefined} />

            <Elegir etiqueta="Dónde" valor={lugar} onCambio={setLugar}
              opciones={LUGARES.map((l) => ({ id: l, rotulo: l }))} />

            <Segmentos etiqueta="Gravedad" valor={gravedad} onCambio={setGravedad}
              opciones={GRAVEDADES}
              ayuda="Alta es lo que no puede esperar al turno siguiente." />

            <Area etiqueta="Detalle" valor={detalle} onCambio={setDetalle} opcional
              placeholder="Qué viste, desde cuándo, si alguien lo está mirando." filas={4} />

            <button className="entrar" type="button" onClick={reportar} style={{ marginTop: 20 }}>
              Reportar el incidente
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
