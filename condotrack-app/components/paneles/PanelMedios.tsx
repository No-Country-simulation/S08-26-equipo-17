"use client";
import { Icon } from "../ui/Icon";
import { Descarga, Copiar } from "../ui/Descarga";
import { Aviso } from "../ui/Estados";
import { MEDIOS_PAGO, ROTULO_MEDIO, archivoMedios } from "@/lib/expensas";

/** El contenido de medios de pago, sin pantalla alrededor.
 *  Lo usan la hoja que sube desde la expensa y la vista R22, que sigue
 *  existiendo para el enlace directo. */
export function PanelMedios() {
  return (
    <>
      {MEDIOS_PAGO.map((m) => (
        <section className="medio" key={m.tipo}>
          <div className="arr">
            <span className="ic">
              <Icon n={m.tipo === "presencial" ? "persona" : m.tipo === "debito" ? "reloj" : "credencial"}
                s={19} w={1.8} />
            </span>
            <h2>{ROTULO_MEDIO[m.tipo]}</h2>
          </div>

          <div className="campos-copia">
            <div className="cp">
              <span className="k">Titular</span>
              <span className="v">{m.titular}</span>
            </div>
            {m.cbu && (
              <div className="cp">
                <span className="k">CBU</span>
                <span className="v mono">{m.cbu}</span>
                <Copiar valor={m.cbu} etiqueta="el CBU" />
              </div>
            )}
            {m.alias && (
              <div className="cp">
                <span className="k">Alias</span>
                <span className="v mono">{m.alias}</span>
                <Copiar valor={m.alias} etiqueta="el alias" />
              </div>
            )}
            {m.banco && (
              <div className="cp">
                <span className="k">Banco</span>
                <span className="v">{m.banco}</span>
              </div>
            )}
          </div>

          {m.nota && <p className="nota-medio">{m.nota}</p>}
        </section>
      ))}

      <Aviso icono="info">
        Pagar por transferencia no avisa solo: informá el pago desde la app para que
        administración lo concilie y la expensa deje de figurar pendiente.
      </Aviso>

      <Descarga rotulo="Descargar los datos en PDF" archivo={archivoMedios()} peso="62 KB" />
    </>
  );
}
