"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { ROTULO_TIPO_VISITA, type Vista, type Visita } from "@/lib/data";
import { useApp } from "@/lib/estado";
import { diaEnPalabras, diaCorto, numDia } from "@/lib/reservas";
import { soloHora } from "@/lib/formato";

type Filtro = "hoy" | "proximas" | "historial";
const FILTROS = [
  { id: "hoy" as const, rotulo: "Hoy" },
  { id: "proximas" as const, rotulo: "Próximas" },
  { id: "historial" as const, rotulo: "Historial" },
];
const CIERRE: Record<Filtro, string> = {
  hoy: "Nada más para hoy",
  proximas: "Nada más para mostrar",
  historial: "Nada más para mostrar",
};

const iniciales = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const faltanDias = (f: Date) => {
  const h = new Date();
  const d = Math.round((new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime()
    - new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime()) / 86400000);
  return d <= 0 ? "Hoy" : d === 1 ? "Mañana" : `En ${d} días`;
};

/** Una visita, según en qué momento está (ronda visual 01, §10).
 *
 *  Las tres se veían iguales: carbón, nombre, hora y una flecha. Ahora el
 *  momento se ve antes de leer:
 *    · vigente — la foto, el nombre grande y la franja amarilla del pase.
 *      Es lo que mostrás parado en la puerta: el pase es protagonista;
 *    · próxima — un ticket: la fecha en amarillo como talón, el corte y
 *      la visita con cuánto falta (ronda 2: "algo visual interesante");
 *    · pasada — una card apagada con las iniciales y qué pasó. */
export function Tarjeta({ v, ir }: { v: Visita; ir: (x: Vista, ref?: string) => void }) {
  const cuando = v.dia ? `${v.dia} · ${v.horario}` : `${diaEnPalabras(new Date(v.fecha))} · ${v.horario}`;

  if (v.estado === "vigente") {
    return (
      <div className="visita vigente">
        <img src="/img/visitas_fondo.jpg" alt="" />
        <div className="cuerpo">
          <span className="lb">
            <Icon n="persona" s={16} />{ROTULO_TIPO_VISITA[v.tipo]}
            <span className="pastilla"><Icon n="check" s={12} />Vigente</span>
          </span>
          <h3>{v.nombre}</h3>
          <span className="hora">{cuando}</span>
          {v.nota && <p className="apunte">{v.nota}</p>}
        </div>
        <button className="pase-fila amarilla" type="button" onClick={() => ir("r07", v.id)}
          aria-label={"Ver el pase de acceso de " + v.nombre}>
          <Icon n="qr" s={18} />
          <b>Ver pase</b>
          <span className="cod">{v.codigo}</span>
          <Icon n="chevron" s={16} />
        </button>
      </div>
    );
  }

  if (v.estado === "programada") {
    const f = new Date(v.fecha);
    return (
      <button className="vis-ticket" type="button" onClick={() => ir("r16", v.id)}
        aria-label={`Ver la autorización de ${v.nombre}, ${diaEnPalabras(f)}, ${v.horario}`}>
        <span className="vt-talon" aria-hidden="true">
          <i>{diaCorto(f)}</i>
          <b>{numDia(f)}</b>
          <i>{f.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}</i>
        </span>
        <span className="vt-corte" aria-hidden="true" />
        <span className="vt-cuerpo">
          <span className="vt-falta">{faltanDias(f)}</span>
          <b>{v.nombre}</b>
          <i>{ROTULO_TIPO_VISITA[v.tipo]} · {v.horario}</i>
          <span className="vt-pase"><Icon n="qr" s={14} />Pase listo · se activa 30 min antes</span>
        </span>
        <span className="vt-flech" aria-hidden="true"><Icon n="chevron" s={16} /></span>
      </button>
    );
  }

  const resultado = v.estado === "cancelada" ? "Cancelada"
    : v.ingresoEl ? "Ingresó " + soloHora(v.ingresoEl)
    : "No ingresó";
  return (
    <button className="vis-pasada" type="button" onClick={() => ir("r16", v.id)}
      aria-label={`Ver la autorización de ${v.nombre}. ${resultado}`}>
      <span className="vp-ini" aria-hidden="true">{iniciales(v.nombre)}</span>
      <span className="vp-d">
        <b>{v.nombre}</b>
        <i>{cuando}</i>
      </span>
      <span className={"vp-res" + (v.ingresoEl && v.estado !== "cancelada" ? " ok" : "")}>{resultado}</span>
    </button>
  );
}

export function R06({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [f, setF] = useState<Filtro>("hoy");
  const { estado } = useApp();
  const lista = estado.visitas.filter((v) => v.cuando === f);

  return (
    <div className="vista" id="r06">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit"><h1>Mis visitas</h1></div>

      {/* Entrar a un formulario no es un acto irreversible: es un botón
          (D-10). El deslizamiento vive al final del formulario, en
          "Autorizar y emitir el pase", que es lo que no se puede deshacer. */}
      <button className="entrar" type="button" onClick={() => ir("f01")}
        style={{ marginTop: 18 }}>
        <Icon n="personaMas" s={20} w={1.9} />
        Crear nueva visita
      </button>

      <Chips etiqueta="Filtro de visitas" opciones={FILTROS} valor={f} onCambio={setF} />

      {lista.length === 0 ? (
        <Vacio icono="personaMas" titulo="Sin visitas" />
      ) : (
        <>
          <div className="vis-lista">
            {lista.map((v) => <Tarjeta key={v.id} v={v} ir={ir} />)}
          </div>
          <FinLista texto={CIERRE[f]} />
        </>
      )}
    </div>
  );
}
