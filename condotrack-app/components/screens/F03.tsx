"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Texto, Elegir, Adjuntar, PieForm } from "../ui/Formulario";
import { ExitoProtagonista } from "../ui/Estados";
import { Importe } from "../ui/Importe";
import type { Vista } from "@/lib/data";
import {
  EXPENSAS, ROTULO_MEDIO, expensaDelMes, type MedioPago,
} from "@/lib/expensas";
import { pesos, periodoLargo } from "@/lib/formato";
import { useNavegacion } from "@/lib/navegacion";
import { nuevoIdPago, useApp } from "@/lib/estado";

/** F03 · Informar un pago.
 *  Informar no es pagar: el pago queda en "informado, pendiente de
 *  confirmación por administración" y lo dice la pantalla, no la letra chica. */

const MEDIOS: { id: MedioPago["tipo"]; rotulo: string }[] = [
  { id: "transferencia", rotulo: ROTULO_MEDIO.transferencia },
  { id: "debito", rotulo: ROTULO_MEDIO.debito },
  { id: "presencial", rotulo: ROTULO_MEDIO.presencial },
];

const hoyISO = () => new Date().toISOString().slice(0, 10);

export function F03({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { hacer } = useApp();
  const exp = expensaDelMes();

  const [periodo, setPeriodo] = useState(exp.periodo);
  const [importe, setImporte] = useState(String(exp.total));
  const [fecha, setFecha] = useState(hoyISO());
  const [medio, setMedio] = useState<MedioPago["tipo"]>("transferencia");
  const [comprobante, setComprobante] = useState<string | undefined>();
  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState(false);

  const n = Number(importe.replace(/[^\d]/g, ""));
  const errImporte =
    !importe.trim() ? "Escribí cuánto pagaste."
    : !Number.isFinite(n) || n <= 0 ? "El importe tiene que ser un número mayor que cero."
    : undefined;
  const errFecha =
    !fecha ? "Poné la fecha del pago."
    : new Date(fecha) > new Date() ? "La fecha del pago no puede ser futura."
    : undefined;
  const hayError = Boolean(errImporte || errFecha);

  const nav = useNavegacion();
  function confirmar() {
    setTocado(true);
    if (hayError) return;
    setEnviando(true);
    window.setTimeout(() => {
      hacer({
        t: "pago/informar",
        pago: {
          id: nuevoIdPago(), periodo, importe: n,
          fecha: new Date(fecha + "T12:00:00").toISOString(),
          medio, comprobante,
          informadoEl: new Date().toISOString(),
          estado: "informado",
        },
      });
      setEnviando(false);
      setHecho(true);
    }, 700);
  }

  if (hecho) {
    /* RES-FIN-01 · el pago ya quedó informado: salir de acá nunca vuelve al
       formulario. Volver (arriba o abajo) lleva al Inicio con el estado
       nuevo; el estado de cuenta se abre en lugar de este éxito. */
    const alInicio = () => (nav?.volverHasta ? nav.volverHasta("r01") : ir("r01"));
    return (
      <div className="vista" id="f03">
        <TopBar volverA="r01" ir={ir} onVolver={alInicio} />
        {/* Ronda 3 · la misma lógica que "Visita autorizada" */}
        <ExitoProtagonista
          titulo="Pago informado"
          resumen={<><b><Importe valor={n} /></b> · {periodoLargo(periodo)}</>}
          detalle={
            <dl className="exito-datos">
              <div><dt>Medio</dt><dd>{ROTULO_MEDIO[medio]}</dd></div>
              <div><dt>Estado</dt><dd>A confirmar</dd></div>
            </dl>
          }
          nota="Administración lo confirma cuando concilia el pago."
          accion="Ver el estado de cuenta"
          onAccion={() => (nav?.reemplazar ? nav.reemplazar("r23") : ir("r23"))}
          alterna="Volver al inicio"
          onAlterna={alInicio}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="f03">
      <TopBar volverA="r20" ir={ir} />
      <div className="tit"><h1>Informar un pago</h1></div>

      <Elegir etiqueta="Período" valor={periodo} onCambio={setPeriodo}
        opciones={EXPENSAS.map((e) => ({ id: e.periodo, rotulo: periodoLargo(e.periodo) }))} />

      <Texto etiqueta="Importe" valor={importe} onCambio={setImporte}
        tipo="text" placeholder="184250" icono="documento"
        error={tocado ? errImporte : undefined}
        ayuda={n > 0 ? pesos(n) : undefined} />

      <Texto etiqueta="Fecha del pago" valor={fecha} onCambio={setFecha} tipo="date"
        error={tocado ? errFecha : undefined} />

      <Elegir etiqueta="Medio" valor={medio} onCambio={setMedio} opciones={MEDIOS} />

      <Adjuntar etiqueta="Comprobante" archivo={comprobante} onCambio={setComprobante}
        titulo="Adjuntar el comprobante" icono="documento"
        ayuda="La constancia de la transferencia o el ticket del pago"
        nombreSugerido="comprobante-transferencia.pdf" />

      <PieForm
        accion="Informar el pago"
        onAccion={confirmar}
        onCancelar={() => ir("r20")}
        cargando={enviando}
        nota="Queda pendiente hasta que administración lo confirme."
      />
    </div>
  );
}
