"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Descarga } from "../ui/Descarga";
import { FinLista } from "../ui/FinLista";
import { Vacio } from "../ui/Vacio";
import { SubNav } from "../ui/SubNav";
import { PESTANAS_EDIFICIO, type Vista } from "@/lib/data";
import { DOCUMENTOS, ROTULO_DOC } from "@/lib/gestiones";
import { fechaCorta } from "@/lib/formato";

/** R14 · Documentos del consorcio. */
export function R14({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  return (
    <div className="vista" id="r14">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit"><h1>Mi edificio</h1><p>Lo que el consorcio publica para todos.</p></div>

      <SubNav etiqueta="Secciones de Mi edificio" opciones={PESTANAS_EDIFICIO}
        valor={"r14" as Vista} onCambio={(v) => ir(v)} />

      {DOCUMENTOS.length === 0 && (
        <Vacio icono="documento" titulo="Todavía no hay documentos"
          texto="Cuando administración publique un acta, una póliza o una rendición, la vas a ver acá y la vas a poder descargar." />
      )}

      {DOCUMENTOS.map((d) => (
        <div className="doc" key={d.id}>
          <div className="arr">
            <span className="ic"><Icon n="documento" s={20} w={1.8} /></span>
            <span className="d">
              <b>{d.titulo}</b>
              <i>{ROTULO_DOC[d.tipo]} · {fechaCorta(d.fecha)}</i>
            </span>
          </div>
          <Descarga chico rotulo="Descargar" archivo={d.archivo} peso={d.peso} />
        </div>
      ))}

      {DOCUMENTOS.length > 0 && <FinLista texto="No hay más documentos" />}
    </div>
  );
}
