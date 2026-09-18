"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Hoja } from "../ui/Hoja";
import { PanelEntrega } from "../paneles/PanelEntrega";
import { TopBar } from "../ui/TopBar";
import { Vacio } from "../ui/Vacio";
import { FinLista } from "../ui/FinLista";
import { Aviso } from "../ui/Estados";
import { RESIDENTE, type Vista } from "@/lib/data";
import { fechaHora } from "@/lib/formato";
import { useApp } from "@/lib/estado";

export function R08({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const [abierta, setAbierta] = useState<string | null>(null);
  const entrega = estado.entregas.find((x) => x.id === abierta);
  const lista = estado.entregas
    .filter((e) => e.unidad === RESIDENTE.unidad)
    .sort((a, b) => b.recibidoEl.localeCompare(a.recibidoEl));

  return (
    <div className="vista" id="r08">
      <TopBar volverA="r02" ir={ir} />
      <div className="tit"><h1>Entregas</h1><p>Paquetes y correspondencia de tu unidad.</p></div>

      {lista.length === 0 ? (
        <Vacio icono="caja" titulo="No hay entregas"
          texto="Cuando recepción reciba algo para tu unidad te avisamos y aparece acá." />
      ) : (
        <>
          {lista.map((e) => {
            const paraRetirar = e.estado === "retirar";
            return (
              <button className="entrega" type="button" key={e.id} onClick={() => setAbierta(e.id)}>
                <span className={"ic" + (paraRetirar ? " am" : "")}><Icon n="caja" s={24} w={1.8} /></span>
                <span className="d">
                  <b>{e.titulo}</b>
                  <span className="m">
                    {paraRetirar
                      ? `Recibido por ${e.recibidoPor} · ${fechaHora(e.recibidoEl)}`
                      : `Retirado por ${e.retiradoPor} · ${fechaHora(e.retiradoEl!)}`}
                  </span>
                  <span className={"pastilla" + (paraRetirar ? "" : " gris")} style={{ marginTop: 10 }}>
                    <Icon n={paraRetirar ? "reloj" : "check"} s={13} w={2.4} />
                    {paraRetirar ? "Para retirar" : "Retirado"}
                  </span>
                </span>
                <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
              </button>
            );
          })}
          <FinLista texto="No hay más entregas" />
        </>
      )}

      <Aviso icono="info">
        El retiro lo registra recepción cuando te la entrega: queda quién la recibió,
        quién la retiró y a qué hora, en el historial de tu unidad.
      </Aviso>

      {/* El detalle de una entrega no necesita una pantalla: son cuatro
          datos y un historial de dos líneas. */}
      {entrega && (
        <Hoja titulo={entrega.titulo} onCancelar={() => setAbierta(null)}
          cerrarRotulo="Cerrar" sinAcciones>
          <PanelEntrega e={entrega} />
          <div style={{ height: 20 }} />
        </Hoja>
      )}
    </div>
  );
}
