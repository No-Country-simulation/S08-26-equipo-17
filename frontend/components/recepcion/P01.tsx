"use client";
import { Icon, type NombreIcono } from "../ui/Icon";
import { RECEPCION, type VistaP } from "@/lib/data";
import { AVISOS_RECEPCION, AGENDA, quienEstaAdentro } from "@/lib/edificio";
import { hace, soloHora } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** P01 · Inicio de recepción.
 *  Cuatro acciones grandes arriba, y abajo las tres preguntas que recepción
 *  tiene que poder contestar sin buscar: quién está adentro, qué queda sin
 *  retirar y qué hay que saber hoy. */

const ACCIONES: {
  id: VistaP; titulo: string; desc: string; icono: NombreIcono; primaria?: boolean;
}[] = [
  { id: "p04", titulo: "Validar acceso", desc: "Verificar un pase y registrar la entrada", icono: "credencial", primaria: true },
  { id: "p05", titulo: "Registrar entrega", desc: "Paquete o sobre que llega para una unidad", icono: "caja" },
  { id: "p02", titulo: "Buscar unidad", desc: "Por número de unidad o por persona", icono: "personas" },
  { id: "p07", titulo: "Reportar incidente", desc: "Algo roto, algo raro, algo que avisar", icono: "alerta" },
];

export function P01({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const { estado } = useApp();
  const adentro = quienEstaAdentro(estado.visitas, estado.permisos);
  const sinRetirar = estado.entregas.filter((e) => e.estado === "retirar");
  const ahora = new Date();
  const proximos = AGENDA.filter((a) => new Date(a.hora) >= ahora).slice(0, 4);

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Buen turno, {RECEPCION.nombre.split(" ")[0]}</h1>
          <p>{adentro.length === 1 ? "1 persona adentro" : `${adentro.length} personas adentro`}
            {" · "}{sinRetirar.length === 1 ? "1 entrega sin retirar" : `${sinRetirar.length} entregas sin retirar`}</p>
        </div>
      </div>

      <div className="acciones-desk">
        {ACCIONES.map((a) => (
          <button key={a.id} type="button" className={"accion-g" + (a.primaria ? " primaria" : "")}
            onClick={() => ir(a.id)}>
            <span className="gl"><Icon n={a.icono} s={24} w={1.9} /></span>
            <span>
              <b>{a.titulo}</b>
              <i>{a.desc}</i>
            </span>
          </button>
        ))}
      </div>

      <div className="columnas">
        <section className="tarjeta">
          <h2>
            <Icon n="persona" s={17} w={1.9} />
            Quién está adentro
            <span className="cnt">{adentro.length}</span>
          </h2>
          <div className="cuerpo">
            {adentro.length === 0 ? (
              <p className="mensaje-vacio">No hay nadie adentro con pase activo.</p>
            ) : (
              adentro.map((a) => (
                <button className="fila-op" type="button" key={a.id} onClick={() => ir("p02", a.unidad)}>
                  <span className="av">{a.nombre.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                  <span className="d">
                    <b>{a.nombre}</b>
                    <i>Unidad {a.unidad} · {a.motivo}</i>
                  </span>
                  <span className="der"><span className="hora">desde {soloHora(a.desde)}</span></span>
                </button>
              ))
            )}
          </div>
          <div className="pie-t">
            <button type="button" onClick={() => ir("p04")}>
              <Icon n="credencial" s={15} w={1.9} />Registrar una salida
            </button>
          </div>
        </section>

        <section className="tarjeta">
          <h2>
            <Icon n="caja" s={17} w={1.9} />
            Entregas sin retirar
            <span className="cnt">{sinRetirar.length}</span>
          </h2>
          <div className="cuerpo">
            {sinRetirar.length === 0 ? (
              <p className="mensaje-vacio">No queda nada sin entregar.</p>
            ) : (
              sinRetirar.map((e) => (
                <button className="fila-op" type="button" key={e.id} onClick={() => ir("p05", e.id)}>
                  <span className="ic"><Icon n="caja" s={18} w={1.8} /></span>
                  <span className="d">
                    <b>{e.titulo}</b>
                    <i>Unidad {e.unidad} · {hace(e.recibidoEl)}</i>
                  </span>
                  <span className="der"><Icon n="chevron" s={15} w={2.2} /></span>
                </button>
              ))
            )}
          </div>
          <div className="pie-t">
            <button type="button" onClick={() => ir("p05")}>
              <Icon n="mas" s={15} w={2.4} />Registrar una entrega
            </button>
          </div>
        </section>

        <section className="tarjeta">
          <h2>
            <Icon n="info" s={17} w={1.9} />
            Para tener en cuenta hoy
          </h2>
          <div className="cuerpo">
            {AVISOS_RECEPCION.map((a) => (
              <p className={"aviso-op" + (a.tono === "alerta" ? " alerta-op" : "")} key={a.id}>
                <Icon n={a.tono === "alerta" ? "alerta" : "info"} s={16} w={1.9} />
                {a.texto}
              </p>
            ))}
          </div>
          <div className="pie-t">
            <button type="button" onClick={() => ir("p08")}>
              <Icon n="calendario" s={15} w={1.9} />
              Ver la agenda del día
              {proximos.length > 0 && ` · ${proximos.length} pendientes`}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
