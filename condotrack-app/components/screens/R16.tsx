"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Linea, type Hito } from "../ui/Linea";
import { Hoja } from "../ui/Hoja";
import { Error as ErrorEstado, Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import { ROTULO_TIPO_VISITA, type Vista } from "@/lib/data";
import { fechaCorta } from "@/lib/formato";
import { diaEnPalabras } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** R16 · Autorización, detalle.
 *  Muestra la separación que pide el producto: validar el pase y registrar
 *  el ingreso son dos hechos distintos, con su hora y su responsable. */
export function R16({ ir, refe }: { ir: (v: Vista, r?: string) => void; refe?: string }) {
  const { estado, hacer } = useApp();
  const [cancelar, setCancelar] = useState(false);
  const v = estado.visitas.find((x) => x.id === refe);

  if (!v) {
    return (
      <div className="vista" id="r16">
        <TopBar volverA="r06" ir={ir} />
        <ErrorEstado
          titulo="No encontramos esa autorización"
          onReintentar={() => ir("r06")}
        />
      </div>
    );
  }

  const activa = v.estado === "vigente" || v.estado === "programada";

  const hitos: Hito[] = [
    v.egresoEl && { id: "e", cuando: v.egresoEl, icono: "salir" as const,
      titulo: "Egreso registrado", autor: v.egresoPor ?? "Recepción", rol: "Recepción" },
    v.ingresoEl && { id: "i", cuando: v.ingresoEl, icono: "check" as const,
      titulo: "Ingreso registrado", detalle: "Segunda acción: recepción registra la entrada.",
      autor: v.ingresoPor ?? "Recepción", rol: "Recepción" },
    v.validadaEl && { id: "v", cuando: v.validadaEl, icono: "qr" as const,
      titulo: "Pase validado", detalle: "Primera acción: recepción verifica que la autorización esté vigente.",
      autor: v.validadaPor ?? "Recepción", rol: "Recepción" },
    { id: "c", cuando: v.creadaEl, icono: "personaMas" as const,
      titulo: "Autorización creada", detalle: `Pase ${v.codigo}`,
      autor: v.creadaPor, rol: "Residente" },
  ].filter(Boolean) as Hito[];
  if (hitos.length) hitos[0].destacado = true;

  return (
    <div className="vista" id="r16">
      <TopBar volverA="r06" ir={ir} />

      <div className="cabecera-ent">
        <span className="et">{ROTULO_TIPO_VISITA[v.tipo]}</span>
        <h1>{v.nombre}</h1>
      </div>

      {/* La llave: quién entra, cuándo puede entrar, en qué estado está y
          con qué pase. Lo administrativo va después, no en una ficha. */}
      <section className={"acceso" + (v.estado === "vigente" ? " vigente" : "")} aria-label="Acceso">
        <span className={"estado-acceso" + (v.estado === "vigente" ? "" : " gris")}>
          {v.estado === "vigente" ? "Vigente"
            : v.estado === "programada" ? "Programada"
            : v.estado === "cancelada" ? "Dada de baja" : "Finalizada"}
        </span>
        <b>{v.dia ? v.dia : diaEnPalabras(new Date(v.fecha))}</b>
        <span className="franja">{v.horario}</span>
        <div className="acceso-pie">
          <span className="pase"><Icon n="qr" s={16} w={1.9} />Pase {v.codigo}</span>
          {v.recurrente && <span className="repite">Todas las semanas</span>}
        </div>
      </section>

      {v.estado === "vigente" && (
        <button className="entrar" type="button" onClick={() => ir("r07", v.id)} style={{ marginTop: 16, width: "100%" }}>
          <Icon n="qr" s={20} w={1.8} />Ver el pase
        </button>
      )}

      <div className="datos-quietos">
        {v.documento && <p><span>Documento</span><b>{v.documento}</b></p>}
        <p><span>Autorizó</span><b>{v.creadaPor}</b></p>
        <p><span>Creada</span><b>{fechaCorta(v.creadaEl)}</b></p>
        {v.nota && <p className="ancho"><span>Nota para recepción</span><b>{v.nota}</b></p>}
      </div>

      <h2 className="sec">Historial del acceso</h2>
      <Linea hitos={hitos} />

      {activa && (
        <button className="btn-ter peligro baja" type="button" onClick={() => setCancelar(true)}>
          Dar de baja la autorización
        </button>
      )}

      <FinLista texto={`Pase ${v.codigo}`} />

      {cancelar && (
        <Hoja
          titulo={`Dar de baja el pase de ${v.nombre}`}
          texto="El pase deja de servir enseguida."
          confirmar="Dar de baja"
          peligro
          onConfirmar={() => { hacer({ t: "visita/cancelar", id: v.id }); setCancelar(false); ir("r06"); }}
          onCancelar={() => setCancelar(false)}
        />
      )}
    </div>
  );
}
