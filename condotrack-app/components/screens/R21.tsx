"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Hoja } from "../ui/Hoja";
import { Torta } from "../ui/Torta";
import { Descarga } from "../ui/Descarga";
import type { Vista } from "@/lib/data";
import {
  DESGLOSE, PARTICIPACION, RUBROS, TOTAL_GASTOS, TOTAL_POR_PERIODO,
  PERIODOS_GASTOS, archivoComprobante, archivoCupon, archivoRendicion, expensaDelMes,
  gastosDeRubro, hayDetalle, porProveedor,
} from "@/lib/expensas";
import { pesos, periodoLargo, diaMes, porciento } from "@/lib/formato";

/** R21 · Composición (ronda fuerte).
 *
 *  Integrado a la pantalla, no metido en un bloque: título, el período
 *  como selector, el donut con el total al centro, las pestañas y el
 *  desglose en filas de una línea —punto de color, rubro, monto,
 *  porcentaje— conectadas con su porción. El detalle se abre desde la fila.
 *
 *  Debajo, tu parte: lo común que te toca, lo propio y el cupón. */

type Modo = "rubro" | "proveedor";
const MODOS = [
  { id: "rubro" as const, rotulo: "Rubros" },
  { id: "proveedor" as const, rotulo: "Proveedores" },
];

export function R21({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [periodo, setPeriodo] = useState(PERIODOS_GASTOS[0]);
  const [modo, setModo] = useState<Modo>("rubro");
  const [elegido, setElegido] = useState<string | null>(null);
  const [abrePeriodo, setAbrePeriodo] = useState(false);

  const conDetalle = hayDetalle(periodo);
  const total = TOTAL_POR_PERIODO[periodo] ?? TOTAL_GASTOS;
  const rubros = [...RUBROS].sort((a, b) => b.monto - a.monto);
  const grupos = porProveedor();
  /* El donut ordena de mayor a menor: la lista de proveedores tiene que
     ir igual para que el color de la fila sea el de su porción. */
  const ordenados = [...grupos].sort((a, b) => b.total - a.total);
  const exp = expensaDelMes();

  const elegir = (id: string) => setElegido(elegido === id ? null : id);

  return (
    <div className="vista" id="r21">
      <TopBar volverA="r20" ir={ir} />
      <div className="tit comp-tit">
        <h1>Gastos del consorcio</h1>
        <button className="comp-periodo" type="button" onClick={() => setAbrePeriodo(true)}>
          {periodoLargo(periodo)}<Icon n="chevron" s={16} />
        </button>
      </div>

      <section className="comp" aria-label="Composición del período">

        {!conDetalle ? (
          <>
            <div className="comp-solo">
              <span className="k">Total del período</span>
              <b>{pesos(total)}</b>
            </div>
            <p className="comp-sin">El detalle por rubro de este período está en la rendición.</p>
          </>
        ) : (
          <>
            <Torta
              porciones={modo === "rubro"
                ? RUBROS.map((r) => ({ id: r.id, nombre: r.nombre, monto: r.monto }))
                : ordenados.map((g) => ({ id: g.clave, nombre: g.clave, monto: g.total }))}
              elegido={elegido}
              onElegir={setElegido}
              total={total}
            />

            <Chips etiqueta="Ver por" opciones={MODOS} valor={modo}
              onCambio={(m) => { setModo(m); setElegido(null); }} />

            <ul className="comp-filas">
              {modo === "rubro"
                ? rubros.map((r, n) => (
                    <li key={r.id} className={elegido === r.id ? "abierta" : undefined}>
                      <button type="button" aria-expanded={elegido === r.id} onClick={() => elegir(r.id)}>
                        <span className="pt" style={{ background: `var(--rubro-${n + 1})` }} aria-hidden="true" />
                        <span className="nb">{r.nombre}</span>
                        <span className="mt">{pesos(r.monto)}</span>
                        <span className="pc">{porciento((r.monto / total) * 100)}</span>
                      </button>
                      {elegido === r.id && (
                        <div className="comp-detalle">
                          {gastosDeRubro(r.id).map((g) => (
                            <div className="cd-f" key={g.id}>
                              <span className="d"><b>{g.proveedor}</b><i>{g.concepto} · {diaMes(g.fecha)}</i></span>
                              <span className="n">{pesos(g.monto)}</span>
                              <Descarga chico rotulo="PDF" archivo={archivoComprobante(g)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))
                : ordenados.map((g, n) => (
                    <li key={g.clave} className={elegido === g.clave ? "abierta" : undefined}>
                      <button type="button" aria-expanded={elegido === g.clave} onClick={() => elegir(g.clave)}>
                        <span className="pt" style={{ background: `var(--rubro-${(n % 8) + 1})` }} aria-hidden="true" />
                        <span className="nb">{g.clave}</span>
                        <span className="mt">{pesos(g.total)}</span>
                        <span className="pc">{porciento((g.total / total) * 100)}</span>
                      </button>
                      {elegido === g.clave && (
                        <div className="comp-detalle">
                          {g.items.map((i) => (
                            <div className="cd-f" key={i.id}>
                              <span className="d"><b>{i.concepto}</b><i>{diaMes(i.fecha)} · {i.comprobante}</i></span>
                              <span className="n">{pesos(i.monto)}</span>
                              <Descarga chico rotulo="PDF" archivo={archivoComprobante(i)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
            </ul>
          </>
        )}
        <div className="comp-pie">
          <Descarga chico rotulo="Rendición" archivo={archivoRendicion(periodo)} />
        </div>
      </section>

      {conDetalle && (
        <section className="tu-parte" aria-label="Tu parte">
          <h2 className="sec">Tu parte · {PARTICIPACION.toLocaleString("es-AR")}%</h2>
          <div className="tabla">
            {DESGLOSE.comunes.map((l) => (
              <div className="tabla-f" key={l.concepto}>
                <span className="d"><b>Gastos comunes</b></span>
                <span className="n">{pesos(l.monto)}</span>
              </div>
            ))}
            {DESGLOSE.propios.map((l) => (
              <div className="tabla-f" key={l.concepto}>
                <span className="d"><b>{l.concepto}</b></span>
                <span className="n">{pesos(l.monto)}</span>
              </div>
            ))}
            <div className="tabla-f total-f">
              <span className="d"><b>Tu expensa</b></span>
              <span className="n">{pesos(exp.total)}</span>
            </div>
          </div>
          <Descarga chico rotulo="Cupón" archivo={archivoCupon(exp.periodo)} />
        </section>
      )}

      {abrePeriodo && (
        <Hoja titulo="Período" onCancelar={() => setAbrePeriodo(false)}
          cerrarRotulo="Cerrar" sinAcciones>
          <div className="tabla" style={{ marginTop: 4 }}>
            {PERIODOS_GASTOS.map((p) => (
              <button className="tabla-f pulsable" key={p} type="button"
                aria-current={p === periodo ? "true" : undefined}
                onClick={() => { setPeriodo(p); setElegido(null); setAbrePeriodo(false); }}>
                <span className="d"><b>{periodoLargo(p)}</b></span>
                <span className="n">{pesos(TOTAL_POR_PERIODO[p] ?? 0)}</span>
                {p === periodo && (
                  <span className="flech"><Icon n="check" s={16} w={2.4} /></span>
                )}
              </button>
            ))}
          </div>
          <div style={{ height: 20 }} />
        </Hoja>
      )}
    </div>
  );
}
