"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Texto, Elegir, Adjuntar, PieForm } from "../ui/Formulario";
import { Confirmacion } from "../ui/Estados";
import type { Vista } from "@/lib/data";
import {
  EXPENSAS, ROTULO_MEDIO, expensaDelMes, type MedioPago,
} from "@/lib/expensas";
import { pesos, periodoLargo } from "@/lib/formato";
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
    return (
      <div className="vista" id="f03">
        <TopBar volverA="r20" ir={ir} />
        <Confirmacion
          titulo="Pago informado"
          principal={`${pesos(n)} · ${periodoLargo(periodo)}`}
          secundario={ROTULO_MEDIO[medio]}
          accion="Ver el estado de cuenta"
          onAccion={() => ir("r23")}
          alterna="Volver a la expensa"
          onAlterna={() => ir("r20")}
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
