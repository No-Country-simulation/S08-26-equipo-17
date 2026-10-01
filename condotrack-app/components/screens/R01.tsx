"use client";
import { Importe, OjoImporte } from "../ui/Importe";
import { useState } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { BotonGlass } from "../ui/BotonGlass";
import { WidgetPrincipal, type EstadoWidget } from "../ui/WidgetPrincipal";
import { PilaVivas, type Viva } from "../ui/PilaVivas";
import { HojaPagar } from "../paneles/HojaPagar";
import { EDIFICIO, RESIDENTE, type Vista } from "@/lib/data";
import { pagoPendienteDe, expensaDelMes } from "@/lib/expensas";
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
  const exp = expensaDelMes(estado.pagos);
  /* RES-022 · un pago informado todavía no es un pago: queda "a confirmar"
     hasta que administración decide, y no se ofrece pagar de nuevo. */
  const informado = pagoPendienteDe(exp.periodo, estado.pagos);
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
      titular: <Importe valor={exp.total} />,
      accesorio: <OjoImporte claro />,
      /* RES-HOME-02 · una sola línea de metadata: el estado con su fecha en
         la pastilla. El amarillo queda para Pagar, nada más. */
      /* v05 · sin la pastilla roja de "Vencida": la fecha queda como un
         dato callado debajo de la cifra */
      detalle: pagada ? "Pagada" : !informado && exp.estado === "vencida" ? `Venció el ${diaMes(exp.vencimiento)}` : undefined,
      /* DEC-003: "Pendiente" es el estado real de la expensa y se queda
         mientras lo sea. Nunca se cambia por "Pagada"; pagar es una acción
         aparte, la de abajo. Vencida además marca severidad. */
      pastilla: pagada ? undefined
        : informado ? { texto: "Pago informado · a confirmar", tono: "curso" as const }
        : exp.estado === "vencida" ? undefined
          : { texto: `Vence el ${diaMes(exp.vencimiento)}`, apagada: true },
      primaria: pagada || informado ? undefined : { rotulo: "Pagar", onIr: () => setPagar(true), acento: true },
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
      titular: paraRetirar.length === 0 ? "Todo en orden"
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
        ? { rotulo: "Ver reserva", icono: "calendario", onIr: () => ir("r18", proxima.id) }
        : { rotulo: "Reservar", icono: "calendario", onIr: () => ir("r05") },
      enlaces: proxima ? [{ rotulo: "Reservar otro", onIr: () => ir("r05") }] : undefined,
    },
  ];

  /* ── la pila: objetos del día, y nada más (D-09) ─────────────────────
     Las cuatro cards son la misma card: la foto (abre la lista de lo suyo)
     y encima un panel de vidrio con lo que importa —quién/qué, el estado y
     la acción concreta en amarillo ("Ver pase", "Ver entrega"…). v04 · A1:
     menos aire vacío y la acción donde se lee. */
  const VIVAS: Viva[] = [];

  if (visitasHoy.length > 0 || vigentes.length > 0) {
    VIVAS.push({
      id: "visitas",
      rotulo: "Visitas de hoy",
      nodo: (
        <CardViva et="Hoy" img="/img/visitas_fondo.jpg"
          titulo={visitasHoy.length === 1 ? "1 visita" : visitasHoy.length + " visitas"}
          detalle={visitasHoy[0] ? visitasHoy.map((v) => v.nombre.split(" ")[0]).join(" · ") : undefined}
          estado={vigentes.length === 0 ? undefined : { texto: vigentes.length === 1 ? "Pase activo" : vigentes.length + " pases activos", tono: "ok" }}
          onFoto={() => ir("r06")} etiqueta="Ver mis visitas"
          accion={vigentes.length > 0
            ? { icono: "qr", ver: "Ver pase", onIr: () => ir("r07", vigentes[0].id) }
            : { icono: "personaMas", ver: "Autorizar", onIr: () => ir("f01") }} />
      ),
    });
  }

  VIVAS.push({
    id: "estado",
    rotulo: "Historial",
    nodo: (
      <CardViva et="Hoy, en casa" img="/img/hero_araoz.jpg"
        titulo={ultimo ? ultimo.titulo : "Todo en orden"}
        detalle={ultimo ? hace(ultimo.cuando) : undefined}
        onFoto={() => ir("r17")} etiqueta="Ver el historial de la unidad"
        accion={{ icono: "lista", ver: "Historial", onIr: () => ir("r17") }} />
    ),
  });

  if (proxima && espacio) {
    VIVAS.push({
      id: "reserva",
      rotulo: "Próxima reserva",
      nodo: (
        <CardViva et="Próxima reserva" img={espacio.img}
          titulo={espacio.nombre} detalle={cuandoCorto(proxima)} estado={{ texto: "Confirmada", tono: "ok" }}
          onFoto={() => ir("r18")} etiqueta="Ver mis reservas"
          accion={{ icono: "calendario", ver: "Ver reserva", onIr: () => ir("r18", proxima.id) }} />
      ),
    });
  }

  if (paraRetirar.length > 0) {
    VIVAS.push({
      id: "entrega",
      rotulo: "Entrega pendiente",
      nodo: (
        /* v04 · A1: el remitente manda; el estado y la acción, a la vista */
        <CardViva et="En recepción" img="/img/hero_lobby.jpg"
          titulo={paraRetirar.length === 1 ? paraRetirar[0].remitente : paraRetirar.length + " entregas para retirar"}
          detalle={paraRetirar.length === 1
            ? `${TIPO_ENTREGA[paraRetirar[0].tipo]} · ${hace(paraRetirar[0].recibidoEl)}`
            : paraRetirar.map((e) => e.remitente).join(" · ")}
          estado={{ texto: "Para retirar", tono: "atencion" }}
          onFoto={() => ir("r08")} etiqueta="Ver mis entregas"
          accion={{ icono: "caja", ver: "Ver entrega", onIr: () => ir("g11", paraRetirar[0].id) }} />
      ),
    });
  }

  /* EL CAMPO — contexto, estado y accesos en una sola superficie. Va
     trabado junto con el mazo mientras se reparte (PilaVivas). */
  const campo = (
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

        <WidgetPrincipal estados={ESTADOS} etiqueta="Estado de tu unidad" memoria="r01" />

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
  );

  return (
    <div className="vista inicio" id="r01">
      {/* EL CAMPO arriba y LO DE HOY abajo, en una sola escena */}
      <PilaVivas items={VIVAS} arriba={campo} titulo="En tu edificio" etiqueta="Lo que está pasando hoy en tu unidad" />

      {pagar && (
        <HojaPagar onCerrar={() => setPagar(false)}
          onInformar={() => { setPagar(false); ir("f03"); }} />
      )}
    </div>
  );
}

