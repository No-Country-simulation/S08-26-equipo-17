"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Ficha, Dato } from "../ui/Panel";
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
          texto="Puede que se haya dado de baja. Volvé a la lista de visitas y elegila de nuevo."
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
        <span className="et">{ROTULO_TIPO_VISITA[v.tipo]} · Unidad {v.unidad}</span>
        <h1>{v.nombre}</h1>
        <p>{v.dia ? `${v.dia} · ${v.horario}` : `${diaEnPalabras(new Date(v.fecha))} · ${v.horario}`}</p>
      </div>

      <div className="estado-exp">
        <span className={"pastilla" + (v.estado === "vigente" ? "" : " gris")}>
          <Icon n={v.estado === "vigente" ? "check" : v.estado === "cancelada" ? "alerta" : "reloj"} s={13} w={2.2} />
          {v.estado === "vigente" ? "Vigente"
            : v.estado === "programada" ? "Programada"
            : v.estado === "cancelada" ? "Cancelada" : "Finalizada"}
        </span>
        <span className="v">Pase {v.codigo}</span>
      </div>

      <Ficha>
        <Dato k="Documento" v={v.documento ?? "No lo cargaste"} />
        <Dato k="Se repite" v={v.recurrente ? "Todas las semanas" : "Una sola vez"} />
        <Dato k="Autorizó" v={v.creadaPor} />
        <Dato k="Creada" v={fechaCorta(v.creadaEl)} />
        {v.nota && <Dato k="Nota para recepción" v={v.nota} ancho />}
      </Ficha>

      {v.estado === "vigente" && (
        <button className="entrar" type="button" onClick={() => ir("r07", v.id)} style={{ marginTop: 16 }}>
          <Icon n="qr" s={18} w={1.8} />Ver el pase
        </button>
      )}

      <h2 className="sec">Historial del acceso</h2>
      {hitos.length === 1 ? (
        <Aviso icono="info">
          Todavía no pasó nada más: la autorización existe pero nadie validó el pase
          ni registró un ingreso.
        </Aviso>
      ) : null}
      <Linea hitos={hitos} />

      <Aviso icono="candado">
        Validar el pase y registrar el ingreso son dos acciones distintas de recepción.
        Las dos quedan acá con su hora y su responsable.
      </Aviso>

      {activa && (
        <button className="dar-baja" type="button" onClick={() => setCancelar(true)}
          style={{ marginTop: 16 }}>
          <Icon n="alerta" s={16} w={2} />Dar de baja la autorización
        </button>
      )}

      <FinLista texto={`Pase ${v.codigo}`} />

      {cancelar && (
        <Hoja
          titulo={`Dar de baja el pase de ${v.nombre}`}
          texto="El pase deja de servir enseguida. Si llega igual, recepción va a ver que la autorización está dada de baja y te va a llamar."
          confirmar="Dar de baja"
          peligro
          onConfirmar={() => { hacer({ t: "visita/cancelar", id: v.id }); setCancelar(false); ir("r06"); }}
          onCancelar={() => setCancelar(false)}
        />
      )}
    </div>
  );
}
