"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Ficha, Dato } from "../ui/Panel";
import { FinLista } from "../ui/FinLista";
import { Error as ErrorEstado } from "../ui/Estados";
import { ESPACIOS, RECURSOS, type Vista } from "@/lib/data";
import { cupoDelDia, diaCon, dias, diaCorto, numDia, esHoy, turnosDelDia } from "@/lib/reservas";
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
          texto="Volvé a la lista de espacios del edificio."
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

      <h2 className="sec">Disponibilidad</h2>
      <div className="dispo">
        {proximos.map((d, n) => {
          const cupo = cupoDelDia(e, d, estado.reservas);
          const total = turnosDelDia(e, d);
          return (
            <div key={n} className={"dia-d" + (cupo === 0 ? " sin" : "")}>
              <i>{esHoy(d) ? "hoy" : diaCorto(d)}</i>
              <b>{numDia(d)}</b>
              <span>{cupo === 0 ? "sin lugar" : `${cupo}/${total}`}</span>
            </div>
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
          <li key={r}><Icon n="check" s={15} w={2.3} />{r}</li>
        ))}
      </ul>

      <button className="entrar" type="button" onClick={() => ir("r05")} style={{ marginTop: 20 }}>
        Reservar {e.nombre}
      </button>

      <FinLista texto={`${e.nombre} · ${e.piso}`} />
    </div>
  );
}
