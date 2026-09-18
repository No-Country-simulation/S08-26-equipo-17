"use client";
import { useId, useState, type ReactNode } from "react";
import { SwipeButton } from "./SwipeButton";
import { Icon, type NombreIcono } from "./Icon";

/** Controles de formulario. Uno solo para todo el producto: si cada
 *  pantalla se arma sus campos, la validación y los errores terminan
 *  diciendo cosas distintas para el mismo problema. */

export function Grupo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="grupo-campos">
      {titulo && <span className="grupo-tit">{titulo}</span>}
      {children}
    </div>
  );
}

type Base = { etiqueta: string; ayuda?: string; error?: string; opcional?: boolean };

export function Texto({
  etiqueta, valor, onCambio, ayuda, error, opcional, placeholder, tipo = "text", icono,
}: Base & {
  valor: string; onCambio: (v: string) => void;
  placeholder?: string; tipo?: string; icono?: NombreIcono;
}) {
  const id = useId();
  return (
    <div className={"campo-f" + (error ? " mal" : "")}>
      <label htmlFor={id}>
        {etiqueta}{opcional && <em>opcional</em>}
      </label>
      <div className="caja">
        {icono && <span className="gl"><Icon n={icono} s={17} w={1.9} /></span>}
        <input id={id} type={tipo} value={valor} placeholder={placeholder}
          onChange={(e) => onCambio(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id + "-e" : ayuda ? id + "-a" : undefined} />
      </div>
      {error
        ? <p className="err" id={id + "-e"}><Icon n="alerta" s={14} w={2} />{error}</p>
        : ayuda ? <p className="ay" id={id + "-a"}>{ayuda}</p> : null}
    </div>
  );
}

export function Area({
  etiqueta, valor, onCambio, ayuda, error, opcional, placeholder, filas = 4,
}: Base & { valor: string; onCambio: (v: string) => void; placeholder?: string; filas?: number }) {
  const id = useId();
  return (
    <div className={"campo-f" + (error ? " mal" : "")}>
      <label htmlFor={id}>{etiqueta}{opcional && <em>opcional</em>}</label>
      <div className="caja alto">
        <textarea id={id} rows={filas} value={valor} placeholder={placeholder}
          onChange={(e) => onCambio(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id + "-e" : ayuda ? id + "-a" : undefined} />
      </div>
      {error
        ? <p className="err" id={id + "-e"}><Icon n="alerta" s={14} w={2} />{error}</p>
        : ayuda ? <p className="ay" id={id + "-a"}>{ayuda}</p> : null}
    </div>
  );
}

export function Elegir<T extends string>({
  etiqueta, valor, onCambio, opciones, ayuda, error, opcional,
}: Base & { valor: T; onCambio: (v: T) => void; opciones: { id: T; rotulo: string }[] }) {
  const id = useId();
  return (
    <div className={"campo-f" + (error ? " mal" : "")}>
      <label htmlFor={id}>{etiqueta}{opcional && <em>opcional</em>}</label>
      <div className="caja">
        <select id={id} value={valor} onChange={(e) => onCambio(e.target.value as T)}
          aria-invalid={error ? true : undefined}>
          {opciones.map((o) => <option key={o.id} value={o.id}>{o.rotulo}</option>)}
        </select>
        <span className="chev-sel" aria-hidden="true"><Icon n="chevron" s={15} w={2.2} /></span>
      </div>
      {error
        ? <p className="err"><Icon n="alerta" s={14} w={2} />{error}</p>
        : ayuda ? <p className="ay">{ayuda}</p> : null}
    </div>
  );
}

/** Segmentado: cuando las opciones son pocas y conviene verlas todas. */
export function Segmentos<T extends string>({
  etiqueta, valor, onCambio, opciones, ayuda,
}: Base & { valor: T; onCambio: (v: T) => void; opciones: { id: T; rotulo: string }[] }) {
  return (
    <div className="campo-f">
      <span className="et">{etiqueta}</span>
      <div className="segmentos" role="radiogroup" aria-label={etiqueta}>
        {opciones.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === valor}
            onClick={() => onCambio(o.id)}>
            {o.rotulo}
          </button>
        ))}
      </div>
      {ayuda && <p className="ay">{ayuda}</p>}
    </div>
  );
}

export function Interruptor({
  etiqueta, ayuda, valor, onCambio,
}: { etiqueta: string; ayuda?: string; valor: boolean; onCambio: (v: boolean) => void }) {
  return (
    <button className="interruptor" type="button" role="switch" aria-checked={valor}
      onClick={() => onCambio(!valor)}>
      <span className="d">
        <b>{etiqueta}</b>
        {ayuda && <i>{ayuda}</i>}
      </span>
      <span className="palanca" aria-hidden="true"><span /></span>
    </button>
  );
}

/** Adjuntar: el prototipo no sube archivos de verdad. Simula la elección y
 *  lo dice, en vez de fingir una subida que no existe. */
export function Adjuntar({
  etiqueta, archivo, onCambio, nombreSugerido,
}: { etiqueta: string; archivo?: string; onCambio: (v?: string) => void; nombreSugerido: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="campo-f">
      <span className="et">{etiqueta}<em>opcional</em></span>
      {archivo ? (
        <div className="adjunto">
          <span className="ic"><Icon n="documento" s={18} w={1.8} /></span>
          <span className="d"><b>{archivo}</b><i>Listo para enviar</i></span>
          <button type="button" onClick={() => onCambio(undefined)} aria-label="Quitar el archivo">
            <Icon n="mas" s={16} w={2.4} />
          </button>
        </div>
      ) : (
        <>
          <button className="adjuntar" type="button"
            onClick={() => { onCambio(nombreSugerido); setAbierto(true); }}>
            <Icon n="mas" s={17} w={2.4} />
            Adjuntar una foto
          </button>
          {abierto && <p className="ay">En el prototipo no se sube el archivo: se guarda el nombre para mostrar cómo queda.</p>}
        </>
      )}
    </div>
  );
}

/** Pie de formulario: la acción principal y la salida. Cancelar siempre
 *  está a la vista; que la única forma de salir sea el botón de atrás es
 *  una trampa. */
/** Pie de formulario.
 *
 *  `deslizar` reserva el gesto para el final (D-10): el slide aparece sólo
 *  en el acto irreversible —emitir un pase, confirmar una reserva—, no para
 *  entrar a un formulario. Mientras confirma vuelve al botón normal: un
 *  deslizable que no se puede deslizar es peor que un botón deshabilitado. */
export function PieForm({
  accion, onAccion, onCancelar, deshabilitado, cargando, nota, deslizar,
  rotuloCancelar = "Cancelar",
}: {
  accion: string; onAccion: () => void; onCancelar: () => void;
  deshabilitado?: boolean; cargando?: boolean; nota?: string; deslizar?: boolean;
  rotuloCancelar?: string;
}) {
  const gesto = deslizar && !cargando && !deshabilitado;
  return (
    <div className="pie-form">
      {nota && <p className="nota-form">{nota}</p>}
      {gesto ? (
        <SwipeButton rotulo={accion} pista="Deslizá" onConfirm={onAccion} />
      ) : (
        <button className="entrar" type="button" onClick={onAccion}
          disabled={deshabilitado || cargando} aria-busy={cargando || undefined}>
          {cargando ? <><span className="giro" />Confirmando…</> : accion}
        </button>
      )}
      <button className="volver-txt" type="button" onClick={onCancelar}>{rotuloCancelar}</button>
    </div>
  );
}
