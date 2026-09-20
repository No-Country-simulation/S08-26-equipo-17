"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { ZonaContexto } from "../ui/ZonaContexto";
import { Panel, Ficha, Dato } from "../ui/Panel";
import { SubNav } from "../ui/SubNav";
import { Hoja } from "../ui/Hoja";
import { Aviso } from "../ui/Estados";
import { EDIFICIO, PESTANAS_EDIFICIO, RESIDENTE, type Vista } from "@/lib/data";
import { PERSONAS, ROTULO_VINCULO, ROTULO_PERMISO, UNIDAD } from "@/lib/unidad";
import { fechaCorta, hace } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { diaEnPalabras } from "@/lib/reservas";

/** R02 · Mi unidad.
 *
 *  Antes este destino era "Visitas" y era una lista plana. Ahora es la
 *  unidad entera, en paneles: se abre el que te interesa y el resto queda
 *  dicho en una línea. Es el mismo principio del producto aplicado a una
 *  pantalla: unidad → personas → operaciones → historial. */
export function R02({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [revocar, setRevocar] = useState<string | null>(null);

  const permisos = estado.permisos.filter((p) => p.activo);
  const revocados = estado.permisos.filter((p) => !p.activo);
  const visitasHoy = estado.visitas.filter((v) => v.cuando === "hoy" && v.estado !== "cancelada");
  const proximas = estado.visitas.filter((v) => v.cuando === "proximas");
  const entregas = estado.entregas.filter((e) => e.unidad === RESIDENTE.unidad);
  const aRetirar = entregas.filter((e) => e.estado === "retirar");
  const elegido = estado.permisos.find((p) => p.id === revocar);

  return (
    <div className="vista" id="r02">
      <ZonaContexto ir={ir} volverA="r01" foto="/img/fachada.jpg"
        contexto={EDIFICIO.ciudad}
        titulo={EDIFICIO.nombre + " · " + UNIDAD.codigo}
        dato={UNIDAD.piso + " · " + UNIDAD.ambientes}>
        <SubNav etiqueta="Secciones de Mi edificio" opciones={PESTANAS_EDIFICIO}
          valor={"r02" as Vista} onCambio={(v) => ir(v)} />
      </ZonaContexto>

      <div className="paneles">
        <Panel icono="personas" titulo="Personas"
          resumen={PERSONAS.map((p) => p.nombre.split(" ")[0]).join(", ")}
          contador={PERSONAS.length}>
          {PERSONAS.map((p) => (
            <div className="persona-f" key={p.id}>
              <span className="av">{p.iniciales}</span>
              <span className="d">
                <b>{p.nombre}</b>
                <i>{ROTULO_VINCULO[p.vinculo]}</i>
                {p.contacto && <i>{p.contacto}</i>}
              </span>
            </div>
          ))}
        </Panel>

        {/* El panel más delicado del producto: va segundo, abierto, y con la
            baja a un toque. */}
        <Panel icono="candado" titulo="Permisos permanentes"
          resumen={permisos.length === 0
            ? "Ninguno activo"
            : permisos.map((p) => p.tipo === "proveedor" ? p.nombre : p.nombre.split(" ")[0]).join(", ")}
          contador={permisos.length}>
          {permisos.length === 0 ? (
            <p className="vacio-chico">Nadie tiene permiso permanente.</p>
          ) : (
            permisos.map((p) => (
              <div className="permiso" key={p.id}>
                <div className="arr">
                  <span className="av">{p.iniciales}</span>
                  <span className="d">
                    <b>{p.nombre}</b>
                    <i>{ROTULO_PERMISO[p.tipo]} · {p.detalle}</i>
                  </span>
                  <span className="estado-acceso chico">Activo</span>
                </div>
                <p className="meta-acceso">
                  Lo dio {p.otorgadoPor} · {fechaCorta(p.otorgadoEl)}
                  {" · "}
                  {p.ultimoIngreso ? `último ingreso ${hace(p.ultimoIngreso)}` : "todavía no entró"}
                </p>
                <button className="btn-ter peligro" type="button" onClick={() => setRevocar(p.id)}>
                  Dar de baja el permiso
                </button>
              </div>
            ))
          )}

          {revocados.length > 0 && (
            <div className="revocados">
              <span className="k">Dados de baja</span>
              {revocados.map((p) => (
                <p key={p.id}>{p.nombre} · {ROTULO_PERMISO[p.tipo]}</p>
              ))}
            </div>
          )}

        </Panel>

        <Panel icono="personaMas" titulo="Visitas"
          resumen={visitasHoy.length > 0
            ? `${visitasHoy.length} hoy · ${proximas.length} programadas`
            : `${proximas.length} programadas`}
          contador={visitasHoy.length + proximas.length}>
          {[...visitasHoy, ...proximas].slice(0, 4).map((v) => (
            <button className="mini-f" type="button" key={v.id} onClick={() => ir("r16", v.id)}>
              <span className="d">
                <b>{v.nombre}</b>
                <i>{v.dia ? `${v.dia} · ${v.horario}` : `${diaEnPalabras(new Date(v.fecha))} · ${v.horario}`}</i>
              </span>
              <span className={"pastilla" + (v.estado === "vigente" ? "" : " gris")}>
                {v.estado === "vigente" ? "Vigente" : "Programada"}
              </span>
            </button>
          ))}
          <div className="acciones-panel">
            <button className="btn-ter" type="button" onClick={() => ir("r06")}>
              Ver todas las visitas
            </button>
            <button className="btn-sec" type="button" onClick={() => ir("f01")}>
              <Icon n="mas" s={16} w={2.4} />Autorizar visita
            </button>
          </div>
        </Panel>

        <Panel icono="caja" titulo="Entregas"
          resumen={aRetirar.length > 0 ? `${aRetirar.length} para retirar` : "Nada para retirar"}
          contador={aRetirar.length || undefined}>
          {entregas.slice(0, 3).map((e) => (
            <button className="mini-f" type="button" key={e.id} onClick={() => ir("g11", e.id)}>
              <span className="d">
                <b>{e.titulo}</b>
                <i>{e.estado === "retirar" ? `Recibido ${hace(e.recibidoEl)}` : `Retirado ${hace(e.retiradoEl!)}`}</i>
              </span>
              <span className={"pastilla" + (e.estado === "retirar" ? "" : " gris")}>
                {e.estado === "retirar" ? "Para retirar" : "Retirado"}
              </span>
            </button>
          ))}
          <div className="acciones-panel">
            <button className="btn-ter" type="button" onClick={() => ir("r08")}>
              Ver todas las entregas
            </button>
          </div>
        </Panel>

        <Panel icono="casa" titulo="Datos de la unidad" resumen={`${UNIDAD.piso} · ${UNIDAD.participacion}`}>
          <Ficha>
            <Dato k="Edificio" v={UNIDAD.edificio} ancho />
            <Dato k="Unidad" v={`${UNIDAD.codigo} · ${UNIDAD.piso}`} />
            <Dato k="Superficie" v={UNIDAD.ambientes} />
            <Dato k="Cochera" v={UNIDAD.cochera} />
            <Dato k="Baulera" v={UNIDAD.baulera} />
            <Dato k="Participación" v={UNIDAD.participacion} />
          </Ficha>
          <div className="acciones-panel">
            <button className="btn-ter" type="button" onClick={() => ir("g15")}>
              Ver el edificio
            </button>
          </div>
        </Panel>
      </div>

      <button className="fila aire" type="button" onClick={() => ir("r17")} style={{ marginTop: 16 }}>
        <span className="ic"><Icon n="lista" s={20} w={1.8} /></span>
        <span className="cu">
          <span className="t">Historial de la unidad</span>
        </span>
        <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
      </button>

      {elegido && (
        <Hoja
          titulo={`Dar de baja a ${elegido.nombre}`}
          texto="Va a necesitar tu autorización para entrar."
          confirmar="Dar de baja"
          peligro
          onConfirmar={() => {
            hacer({ t: "permiso/revocar", id: elegido.id, por: RESIDENTE.nombre });
            setRevocar(null);
          }}
          onCancelar={() => setRevocar(null)}
        />
      )}
    </div>
  );
}
