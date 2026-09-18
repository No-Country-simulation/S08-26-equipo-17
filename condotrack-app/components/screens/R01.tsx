"use client";
import { Icon, type NombreIcono } from "../ui/Icon";
import { BotonGlass } from "../ui/BotonGlass";
import { WidgetPrincipal, type EstadoWidget } from "../ui/WidgetPrincipal";
import { PilaVivas, type Viva } from "../ui/PilaVivas";
import { EDIFICIO, RECEPCION, RESIDENTE, type Vista } from "@/lib/data";
import { DESGLOSE, PARTICIPACION, expensaDelMes } from "@/lib/expensas";
import { pesos, periodoLargo, vencimientoEnPalabras } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { proximas, cuandoCorto, espacioDe } from "@/lib/reservas";

/** R01 · Inicio del residente.
 *
 *  La jerarquía es la de 03_INFORMATION_ARCHITECTURE y no se negocia:
 *
 *    CONTEXTO → ESTADO → ACCIONES FRECUENTES → CONTENIDO VIVO
 *
 *  · Contexto: la franja de arriba. Edificio y unidad, sin hero y sin
 *    saludo grande (D-15). El home no empieza felicitándote, empieza
 *    diciéndote dónde estás.
 *  · Estado: un solo widget con cuatro caras —expensas, visitas, entregas,
 *    reservas—. La cifra no lleva card propia: se apoya sobre el campo
 *    tonal del fondo.
 *  · Acciones: las tres que se hacen seguido, con el botón firma (D-06).
 *  · Contenido vivo: la pila. Apilan sólo objetos equivalentes (D-09), y
 *    por eso la expensa NO está ahí: es plata, no es un objeto del día. */

const ACCIONES: { icono: NombreIcono; rotulo: [string, string]; va: Vista }[] = [
  { icono: "personaMas", rotulo: ["Autorizar", "visita"], va: "f01" },
  { icono: "chat",       rotulo: ["Hacer", "reclamo"],    va: "f02" },
  { icono: "calendario", rotulo: ["Reservar", "espacio"], va: "r05" },
];

const dos = (n: number) => String(n).padStart(2, "0");

