"use client";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { useNavegacion } from "@/lib/navegacion";
import { CONTEXTO, type Vista } from "@/lib/data";

/** Zona de contexto (ronda visual 01, §1.4).
 *
 *  La parte de arriba de una pantalla que te dice dónde estás antes de que
 *  leas una palabra. Dos variantes:
 *
 *  · con foto: el lugar a sangre —el edificio, el espacio— con el texto
 *    apoyado abajo sobre un degradado. Es material Foto (D-11) aplicado a
 *    una zona entera, no a una card.
 *  · sin foto: el campo del ámbito con el isotipo grande y casi
 *    invisible. Para lo que no es un lugar: la expensa, un trámite.
 *
 *  El volver vive adentro y flota en vidrio, porque acá sí hay algo detrás
 *  (§1.5). Reemplaza a TopBar en las pantallas que la usan: repetir un
 *  header pesado arriba de la zona era justo lo que había que evitar. */
export function ZonaContexto({
  ir, volverA, foto, volanta, titulo, cifra, dato, contexto = CONTEXTO, children, accion,
}: {
  ir: (v: Vista, ref?: string) => void;
  volverA: Vista;
  foto?: string;
  volanta?: string;
  titulo: string;
  /** El título es un importe o un número: sube de escala y va en 900. */
  cifra?: boolean;
  dato?: ReactNode;
  contexto?: string;
  /** Lo que va abajo de todo, dentro de la zona: una subnav, una acción. */
  children?: ReactNode;
  accion?: ReactNode;
}) {
  const nav = useNavegacion();
  return (
    <header className={"zona-ctx" + (foto ? " con-foto" : "")}>
      {foto && <img className="zc-foto" src={foto} alt="" />}
      <span className="zc-iso" aria-hidden="true" />

      <div className="zc-barra">
        <button className={"circulo" + (foto ? " claro" : "")} type="button" aria-label="Volver"
          onClick={() => (nav?.hayVuelta ? nav.volver() : ir(volverA))}>
          <Icon n="volver" s={20} />
        </button>
        <span className="ctx">{contexto}</span>
        {accion}
      </div>

      <div className="zc-cuerpo">
        {volanta && <span className="vol">{volanta}</span>}
        <h1 className={cifra ? "cifra" : undefined}>{titulo}</h1>
        {dato && <span className="dato">{dato}</span>}
        {children}
      </div>
    </header>
  );
}
