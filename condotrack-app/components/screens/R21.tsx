"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Chips } from "../ui/Chips";
import { Hoja } from "../ui/Hoja";
import { Torta } from "../ui/Torta";
import { Descarga } from "../ui/Descarga";
import { Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import type { Vista } from "@/lib/data";
import {
  RUBROS, RUBRO_LARGO, TOTAL_GASTOS, TOTAL_POR_PERIODO, PERIODOS_GASTOS,
  archivoComprobante, archivoRendicion, gastosDeRubro, hayDetalle, porProveedor,
} from "@/lib/expensas";
import { pesos, periodoCorto, periodoLargo, fechaCorta, porciento } from "@/lib/formato";

/** R21 · Gastos del consorcio.
 *  La torta es SVG dibujado a mano; la escala de color es neutra y el
 *  amarillo marca únicamente el rubro elegido. Ver components/ui/Torta.tsx. */

type Modo = "rubro" | "proveedor";
const MODOS = [
  { id: "rubro" as const, rotulo: "Por rubro" },
  { id: "proveedor" as const, rotulo: "Por proveedor" },
];

export function R21({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const [periodo, setPeriodo] = useState(PERIODOS_GASTOS[0]);
  const [modo, setModo] = useState<Modo>("rubro");
  const [rubro, setRubro] = useState<string | null>(null);
  const [proveedor, setProveedor] = useState<string | null>(null);
  const [abrePeriodo, setAbrePeriodo] = useState(false);
  const [verTorta, setVerTorta] = useState(false);

  const conDetalle = hayDetalle(periodo);
  const total = TOTAL_POR_PERIODO[periodo] ?? TOTAL_GASTOS;
  const elegido = rubro ? RUBROS.find((r) => r.id === rubro) : null;
  const grupos = porProveedor();

  return (
    <div className="vista" id="r21">
      <TopBar volverA="r20" ir={ir} />
      <div className="tit">
        <h1>Gastos del consorcio</h1>
        <p>En qué se fue la plata del edificio.</p>
      </div>

      {/* Elegir período: seis opciones no justifican una tira que empuja
          la torta fuera de la pantalla. Sube una hoja. */}
      <button className="selector" type="button" onClick={() => setAbrePeriodo(true)}>
        <span className="d">
          <span className="k">Período</span>
          <b>{periodoLargo(periodo)}</b>
        </span>
        <span className="n">{pesos(total)}</span>
        <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
      </button>

      {!conDetalle ? (
        <>
          <div className="cabecera-ent" style={{ marginTop: 22 }}>
            <span className="et">{periodoLargo(periodo)}</span>
            <h1>{pesos(total)}</h1>
            <p>Total gastado en el período</p>
          </div>
          <Aviso icono="info">
            De {periodoLargo(periodo).toLowerCase()} está cargado el total, no el detalle por
            rubro. En el prototipo sólo el mes en curso tiene las facturas cargadas:
            inventar seis meses de comprobantes sería mostrar datos que no existen.
          </Aviso>
          <Descarga rotulo="Descargar la rendición del período" archivo={archivoRendicion(periodo)} peso="820 KB" />
          <FinLista texto={`Período ${periodoCorto(periodo)}`} />
        </>
      ) : (
        <>
          {/* La torta es una segunda lectura, no la primera: el que entra
              quiere saber cuánto se gastó y en qué, y eso lo dice la tabla.
              Se despliega cuando la pedís. */}
          <button className="revelar" type="button" aria-expanded={verTorta}
            onClick={() => setVerTorta(!verTorta)}>
            <Icon n="chispa" s={17} w={1.8} />
            {verTorta ? "Ocultar cómo se reparte" : "Ver cómo se reparte"}
            <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
          </button>

          {verTorta && (
            <Torta
              porciones={RUBROS.map((r) => ({ id: r.id, nombre: r.nombre, monto: r.monto }))}
              elegido={rubro}
              onElegir={(id) => { setRubro(id); setModo("rubro"); }}
              total={total}
            />
          )}

          <Chips etiqueta="Cómo ver los gastos" opciones={MODOS} valor={modo}
            onCambio={(m) => { setModo(m); setRubro(null); setProveedor(null); }} />

          {modo === "rubro" ? (
            <>
              <div className="subtit">
                <h2>Rubros del período</h2>
                <span>{RUBROS.length} rubros</span>
              </div>

              <div className="tabla">
                  {[...RUBROS].sort((a, b) => b.monto - a.monto).map((r) => (
                    <button className="tabla-f pulsable" key={r.id} type="button"
                      onClick={() => { setRubro(r.id); setVerTorta(true); }}>
                      <span className="d">
                        <b>{RUBRO_LARGO[r.id] ?? r.nombre}</b>
                        <i>{porciento((r.monto / total) * 100)} del total · {gastosDeRubro(r.id).length} comprobantes</i>
                      </span>
                      <span className="n">{pesos(r.monto)}</span>
                      <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="subtit">
                <h2>Proveedores del período</h2>
                <span>{grupos.length}</span>
              </div>
              <div className="tabla">
                {grupos.map((g) => (
                  <div key={g.clave}>
                    <button className="tabla-f pulsable" type="button"
                      aria-expanded={proveedor === g.clave}
                      onClick={() => setProveedor(proveedor === g.clave ? null : g.clave)}>
                      <span className="d">
                        <b>{g.clave}</b>
                        <i>{g.items.length === 1 ? "1 comprobante" : `${g.items.length} comprobantes`}</i>
                      </span>
                      <span className="n">{pesos(g.total)}</span>
                      <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
                    </button>
                    {proveedor === g.clave && (
                      <div className="sub-tabla">
                        {g.items.map((i) => (
                          <div className="tabla-f" key={i.id}>
                            <span className="d">
                              <b>{i.concepto}</b>
                              <i>{fechaCorta(i.fecha)} · {i.comprobante}</i>
                              <Descarga chico rotulo="Comprobante" archivo={archivoComprobante(i)} />
                            </span>
                            <span className="n">{pesos(i.monto)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="sec">Rendición</h2>
          <Descarga rotulo="Descargar la rendición completa" archivo={archivoRendicion(periodo)} peso="860 KB" />
          <FinLista texto={`Cierre de ${periodoLargo(periodo).toLowerCase()}`} />
        </>
      )}

      {/* Elegir período: seis opciones en una hoja, sin sacar la torta de
          la pantalla. */}
      {abrePeriodo && (
        <Hoja titulo="Elegí el período" onCancelar={() => setAbrePeriodo(false)}
          cerrarRotulo="Cerrar" sinAcciones>
          <div className="tabla" style={{ marginTop: 4 }}>
            {PERIODOS_GASTOS.map((p) => (
              <button className="tabla-f pulsable" key={p} type="button"
                aria-current={p === periodo ? "true" : undefined}
                onClick={() => {
                  setPeriodo(p); setRubro(null); setProveedor(null); setAbrePeriodo(false);
                }}>
                <span className="d">
                  <b>{periodoLargo(p)}</b>
                  <i>{hayDetalle(p) ? "con detalle por rubro" : "sólo el total del período"}</i>
                </span>
                <span className="n">{pesos(TOTAL_POR_PERIODO[p] ?? 0)}</span>
                {p === periodo && (
                  <span className="flech"><Icon n="check" s={15} w={2.4} /></span>
                )}
              </button>
            ))}
          </div>
          <div style={{ height: 20 }} />
        </Hoja>
      )}

      {/* El detalle de un rubro tampoco es una pantalla: es una lista de
          comprobantes con su total. */}
      {elegido && (
        <Hoja titulo={RUBRO_LARGO[elegido.id] ?? elegido.nombre}
          texto={`${porciento((elegido.monto / total) * 100)} del total del período · ${gastosDeRubro(elegido.id).length} comprobantes`}
          onCancelar={() => setRubro(null)} cerrarRotulo="Cerrar" sinAcciones>
          <div className="tabla">
            {gastosDeRubro(elegido.id).map((g) => (
              <div className="tabla-f alto" key={g.id}>
                <span className="d">
                  <b>{g.proveedor}</b>
                  <i>{g.concepto}</i>
                  <i>{fechaCorta(g.fecha)} · {g.comprobante}</i>
                  <Descarga chico rotulo="Comprobante" archivo={archivoComprobante(g)} />
                </span>
                <span className="n">{pesos(g.monto)}</span>
              </div>
            ))}
            <div className="tabla-f total-f">
              <span className="d"><b>Total del rubro</b></span>
              <span className="n">{pesos(elegido.monto)}</span>
            </div>
          </div>
          <div style={{ height: 20 }} />
        </Hoja>
      )}
    </div>
  );
}
