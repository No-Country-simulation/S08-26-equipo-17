"use client";
import { useState, type FormEvent } from "react";
import { Icon } from "./ui/Icon";

/** G02 · Recuperar acceso. Nunca confirma ni niega que el correo exista:
 *  el mismo mensaje para todos, para no filtrar quién tiene cuenta. */
export function Recuperar({ onVolver }: { onVolver: () => void }) {
  const [mail, setMail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const m = mail.trim();
    if (!m || !m.includes("@")) { setError("Escribí el correo con el que entrás a CondoTrack."); return; }
    setError(null);
    setEnviado(true);
  }

  return (
    <section className="screen login ingreso" aria-label="Recuperar acceso">
      {/* la misma escena que el login: fachada atrás, card de vidrio adelante */}
      <img className="lg-foto" src="/img/fachada.jpg" alt="" aria-hidden="true" />
      <button className="redondo volver-redondo" type="button" onClick={onVolver} aria-label="Volver">
        <Icon n="volver" s={20} w={2.1} />
      </button>

      <div className="lg-card">
        <div className="lg-top">
          <img src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" />
        </div>

        {!enviado ? (
          <>
            <h1>Recuperá tu acceso</h1>
            <p className="sub">Te mandamos un enlace para crear una contraseña nueva.</p>
            <form onSubmit={enviar} noValidate>
              <div>
                <label className="sr" htmlFor="mailrec">Correo electrónico</label>
                <div className="campo">
                  <span className="glifo-campo"><Icon n="sobre" s={20} w={1.8} /></span>
                  <input id="mailrec" type="email" autoComplete="username" placeholder="Correo electrónico"
                    value={mail} onChange={(e) => { setMail(e.target.value); setError(null); }} />
                </div>
              </div>
              {error && (
                <div className="alerta" role="alert">
                  <span style={{ flex: "none", marginTop: 1, color: "var(--error)" }}><Icon n="alerta" s={16} w={2} /></span>
                  <p>{error}</p>
                </div>
              )}
              <button className="entrar" type="submit">Enviar enlace</button>
            </form>
          </>
        ) : (
          <>
            <span className="lg-glifo" aria-hidden="true"><Icon n="sobre" s={20} w={1.8} /></span>
            <h1>Revisá tu correo</h1>
            <p className="sub">
              Si <strong>{mail.trim()}</strong> tiene una cuenta, va a recibir un enlace para crear una
              contraseña nueva. Vence en 30 minutos.
            </p>
            <button className="entrar" type="button" onClick={onVolver}>Iniciar sesión</button>
          </>
        )}
      </div>

      {!enviado && (
        <div className="cambiar">
          ¿Te acordaste? <button type="button" onClick={onVolver}>Iniciar sesión</button>
        </div>
      )}
    </section>
  );
}
