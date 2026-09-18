"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { ROTULO_TIPO_VISITA, type Vista, type Visita } from "@/lib/data";
import { useApp } from "@/lib/estado";
import { diaEnPalabras } from "@/lib/reservas";

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

export function Tarjeta({ v, ir }: { v: Visita; ir: (x: Vista, ref?: string) => void }) {
  const cerrada = v.estado === "finalizada" || v.estado === "cancelada";
  return (
    <div className={"visita" + (cerrada ? " fin" : " mat-carbon")}>
      <div className="top">
        <Icon n="persona" s={20} w={1.8} />
        <span className="lb">{ROTULO_TIPO_VISITA[v.tipo]}</span>
        {v.estado === "vigente" && <span className="pastilla"><Icon n="check" s={13} w={2.6} />Vigente</span>}
        {v.estado === "programada" && <span className="pastilla gris"><Icon n="reloj" s={13} w={2} />Programada</span>}
        {v.estado === "finalizada" && <span className="pastilla gris">Finalizada</span>}
        {v.estado === "cancelada" && <span className="pastilla gris">Cancelada</span>}
      </div>
      <h3>{v.nombre}</h3>
      <div className="hora">
        <Icon n="reloj" s={17} />
        <span>{v.dia ? `${v.dia} · ${v.horario}` : `${diaEnPalabras(new Date(v.fecha))} · ${v.horario}`}</span>
      </div>
      {v.nota && <p className="apunte">{v.nota}</p>}

      <div className="sep">
        {v.estado === "vigente" ? (
          <>
            <Icon n="qr" s={22} w={1.8} />
            <b>Ver pase</b>
            <button className="circ-b" type="button" onClick={() => ir("r07", v.id)}
              aria-label={`Ver el pase de acceso de ${v.nombre}`}>
              <Icon n="flechaDer" s={18} w={2.1} />
            </button>
          </>
        ) : (
          <>
            <b>{v.ingresoEl ? "Ingreso registrado" : "Sin ingresos registrados"}</b>
            <button className="circ-b" type="button" onClick={() => ir("r16", v.id)}
              aria-label={`Ver el detalle de la autorización de ${v.nombre}`}>
              <Icon n="chevron" s={18} w={2.1} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function R06({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [f, setF] = useState<Filtro>("hoy");
  const { estado } = useApp();
  const lista = estado.visitas.filter((v) => v.cuando === f);

  return (
    <div className="vista" id="r06">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit"><h1>Mis visitas</h1><p>Autorizaciones y accesos de tu unidad.</p></div>

      {/* Entrar a un formulario no es un acto irreversible: es un botón
          (D-10). El deslizamiento vive al final del formulario, en
          "Autorizar y emitir el pase", que es lo que no se puede deshacer. */}
      <button className="entrar" type="button" onClick={() => ir("f01")}
        style={{ marginTop: 18 }}>
        <Icon n="personaMas" s={19} w={1.9} />
        Crear nueva visita
      </button>

      <Chips etiqueta="Filtro de visitas" opciones={FILTROS} valor={f} onCambio={setF} />

      <div className="subtit">
        <h2>{f === "hoy" ? "Hoy" : f === "proximas" ? "Próximos días" : "Visitas anteriores"}</h2>
        <span>{lista.length === 1 ? "1 visita" : `${lista.length} visitas`}</span>
      </div>

      {lista.length === 0 ? (
        <Vacio icono="personaMas" titulo="No tenés visitas acá"
          texto="Cuando autorices a alguien, su pase y su horario aparecen en esta lista."
          accion="Autorizar visita" onAccion={() => ir("f01")} />
      ) : (
        <>
          {lista.map((v) => <Tarjeta key={v.id} v={v} ir={ir} />)}
          <FinLista texto={CIERRE[f]} />
        </>
      )}
    </div>
  );
}
