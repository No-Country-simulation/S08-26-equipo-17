"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Hoja } from "../ui/Hoja";
import { ZonaContexto } from "../ui/ZonaContexto";
import { FinLista } from "../ui/FinLista";
import { SubNav } from "../ui/SubNav";
import { EDIFICIO, RECEPCION, ADMINISTRACION, ESPACIOS, PESTANAS_EDIFICIO, type Vista } from "@/lib/data";
import { SIN_FOTO, cupoDelDia, diaCon, diaEnPalabras, proximoLibre } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** G15 · Mi edificio.
 *  Antes era R02. R02 pasó a ser Mi unidad, que es lo que dice el mapeo de
 *  IDs ("R02 unidad / contexto"), así que el contexto del edificio bajó al
 *  patrón genérico de detalle de contexto. Ver 04_MAPEO_IDS_A_PATRONES. */

export function G15({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const hoy = diaCon(0);
  return (
    <div className="vista" id="g15">
      {/* La foto del edificio ya es la zona de arriba: la card con la misma
          foto que había acá abajo la repetía. */}
      <ZonaContexto ir={ir} volverA="r01" foto="/img/fachada.jpg"
        contexto={EDIFICIO.ciudad}
        titulo={EDIFICIO.nombre}>
        <SubNav etiqueta="Secciones de Mi edificio" opciones={PESTANAS_EDIFICIO}
          valor={"g15" as Vista} onCambio={(v) => ir(v)} />
      </ZonaContexto>

      {/* Los dos contactos con la misma forma: quién, rol y horario en una
          línea, y cómo hablarle. Los atajos a reclamos y entregas que tenía
          cada uno repetían la barra y el home (lock V02). */}
      <h2 className="sec">Contactos</h2>
      <Contacto iniciales={ADMINISTRACION.iniciales} nombre={ADMINISTRACION.nombre}
        rol="Administración" horario="Lun a vie · 10:00–17:00"
        telefono={ADMINISTRACION.telefono} mail={ADMINISTRACION.mail} />
      <Contacto iniciales={RECEPCION.iniciales} nombre={RECEPCION.nombre}
        rol="Recepción" horario={EDIFICIO.horarioRecepcion}
        telefono={RECEPCION.telefono} extra={RECEPCION.interno} />

      {/* Las cards completas de los espacios viven acá (lock V02): la foto
          lleva al espacio, "Reservar" abre el calendario con ese espacio
          elegido. En Reservas no se repiten. */}
      <h2 className="sec">Espacios</h2>
      <div className="dos">
        {ESPACIOS.map((e) => {
          const cupo = cupoDelDia(e, hoy, estado.reservas);
          const proximo = cupo > 0 ? null : proximoLibre(e, hoy, estado.reservas);
          const cupoProx = proximo ? cupoDelDia(e, proximo, estado.reservas) : 0;
          const cuantos = (n: number) => (n === 1 ? "1 horario" : n + " horarios");
          const dia = proximo ? diaEnPalabras(proximo) : "";
          const texto = cupo > 0 ? `Hoy · ${cuantos(cupo)}`
            : proximo ? `${dia.charAt(0).toUpperCase() + dia.slice(1)} · ${cuantos(cupoProx)}` : "Sin horarios";
          const sinFoto = SIN_FOTO.has(e.id);
          return (
            <div className={"esp " + (sinFoto ? "mat-carbon sin-foto" : "mat-foto")} key={e.id}>
              {!sinFoto && <img src={e.img} alt="" />}
              {sinFoto && <span className="ic-grande" aria-hidden="true"><Icon n="rayo" s={30} /></span>}
              <button className="esp-ver" type="button" onClick={() => ir("r13", e.id)}
                aria-label={"Ver " + e.nombre} />
              <span className="sobre">
                <span className="tx"><b>{e.nombre}</b><i>{texto}</i></span>
              </span>
              <button className="esp-reservar" type="button" onClick={() => ir("r05", e.id)}>
                Reservar
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="grupo">Documentos y reglas</h3>
      <div className="menu">
        <button type="button" onClick={() => ir("r19")}>
          <span className="d"><b>Reglamento de convivencia</b><i>Horarios, espacios, accesos y expensas</i></span>
          <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => ir("r14")}>
          <span className="d"><b>Documentos</b><i>Actas, pólizas, rendiciones y planos</i></span>
          <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => ir("r21")}>
          <span className="d"><b>Gastos del consorcio</b><i>En qué se fue la plata del período</i></span>
          <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
        </button>
      </div>

      <FinLista texto={EDIFICIO.nombreLargo} />
    </div>
  );
}

function Contacto({ iniciales, nombre, rol, horario, telefono, mail, extra }: {
  iniciales: string; nombre: string; rol: string; horario: string;
  telefono: string; mail?: string; extra?: string;
}) {
  /* Los botones abrían la nada. Ahora levantan una hoja corta con las
     formas reales de hablarle: el teléfono, el interno y el correo. */
  const [abre, setAbre] = useState(false);
  return (
    <div className="contacto">
      <div className="arr">
        <span className="av">{iniciales}</span>
        <span className="d"><b>{nombre}</b><i>{rol}</i><i className="hor">{horario}</i></span>
      </div>
      <div className="ct-acciones">
        {mail && (
          <button className="circulo" type="button" aria-label={"Escribir a " + nombre}
            onClick={() => setAbre(true)}><Icon n="sobre" s={20} /></button>
        )}
        <button className="circulo llamar" type="button" aria-label={"Llamar a " + nombre}
          onClick={() => setAbre(true)}><Icon n="telefono" s={20} /></button>
      </div>

      {abre && (
        <Hoja titulo={nombre} texto={`${rol} · ${horario}`} onCancelar={() => setAbre(false)}
          cerrarRotulo="Cerrar" sinAcciones>
          <ul className="opciones-hoja">
            <li>
              <a href={"tel:" + telefono.replace(/\s/g, "")} onClick={() => setAbre(false)}>
                <span className="ic"><Icon n="telefono" s={20} /></span>
                <b>Llamar</b>
                <span className="val">{telefono}</span>
              </a>
            </li>
            {extra && (
              <li>
                <span className="solo-dato">
                  <span className="ic"><Icon n="info" s={20} /></span>
                  <b>{extra}</b>
                </span>
              </li>
            )}
            {mail && (
              <li>
                <a href={"mailto:" + mail} onClick={() => setAbre(false)}>
                  <span className="ic"><Icon n="sobre" s={20} /></span>
                  <b>Escribir</b>
                  <span className="val">{mail}</span>
                </a>
              </li>
            )}
          </ul>
          <div style={{ height: 12 }} />
        </Hoja>
      )}
    </div>
  );
}
