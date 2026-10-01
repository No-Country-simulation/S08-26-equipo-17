import type { ReactNode } from "react";

export type Tono = "ok" | "alerta" | "error" | "pendiente" | "neutro" | "hecho" | "curso";

/** StatusTag: informa un estado. No es un botón y no se parece a uno:
 *  marca + palabra, sin borde ni fondo. La forma de la marca cambia con el
 *  tono (lleno, anillo, rombo), así el estado no depende sólo del color. */
export function StatusTag({ tono = "neutro", fuerte = false, children }: { tono?: Tono; fuerte?: boolean; children: ReactNode }) {
  return <span className="ct-status" data-tono={tono} data-fuerte={fuerte ? "" : undefined}><i aria-hidden="true" />{children}</span>;
}

/** Severidad: barras de intensidad + palabra. Es otra dimensión que el
 *  estado del caso y por eso tiene otra forma. */
export function Severidad({ g, children }: { g: "baja" | "media" | "alta"; children: ReactNode }) {
  return <span className="ct-sev" data-g={g}><i aria-hidden="true"><b /><b /><b /></i>{children}</span>;
}
