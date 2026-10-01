"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { avisar } from "../sistema/Tostada";

/** Descargar algo que todavía no existe.
 *
 *  En el prototipo no hay PDF. Bajar un archivo vacío sería mentir, y no
 *  hacer nada al tocar sería peor. Así que el botón muestra el estado real
 *  de la operación y termina diciendo exactamente qué archivo saldría. */

type Fase = "listo" | "preparando" | "hecho";

export function Descarga({
  rotulo, archivo, chico = false, peso, meta,
}: {
  rotulo: string; archivo: string; chico?: boolean; peso?: string;
  /** Una línea debajo del rótulo: con ella la descarga es la fila del
   *  documento, sin una card alrededor (Documentos, lock V02). */
  meta?: string;
}) {
  const [fase, setFase] = useState<Fase>("listo");
  const reloj = useRef<number[]>([]);

  useEffect(() => () => reloj.current.forEach((t) => window.clearTimeout(t)), []);

  function pedir() {
    if (fase === "preparando") return;
    setFase("preparando");
    /* RES-FIN-01 · feedback después de descargar, sin bloquear la
       pantalla: el botón pasa a "Descargado" con su tilde y un aviso
       flotante dice qué archivo salió. La fila no crece. */
    reloj.current.push(window.setTimeout(() => {
      setFase("hecho");
      avisar({ titulo: `${rotulo === "PDF" ? "Comprobante" : rotulo} descargado`, detalle: archivo, icono: "descarga" });
    }, 900));
  }

  return (
    <div className={"descarga" + (chico ? " chica" : "") + (fase === "hecho" ? " lista" : "") + (fase === "preparando" ? " bajando" : "")}>
      <button type="button" onClick={pedir} disabled={fase === "preparando"}
        aria-busy={fase === "preparando" || undefined}>
        {fase === "preparando"
          ? <span className="rueda-chica" aria-hidden="true" />
          : <Icon n={meta ? "documento" : fase === "hecho" ? "check" : "descarga"} s={meta ? 20 : 16} />}
        <span className="tx">
          {fase === "preparando" ? (chico ? "Bajando…" : "Preparando el archivo…") : meta ? <b>{rotulo}</b> : fase === "hecho" && chico ? "Listo" : rotulo}
          {meta && fase !== "preparando" && <i>{meta}</i>}
        </span>
        {peso && fase === "listo" && !meta && <em>{peso}</em>}
        {meta && <span className="dl-ic" aria-hidden="true"><Icon n={fase === "hecho" ? "check" : "descarga"} s={16} /></span>}
      </button>

      {fase === "hecho" && !chico && (
        <p className="detalle-descarga">
          <b>{archivo}</b>
        </p>
      )}
    </div>
  );
}

/** Copiar al portapapeles: CBU, alias, código de pase. */
export function Copiar({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  const [estado, setEstado] = useState<"listo" | "copiado" | "error">("listo");
  const reloj = useRef<number[]>([]);
  useEffect(() => () => reloj.current.forEach((t) => window.clearTimeout(t)), []);

  async function copiar() {
    try {
      if (!navigator.clipboard) throw new Error("sin portapapeles");
      await navigator.clipboard.writeText(valor);
      setEstado("copiado");
    } catch {
      /* Sin permiso de portapapeles el valor igual está a la vista para
         seleccionarlo a mano. No inventamos un éxito que no pasó: se dice. */
      setEstado("error");
    }
    reloj.current.push(window.setTimeout(() => setEstado("listo"), 2600));
  }

  return (
    <button className={"copiar" + (estado === "copiado" ? " ok" : estado === "error" ? " mal" : "")}
      type="button" onClick={copiar} aria-label={`Copiar ${etiqueta}`}>
      <Icon n={estado === "copiado" ? "check" : estado === "error" ? "alerta" : "documento"} s={16}
        w={estado === "copiado" ? 2.4 : 1.8} />
      {estado === "copiado" ? "Copiado" : estado === "error" ? "Copialo a mano" : "Copiar"}
      <span className="sr" role="status">
        {estado === "copiado" ? `${etiqueta} copiado` : estado === "error" ? `No se pudo copiar ${etiqueta}` : ""}
      </span>
    </button>
  );
}
