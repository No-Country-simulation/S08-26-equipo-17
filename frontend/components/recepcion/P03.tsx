"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Aviso } from "../ui/Estados";
import { type VistaP } from "@/lib/data";
import { useApp } from "@/lib/estado";

/** P03 · Escáner.
 *  El prototipo no pide la cámara: pedir permiso de cámara para una demo es
 *  invasivo y además no habría nada que leer. El visor muestra la geometría
 *  real de la pantalla y a un toque se pasa a la validación, que es lo que
 *  importa del flujo. */
export function P03({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const { estado } = useApp();
  const [leyendo, setLeyendo] = useState(false);
  const vigentes = estado.visitas.filter((v) => v.estado === "vigente" || v.estado === "programada");

  function simular(codigo: string) {
    setLeyendo(true);
    window.setTimeout(() => ir("p04", codigo), 600);
  }

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Escanear un pase</h1>
          <p>Apuntá el QR del visitante al lector del mostrador.</p>
        </div>
        <div className="der">
          <button className="btn-desk" type="button" onClick={() => ir("p04")}>
            <Icon n="credencial" s={16} w={1.9} />Cargar el código a mano
          </button>
        </div>
      </div>

      <div className="validar">
        <section className="panel-v on">
          <span className="paso-t"><span className="n">1</span>Lectura</span>
          <div className="visor">
            <div className="marco" aria-hidden="true"><span /><span /><span /><span /></div>
            <p className="leyenda-v">
              {leyendo ? "Leyendo el código…" : "El prototipo no accede a la cámara. Elegí un pase de la derecha para simular la lectura."}
            </p>
          </div>
          <Aviso icono="info">
            Escanear no registra el ingreso. Lo único que hace es cargar el código
            en la pantalla de validación.
          </Aviso>
        </section>

        <section className="panel-v on">
          <span className="paso-t"><span className="n">2</span>Pases de prueba</span>
          <h2>Simular una lectura</h2>
          <p>Estos son los pases que hoy existen en el edificio.</p>
          <div style={{ marginTop: 16 }}>
            {vigentes.map((v) => (
              <button className="fila-op" type="button" key={v.id} onClick={() => simular(v.codigo)}>
                <span className="ic"><Icon n="qr" s={18} w={1.8} /></span>
                <span className="d">
                  <b>{v.codigo}</b>
                  <i>{v.nombre} · Unidad {v.unidad} · {v.horario}</i>
                </span>
                <span className="der"><Icon n="chevron" s={15} w={2.2} /></span>
              </button>
            ))}
            <button className="fila-op" type="button" onClick={() => simular("CT 7D 0000")}>
              <span className="ic"><Icon n="alerta" s={18} w={1.8} /></span>
              <span className="d">
                <b>CT 7D 0000</b>
                <i>Código inexistente · para ver el estado de error</i>
              </span>
              <span className="der"><Icon n="chevron" s={15} w={2.2} /></span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
