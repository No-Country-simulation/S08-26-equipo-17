"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Linea, type Hito } from "../ui/Linea";
import { Ficha, Dato } from "../ui/Panel";
import { Aviso } from "../ui/Estados";
import { RESIDENTE, type VistaP } from "@/lib/data";
import { buscarUnidades, unidadPorCodigo, type Unidad } from "@/lib/edificio";
import { PERMISOS, ROTULO_PERMISO, historialOrdenado, ICONO_EVENTO } from "@/lib/unidad";
import type { NombreIcono } from "../ui/Icon";
import { hace, pesos } from "@/lib/formato";
import { diaEnPalabras } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** P02 · Unidades y búsqueda.
 *  Recepción busca por unidad o por persona, porque quien llega dice
 *  "vengo a lo de Osorio" y no "vengo al 7D". Desde el resultado se abre el
 *  contexto completo de esa unidad sin cambiar de pantalla. */

const ROTULO_CUENTA = { "al-dia": "Al día", debe: "Debe", informado: "Pago informado" } as const;

export function P02({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const [q, setQ] = useState("");
  const [abierta, setAbierta] = useState<string | null>(refe ?? null);

  const resultados = buscarUnidades(q);
  const u: Unidad | undefined = abierta ? unidadPorCodigo(abierta) : undefined;

  if (u) {
    const visitas = estado.visitas.filter((v) => v.unidad === u.codigo && v.cuando !== "historial");
    const entregas = estado.entregas.filter((e) => e.unidad === u.codigo);
    const aRetirar = entregas.filter((e) => e.estado === "retirar");
    const permisos = u.codigo === RESIDENTE.unidad
      ? estado.permisos.filter((p) => p.activo)
      : [];
    const eventos = u.codigo === RESIDENTE.unidad
      ? historialOrdenado(estado.eventos).slice(0, 8)
      : [];
    const hitos: Hito[] = eventos.map((e) => ({
      id: e.id, cuando: e.cuando, icono: ICONO_EVENTO[e.tipo] as NombreIcono,
      titulo: e.titulo, detalle: e.detalle, autor: e.responsable, rol: e.rol,
    }));

    return (
      <>
        <button className="btn-desk" type="button" onClick={() => setAbierta(null)}>
          <Icon n="volver" s={16} w={2.1} />Volver a la búsqueda
        </button>

        <div className="ent-cab" style={{ marginTop: 18 }}>
          <div>
            <span className="id">{u.codigo}</span>
            <p className="meta">
              Piso {u.piso} · {u.ambientes} · {u.metros} m²
              {u.telefono && ` · ${u.telefono}`}
            </p>
          </div>
          <div className="der">
            <span className={"pastilla" + (u.cuenta === "al-dia" ? " gris" : "")}>
              <Icon n={u.cuenta === "al-dia" ? "check" : "reloj"} s={13} w={2.2} />
              {ROTULO_CUENTA[u.cuenta]}
              {u.saldo > 0 && ` · ${pesos(u.saldo)}`}
            </span>
          </div>
        </div>

        <div className="columnas" style={{ marginTop: 20 }}>
          <section className="tarjeta">
            <h2><Icon n="personas" s={17} w={1.9} />Quiénes viven acá<span className="cnt">{u.residentes.length}</span></h2>
            <div className="cuerpo">
              {u.residentes.map((r) => (
                <div className="fila-op" key={r}>
                  <span className="av">{r.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                  <span className="d"><b>{r}</b><i>Unidad {u.codigo}</i></span>
                </div>
              ))}
            </div>

            {permisos.length > 0 && (
              <>
                <h2 style={{ borderTop: "1px solid var(--borde)" }}>
                  <Icon n="candado" s={17} w={1.9} />
                  Entran sin autorización
                  <span className="cnt">{permisos.length}</span>
                </h2>
                <div className="cuerpo">
                  {permisos.map((p) => (
                    <div className="fila-op" key={p.id}>
                      <span className="av">{p.iniciales}</span>
                      <span className="d">
                        <b>{p.nombre}</b>
                        <i>{ROTULO_PERMISO[p.tipo]} · {p.detalle}</i>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="tarjeta">
            <h2><Icon n="credencial" s={17} w={1.9} />Visitas de hoy y próximas<span className="cnt">{visitas.length}</span></h2>
            <div className="cuerpo">
              {visitas.length === 0 ? (
                <p className="mensaje-vacio">No hay visitas autorizadas.</p>
              ) : (
                visitas.map((v) => (
                  <button className="fila-op" type="button" key={v.id} onClick={() => ir("p04", v.codigo)}>
                    <span className="ic"><Icon n="qr" s={18} w={1.8} /></span>
                    <span className="d">
                      <b>{v.nombre}</b>
                      <i>{diaEnPalabras(new Date(v.fecha))} · {v.horario} · {v.codigo}</i>
                    </span>
                    <span className="der">
                      <span className={"pastilla" + (v.estado === "vigente" ? "" : " gris")}>
                        {v.estado === "vigente" ? "Vigente" : "Programada"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="pie-t">
              <button type="button" onClick={() => ir("p04")}>
                <Icon n="credencial" s={15} w={1.9} />Validar un pase de esta unidad
              </button>
            </div>
          </section>

          <section className="tarjeta">
            <h2><Icon n="caja" s={17} w={1.9} />Entregas<span className="cnt">{entregas.length}</span></h2>
            <div className="cuerpo">
              {entregas.length === 0 ? (
                <p className="mensaje-vacio">Nunca llegó nada para esta unidad.</p>
              ) : (
                entregas.map((e) => (
                  <div className="fila-op" key={e.id}>
                    <span className="ic"><Icon n="caja" s={18} w={1.8} /></span>
                    <span className="d">
                      <b>{e.titulo}</b>
                      <i>{e.estado === "retirar" ? `Recibido ${hace(e.recibidoEl)}` : `Retirado por ${e.retiradoPor}`}</i>
                    </span>
                    <span className="der">
                      <span className={"pastilla" + (e.estado === "retirar" ? "" : " gris")}>
                        {e.estado === "retirar" ? "Para retirar" : "Retirado"}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
            {aRetirar.length > 0 && (
              <div className="pie-t">
                <button type="button" onClick={() => ir("p05")}>
                  <Icon n="caja" s={15} w={1.9} />Entregar lo que está guardado
                </button>
              </div>
            )}
          </section>
        </div>

        <Ficha>
          <Dato k="Estado de cuenta" v={`${ROTULO_CUENTA[u.cuenta]}${u.saldo > 0 ? ` · ${pesos(u.saldo)}` : ""}`} />
          <Dato k="Metros" v={`${u.metros} m²`} />
          <Dato k="Teléfono" v={u.telefono ?? "No registrado"} />
          <Dato k="Piso" v={String(u.piso)} />
        </Ficha>

        {hitos.length > 0 ? (
          <>
            <h2 className="sec">Historial de la unidad</h2>
            <Linea hitos={hitos} relativo />
          </>
        ) : (
          <Aviso icono="info">
            El historial completo de esta unidad lo ve administración (A05). Recepción ve lo
            operativo del día: accesos, entregas y visitas.
          </Aviso>
        )}
      </>
    );
  }

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Buscar unidad</h1>
          <p>Por número de unidad, por piso o por el nombre de quien vive ahí.</p>
        </div>
      </div>

      <div className="buscador">
        <span className="gl"><Icon n="ojo" s={19} w={1.9} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="7D, Osorio, piso 7…" aria-label="Buscar unidad o persona" />
        {q && (
          <button className="limpiar" type="button" onClick={() => setQ("")} aria-label="Borrar la búsqueda">
            <Icon n="mas" s={15} w={2.4} />
          </button>
        )}
      </div>

      <div className="grilla">
        <div className="cab" style={{ gridTemplateColumns: "90px 1fr 150px 130px 40px" }}>
          <span>Unidad</span><span>Quiénes viven</span><span>Cuenta</span><span>Operativo</span><span />
        </div>
        {resultados.length === 0 ? (
          <p className="mensaje-vacio">
            No hay ninguna unidad ni persona que coincida con “{q}”. Probá con el número de
            unidad o con el apellido.
          </p>
        ) : (
          resultados.map((x) => {
            const pend = estado.entregas.filter((e) => e.unidad === x.codigo && e.estado === "retirar").length;
            const vis = estado.visitas.filter((v) => v.unidad === x.codigo && v.cuando === "hoy").length;
            return (
              <button className="fil" type="button" key={x.codigo}
                style={{ gridTemplateColumns: "90px 1fr 150px 130px 40px" }}
                onClick={() => setAbierta(x.codigo)}>
                <span>
                  <span className="cod">{x.codigo}</span>
                  <span className="sub">Piso {x.piso}</span>
                </span>
                <span>
                  {x.residentes.join(", ")}
                  <span className="sub">{x.ambientes} · {x.metros} m²</span>
                </span>
                <span>
                  <span className={"pastilla" + (x.cuenta === "al-dia" ? " gris" : "")}>
                    {ROTULO_CUENTA[x.cuenta]}
                  </span>
                </span>
                <span className="sub" style={{ margin: 0 }}>
                  {pend > 0 && `${pend} sin retirar`}
                  {pend > 0 && vis > 0 && " · "}
                  {vis > 0 && `${vis} visita${vis > 1 ? "s" : ""} hoy`}
                  {pend === 0 && vis === 0 && "Sin pendientes"}
                </span>
                <span><Icon n="chevron" s={15} w={2.2} /></span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
