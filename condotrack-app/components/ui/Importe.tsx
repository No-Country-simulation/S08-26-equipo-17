"use client";
import { Icon } from "./Icon";
import { MASCARA, setImportesOcultos, useImportesOcultos } from "@/lib/privacidad";
import { pesos } from "@/lib/formato";

/** Un importe de la unidad. Oculto, la máscara es lo único que se lee:
 *  el valor no queda ni en el texto ni en la etiqueta accesible. */
export function Importe({ valor }: { valor: number }) {
  const oculto = useImportesOcultos();
  if (!oculto) return <>{pesos(valor)}</>;
  return <span className="importe-oculto" role="img" aria-label="Importe oculto">{MASCARA}</span>;
}

/** El ojo: informa su estado (aria-pressed) y dice qué va a hacer. */
export function OjoImporte({ claro }: { claro?: boolean }) {
  const oculto = useImportesOcultos();
  return (
    <button type="button" className={"ojo-importe" + (claro ? " claro" : "")}
      aria-pressed={oculto} aria-label={oculto ? "Mostrar importes" : "Ocultar importes"}
      title={oculto ? "Mostrar importes" : "Ocultar importes"}
      onClick={() => setImportesOcultos(!oculto)}>
      <Icon n={oculto ? "ojoTachado" : "ojo"} s={20} w={1.9} />
    </button>
  );
}
