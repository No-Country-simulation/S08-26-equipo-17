"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Hoja } from "../ui/Hoja";
import { Panel } from "../ui/Panel";
import { PanelMedios } from "../paneles/PanelMedios";
import { TopBar } from "../ui/TopBar";
import { Descarga } from "../ui/Descarga";
import { Aviso } from "../ui/Estados";
import { FinLista } from "../ui/FinLista";
import { RESIDENTE, type Vista } from "@/lib/data";
import {
  DESGLOSE, PARTICIPACION, archivoCupon, archivoRendicion, expensaDelMes,
} from "@/lib/expensas";
import { pesos, periodoLargo, fechaCorta, vencimientoEnPalabras, fechaHora } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R20 · Expensa del mes.
 *  Módulo nuevo: no estaba en la documentación del proyecto. Ver D-007. */
export function R20({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const [medios, setMedios] = useState(false);
  const [papeles, setPapeles] = useState(false);
  const exp = expensaDelMes();
  const informado = estado.pagos.find((p) => p.periodo === exp.periodo);

  const totalComunes = DESGLOSE.comunes.reduce((a, l) => a + l.monto, 0);
  const totalPropios = DESGLOSE.propios.reduce((a, l) => a + l.monto, 0);

  return (
    <div className="vista" id="r20">
      <TopBar volverA="r01" ir={ir} />

      <div className="cabecera-ent">
        <span className="et">Expensa · Unidad {RESIDENTE.unidad}</span>
        <h1>{pesos(exp.total)}</h1>
        <p>{periodoLargo(exp.periodo)}</p>
      </div>

      <div className="estado-exp">
        <span className={"pastilla" + (exp.estado === "pagada" ? " gris" : "")}>
          <Icon n={exp.estado === "pagada" ? "check" : "reloj"} s={13} w={2.2} />
          {exp.estado === "pagada" ? "Pagada" : exp.estado === "vencida" ? "Vencida" : "Pendiente"}
        </span>
        <span className="v">
          Vence el {fechaCorta(exp.vencimiento)} · {vencimientoEnPalabras(exp.vencimiento)}
        </span>
      </div>

      {informado && (
        <Aviso icono="reloj">
          Informaste un pago de {pesos(informado.importe)} el {fechaHora(informado.informadoEl)}.
          Queda pendiente de confirmación por administración.
        </Aviso>
      )}

      {/* La composición arranca cerrada y con los dos subtotales a la
          vista. Antes la pantalla abría con toda la contabilidad
          desplegada: el que entra a ver cuánto paga no necesita las
          catorce líneas para enterarse. */}
      <h2 className="sec">Cómo se compone</h2>

      <Panel icono="lista" titulo="Gastos comunes" resumen={pesos(totalComunes)}>
        {DESGLOSE.comunes.map((l) => (
          <div className="tabla-f" key={l.concepto}>
            <span className="d"><b>{l.concepto}</b><i>{l.detalle}</i></span>
            <span className="n">{pesos(l.monto)}</span>
          </div>
        ))}
        <button className="tabla-ir" type="button" onClick={() => ir("r21")}>
          <Icon n="lista" s={17} w={1.8} />
          Ver en qué se gastó · {PARTICIPACION}% es tuyo
          <span className="flech"><Icon n="chevron" s={15} w={2.2} /></span>
        </button>
      </Panel>

      <Panel icono="casa" titulo="Propios de la unidad" resumen={pesos(totalPropios)}>
        {DESGLOSE.propios.map((l) => (
          <div className="tabla-f" key={l.concepto}>
            <span className="d"><b>{l.concepto}</b><i>{l.detalle}</i></span>
            <span className="n">{pesos(l.monto)}</span>
          </div>
        ))}
      </Panel>

      <div className="tabla total">
        <div className="tabla-f">
          <span className="d"><b>Total del período</b></span>
          <span className="n">{pesos(exp.total)}</span>
        </div>
      </div>

      <h2 className="sec">Qué podés hacer</h2>

      <button className="entrar" type="button" onClick={() => ir("f03")} style={{ marginTop: 14 }}>
        Informar un pago
      </button>

      <div className="menu" style={{ marginTop: 18 }}>
        <button type="button" onClick={() => setMedios(true)}>
          <span className="ic"><Icon n="credencial" s={20} w={1.8} /></span>
          <span className="d"><b>Medios de pago</b><i>CBU, alias y pago presencial</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => setPapeles(true)}>
          <span className="ic"><Icon n="documento" s={20} w={1.8} /></span>
          <span className="d"><b>Documentos</b><i>Cupón de pago y rendición del período</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => ir("r23")}>
          <span className="ic"><Icon n="lista" s={20} w={1.8} /></span>
          <span className="d"><b>Estado de cuenta</b><i>Histórico de la unidad y saldo</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
      </div>

      <FinLista texto={`Expensa de ${periodoLargo(exp.periodo).toLowerCase()}`} />

      {/* Copiar un CBU no justifica cambiar de pantalla. */}
      {papeles && (
        <Hoja titulo="Documentos de la expensa" onCancelar={() => setPapeles(false)}
          cerrarRotulo="Cerrar" sinAcciones>
          <Descarga rotulo="Cupón de pago" archivo={archivoCupon(exp.periodo)} peso="94 KB" />
          <Descarga rotulo="Rendición completa del período" archivo={archivoRendicion(exp.periodo)} peso="860 KB" />
          <div style={{ height: 16 }} />
        </Hoja>
      )}

      {medios && (
        <Hoja titulo="Medios de pago" onCancelar={() => setMedios(false)}
          cerrarRotulo="Cerrar" sinAcciones alto="alta">
          <PanelMedios />
          <div style={{ height: 20 }} />
        </Hoja>
      )}
    </div>
  );
}
