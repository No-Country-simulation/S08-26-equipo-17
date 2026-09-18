"use client";
import { useState, type ReactNode } from "react";
import { Icon, type NombreIcono } from "./Icon";

/** Panel plegable. Es lo que convierte Mi unidad en una pantalla navegable
 *  en vez de una lista plana de treinta filas: cada bloque dice qué guarda
 *  y cuánto, y se abre sólo el que te interesa. */
export function Panel({
  icono, titulo, resumen, contador, abiertoPorDefecto = false, children, accion,
}: {
  icono: NombreIcono;
  titulo: string;
  resumen?: string;
  contador?: number;
  abiertoPorDefecto?: boolean;
  children: ReactNode;
  accion?: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto);
  return (
    <section className={"panel-p" + (abierto ? " abierto" : "")}>
      <button className="cab" type="button" aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}>
        <span className="ic"><Icon n={icono} s={19} w={1.8} /></span>
        <span className="d">
          <b>{titulo}</b>
          {resumen && <i>{resumen}</i>}
        </span>
        {contador != null && <span className="contador">{contador}</span>}
        <span className="chev" aria-hidden="true"><Icon n="chevron" s={16} w={2.2} /></span>
      </button>
      {abierto && (
        <div className="cuerpo">
          {children}
          {accion}
        </div>
      )}
    </section>
  );
}

/** Fila de datos: clave arriba, valor abajo. Para fichas de entidad. */
export function Dato({ k, v, ancho }: { k: string; v: ReactNode; ancho?: boolean }) {
  return (
    <div className={"dato-f" + (ancho ? " ancho" : "")}>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function Ficha({ children }: { children: ReactNode }) {
  return <div className="ficha-datos">{children}</div>;
}
