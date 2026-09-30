"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { Hoja } from "../ui/Hoja";
import { RESIDENTE, type Reserva, type Vista } from "@/lib/data";
import {
  proximas, historial, historialEdificio, cuandoLargo, espacioDe, recursoDe,
} from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** R18 · Mis reservas y agenda.
 *  El historial no es sólo el propio: ver el del edificio es lo que permite
 *  entender cuánto se usan los espacios y reclamar un turno que salió mal. */

type Filtro = "proximas" | "historial" | "edificio";
const FILTROS = [
  { id: "proximas" as const, rotulo: "Próximas" },
  { id: "historial" as const, rotulo: "Mi historial" },
  { id: "edificio" as const, rotulo: "Del edificio" },
];

function Fila({ r, onCancelar }: { r: Reserva; onCancelar?: () => void }) {
  const espacio = espacioDe(r.recursoId);
  const recurso = recursoDe(r.recursoId);
  const cerrada = r.estado !== "confirmada";
  const porRecurso = espacio?.tipoReserva === "recurso";
  const mia = r.unidad === RESIDENTE.unidad;
  return (
    /* Ticket: arriba el lugar y cuándo, sobre la foto del espacio; abajo,
       separado por el corte, el estado y la única acción que queda. */
    <div className={"reserva ticket" + (cerrada ? " fin" : "")}>
      {espacio?.img && <img src={espacio.img} alt="" aria-hidden="true" />}
      <div className="bo">
        <div>
          <h3>{espacio?.nombre}</h3>
          <div className="dato"><Icon n="reloj" s={16} />{cuandoLargo(r)}</div>
          <div className="dato">
            <Icon n="pin" s={16} />
            {espacio?.piso}{porRecurso && recurso ? ` · ${recurso.nombre}` : ""}
          </div>
          <div className="dato">
            <Icon n="persona" s={16} />
            {mia ? "Tu unidad" : `Unidad ${r.unidad}`}
          </div>
        </div>
      </div>
      <div className="corte" aria-hidden="true" />
      <div className="tk-pie">
        <span className={"tk-estado" + (cerrada ? " gris" : "")}>
          {r.estado === "confirmada" ? "Confirmada"
            : r.estado === "cancelada" ? "Cancelada" : "Finalizada"}
        </span>
        {onCancelar && (
          <button className="btn-ter peligro" type="button" onClick={onCancelar}>
            Cancelar la reserva
          </button>
        )}
      </div>
    </div>
  );
}

export function R18({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [f, setF] = useState<Filtro>("proximas");
  const [cancelar, setCancelar] = useState<Reserva | null>(null);

  const prox = proximas(estado.reservas);
  const hist = historial(estado.reservas);
  const edificio = historialEdificio(estado.reservas);
  const lista = f === "proximas" ? prox : f === "historial" ? hist : edificio;

  return (
    <div className="vista" id="r18">
      <TopBar volverA="r05" ir={ir} />
      <div className="tit"><h1>Mis reservas</h1></div>

      <button className="entrar" type="button" onClick={() => ir("r05")} style={{ marginTop: 18 }}>
        <Icon n="mas" s={20} w={2.4} />Reservar un espacio
      </button>

      <Chips etiqueta="Filtro de reservas" opciones={FILTROS} valor={f} onCambio={setF} />

      <div className="subtit">
        <h2>
          {f === "proximas" ? "Próximas" : f === "historial" ? "Tus reservas anteriores" : "Historial del edificio"}
        </h2>
        <span>{lista.length}</span>
      </div>


      {lista.length === 0 ? (
        <Vacio icono="calendario" titulo="Sin reservas"
          accion={f === "proximas" ? "Reservar espacio" : undefined}
          onAccion={() => ir("r05")} />
      ) : (
        <>
          {lista.map((r) => (
            <Fila key={r.id} r={r}
              onCancelar={f === "proximas" ? () => setCancelar(r) : undefined} />
          ))}
          <FinLista texto={
            f === "proximas" ? "No hay más reservas próximas"
            : f === "historial" ? "No hay más reservas tuyas"
            : "No hay más reservas del edificio"} />
        </>
      )}

      {cancelar && (
        <Hoja
          titulo="Cancelar la reserva"
          texto={`${espacioDe(cancelar.recursoId)?.nombre} · ${cuandoLargo(cancelar)}.`}
          confirmar="Cancelar la reserva"
          peligro
          onConfirmar={() => {
            hacer({
              t: "reserva/cancelar", id: cancelar.id,
              rotulo: espacioDe(cancelar.recursoId)?.nombre ?? "Espacio",
            });
            setCancelar(null);
          }}
          onCancelar={() => setCancelar(null)}
        />
      )}
    </div>
  );
}
