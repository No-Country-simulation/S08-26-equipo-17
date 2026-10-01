"use client";
import type { ReactNode } from "react";
import { Icon, type NombreIcono } from "./Icon";

/** Los estados sistémicos del 06_UX_UI_SCOPE (template 12). Una pantalla sin
 *  estos no está terminada, así que están acá una sola vez y se usan igual
 *  en los tres perfiles. */

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div className="estado-sis" role="status" aria-live="polite">
      <span className="rueda-chica" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function Error({
  titulo = "No pudimos cargar esto", texto, onReintentar,
}: { titulo?: string; texto?: string; onReintentar?: () => void }) {
  return (
    <div className="estado-sis mal" role="alert">
      <span className="glifo"><Icon n="alerta" s={22} w={1.9} /></span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {onReintentar && (
        <button className="entrar" type="button" onClick={onReintentar}>Reintentar</button>
      )}
    </div>
  );
}

export function SinPermiso({
  texto = "Esta pantalla es de administración. Tu perfil de residente ve su unidad y las operaciones de su unidad.",
  onVolver,
}: { texto?: string; onVolver?: () => void }) {
  return (
    <div className="estado-sis" role="alert">
      <span className="glifo"><Icon n="candado" s={22} w={1.9} /></span>
      <h3>No tenés permiso para ver esto</h3>
      <p>{texto}</p>
      {onVolver && <button className="entrar" type="button" onClick={onVolver}>Volver al inicio</button>}
    </div>
  );
}

/** Confirmación de una operación. Dice qué pasó, qué queda registrado y
 *  cuál es el paso siguiente: sin eso es un cartel de felicitaciones. */
export function Confirmacion({
  titulo, principal, secundario, registro, accion, onAccion, alterna, onAlterna, pieza, compacta,
}: {
  titulo: string; principal: string; secundario?: string; registro?: string;
  accion: string; onAccion: () => void; alterna?: string; onAlterna?: () => void;
  /** Lo que se emitió: el pase, el ticket de la reserva. Va en lugar del
   *  texto, cuando hay algo para mostrar y no sólo para decir. */
  pieza?: ReactNode;
  /** Sin el alto de pantalla completa: el resultado arriba y la acción
   *  siguiente a mano (RES-030). */
  compacta?: boolean;
}) {
  return (
    <div className={"listo" + (compacta ? " compacta" : "")} role="status" aria-live="polite">
      <span className="tilde"><Icon n="check" s={26} w={2.6} /></span>
      <h1>{titulo}</h1>
      {pieza ?? <p>{principal}</p>}
      {!pieza && secundario && <p className="cuando">{secundario}</p>}
      {registro && (
        <div className="listo-nota">
          <Icon n="info" s={16} w={2} />
          <p>{registro}</p>
        </div>
      )}
      <button className="entrar" type="button" onClick={onAccion}>{accion}</button>
      {alterna && onAlterna && (
        <button className="btn-ter" type="button" onClick={onAlterna}>{alterna}</button>
      )}
    </div>
  );
}

/** Aviso en línea: un dato que hace falta saber antes de decidir. */
export function Aviso({
  icono = "info", children, tono = "neutro",
}: { icono?: NombreIcono; children: ReactNode; tono?: "neutro" | "mal" }) {
  return (
    <div className={"nota" + (tono === "mal" ? " mal" : "")}>
      <span style={{ flex: "none", marginTop: 1, color: tono === "mal" ? "var(--error)" : "var(--txt2)" }}>
        <Icon n={icono} s={18} w={2} />
      </span>
      <p>{children}</p>
    </div>
  );
}

/** Éxito con el estado como protagonista (F01-S01…S04, referencia de
 *  jerarquía `REF_success_hierarchy`): el tilde grande al centro con aire,
 *  el título fuerte, el detalle más callado y las acciones juntas al pie del
 *  contenido. Entra una sola vez (escala y tilde que se dibuja); con
 *  movimiento reducido aparece terminado. Lo usa Autorizar visita; las otras
 *  confirmaciones (Reclamo creado, Pago informado) no cambian. */
export function ExitoProtagonista({
  titulo, resumen, detalle, nota, accion, onAccion, alterna, onAlterna,
}: {
  titulo: string; resumen: ReactNode; detalle?: ReactNode; nota?: string;
  accion: string; onAccion: () => void; alterna?: string; onAlterna?: () => void;
}) {
  return (
    <div className="exito" role="status" aria-live="polite">
      <div className="exito-cuerpo">
        <span className="exito-tilde" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="52" height="52">
            <path d="M15 27.5 22.5 35 38 18.5" fill="none" stroke="currentColor" strokeWidth="4.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1>{titulo}</h1>
        <p className="exito-resumen">{resumen}</p>
        {detalle && <div className="exito-detalle">{detalle}</div>}
        {nota && <p className="exito-nota"><Icon n="info" s={15} w={2} />{nota}</p>}
      </div>
      <div className="exito-acciones">
        <button className="entrar exito-cta" type="button" onClick={onAccion}>{accion}</button>
        {alterna && onAlterna && (
          <button className="btn-ter" type="button" onClick={onAlterna}>{alterna}</button>
        )}
      </div>
    </div>
  );
}
