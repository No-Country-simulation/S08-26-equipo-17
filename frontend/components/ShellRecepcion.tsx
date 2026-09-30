"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, type NombreIcono } from "./ui/Icon";
import { P01 } from "./recepcion/P01";
import { P02 } from "./recepcion/P02";
import { P03 } from "./recepcion/P03";
import { P04 } from "./recepcion/P04";
import { P05 } from "./recepcion/P05";
import { P07 } from "./recepcion/P07";
import { P08 } from "./recepcion/P08";
import { EDIFICIO, RECEPCION, type VistaP } from "@/lib/data";

/** Escritorio de recepción. 1280 × 800.
 *
 *  No es un dashboard: es un mostrador. La gente espera del otro lado, así
 *  que los destinos están siempre a la vista en el riel, con área grande, y
 *  nada está a más de un toque. */

const DESTINOS: { id: VistaP; rotulo: string; icono: NombreIcono }[] = [
  { id: "p01", rotulo: "Inicio", icono: "casa" },
  { id: "p04", rotulo: "Validar acceso", icono: "credencial" },
  { id: "p05", rotulo: "Entregas", icono: "caja" },
  { id: "p02", rotulo: "Unidades", icono: "personas" },
  { id: "p07", rotulo: "Incidencias", icono: "alerta" },
  { id: "p08", rotulo: "Agenda", icono: "calendario" },
];

function Reloj() {
  const [h, setH] = useState<string>("");
  useEffect(() => {
    const f = () => setH(new Intl.DateTimeFormat("es-AR", {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()));
    f();
    const t = window.setInterval(f, 30000);
    return () => window.clearInterval(t);
  }, []);
  return <span className="reloj">{h}</span>;
}

export function ShellRecepcion({
  vista, refe, ir, onSalir,
}: {
  vista: VistaP; refe?: string;
  ir: (v: VistaP, ref?: string) => void;
  onSalir: () => void;
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  useEffect(() => { caja.current?.scrollTo(0, 0); }, [vista, refe]);

  return (
    <section className="desk" aria-label="CondoTrack recepción">
      <nav className="desk-rail" aria-label="Acciones de recepción">
        <span className="logo" aria-hidden="true">
          <img src="/brand/CT_SYMBOL_PRIMARY_TRANSPARENT.svg" alt="" width={22} height={22} />
        </span>
        {DESTINOS.map((d) => (
          <button key={d.id} type="button" onClick={() => ir(d.id)}
            aria-current={vista === d.id ? "page" : undefined}>
            <span className="gl"><Icon n={d.icono} s={19} w={1.9} /></span>
            {d.rotulo}
          </button>
        ))}
        <span className="sep" />
        <button className="salir" type="button" onClick={onSalir}>
          <span className="gl"><Icon n="salir" s={19} w={1.9} /></span>
          Salir
        </button>
      </nav>

      <div className="desk-main">
        <header className="desk-top">
          <span className="ctx">
            <b>{EDIFICIO.nombreLargo}</b>
            <i>Recepción · {EDIFICIO.horarioRecepcion}</i>
          </span>
          <Reloj />
          <span className="yo">
            <span className="av">{RECEPCION.iniciales}</span>
            <span>
              <b>{RECEPCION.nombre}</b>
              <i>{RECEPCION.turno}</i>
            </span>
          </span>
        </header>

        <div className="desk-cuerpo" ref={caja}>
          {vista === "p01" && <P01 ir={ir} />}
          {vista === "p02" && <P02 ir={ir} refe={refe} />}
          {vista === "p03" && <P03 ir={ir} />}
          {vista === "p04" && <P04 ir={ir} refe={refe} />}
          {vista === "p05" && <P05 ir={ir} />}
          {vista === "p07" && <P07 ir={ir} />}
          {vista === "p08" && <P08 ir={ir} />}
        </div>
      </div>
    </section>
  );
}
