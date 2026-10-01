"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Ficha, Dato } from "../ui/Panel";
import { FinLista } from "../ui/FinLista";
import { Error as ErrorEstado } from "../ui/Estados";
import { ESPACIOS, RECURSOS, type Vista } from "@/lib/data";
import { diaCon, dias, diaCorto, numDia, esHoy, turnosDelDia, turnos } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** R13 · Espacio común, detalle.
 *  Lo que cambia de edificio a edificio: fotos, reglas y disponibilidad. */
export function R13({ ir, refe }: { ir: (v: Vista, r?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const e = ESPACIOS.find((x) => x.id === refe);

  if (!e) {
    return (
      <div className="vista" id="r13">
        <TopBar volverA="r05" ir={ir} />
        <ErrorEstado titulo="No encontramos ese espacio"
          onReintentar={() => ir("r05")} />
      </div>
    );
  }

  const recursos = RECURSOS.filter((r) => r.espacioId === e.id);
  const proximos = dias().slice(0, 7);

  return (
    <div className="vista" id="r13">
      <TopBar volverA="r05" ir={ir} />

      <div className="hero-ed mat-foto" style={{ marginTop: 20 }}>
        <img src={e.img} alt="" />
        <div className="tx">
          <div className="lb">{e.piso}</div>
          <h2>{e.nombre}</h2>
          <p>{e.capacidad}</p>
        </div>
      </div>

      <p className="cuerpo-txt" style={{ marginTop: 16 }}>{e.descripcion}</p>

      <Ficha>
        <Dato k="Turnos de" v={`${e.bloqueMin} minutos`} />
        <Dato k="Horario" v={`${e.aperturaMin / 60}:00 a ${e.cierreMin / 60}:00`} />
        <Dato k="Se reserva" v={e.tipoReserva === "recurso" ? "Por máquina" : "El espacio completo"} />
        <Dato k="Turnos por día" v={String(turnosDelDia(e, diaCon(0)))} />
      </Ficha>

      {/* v04 · A2 · la disponibilidad de la semana en un riel de vidrio:
          cada día dice cuántos turnos quedan (con una barra de lo tomado) y
          lleva a reservar. "Cerró" cuando el día ya terminó, no "sin lugar". */}
      <h2 className="sec">Disponibilidad</h2>
      <div className="dispo" role="list" aria-label={"Disponibilidad de " + e.nombre + " esta semana"}>
        {proximos.map((d, n) => {
          const ts = turnos(e, d, estado.reservas).filter((t) => t.bloqueo !== "pasada");
          const cupo = ts.filter((t) => !t.bloqueo).length;
          const total = turnosDelDia(e, d);
          const cerro = ts.length === 0;
          const texto = cerro ? "Cerró" : cupo === 0 ? "Completo" : cupo === 1 ? "1 libre" : `${cupo} libres`;
          return (
            <button key={n} type="button" role="listitem" onClick={() => ir("r05", e.id)}
              className={"dia-d" + (cupo === 0 ? " sin" : cupo <= 2 ? " poco" : "")}
              aria-label={`${esHoy(d) ? "Hoy" : diaCorto(d)} ${numDia(d)}: ${texto}. Reservar`}>
              <i>{esHoy(d) ? "Hoy" : diaCorto(d)}</i>
              <b>{numDia(d)}</b>
              <span className="dia-d-barra" aria-hidden="true"><em style={{ width: `${Math.round((1 - cupo / Math.max(1, total)) * 100)}%` }} /></span>
              <span className="dia-d-tx">{texto}</span>
            </button>
          );
        })}
      </div>

      {e.tipoReserva === "recurso" && (
        <>
          <h2 className="sec">Máquinas</h2>
          <div className="tabla">
            {recursos.map((r) => (
              <div className="tabla-f" key={r.id}>
                <span className="d">
                  <b>{r.nombre}</b>
                  {r.motivo && <i>{r.motivo}</i>}
                </span>
                <span className={"pastilla" + (r.estado === "disponible" ? " gris" : "")}>
                  {r.estado === "disponible" ? "En servicio" : "Fuera de servicio"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="sec">Reglas</h2>
      <ul className="reglas-l">
        {e.reglas.map((r) => (
          <li key={r}><Icon n="check" s={16} w={2.3} />{r}</li>
        ))}
      </ul>

      <button className="entrar" type="button" onClick={() => ir("r05", e.id)} style={{ marginTop: 20 }}>
        Reservar {e.nombre}
      </button>

      <FinLista texto={`${e.nombre} · ${e.piso}`} />
    </div>
  );
}
