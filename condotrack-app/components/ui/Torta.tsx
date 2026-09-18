"use client";
import { pesos, porciento } from "@/lib/formato";

/** Gráfico de torta dibujado a mano con SVG. Sin librería de gráficos: el
 *  producto no tiene ninguna y no vale la pena traer uno entero por ocho
 *  porciones.
 *
 *  Color: una escala neutra derivada del carbón, del más oscuro (el rubro
 *  más grande) al más claro. El amarillo se reserva para el rubro que
 *  elegiste; si todos los rubros fueran de colores, el amarillo dejaría de
 *  significar algo. Las porciones nunca se distinguen sólo por color: la
 *  leyenda es texto y trae el porcentaje. */

export type Porcion = { id: string; nombre: string; monto: number };

const TAM = 200;
const C = TAM / 2;
const R_EXT = 94;
const R_INT = 61;
const SALTO = 7;          // cuánto sale la porción elegida

const punto = (r: number, ang: number, dx = 0, dy = 0) =>
  [C + dx + r * Math.cos(ang), C + dy + r * Math.sin(ang)] as const;

function segmento(a0: number, a1: number, dx: number, dy: number) {
  const [x0, y0] = punto(R_EXT, a0, dx, dy);
  const [x1, y1] = punto(R_EXT, a1, dx, dy);
  const [x2, y2] = punto(R_INT, a1, dx, dy);
  const [x3, y3] = punto(R_INT, a0, dx, dy);
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${R_EXT} ${R_EXT} 0 ${grande} 1 ${x1} ${y1}`
    + ` L ${x2} ${y2} A ${R_INT} ${R_INT} 0 ${grande} 0 ${x3} ${y3} Z`;
}

export function Torta({
  porciones, elegido, onElegir, total,
}: {
  porciones: Porcion[];
  elegido: string | null;
  onElegir: (id: string | null) => void;
  total: number;
}) {
  /* De mayor a menor: así la escala va de oscuro a claro y se lee sola. */
  const orden = [...porciones].sort((a, b) => b.monto - a.monto);
  const suma = orden.reduce((a, p) => a + p.monto, 0) || 1;

  let ang = -Math.PI / 2;
  const trozos = orden.map((p, n) => {
    const a0 = ang;
    const a1 = ang + (p.monto / suma) * Math.PI * 2;
    ang = a1;
    const medio = (a0 + a1) / 2;
    const fuera = elegido === p.id;
    const dx = fuera ? Math.cos(medio) * SALTO : 0;
    const dy = fuera ? Math.sin(medio) * SALTO : 0;
    return { ...p, n, d: segmento(a0, a1, dx, dy), pct: (p.monto / suma) * 100, fuera };
  });

  const activo = trozos.find((t) => t.id === elegido);

  const resumen = trozos
    .map((t) => `${t.nombre}, ${porciento(t.pct)}`)
    .join(". ");

  return (
    <div className="torta">
      <div className="lienzo">
        <svg viewBox={`0 0 ${TAM} ${TAM}`} role="img"
          aria-label={`Gastos del período por rubro. Total ${pesos(total)}. ${resumen}.`}>
          {trozos.map((t) => (
            <path
              key={t.id}
              d={t.d}
              className={"porcion" + (t.fuera ? " on" : "")}
              style={{ fill: t.fuera ? "var(--amarillo)" : `var(--rubro-${t.n + 1})` }}
              onClick={() => onElegir(t.fuera ? null : t.id)}
            />
          ))}
        </svg>
        <div className="centro" aria-hidden="true">
          {/* Adentro del anillo sólo entran textos cortos. El nombre del
              rubro elegido se lee en el título de la sección de abajo, que
              tiene el ancho para mostrarlo entero. */}
          {activo ? (
            <>
              <span className="k">Del total</span>
              <b>{porciento(activo.pct)}</b>
              <span className="p">{pesos(activo.monto)}</span>
            </>
          ) : (
            <>
              <span className="k">Total</span>
              <b>{pesos(total)}</b>
              <span className="p">{porciones.length} rubros</span>
            </>
          )}
        </div>
      </div>

      <ul className="leyenda">
        {trozos.map((t) => (
          <li key={t.id}>
            <button type="button" aria-pressed={t.fuera}
              onClick={() => onElegir(t.fuera ? null : t.id)}>
              <span className="tinta" aria-hidden="true"
                style={{ background: t.fuera ? "var(--amarillo)" : `var(--rubro-${t.n + 1})` }} />
              <span className="nb">{t.nombre}</span>
              <span className="pc">{porciento(t.pct)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
