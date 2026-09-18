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
}: { titulo?: string; texto: string; onReintentar?: () => void }) {
  return (
    <div className="estado-sis mal" role="alert">
      <span className="glifo"><Icon n="alerta" s={22} w={1.9} /></span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
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
  titulo, principal, secundario, registro, accion, onAccion, alterna, onAlterna,
}: {
  titulo: string; principal: string; secundario?: string; registro?: string;
  accion: string; onAccion: () => void; alterna?: string; onAlterna?: () => void;
}) {
  return (
    <div className="listo" role="status" aria-live="polite">
      <span className="tilde"><Icon n="check" s={26} w={2.6} /></span>
      <h1>{titulo}</h1>
      <p>{principal}</p>
      {secundario && <p className="cuando">{secundario}</p>}
      {registro && (
        <div className="listo-nota">
          <Icon n="info" s={17} w={2} />
          <p>{registro}</p>
        </div>
      )}
      <button className="entrar" type="button" onClick={onAccion}>{accion}</button>
      {alterna && onAlterna && (
        <button className="volver-txt" type="button" onClick={onAlterna}>{alterna}</button>
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
