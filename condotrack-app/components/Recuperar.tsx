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
    <section className="screen login" aria-label="Recuperar acceso">
      <button className="redondo volver-redondo" type="button" onClick={onVolver} aria-label="Volver">
        <Icon n="volver" s={19} w={2.1} />
      </button>

      <div className="lg-top">
        <img className="marca-claro" src="/brand/CT_LOGO_LIGHT_V2.png" alt="CondoTrack" />
        <img className="marca-oscuro" src="/brand/CT_LOGO_DARK_V2.png" alt="" aria-hidden="true" />
      </div>

      {!enviado ? (
        <>
          <h1>Recuperá tu acceso</h1>
          <p className="sub">Te mandamos un enlace para crear una contraseña nueva.</p>
          <form onSubmit={enviar} noValidate>
            <div>
              <label className="sr" htmlFor="mailrec">Correo electrónico</label>
              <div className="campo">
                <span className="glifo-campo"><Icon n="sobre" s={19} w={1.8} /></span>
                <input id="mailrec" type="email" autoComplete="username" placeholder="Correo electrónico"
                  value={mail} onChange={(e) => { setMail(e.target.value); setError(null); }} />
              </div>
            </div>
            {error && (
              <div className="alerta" role="alert">
                <span style={{ flex: "none", marginTop: 1, color: "var(--error)" }}><Icon n="alerta" s={17} w={2} /></span>
                <p>{error}</p>
              </div>
            )}
            <button className="entrar" type="submit">Enviar enlace</button>
          </form>
        </>
      ) : (
        <>
          <h1>Revisá tu correo</h1>
          <p className="sub">
            Si <strong>{mail.trim()}</strong> tiene una cuenta, va a recibir un enlace para crear una
            contraseña nueva. Vence en 30 minutos.
          </p>
          <div className="nota" style={{ marginTop: 26 }}>
            <span style={{ flex: "none", marginTop: 1, color: "var(--txt2)" }}><Icon n="info" s={18} w={2} /></span>
            <p>¿No te llegó? Revisá spam, o pedile a tu administración que verifique el correo registrado.</p>
          </div>
        </>
      )}

      <div className="cambiar">
        ¿Te acordaste? <button type="button" onClick={onVolver}>Iniciar sesión</button>
      </div>

      <div className="ayuda">
        <p>El acceso lo habilita la administración del edificio. Si nunca lo activaste, pedíselo a ellos.</p>
      </div>
    </section>
  );
}
