"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Elegir, Area, Adjuntar, PieForm } from "../ui/Formulario";
import { RESIDENTE, type Vista } from "@/lib/data";
import { CATEGORIAS, UBICACIONES, rotuloCategoria, type CategoriaReclamo } from "@/lib/gestiones";
import { ExitoProtagonista } from "../ui/Estados";
import { nuevoCodigoReclamo, nuevoIdReclamo, useApp } from "@/lib/estado";

/** El formulario de reclamo, sin pantalla alrededor.
 *
 *  Vive en dos lugares y es el mismo: la hoja que sube desde Reclamos
 *  —hacer un reclamo va en hoja, según 04_COMPONENT_SYSTEM— y la pantalla
 *  F02, que existe para el enlace directo. Duplicarlo terminaría en dos
 *  formularios que validan distinto. */
export function PanelReclamo({
  onListo, onCancelar, rotuloCancelar,
}: {
  onListo: (codigo: string) => void;
  onCancelar: () => void;
  rotuloCancelar?: string;
}) {
  const { estado, hacer } = useApp();

  /* D-12 · la categoría es opcional al crear. "Todavía no sé" es la que
     viene puesta: el residente no tiene por qué saber si una mancha es
     humedad o plomería. */
  const [categoria, setCategoria] = useState<CategoriaReclamo>("sin-definir");
  const [ubicacion, setUbicacion] = useState(UBICACIONES[0]);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const errDesc =
    !descripcion.trim() ? "Contá qué pasa: sin eso no se puede asignar a nadie."
    : descripcion.trim().length < 15 ? "Un poco más de detalle ayuda a resolverlo antes."
    : undefined;

  function confirmar() {
    setTocado(true);
    if (errDesc) return;
    setEnviando(true);
    const codigo = nuevoCodigoReclamo(estado.reclamos);
    const ahora = new Date().toISOString();
    window.setTimeout(() => {
      hacer({
        t: "reclamo/crear",
        reclamo: {
          id: nuevoIdReclamo(), codigo, categoria, ubicacion,
          descripcion: descripcion.trim(), foto,
          estado: "nuevo",
          creadoPor: RESIDENTE.nombre, creadoEl: ahora, unidad: RESIDENTE.unidad,
          acciones: [{
            id: "a0", cuando: ahora, estado: "nuevo",
            texto: "Reclamo creado desde la app.",
            autor: RESIDENTE.nombre, rol: "Residente",
          }],
        },
      });
      setEnviando(false);
      onListo(codigo);
    }, 700);
  }

  return (
    <>
      <Area etiqueta="Qué pasa" valor={descripcion} onCambio={setDescripcion}
        placeholder="Qué pasa y dónde"
        filas={5} error={tocado ? errDesc : undefined} />

      <Elegir etiqueta="Ubicación" valor={ubicacion} onCambio={setUbicacion}
        opciones={UBICACIONES.map((u) => ({ id: u, rotulo: u }))} />

      <Elegir etiqueta="Categoría" valor={categoria} onCambio={setCategoria}
        opciones={CATEGORIAS} opcional />

      <Adjuntar etiqueta="Foto" archivo={foto} onCambio={setFoto}
        nombreSugerido="foto-reclamo.jpg" />

      <PieForm
        accion="Enviar reclamo"
        onAccion={confirmar}
        onCancelar={onCancelar}
        cargando={enviando}
        rotuloCancelar={rotuloCancelar}
      />
    </>
  );
}

/** Éxito de "Hacer un reclamo" (ronda 3): la misma composición que "Visita
 *  autorizada". Lo usan la hoja de Reclamos (R09) y el enlace directo (F02). */
export function ExitoReclamo({ codigo, ir, alterna, onAlterna }: {
  codigo: string;
  ir: (v: Vista, ref?: string) => void;
  alterna: string;
  onAlterna: () => void;
}) {
  const { estado } = useApp();
  const r = estado.reclamos.find((x) => x.codigo === codigo);
  return (
    <ExitoProtagonista
      titulo="Reclamo creado"
      resumen={<><b>{codigo}</b>{r ? <> · {rotuloCategoria(r.categoria)}</> : null}</>}
      detalle={r ? (
        <dl className="exito-datos">
          <div><dt>Dónde</dt><dd>{r.ubicacion}</dd></div>
          <div><dt>Estado</dt><dd>Abierto</dd></div>
        </dl>
      ) : undefined}
      nota="Administración ya lo ve en su panel."
      accion="Seguir el reclamo"
      onAccion={() => (r ? ir("g10", r.id) : ir("r09"))}
      alterna={alterna}
      onAlterna={onAlterna}
    />
  );
}
