"use client";
import { pesos, porciento } from "@/lib/formato";

/** Donut de composición (ronda fuerte).
 *
 *  Un aro fino con separaciones, dibujado con trazos sobre un círculo: el
 *  total vive en el centro y cada porción lleva el color de su fila en la
 *  lista de abajo, en el mismo orden (de mayor a menor). Elegir una
 *  porción —o su fila— la engrosa y apaga las demás; el centro pasa a
 *  decir cuál es y cuánto pesa.
 *
 *  SVG a mano: el producto no tiene librería de gráficos. Los colores
 *  salen de --rubro-1…8, que no son de marca y sólo viven en datos. */

export type Porcion = { id: string; nombre: string; monto: number };

const TAM = 240;
const R = 100;
const GROSOR = 16;
const HUECO = 2.2;          // separación entre porciones, en px de arco

export function Torta({
  porciones, elegido, onElegir, total, rotuloTotal = "Total del período",
}: {
  porciones: Porcion[];
  elegido: string | null;
  onElegir: (id: string | null) => void;
  total: number;
  rotuloTotal?: string;
}) {
  const orden = [...porciones].sort((a, b) => b.monto - a.monto);
  const suma = orden.reduce((a, p) => a + p.monto, 0) || 1;
  const C = 2 * Math.PI * R;

  let acumulado = 0;
  const trozos = orden.map((p, n) => {
    const largo = (p.monto / suma) * C;
    const t = { ...p, n, largo, desde: acumulado, pct: (p.monto / suma) * 100 };
    acumulado += largo;
    return t;
  });
  const activo = trozos.find((t) => t.id === elegido);
  const resumen = trozos.map((t) => `${t.nombre}, ${porciento(t.pct)}`).join(". ");

  return (
    <div className={"torta" + (elegido ? " con-eleccion" : "")}>
      <svg viewBox={`0 0 ${TAM} ${TAM}`} role="img"
        aria-label={`Gastos del período. Total ${pesos(total)}. ${resumen}.`}>
        <circle cx={TAM / 2} cy={TAM / 2} r={R} className="aro-base" style={{ strokeWidth: GROSOR }} />
        {trozos.map((t) => (
          <circle
            key={t.id}
            cx={TAM / 2} cy={TAM / 2} r={R}
            className={"porcion" + (t.id === elegido ? " on" : "")}
            style={{ stroke: `var(--rubro-${(t.n % 8) + 1})`, strokeWidth: t.id === elegido ? GROSOR + 6 : GROSOR }}
            strokeDasharray={`${Math.max(t.largo - HUECO, 0.5)} ${C}`}
            strokeDashoffset={-t.desde}
            transform={`rotate(-90 ${TAM / 2} ${TAM / 2})`}
            onClick={() => onElegir(t.id === elegido ? null : t.id)}
          />
        ))}
      </svg>
      <div className="centro" aria-hidden="true">
        {activo ? (
          <>
            <span className="k">{activo.nombre}</span>
            <b>{pesos(activo.monto)}</b>
            <span className="p">{porciento(activo.pct)}</span>
          </>
        ) : (
          <>
            <span className="k">{rotuloTotal}</span>
            <b>{pesos(total)}</b>
          </>
        )}
      </div>
    </div>
  );
}
