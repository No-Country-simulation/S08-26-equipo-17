"use client";
import { ZonaContexto } from "../ui/ZonaContexto";
import { Descarga } from "../ui/Descarga";
import { FinLista } from "../ui/FinLista";
import { Vacio } from "../ui/Vacio";
import { SubNav } from "../ui/SubNav";
import { EDIFICIO, PESTANAS_EDIFICIO, type Vista } from "@/lib/data";
import { DOCUMENTOS } from "@/lib/gestiones";

/** R14 · Documentos del consorcio (lock V02).
 *  Una lista, no una card por PDF: cada fila es el documento y su descarga. */
export function R14({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  return (
    <div className="vista" id="r14">
      <ZonaContexto ir={ir} volverA="r02" foto="/img/fachada.jpg"
        contexto={EDIFICIO.ciudad}
        titulo={EDIFICIO.nombre}
        dato={DOCUMENTOS.length === 1 ? "1 documento publicado" : DOCUMENTOS.length + " documentos publicados"}>
        <SubNav etiqueta="Secciones de Mi edificio" opciones={PESTANAS_EDIFICIO}
          valor={"r14" as Vista} onCambio={(v) => ir(v)} />
      </ZonaContexto>

      {DOCUMENTOS.length === 0 && (
        <Vacio icono="documento" titulo="Sin documentos" />
      )}

      {DOCUMENTOS.length > 0 && (
        <div className="docs">
          {DOCUMENTOS.map((d) => (
            <Descarga key={d.id} rotulo={d.titulo} archivo={d.archivo} meta={"PDF · " + d.peso} />
          ))}
        </div>
      )}

      {DOCUMENTOS.length > 0 && <FinLista texto="No hay más documentos" />}
    </div>
  );
}
