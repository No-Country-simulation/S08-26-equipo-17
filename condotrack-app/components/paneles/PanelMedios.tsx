"use client";
import { Icon } from "../ui/Icon";
import { Descarga, Copiar } from "../ui/Descarga";
import { MEDIOS_PAGO, archivoMedios } from "@/lib/expensas";
import { RESIDENTE } from "@/lib/data";

/** Cómo pagar, sin pantalla alrededor (ronda visual 01, §5.5).
 *
 *  Antes eran tres bloques iguales con titular, CBU, alias, banco y nota
 *  cada uno, más un aviso largo: la misma densidad para el medio que usa
 *  casi todo el mundo y para los otros dos. Ahora la transferencia manda
 *  —el alias es lo que se copia, el CBU queda al lado— y débito y pago
 *  presencial son una línea cada uno.
 *
 *  Lo usan la hoja "Pagar" de la expensa y la vista R22 del enlace
 *  directo. */
export function PanelMedios() {
  const trans = MEDIOS_PAGO.find((m) => m.tipo === "transferencia");
  const debito = MEDIOS_PAGO.find((m) => m.tipo === "debito");
  const presencial = MEDIOS_PAGO.find((m) => m.tipo === "presencial");

  return (
    <div className="medios">
      {trans && (
        /* RES-033 · una grilla de datos y no una tarjeta dentro de la hoja:
           titular y banco para saber a quién, alias y CBU en líneas propias
           con copia inequívoca, y el siguiente paso dicho. Copiar no es pagar. */
        <section className="medio-principal" aria-labelledby="mp-transf">
          <h3 className="k" id="mp-transf">Por transferencia</h3>
          <dl className="transf">
            <div><dt>Titular</dt><dd>{trans.titular}</dd></div>
            {trans.banco && <div><dt>Banco</dt><dd>{trans.banco.split(" · ")[0]}</dd></div>}
            {trans.alias && (
              <div className="copia grande"><dt>Alias</dt>
                <dd><span className="v mono">{trans.alias}</span><Copiar valor={trans.alias} etiqueta="el alias" /></dd></div>
            )}
            {trans.cbu && (
              <div className="copia"><dt>CBU</dt>
                <dd><span className="v mono">{trans.cbu}</span><Copiar valor={trans.cbu} etiqueta="el CBU" /></dd></div>
            )}
            <div><dt>Concepto</dt><dd><b>Unidad {RESIDENTE.unidad}</b></dd></div>
          </dl>
          <p className="paso">Transferí desde tu banco y después informá el pago con <b>Ya pagué</b>.</p>
        </section>
      )}

      <div className="medios-otros">
        {debito && (
          <div className="otro">
            <span className="ic"><Icon n="reloj" s={20} /></span>
            <span className="d">
              <b>Débito automático</b>
              <i>Desde tu home banking · día 20</i>
            </span>
          </div>
        )}
        {presencial && (
          <div className="otro">
            <span className="ic"><Icon n="persona" s={20} /></span>
            <span className="d">
              <b>En recepción</b>
              <i>Efectivo · lun a vie · 09:00–18:00</i>
            </span>
          </div>
        )}
      </div>

      <Descarga chico rotulo="PDF" archivo={archivoMedios()} />
    </div>
  );
}
