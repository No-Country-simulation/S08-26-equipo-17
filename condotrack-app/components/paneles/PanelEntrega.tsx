"use client";
import { useState, type CSSProperties } from "react";
import { Icon } from "../ui/Icon";
import { Linea, type Hito } from "../ui/Linea";
import { type Entrega } from "@/lib/data";
import { diaMes, soloHora } from "@/lib/formato";

/** El detalle de una entrega como seguimiento (G11-01…06 · ronda 2).
 *
 *  Referencia de jerarquía: `REF_delivery_tracking_dribbble` (sólo la
 *  estructura). Orden de lectura:
 *    1. de quién es y qué día llegó (no "Sobre · Unidad 7D": la unidad es
 *       la tuya y el tipo de envío no siempre se sabe);
 *    2. el estado actual, en el lenguaje de estado de CondoTrack;
 *    3. quién la recibió (y quién la retiró);
 *    4. el recorrido Recibida → Avisada → Retirada, y abajo el historial.
 *
 *  La lista de Entregas (R08) usa la misma card en chico: `CardEntrega`. */

/** "Hoy · 14:20", "Ayer · 16:15" o "lun 21 sep · 11:05" */
export function cuandoLlego(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const dias = Math.round(
    (new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
      - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  const dia = dias === 0 ? "Hoy" : dias === 1 ? "Ayer"
    : d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "") + " " + diaMes(iso);
  return `${dia} · ${soloHora(iso)}`;
}

function pasosDe(e: Entrega) {
  const avisada = Boolean(e.avisadoEl) || Boolean(e.retiradoEl);
  const actual = e.retiradoEl ? 2 : avisada ? 1 : 0;
  const pasos = [
    { id: "recibida", rotulo: "Recibida", cuando: e.recibidoEl, hecho: true },
    { id: "avisada", rotulo: "Avisada", cuando: e.avisadoEl, hecho: avisada },
    { id: "retirada", rotulo: "Retirada", cuando: e.retiradoEl, hecho: Boolean(e.retiradoEl) },
  ];
  return { pasos, actual, terminada: Boolean(e.retiradoEl) };
}

/** El recorrido: una sola línea con tres puntos alineados a sus rótulos.
 *  La parte recorrida se pinta; el paso en curso lleva el amarillo. */
export function RielEntrega({ e, compacto }: { e: Entrega; compacto?: boolean }) {
  const { pasos, actual, terminada } = pasosDe(e);
  const linea = (
    <span className="ent-riel-linea" aria-hidden="true">
      <span className="ent-riel-fill" />
      {pasos.map((p, i) => (
        <span key={p.id} style={{ "--x": i / 2 } as CSSProperties}
          className={"ent-riel-punto" + (p.hecho ? " hecho" : "") + (i === actual && !terminada ? " actual" : "")} />
      ))}
    </span>
  );
  if (compacto) {
    return (
      <span className="ent-riel compacto" style={{ "--avance": actual / 2 } as CSSProperties} aria-hidden="true">
        {linea}
        <span className="ent-riel-pasos">
          {pasos.map((p) => <span key={p.id} className={p.hecho ? "hecho" : undefined}><b>{p.rotulo}</b></span>)}
        </span>
      </span>
    );
  }
  return (
    <div className="ent-riel" style={{ "--avance": actual / 2 } as CSSProperties}>
      {linea}
      <ol className="ent-riel-pasos" aria-label="Recorrido de la entrega">
        {pasos.map((p, i) => (
          <li key={p.id} className={p.hecho ? "hecho" : undefined} aria-current={i === actual ? "step" : undefined}>
            <b>{p.rotulo}</b>
            <small>{p.cuando ? `${diaMes(p.cuando)} · ${soloHora(p.cuando)}` : p.hecho ? "Sin hora registrada" : "Pendiente"}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

const TIPO: Record<string, string> = { paquete: "Paquete", sobre: "Sobre", delivery: "Delivery", otro: "Entrega" };

/** La misma card, en chico, para la lista de Entregas (v04 · A3): una sola
 *  superficie de vidrio claro que se toca entera. Arriba quién la mandó, qué
 *  es y cuándo llegó, con el estado en su pastilla; al medio el recorrido;
 *  la acción, compacta, en su esquina (antes era una barra negra aparte).
 *  Sin la línea chica "en recepción desde las…": la hora ya está arriba. */
export function CardEntrega({ e, onAbrir }: { e: Entrega; onAbrir: () => void }) {
  const para = e.estado === "retirar";
  return (
    <button type="button" className={"ent-card" + (para ? "" : " cerrada")} onClick={onAbrir}
      aria-label={`${e.remitente}, ${TIPO[e.tipo].toLowerCase()}, llegó ${cuandoLlego(e.recibidoEl)}, ${para ? "para retirar" : "retirada"}. ${para ? "Ver seguimiento" : "Ver el detalle"}`}>
      <span className="ent-card-cab">
        <span className="ent-card-ic" aria-hidden="true"><Icon n="caja" s={20} w={1.8} /></span>
        <span className="ent-card-tx">
          <b>{e.remitente}</b>
          <i>{TIPO[e.tipo]} · {cuandoLlego(e.recibidoEl)}</i>
        </span>
        <span className={"ent-card-estado" + (para ? "" : " hecho")}>{para ? "Para retirar" : "Retirada"}</span>
      </span>
      <RielEntrega e={e} compacto />
      <span className="ent-card-pie">
        {!para && e.retiradoPor && <span className="ent-card-quien">Retiró {e.retiradoPor}</span>}
        <span className="ent-card-ver">{para ? "Ver seguimiento" : "Ver el detalle"}<Icon n="chevron" s={14} /></span>
      </span>
    </button>
  );
}

export function PanelEntrega({ e, conTitulo }: { e: Entrega; conTitulo?: boolean }) {
  const paraRetirar = e.estado === "retirar";
  /* Si la foto no está, no se reserva el lugar. */
  const [hayFoto, setHayFoto] = useState(Boolean(e.foto));
  const hitos: Hito[] = [
    e.retiradoEl && { id: "r", cuando: e.retiradoEl, icono: "check" as const,
      titulo: "Entrega retirada",
      detalle: `Retirada por ${e.retiradoPor}. Entregada por ${e.entregadoPor}.`,
      autor: e.entregadoPor ?? "Recepción", rol: "Recepción", destacado: true },
    e.avisadoEl && { id: "a", cuando: e.avisadoEl, icono: "campana" as const,
      titulo: "Aviso enviado a la unidad",
      detalle: `Unidad ${e.unidad}`,
      autor: e.recibidoPor, rol: "Recepción", destacado: !e.retiradoEl },
    { id: "c", cuando: e.recibidoEl, icono: "caja" as const,
      titulo: "Recibida en recepción",
      detalle: e.titulo,
      autor: e.recibidoPor, rol: "Recepción", destacado: !e.retiradoEl && !e.avisadoEl },
  ].filter(Boolean) as Hito[];

  return (
    <>
      <section className={"ent-track" + (paraRetirar ? "" : " cerrada")} aria-label="Seguimiento de la entrega">
        <div className="ent-track-cab">
          <div className="ent-track-id">
            <span className="ent-track-tipo">{cuandoLlego(e.recibidoEl)}</span>
            {conTitulo ? <h1>{e.remitente}</h1> : <b className="ent-track-rem">{e.remitente}</b>}
          </div>
          <span className="ent-track-glifo" aria-hidden="true">
            <Icon n="caja" s={30} w={1.6} />
          </span>
        </div>

        <p className="ent-chip-fila">
          <span className={"ent-chip" + (paraRetirar ? "" : " hecho")}>
            {paraRetirar ? "Para retirar" : "Retirada"}
          </span>
          <span className="ent-track-dato">
            {paraRetirar ? `en recepción desde las ${soloHora(e.recibidoEl)}` : `el ${diaMes(e.retiradoEl!)}`}
          </span>
        </p>

        <dl className="ent-track-datos">
          <div><dt>Recibido</dt><dd>{e.recibidoPor}</dd></div>
          {e.retiradoPor && <div><dt>Retirado</dt><dd>{e.retiradoPor}</dd></div>}
          {e.entregadoPor && <div><dt>Entregado</dt><dd>{e.entregadoPor}</dd></div>}
        </dl>

        <RielEntrega e={e} />
      </section>

      {/* la foto de recepción, si la sacó; nunca el nombre del archivo */}
      {e.foto && hayFoto && (
        <figure className="ent-foto">
          <img src={"/img/" + e.foto} alt="Foto de la entrega tomada por recepción"
            onError={() => setHayFoto(false)} />
          <figcaption>Foto de recepción</figcaption>
        </figure>
      )}

      <h2 className="sec">Historial</h2>
      <Linea hitos={hitos} />
    </>
  );
}
