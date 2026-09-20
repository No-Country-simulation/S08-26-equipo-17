"use client";
import { useState } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { BotonGlass } from "../ui/BotonGlass";
import { WidgetPrincipal, type EstadoWidget } from "../ui/WidgetPrincipal";
import { PilaVivas, type Viva } from "../ui/PilaVivas";
import { HojaPagar } from "../paneles/HojaPagar";
import { EDIFICIO, RESIDENTE, type Vista } from "@/lib/data";
import { expensaDelMes } from "@/lib/expensas";
import { pesos, diaMes, hace } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { proximas, cuandoCorto, espacioDe } from "@/lib/reservas";
import { historialOrdenado } from "@/lib/unidad";

/** R01 · Inicio del residente (ronda visual 01).
 *
 *  Dos zonas, no una colección de cards:
 *
 *  · EL CAMPO, arriba y a sangre: carbón con luz cálida, el isotipo grande
 *    casi invisible. Adentro va el header —que orienta y no domina—, el
 *    estado de la unidad con la cifra sin caja y su acción, y los cuatro
 *    accesos como una familia de círculos.
 *  · LO DE HOY, abajo: la pila de objetos vivos del día.
 *
 *  Administración y Recepción dejaron de ser dos filas con peso de acción
 *  principal (§2): son un acceso más, "Contactar", que lleva a Mi
 *  edificio, donde están los dos con horarios y canales. */

const ACCIONES: { icono: NombreIcono; rotulo: string; etiqueta: string; va: Vista }[] = [
  { icono: "personaMas", rotulo: "Autorizar", etiqueta: "Autorizar una visita", va: "f01" },
  { icono: "chat",       rotulo: "Reclamar",  etiqueta: "Hacer un reclamo",     va: "f02" },
  { icono: "calendario", rotulo: "Reservar",  etiqueta: "Reservar un espacio",  va: "r05" },
];

const dos = (n: number) => String(n).padStart(2, "0");

