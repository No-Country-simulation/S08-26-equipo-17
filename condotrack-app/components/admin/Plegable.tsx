"use client";
import { useId, useRef, useState } from "react";
import { Icon } from "../ui/Icon";

/** DEC-005 · Región plegable del Home de administración.
 *
 *  Un solo componente para las tres regiones, porque el patrón es uno solo.
 *  Reglas que vienen del encargo y que están acá y no en cada pantalla:
 *
 *  - Colapsar afecta SÓLO a la presentación. No apaga, no suspende, no
 *    desactiva nada. El contenido sigue montado, así que filtros, selección,
 *    borradores y scroll siguen vivos y vuelven como estaban.
 *  - Cerrado conserva el encabezado y su resumen —conteo, novedad,
 *    criticidad— y deja el control de reapertura a la vista.
 *  - Nunca se colapsa solo: ni por estar vacía, ni por inactividad, ni al
 *    recibir una actualización. Sólo lo pliega la persona.
 *  - Si el foco quedó adentro de lo que se oculta, vuelve al trigger; si no,
 *    plegar dejaría el foco en un nodo inerte.
 *  - Motion 240 ms; con movimiento reducido, instantáneo (lo resuelve el CSS).
 */
export function Plegable({
  id, titulo, resumen, critico, clase, inicial = true, cerrado, children,
}: {
  id: string;
  titulo: string;
  /** Lo que se sigue viendo con la región cerrada: "12 de 30", "3 críticas". */
  resumen?: React.ReactNode;
  /** Marca la región como crítica; se ve también cerrada. */
  critico?: boolean;
  /** Clase de grilla de la pantalla; la región conserva su lugar. */
  clase?: string;
  inicial?: boolean;
  /** A01-08 · lo que la región sigue mostrando plegada: contexto, conteos y
   *  criticidad, para que cerrada no sea una tira vacía. */
  cerrado?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(inicial);
  const cuerpo = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const auto = useId();
  const idCuerpo = `${id}-cuerpo`;
  const idTitulo = `${id}-tit`;

  function alternar() {
    const cerrando = abierto;
    if (cerrando && cuerpo.current?.contains(document.activeElement)) {
      trigger.current?.focus();
    }
    setAbierto(!cerrando);
  }

  return (
    <section className={"ad-plegable" + (clase ? " " + clase : "")} aria-labelledby={idTitulo} data-abierto={abierto || undefined}
      data-critico={critico || undefined}>
      <header>
        {/* El botón va dentro del título y no al revés: un h2 adentro de un
            botón deja de ser encabezado para el lector de pantalla. */}
        <h2 id={idTitulo} className="ct-h2 ad-plegable-h">
          <button ref={trigger} type="button" className="ad-plegable-tr"
            aria-expanded={abierto} aria-controls={idCuerpo} onClick={alternar}>
            <span className="ad-plegable-chev" aria-hidden="true">
              <Icon n="chevron" s={16} w={2.2} />
            </span>
            {titulo}
          </button>
        </h2>
        {resumen !== undefined && <span className="ct-meta ad-plegable-res">{resumen}</span>}
      </header>
      {cerrado && !abierto && <div className="ad-plegable-cerrado">{cerrado}</div>}
      {/* El cuerpo no se desmonta: se oculta. Esa es la diferencia entre
          plegar y perder el trabajo que había adentro. */}
      <div className="ad-plegable-caja" data-uid={auto}>
        <div ref={cuerpo} id={idCuerpo} className="ad-plegable-cuerpo"
          {...(!abierto ? { inert: "" as unknown as boolean } : {})}
          aria-hidden={!abierto || undefined}>
          {children}
        </div>
      </div>
    </section>
  );
}
