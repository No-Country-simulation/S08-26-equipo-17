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
  hoy: "No hay más visitas para hoy",
  proximas: "No hay más visitas programadas",
  historial: "No hay más visitas",
};

/** Una visita, según en qué momento está (ronda visual 01, §10).
 *
 *  Las tres se veían iguales: carbón, nombre, hora y una flecha. Ahora el
 *  momento se ve antes de leer:
 *    · vigente — la foto, el nombre grande y la franja amarilla del pase.
 *      Es lo que mostrás parado en la puerta: el pase es protagonista;
 *    · próxima — una superficie clara con la fecha como bloque;
 *    · pasada — una fila compacta que dice qué pasó. Es historial. */
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
      <button className="visita proxima" type="button" onClick={() => ir("r16", v.id)}
        aria-label={"Ver la autorización de " + v.nombre}>
        <span className="fecha" aria-hidden="true">
          <b>{numDia(f)}</b>
          <i>{diaCorto(f)}</i>
        </span>
        <span className="d">
          <b>{v.nombre}</b>
          <i>{ROTULO_TIPO_VISITA[v.tipo]} · {v.horario}</i>
        </span>
        <span className="pastilla gris"><Icon n="reloj" s={12} />Programada</span>
      </button>
    );
  }

  const resultado = v.estado === "cancelada" ? "Cancelada"
    : v.ingresoEl ? "Ingresó " + soloHora(v.ingresoEl)
    : "No ingresó";
  return (
    <button className="visita pasada" type="button" onClick={() => ir("r16", v.id)}
      aria-label={"Ver la autorización de " + v.nombre}>
      <span className="d">
        <b>{v.nombre}</b>
        <i>{cuando}</i>
      </span>
      <span className="res">{resultado}</span>
      <Icon n="chevron" s={16} />
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
          {lista.map((v) => <Tarjeta key={v.id} v={v} ir={ir} />)}
          <FinLista texto={CIERRE[f]} />
        </>
      )}
    </div>
  );
}
