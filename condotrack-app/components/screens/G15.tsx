"use client";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { FinLista } from "../ui/FinLista";
import { SubNav } from "../ui/SubNav";
import { EDIFICIO, RECEPCION, ADMINISTRACION, ESPACIOS, PESTANAS_EDIFICIO, type Vista } from "@/lib/data";

/** G15 · Mi edificio.
 *  Antes era R02. R02 pasó a ser Mi unidad, que es lo que dice el mapeo de
 *  IDs ("R02 unidad / contexto"), así que el contexto del edificio bajó al
 *  patrón genérico de detalle de contexto. Ver 04_MAPEO_IDS_A_PATRONES. */

export function G15({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  return (
    <div className="vista" id="g15">
      <TopBar volverA="r01" ir={ir} contexto={EDIFICIO.nombreLargo} />
      <div className="tit"><h1>Mi edificio</h1><p>Tu contexto y con quién hablar.</p></div>

      <SubNav etiqueta="Secciones de Mi edificio" opciones={PESTANAS_EDIFICIO}
        valor={"g15" as Vista} onCambio={(v) => ir(v)} />

      <div className="hero-ed mat-foto">
        <img src="/img/edificio.jpg" alt="" />
        <div className="tx">
          <div className="lb">Edificio</div>
          <h2>{EDIFICIO.nombre}</h2>
          <p>{EDIFICIO.ciudad}</p>
        </div>
      </div>

      <h2 className="sec">Con quién hablar</h2>

      <div className="contacto">
        <div className="arr">
          <span className="av">{ADMINISTRACION.iniciales}</span>
          <span className="d">
            <b>{ADMINISTRACION.nombre}</b>
            <i>Administración · {ADMINISTRACION.estudio}</i>
          </span>
        </div>
        <div className="datos">
          <p><Icon n="reloj" s={15} />Lun a vie · 10:00–17:00</p>
          <p><Icon n="sobre" s={15} />{EDIFICIO.mail}</p>
          <p><Icon n="chat" s={15} />{EDIFICIO.telefono}</p>
        </div>
        <div className="acciones-panel">
          <button className="principal" type="button">
            <Icon n="sobre" s={16} w={1.9} />Escribir
          </button>
          <button className="secundario" type="button" onClick={() => ir("r09")}>
            Hacer un reclamo
          </button>
        </div>
      </div>

      <div className="contacto">
        <div className="arr">
          <span className="av">{RECEPCION.iniciales}</span>
          <span className="d">
            <b>{RECEPCION.nombre}</b>
            <i>Recepción · {RECEPCION.turno}</i>
          </span>
        </div>
        <div className="datos">
          <p><Icon n="reloj" s={15} />{EDIFICIO.horarioRecepcion}</p>
          <p><Icon n="pin" s={15} />Hall de entrada</p>
        </div>
        <div className="acciones-panel">
          <button className="principal" type="button">
            <Icon n="chat" s={16} w={1.9} />Llamar a recepción
          </button>
          <button className="secundario" type="button" onClick={() => ir("r08")}>
            Ver entregas
          </button>
        </div>
      </div>

      <h2 className="sec">Espacios del edificio</h2>
      <div className="dos">
        {ESPACIOS.map((e) => (
          <button className="esp mat-foto" type="button" key={e.id} onClick={() => ir("r13", e.id)}>
            <img src={e.img} alt="" />
            <span className="sobre">
              <span className="tx"><b>{e.nombre}</b><i>{e.piso}</i></span>
            </span>
          </button>
        ))}
      </div>

      <h3 className="grupo">Documentos y reglas</h3>
      <div className="menu">
        <button type="button" onClick={() => ir("r19")}>
          <span className="d"><b>Reglamento de convivencia</b><i>Horarios, espacios, accesos y expensas</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => ir("r14")}>
          <span className="d"><b>Documentos</b><i>Actas, pólizas, rendiciones y planos</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={() => ir("r21")}>
          <span className="d"><b>Gastos del consorcio</b><i>En qué se fue la plata del período</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
      </div>

      <FinLista texto={EDIFICIO.nombreLargo} />
    </div>
  );
}
