"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Hoja } from "../ui/Hoja";
import { Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import { Vacio } from "../ui/Vacio";
import type { Vista } from "@/lib/data";
import { VOTACIONES, votosDe, type Votacion } from "@/lib/gestiones";
import { fechaCorta, diasHasta, porciento } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R24 · Votaciones del consorcio.
 *  ID nuevo: el módulo no figura en 04_MAPEO_IDS_A_PATRONES.md. Ver D-008. */

function Tarjeta({
  v, miVoto, onVotar,
}: { v: Votacion; miVoto?: string; onVotar: (opcionId: string) => void }) {
  const total = votosDe(v) + (miVoto && !v.miVoto ? 1 : 0);
  const faltan = diasHasta(v.cierra);
  const abierta = v.estado === "abierta";
  const alcanzado = total >= v.quorum;

  return (
    <article className={"votacion" + (abierta ? "" : " fin")}>
      <div className="arr">
        <span className={"pastilla" + (abierta ? "" : " gris")}>
          <Icon n={abierta ? "reloj" : v.estado === "cerrada" ? "check" : "calendario"} s={12} w={2.2} />
          {abierta ? "Abierta" : v.estado === "cerrada" ? "Cerrada" : "Próxima"}
        </span>
        <span className="cuando">
          {abierta
            ? faltan <= 0 ? "Cierra hoy" : `Cierra en ${faltan} días`
            : v.estado === "proxima" ? `Abre el ${fechaCorta(v.abre)}` : `Cerró el ${fechaCorta(v.cierra)}`}
        </span>
      </div>

      <h3>{v.titulo}</h3>
      <p className="cuerpo-txt">{v.descripcion}</p>

      <div className="opciones-voto">
        {v.opciones.map((o) => {
          const votos = o.votos + (miVoto === o.id && !v.miVoto ? 1 : 0);
          const pct = total ? (votos / total) * 100 : 0;
          const elegida = miVoto === o.id;
          const muestra = v.estado !== "proxima";
          return (
            <button key={o.id} type="button" className={elegida ? "on" : ""}
              disabled={!abierta || Boolean(miVoto)}
              aria-pressed={elegida}
              onClick={() => onVotar(o.id)}>
              {muestra && <span className="barra" style={{ width: `${pct}%` }} aria-hidden="true" />}
              <span className="tx">
                {elegida && <Icon n="check" s={14} w={2.6} />}
                {o.texto}
              </span>
              {muestra && <span className="pc">{votos} · {porciento(pct)}</span>}
            </button>
          );
        })}
      </div>

      <p className="quorum">
        {total} de {v.padron} unidades votaron ·{" "}
        {alcanzado ? "quórum alcanzado" : `faltan ${v.quorum - total} para el quórum`}
      </p>

      {abierta && !miVoto && <p className="quorum av">Todavía no votaste.</p>}
      {miVoto && abierta && <p className="quorum av">Tu voto quedó registrado. No se puede cambiar.</p>}
    </article>
  );
}

export function R24({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [pendiente, setPendiente] = useState<{ v: Votacion; opcionId: string } | null>(null);

  return (
    <div className="vista" id="r24">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Votaciones</h1><p>Las decisiones que se toman entre todos.</p></div>

      <Aviso icono="info">
        Vota una unidad, no una persona. El voto lo emite el titular y no se puede
        cambiar una vez enviado.
      </Aviso>

      {VOTACIONES.length === 0 ? (
        <Vacio icono="lista" titulo="No hay votaciones abiertas"
          texto="Cuando el consorcio abra una votación, te avisamos y podés votar desde acá. Las cerradas quedan con su resultado." />
      ) : (
        <>
          {VOTACIONES.map((v) => (
            <Tarjeta key={v.id} v={v} miVoto={estado.votos[v.id]}
              onVotar={(opcionId) => setPendiente({ v, opcionId })} />
          ))}
          <FinLista texto="No hay más votaciones" />
        </>
      )}

      {pendiente && (
        <Hoja
          titulo="Confirmar el voto"
          texto={`Vas a votar "${pendiente.v.opciones.find((o) => o.id === pendiente.opcionId)?.texto}" en "${pendiente.v.titulo}". El voto se emite a nombre de tu unidad y no se puede cambiar.`}
          confirmar="Emitir el voto"
          onConfirmar={() => {
            hacer({ t: "voto/emitir", votacionId: pendiente.v.id, opcionId: pendiente.opcionId });
            setPendiente(null);
          }}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </div>
  );
}
