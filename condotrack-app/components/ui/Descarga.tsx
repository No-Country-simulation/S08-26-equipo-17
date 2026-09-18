"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/** Descargar algo que todavía no existe.
 *
 *  En el prototipo no hay PDF. Bajar un archivo vacío sería mentir, y no
 *  hacer nada al tocar sería peor. Así que el botón muestra el estado real
 *  de la operación y termina diciendo exactamente qué archivo saldría. */

type Fase = "listo" | "preparando" | "hecho";

export function Descarga({
  rotulo, archivo, chico = false, peso,
}: { rotulo: string; archivo: string; chico?: boolean; peso?: string }) {
  const [fase, setFase] = useState<Fase>("listo");
  const reloj = useRef<number[]>([]);

  useEffect(() => () => reloj.current.forEach((t) => window.clearTimeout(t)), []);

  function pedir() {
    if (fase === "preparando") return;
    setFase("preparando");
    reloj.current.push(window.setTimeout(() => setFase("hecho"), 1100));
  }

  return (
    <div className={"descarga" + (chico ? " chica" : "") + (fase === "hecho" ? " lista" : "")}>
      <button type="button" onClick={pedir} disabled={fase === "preparando"}
        aria-busy={fase === "preparando" || undefined}>
        {fase === "preparando"
          ? <span className="rueda-chica" aria-hidden="true" />
          : <Icon n={fase === "hecho" ? "check" : "documento"} s={17} w={fase === "hecho" ? 2.3 : 1.8} />}
        <span className="tx">
          {fase === "preparando" ? "Preparando el archivo…" : rotulo}
        </span>
        {peso && fase === "listo" && <em>{peso}</em>}
      </button>

      {fase === "hecho" && (
        <p className="detalle-descarga" role="status">
          <b>{archivo}</b>
          <span>
            En el prototipo el archivo no se genera. Este es el nombre y el contenido
            que produciría el sistema real.
          </span>
        </p>
      )}
    </div>
  );
}

/** Copiar al portapapeles: CBU, alias, código de pase. */
export function Copiar({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);
  const reloj = useRef<number[]>([]);
  useEffect(() => () => reloj.current.forEach((t) => window.clearTimeout(t)), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      reloj.current.push(window.setTimeout(() => setCopiado(false), 2200));
    } catch {
      /* Sin permiso de portapapeles el valor igual está a la vista para
         seleccionarlo a mano. No inventamos un éxito que no pasó. */
      setCopiado(false);
    }
  }

  return (
    <button className={"copiar" + (copiado ? " ok" : "")} type="button" onClick={copiar}
      aria-label={copiado ? `${etiqueta} copiado` : `Copiar ${etiqueta}`}>
      <Icon n={copiado ? "check" : "documento"} s={15} w={copiado ? 2.4 : 1.8} />
      {copiado ? "Copiado" : "Copiar"}
    </button>
  );
}