const TIPO_ENTREGA: Record<string, string> = { paquete: "Paquete", sobre: "Sobre", delivery: "Delivery", otro: "Entrega" };

/** Una card de "En tu edificio". La foto es un botón (lleva a la lista de
 *  lo suyo) y la acción puntual es otro, dentro del panel de vidrio: dos
 *  botones hermanos, nunca uno adentro del otro (el texto del panel deja
 *  pasar el toque a la foto). */
function CardViva({ et, titulo, detalle, estado, img, onFoto, etiqueta, accion }: {
  et: string;
  titulo: string;
  detalle?: string;
  /** semáforo: ok = verde, atencion = amarillo */
  estado?: { texto: string; tono: "ok" | "atencion" };
  img: string;
  onFoto: () => void;
  etiqueta: string;
  accion: { icono: NombreIcono; ver: string; onIr: () => void };
}) {
  return (
    <div className="viva vc">
      <button type="button" className="vc-foto" onClick={onFoto} aria-label={etiqueta}>
        <img src={img} alt="" />
        <span className="vc-et">{et}</span>
        <span className="vc-ir"><BotonGlass etiqueta={etiqueta} tono="claro" decorativo /></span>
      </button>
      <div className="vc-vidrio">
        <span className="vc-tx">
          {estado && <em className="vc-estado" data-tono={estado.tono}>{estado.texto}</em>}
          <b>{titulo}</b>
          {detalle && <i>{detalle}</i>}
        </span>
        <button type="button" className="vc-accion" onClick={accion.onIr}>
          <Icon n={accion.icono} s={16} />{accion.ver}
        </button>
      </div>
    </div>
  );
}