export function R01({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const exp = expensaDelMes();

  const visitasHoy = estado.visitas.filter(
    (v) => v.cuando === "hoy" && v.estado !== "cancelada"
  );
  const pasesVigentes = estado.visitas.filter((v) => v.estado === "vigente").length;
  const paraRetirar = estado.entregas.filter(
    (e) => e.unidad === RESIDENTE.unidad && e.estado === "retirar"
  );
  const proxima = proximas(estado.reservas)[0];
  const espacio = proxima ? espacioDe(proxima.recursoId) : undefined;

  /* "asuntos para revisar" no es un número escrito a mano: es lo que
     efectivamente tenés pendiente hoy. */
  const asuntos = paraRetirar.length + (exp.estado === "pagada" ? 0 : 1);
  const comunes = DESGLOSE.comunes.reduce((a, l) => a + l.monto, 0);
  const propios = DESGLOSE.propios.reduce((a, l) => a + l.monto, 0);

  /* ── el widget: cuatro caras del mismo estado ─────────────────────── */
  const ESTADOS: EstadoWidget[] = [
    {
      id: "expensa",
      rotulo: "Expensas",
      volanta: "Expensa del mes",
      titular: pesos(exp.total),
      detalle: periodoLargo(exp.periodo) + " · "
        + vencimientoEnPalabras(exp.vencimiento).toLowerCase(),
      pastilla: exp.estado === "pagada"
        ? { texto: "Pagada", icono: "check", apagada: true }
        : { texto: exp.estado === "vencida" ? "Vencida" : "Pendiente", icono: "reloj" },
      datos: [
        { k: "Gastos comunes", v: pesos(comunes) },
        { k: "De tu unidad", v: pesos(propios) },
        { k: "Tu parte", v: PARTICIPACION.toLocaleString("es-AR") + "%" },
      ],
      accion: {
        rotulo: "Ver el detalle y los gastos del consorcio",
        icono: "documento",
        onIr: () => ir("r20"),
      },
    },
    {
      id: "visitas",
      rotulo: "Visitas",
      volanta: "Visitas de hoy",
      titular: dos(visitasHoy.length),
      detalle: pasesVigentes === 0
        ? "Ningún pase vigente ahora mismo"
        : pasesVigentes === 1
        ? "1 pase vigente"
        : pasesVigentes + " pases vigentes",
      accion: { rotulo: "Ver mis visitas y pases", icono: "credencial", onIr: () => ir("r06") },
    },
    {
      id: "entregas",
      rotulo: "Entregas",
      volanta: "En recepción",
      titular: dos(paraRetirar.length),
      detalle: paraRetirar.length === 0
        ? "No hay nada esperándote"
        : paraRetirar.length === 1
        ? "1 paquete para retirar"
        : paraRetirar.length + " paquetes para retirar",
      accion: { rotulo: "Ver las entregas de la unidad", icono: "caja", onIr: () => ir("r08") },
    },
    {
      id: "reservas",
      rotulo: "Reservas",
      volanta: proxima ? "Tu próxima reserva" : "Espacios del edificio",
      titular: proxima && espacio ? espacio.nombre : "Sin reservas",
      detalle: proxima ? cuandoCorto(proxima) : "SUM, cowork, parrilla y lavandería",
      accion: proxima
        ? { rotulo: "Ver mis reservas", icono: "calendario", onIr: () => ir("r18") }
        : { rotulo: "Reservar un espacio", icono: "calendario", onIr: () => ir("r05") },
    },
  ];

  /* ── la pila: objetos equivalentes, y nada más (D-09) ─────────────── */
  const VIVAS: Viva[] = [];

  if (visitasHoy.length > 0 || pasesVigentes > 0) {
    VIVAS.push({
      id: "visitas",
      nodo: (
        <div className="viva visitas">
          <div className="osc">
            <img src="/img/visitas_fondo.jpg" alt="" />
            <div className="c">
              <div className="et">Visitas hoy</div>
              <div className="n">{dos(visitasHoy.length)}</div>
            </div>
            <span className="ir">
              <BotonGlass etiqueta="Ver mis visitas" tono="claro" onClick={() => ir("r06")} />
            </span>
          </div>
          {pasesVigentes > 0 && (
            <button className="pase-fila" type="button" onClick={() => ir("r07")}>
              <span className="punto" aria-hidden="true" />
              <b>{pasesVigentes === 1 ? "1 pase vigente" : pasesVigentes + " pases vigentes"}</b>
              <span className="ver">Ver<Icon n="chevron" s={14} w={2.2} /></span>
            </button>
          )}
        </div>
      ),
    });
  }

  VIVAS.push({
    id: "estado",
    nodo: (
      <button className="viva hero mat-foto" type="button" onClick={() => ir("r17")}
        aria-label="Ver el historial de la unidad">
        <img src="/img/hero_araoz.jpg" alt="" />
        <span className="et">Hoy</span>
        <span className="sobre">
          <span className="tx">
            <h2>Todo en orden</h2>
            <p>{asuntos === 1 ? "1 asunto para revisar" : asuntos + " asuntos para revisar"}</p>
          </span>
        </span>
      </button>
    ),
  });

  if (proxima && espacio) {
    VIVAS.push({
      id: "reserva",
      nodo: (
        <button className="viva mat-foto" type="button" onClick={() => ir("r18")}>
          <img src={espacio.img} alt="" />
          <span className="et">Próxima reserva</span>
          <span className="sobre">
            <span className="tx">
              <b>{espacio.nombre}</b>
              <i>{cuandoCorto(proxima)}</i>
            </span>
          </span>
        </button>
      ),
    });
  }

  if (paraRetirar.length > 0) {
    VIVAS.push({
      id: "entrega",
      nodo: (
        <button className="viva paquete" type="button" onClick={() => ir("r08")}>
          <span className="ic"><Icon n="caja" s={30} w={1.7} /></span>
          <span className="tx">
            <b>{paraRetirar.length === 1
              ? "1 paquete para retirar"
              : paraRetirar.length + " paquetes para retirar"}</b>
            <i>Te lo guarda {RECEPCION.nombre} en recepción</i>
          </span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
      ),
    });
  }

  return (
    <div className="vista sandwich" id="r01">
      {/* CONTEXTO — silencioso: dónde estás, no cómo te llamás (D-15) */}
      <header className="cabezal">
        <span className="marca-cab">
          <img src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" width={780} height={170} />
        </span>
        <h1>{EDIFICIO.nombre} · Unidad {RESIDENTE.unidad}</h1>
        <button className="circulo claro" type="button" onClick={() => ir("mas")}
          aria-label={"Tu perfil, " + RESIDENTE.nombre}>
          {RESIDENTE.iniciales}
        </button>
      </header>

      {/* ESTADO */}
      <WidgetPrincipal estados={ESTADOS} etiqueta="Estado de tu unidad" />

      {/* ACCIONES FRECUENTES */}
      <div className="tres">
        {ACCIONES.map((a) => (
          <button className="acceso" type="button" key={a.rotulo.join(" ")}
            onClick={() => ir(a.va)}>
            <span className="glifo" aria-hidden="true"><Icon n={a.icono} s={22} w={1.8} /></span>
            <BotonGlass etiqueta="" tamano="s" decorativo />
            <span className="rot">{a.rotulo[0]}<br />{a.rotulo[1]}</span>
          </button>
        ))}
      </div>

      <div className="directos">
        <button className="directo" type="button" onClick={() => ir("g15")}>
          <span className="ic"><Icon n="sobre" s={17} w={1.8} /></span>
          <span className="d">
            <b>Administración</b>
            <i>{EDIFICIO.administracion}</i>
          </span>
          <BotonGlass etiqueta="" tamano="s" decorativo />
        </button>
        <button className="directo" type="button" onClick={() => ir("g15")}>
          <span className="ic"><Icon n="chat" s={17} w={1.8} /></span>
          <span className="d">
            <b>Recepción</b>
            <i>{RECEPCION.nombre}</i>
          </span>
          <BotonGlass etiqueta="" tamano="s" decorativo />
        </button>
      </div>

      {/* CONTENIDO VIVO */}
      <h2 className="sec">Lo de hoy</h2>
      <PilaVivas items={VIVAS} etiqueta="Lo que está pasando hoy en tu unidad" />
    </div>
  );
}
