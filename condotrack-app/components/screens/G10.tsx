"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Linea, Avance, type Hito } from "../ui/Linea";
import { Ficha, Dato } from "../ui/Panel";
import { Error as ErrorEstado, Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import type { Vista } from "@/lib/data";
import { PASOS_RECLAMO, ROTULO_RECLAMO, rotuloCategoria } from "@/lib/gestiones";
import { fechaCorta } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** G10 · Reclamo, detalle + historial.
 *  Es el template "Entity detail + timeline" del scope, tal cual: cabecera,
 *  estado del workflow, metadata, historial de acciones. No se inventa otro. */
export function G10({ ir, refe }: { ir: (v: Vista, r?: string) => void; refe?: string }) {
  const { estado } = useApp();
  const r = estado.reclamos.find((x) => x.id === refe);

  if (!r) {
    return (
      <div className="vista" id="g10">
        <TopBar volverA="r09" ir={ir} />
        <ErrorEstado
          titulo="No encontramos ese reclamo"
          onReintentar={() => ir("r09")}
        />
      </div>
    );
  }

  const cerrado = r.estado === "resuelto" || r.estado === "cerrado";
  const hitos: Hito[] = r.acciones
    .slice()
    .reverse()
    .map((a, n) => ({
      id: a.id,
      cuando: a.cuando,
      icono: a.estado === "resuelto" ? "check" : a.estado === "nuevo" ? "chat" : "reloj",
      titulo: ROTULO_RECLAMO[a.estado],
      detalle: a.texto,
      autor: a.autor,
      rol: a.rol,
      destacado: n === 0,
    }));

  return (
    <div className="vista" id="g10">
      <TopBar volverA="r09" ir={ir} />

      <div className="cabecera-ent">
        <span className="et">Reclamo {r.codigo}</span>
        <h1>{rotuloCategoria(r.categoria)}</h1>
        <p>{r.ubicacion}</p>
      </div>

      <Avance pasos={PASOS_RECLAMO} actual={r.estado} rotulos={ROTULO_RECLAMO} />

      <div className="bloque">
        <h2 className="chico">Lo que contaste</h2>
        <p className="cuerpo-txt">{r.descripcion}</p>
        {r.foto && (
          <p className="adjunto-nota">
            <Icon n="documento" s={15} w={1.8} />
            {r.foto} · adjuntado al crear el reclamo
          </p>
        )}
      </div>

      <Ficha>
        <Dato k="Estado" v={ROTULO_RECLAMO[r.estado]} />
        <Dato k="Responsable" v={r.responsable ?? "Todavía sin asignar"} />
        <Dato k="Creado" v={fechaCorta(r.creadoEl)} />
        <Dato k="Unidad" v={r.unidad} />
      </Ficha>

      <h2 className="sec">Historial</h2>
      <Linea hitos={hitos} />

      <FinLista texto={`Reclamo ${r.codigo}`} />
    </div>
  );
}