export function R01({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const exp = expensaDelMes();
  /* Pagar es una acción: abre la hoja acá, no manda a otra pantalla. */
  const [pagar, setPagar] = useState(false);

  const visitasHoy = estado.visitas.filter(
    (v) => v.cuando === "hoy" && v.estado !== "cancelada"
  );
  const vigentes = estado.visitas.filter((v) => v.estado === "vigente");
  const paraRetirar = estado.entregas.filter(
    (e) => e.unidad === RESIDENTE.unidad && e.estado === "retirar"
  );
  const proxima = proximas(estado.reservas)[0];
  const espacio = proxima ? espacioDe(proxima.recursoId) : undefined;
  const pagada = exp.estado === "pagada";

  /* La card del historial muestra lo último que pasó: un dato real, no
     un resumen que suena bien. */
  const ultimo = historialOrdenado(estado.eventos)[0];

  /* ── el estado: cuatro caras, una pregunta y una acción cada una ──── */
  const ESTADOS: EstadoWidget[] = [
    {
      id: "expensa",
      rotulo: "Expensas",
      volanta: "",
      titular: pesos(exp.total),
      detalle: pagada ? "Pagada" : "Vence " + diaMes(exp.vencimiento),
      pastilla: pagada ? undefined
        : { texto: exp.estado === "vencida" ? "Vencida" : "Pendiente" },
      primaria: pagada ? undefined : { rotulo: "Pagar", onIr: () => setPagar(true) },
      enlaces: [
        { rotulo: "Composición", icono: "torta", onIr: () => ir("r21") },
        { rotulo: "Movimientos", icono: "lista", onIr: () => ir("r23") },
      ],
    },
    {
      id: "visitas",
      rotulo: "Visitas",
      volanta: "Hoy",
      titular: visitasHoy.length === 1 ? "1 visita" : visitasHoy.length + " visitas",
      titularTexto: true,
      detalle: vigentes.length === 0
        ? "Sin pase activo"
        : vigentes.length === 1
        ? "Pase activo · " + vigentes[0].nombre
        : vigentes.length + " pases activos",
      primaria: vigentes.length > 0
        ? { rotulo: "Ver pase", icono: "qr", onIr: () => ir("r07", vigentes[0].id) }
        : { rotulo: "Autorizar visita", icono: "personaMas", onIr: () => ir("f01") },
      enlaces: [{ rotulo: "Visitas", onIr: () => ir("r06") }],
    },
    {
      id: "entregas",
      rotulo: "Entregas",
      volanta: paraRetirar.length === 0 ? "Entregas" : "Entrega pendiente",
      titular: paraRetirar.length === 0 ? "Nada pendiente"
        : paraRetirar.length === 1 ? "1 paquete" : paraRetirar.length + " paquetes",
      titularTexto: true,
      detalle: paraRetirar.length === 0 ? undefined : paraRetirar[0].titulo,
      primaria: paraRetirar.length > 0
        ? { rotulo: "Ver entrega", icono: "caja", onIr: () => ir("g11", paraRetirar[0].id) }
        : undefined,
      enlaces: [{ rotulo: "Entregas", onIr: () => ir("r08") }],
    },
    {
      id: "reservas",
      rotulo: "Reservas",
      volanta: proxima ? "Tu próxima reserva" : "Espacios del edificio",
      titular: proxima && espacio ? espacio.nombre : "Sin reservas",
      titularTexto: true,
      detalle: proxima ? cuandoCorto(proxima) : undefined,
      primaria: proxima
        ? { rotulo: "Ver reserva", icono: "calendario", onIr: () => ir("r18") }
        : { rotulo: "Reservar", icono: "calendario", onIr: () => ir("r05") },
      enlaces: proxima ? [{ rotulo: "Reservar otro", onIr: () => ir("r05") }] : undefined,
    },
  ];

  /* ── la pila: objetos del día, y nada más (D-09) ─────────────────── */
  const VIVAS: Viva[] = [];

  if (visitasHoy.length > 0 || vigentes.length > 0) {
    VIVAS.push({
      id: "visitas",
      rotulo: "Visitas de hoy",
      nodo: (
        <div className="viva visitas">
          <div className="osc">
            <img src="/img/visitas_fondo.jpg" alt="" />
            <div className="c">
              <div className="et">Hoy</div>
              <div className="n">{visitasHoy.length === 1 ? "1 visita" : visitasHoy.length + " visitas"}</div>
            </div>
            <span className="ir">
              <BotonGlass etiqueta="Ver mis visitas" tono="claro" onClick={() => ir("r06")} />
            </span>
          </div>
          {vigentes.length > 0 && (
            <button className="pase-fila amarilla" type="button"
              onClick={() => ir("r07", vigentes[0].id)}>
              <Icon n="qr" s={17} />
              <b>{vigentes.length === 1 ? "Pase activo" : vigentes.length + " pases activos"}</b>
              <span className="ver-pase">Ver pase<Icon n="chevron" s={14} /></span>
            </button>
          )}
        </div>
      ),
    });
  }

  VIVAS.push({
    id: "estado",
    rotulo: "Historial",
    nodo: (
      <button className="viva hero mat-foto" type="button" onClick={() => ir("r17")}
        aria-label="Ver el historial de la unidad">
        <img src="/img/hero_araoz.jpg" alt="" />
        <span className="et">Hoy, en casa</span>
        <span className="sobre">
          <span className="tx">
            <h2>{ultimo ? ultimo.titulo : "Sin movimientos"}</h2>
            <p>{ultimo ? "Historial · " + hace(ultimo.cuando) : "Historial"}</p>
          </span>
        </span>
      </button>
    ),
  });

  if (proxima && espacio) {
    VIVAS.push({
      id: "reserva",
      rotulo: "Próxima reserva",
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
      rotulo: "Entrega pendiente",
      nodo: (
        <button className="viva paquete mat-foto" type="button" onClick={() => ir("g11", paraRetirar[0].id)}>
          <img src="/img/hero_lobby.jpg" alt="" aria-hidden="true" />
          <span className="et">En recepción</span>
          <span className="sobre">
            <span className="tx">
              <b>{paraRetirar.length === 1
                ? "1 paquete para retirar"
                : paraRetirar.length + " paquetes para retirar"}</b>
              <i>Te lo entregan cuando bajes</i>
            </span>
            <span className="flech"><Icon n="chevron" s={16} /></span>
          </span>
        </button>
      ),
    });
  }

  return (
    <div className="vista inicio" id="r01">
      {/* EL CAMPO — contexto, estado y accesos en una sola superficie */}
      <section className="home-campo" aria-label="Tu unidad hoy">
        {/* la fachada va atrás del campo, no en lugar del campo */}
        <img className="campo-foto" src="/img/fachada.jpg" alt="" aria-hidden="true" />

        <header className="home-cab">
          <img className="marca" src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack"
            width={780} height={170} />
          <h1>{EDIFICIO.nombre} · Unidad {RESIDENTE.unidad}</h1>
          <button className="circulo claro perfil" type="button" onClick={() => ir("mas")}
            aria-label={"Tu perfil, " + RESIDENTE.nombre}>
            {RESIDENTE.iniciales}
          </button>
        </header>

        <WidgetPrincipal estados={ESTADOS} etiqueta="Estado de tu unidad" />

        <nav className="home-acciones" aria-label="Accesos rápidos">
          {ACCIONES.map((a) => (
            <button key={a.va + a.rotulo} type="button" aria-label={a.etiqueta}
              onClick={() => ir(a.va)}>
              <span className="circ" aria-hidden="true"><Icon n={a.icono} s={24} /></span>
              <span className="rot" aria-hidden="true">{a.rotulo}</span>
            </button>
          ))}
        </nav>
      </section>

      {/* LO DE HOY */}
      <PilaVivas items={VIVAS} titulo="En tu edificio" etiqueta="Lo que está pasando hoy en tu unidad" />

      {pagar && (
        <HojaPagar onCerrar={() => setPagar(false)}
          onInformar={() => { setPagar(false); ir("f03"); }} />
      )}
    </div>
  );
}
