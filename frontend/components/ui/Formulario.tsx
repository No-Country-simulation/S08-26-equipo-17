"use client";
import { useId, useState, type ReactNode } from "react";
import { SwipeButton } from "./SwipeButton";
import { Hoja } from "./Hoja";
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

/** Elegir entre opciones. No usa el select del navegador —que trae su
 *  propia estética y su propia lista— sino una fila del sistema que abre
 *  la hoja con las opciones, como el resto de la app. */
export function Elegir<T extends string>({
  etiqueta, valor, onCambio, opciones, ayuda, error, opcional, placeholder,
}: Base & {
  valor: T; onCambio: (v: T) => void; opciones: { id: T; rotulo: string }[];
  placeholder?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.id === valor);
  return (
    <div className={"campo-f" + (error ? " mal" : "")}>
      <span className="et">{etiqueta}{opcional && <em>opcional</em>}</span>
      <button className="caja elige" type="button" onClick={() => setAbierto(true)}
        aria-haspopup="dialog" aria-invalid={error ? true : undefined}>
        <span className={"val" + (elegida ? "" : " vacio")}>
          {elegida ? elegida.rotulo : placeholder ?? "Elegir"}
        </span>
        <span className="chev-sel" aria-hidden="true"><Icon n="chevron" s={16} w={2.2} /></span>
      </button>
      {error
        ? <p className="err"><Icon n="alerta" s={14} w={2} />{error}</p>
        : ayuda ? <p className="ay">{ayuda}</p> : null}

      {abierto && (
        <Hoja titulo={etiqueta} onCancelar={() => setAbierto(false)} cerrarRotulo="Cerrar" sinAcciones>
          <ul className="opciones-hoja">
            {opciones.map((o) => (
              <li key={o.id}>
                <button type="button" aria-current={o.id === valor ? "true" : undefined}
                  onClick={() => { onCambio(o.id); setAbierto(false); }}>
                  <b>{o.rotulo}</b>
                  {o.id === valor && <span className="tic"><Icon n="check" s={16} w={2.4} /></span>}
                </button>
              </li>
            ))}
          </ul>
          <div style={{ height: 12 }} />
        </Hoja>
      )}
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
  titulo = "Adjuntar una foto", ayuda = "Una foto ayuda a entender de qué se trata",
  icono = "camara",
}: {
  etiqueta: string; archivo?: string; onCambio: (v?: string) => void; nombreSugerido: string;
  titulo?: string; ayuda?: string; icono?: NombreIcono;
}) {
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
            <span className="ic" aria-hidden="true"><Icon n={icono} s={20} w={1.9} /></span>
            <span className="tx">
              <b>{titulo}</b>
              <i>{ayuda}</i>
            </span>
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
        <SwipeButton rotulo={accion} onConfirm={onAccion} />
      ) : (
        <button className="entrar" type="button" onClick={onAccion}
          disabled={deshabilitado || cargando} aria-busy={cargando || undefined}>
          {cargando ? <><span className="giro" />Confirmando…</> : accion}
        </button>
      )}
      <button className="btn-ter" type="button" onClick={onCancelar}>{rotuloCancelar}</button>
    </div>
  );
}
