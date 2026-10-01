"use client";
import { useState } from "react";
import { ReceptionPage } from "./ReceptionPage";
import { Icon } from "../ui/Icon";
import { type VistaP } from "@/lib/data";
import { useApp } from "@/lib/estado";
import { soloHora } from "@/lib/formato";
import { accesosPrevistos, mismoDiaOperativo } from "@/lib/recepcion";

/** P03 · Escanear acceso. Referencia primaria: U06 Security.
 *
 *  USER GOAL: leer el pase del visitante y pasar a verificarlo.
 *  La tarea es el visor, grande y limpio, con la leyenda debajo del marco.
 *  Al costado, lo que viene después (verificar → identidad y estado →
 *  registrar) y quién se espera hoy. La simulación de lectura existe sólo
 *  porque el prototipo no usa cámara: es un control chico, plegado, rotulado
 *  como prototipo, y no compite con la tarea. */
export function P03({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const { estado } = useApp();
  const [leyendo, setLeyendo] = useState<string | null>(null);
  const ahora = new Date();
  const esperados = accesosPrevistos(estado, ahora).filter(a => a.destino.vista === "p04" && mismoDiaOperativo(a.cuando, ahora));
  const prueba = [
    ...estado.visitas.filter(v => v.estado === "vigente" || v.estado === "programada").map(v => ({ codigo: v.codigo, nota: `${v.nombre} · ${v.estado === "vigente" ? "vigente" : "otro día"}` })),
    ...estado.visitas.filter(v => v.estado === "finalizada").slice(0, 1).map(v => ({ codigo: v.codigo, nota: `${v.nombre} · ya usado` })),
    { codigo: "CT 7D 0000", nota: "no existe" },
  ];

  function leer(codigo: string) {
    setLeyendo(codigo);
    window.setTimeout(() => ir("p04", codigo), 420);
  }

  return (
    <ReceptionPage titulo="Escanear acceso" descripcion="Leé el QR del pase. Después verificás la autorización y, recién ahí, registrás el ingreso." icono="qr" clase="acc"
      acciones={<button className="ct-btn ct-btn--secundario" type="button" onClick={() => ir("p04")}><Icon n="credencial" s={18} />Cargar el código a mano</button>}>
      <div className="acc-escaner">
        <section className="acc-visor-marco" aria-label="Lector de pases">
          <div className="acc-visor" data-leyendo={leyendo ? "" : undefined}>
            <div className="acc-visor-esquinas" aria-hidden="true"><span /><span /><span /><span /></div>
            <Icon n="qr" s={44} />
          </div>
          <p className="acc-visor-leyenda" role="status">{leyendo ? `Código leído: ${leyendo}. Abriendo la verificación…` : "Apuntá el QR del pase a la cámara del mostrador."}</p>
        </section>

        <aside className="acc-lado">
          <section>
            <h2 className="ct-label">Qué pasa después</h2>
            <ol className="acc-pasos">
              <li data-actual=""><b>1</b><span><strong>Leer o cargar el código</strong><small>No registra nada.</small></span></li>
              <li><b>2</b><span><strong>Ver identidad y estado</strong><small>Autorizado, vencido o no encontrado.</small></span></li>
              <li><b>3</b><span><strong>Registrar el ingreso</strong><small>Sólo con un pase autorizado.</small></span></li>
            </ol>
          </section>
          <section>
            <h2 className="ct-label">Se esperan hoy · {String(esperados.length).padStart(2, "0")}</h2>
            {esperados.length ? <ul className="acc-esperados">{esperados.map(a => <li key={a.id}>
              <button type="button" onClick={() => ir("p04", a.destino.ref)}>
                <time>{soloHora(a.cuando)}</time><span><b>{a.nombre}</b><small>{a.contexto}</small></span><Icon n="chevron" s={16} />
              </button></li>)}</ul> : <p className="ct-meta">No quedan accesos previstos para hoy.</p>}
          </section>
        </aside>
      </div>

      <details className="rx-prototipo">
        <summary>Prototipo · simular una lectura</summary>
        <p>Sin cámara en la demo: elegí un código para ver cada resultado.</p>
        <div>{prueba.map(p => <button key={p.codigo} type="button" onClick={() => leer(p.codigo)} disabled={Boolean(leyendo)}>{p.codigo}<small>{p.nota}</small></button>)}</div>
      </details>
    </ReceptionPage>
  );
}
