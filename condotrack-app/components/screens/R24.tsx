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

/* Ronda 2 · la card abierta ya no es carbón (en oscuro se perdía entre
   las demás): es la superficie clara con la marca amarilla. El estado es
   texto, no una pastilla que parece botón. La cerrada dice sólo el
   resultado y tu voto; las barras quedan para la que se está votando. */
function Tarjeta({
  v, miVoto, onVotar,
}: { v: Votacion; miVoto?: string; onVotar: (opcionId: string) => void }) {
  const total = votosDe(v) + (miVoto && !v.miVoto ? 1 : 0);
  const faltan = diasHasta(v.cierra);
  const abierta = v.estado === "abierta";
  const alcanzado = total >= v.quorum;
  const votosDeOp = (id: string) => (v.opciones.find((o) => o.id === id)?.votos ?? 0) + (miVoto === id && !v.miVoto ? 1 : 0);
  const pctDe = (id: string) => (total ? (votosDeOp(id) / total) * 100 : 0);
  const ganadora = [...v.opciones].sort((a, b) => votosDeOp(b.id) - votosDeOp(a.id))[0];
  const tuya = v.opciones.find((o) => o.id === miVoto);

  return (
    <article className={"vot " + v.estado}>
      <p className="vot-estado">
        <span className="vot-marca" aria-hidden="true" />
        <b>{abierta ? "Abierta" : v.estado === "cerrada" ? "Cerrada" : "Próxima"}</b>
        <span>
          {abierta
            ? faltan <= 0 ? "cierra hoy" : `cierra en ${faltan} días`
            : v.estado === "proxima" ? `abre el ${fechaCorta(v.abre)}` : `cerró el ${fechaCorta(v.cierra)}`}
        </span>
      </p>

      <h3>{v.titulo}</h3>
      {v.estado !== "cerrada" && <p className="vot-txt">{v.descripcion}</p>}

      {abierta && (
        <div className="vot-ops" role="group" aria-label={"Opciones de " + v.titulo}>
          {v.opciones.map((o) => {
            const elegida = miVoto === o.id;
            const pct = pctDe(o.id);
            return (
              <button key={o.id} type="button" className={elegida ? "on" : undefined}
                disabled={Boolean(miVoto)} aria-pressed={elegida}
                onClick={() => onVotar(o.id)}>
                <span className="barra" style={{ width: `${pct}%` }} aria-hidden="true" />
                <span className="tx">{elegida && <Icon n="check" s={16} w={2.6} />}{o.texto}</span>
                <span className="pc">{elegida ? "Tu voto" : porciento(pct)}</span>
              </button>
            );
          })}
        </div>
      )}

      {v.estado === "cerrada" && (
        <dl className="vot-res">
          <div><dt>Resultado</dt><dd>{ganadora.texto} · {porciento(pctDe(ganadora.id))}</dd></div>
          {tuya && <div><dt>Tu voto</dt><dd>{tuya.texto}</dd></div>}
        </dl>
      )}

      {v.estado !== "proxima" && (
        <p className="vot-pie">
          {total} de {v.padron} unidades votaron · {alcanzado ? "quórum alcanzado" : `faltan ${v.quorum - total} para el quórum`}
        </p>
      )}
      {abierta && !miVoto && <p className="vot-pie fuerte">Tocá una opción para votar.</p>}
      {abierta && miVoto && <p className="vot-pie fuerte">Tu voto quedó registrado.</p>}
    </article>
  );
}

export function R24({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [pendiente, setPendiente] = useState<{ v: Votacion; opcionId: string } | null>(null);

  return (
    <div className="vista" id="r24">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Votaciones</h1></div>

      <Aviso icono="info">
        Vota la unidad, y el voto no se puede cambiar.
      </Aviso>

      {VOTACIONES.length === 0 ? (
        <Vacio icono="lista" titulo="Sin votaciones abiertas" />
      ) : (
        <>
          {VOTACIONES.map((v) => (
            <Tarjeta key={v.id} v={v} miVoto={estado.votos[v.id]}
              onVotar={(opcionId) => setPendiente({ v, opcionId })} />
          ))}
          <FinLista texto="Nada más para mostrar" />
        </>
      )}

      {pendiente && (
        <Hoja
          titulo="Confirmar el voto"
          texto={`Vas a votar "${pendiente.v.opciones.find((o) => o.id === pendiente.opcionId)?.texto}" en "${pendiente.v.titulo}". No se puede cambiar.`}
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
