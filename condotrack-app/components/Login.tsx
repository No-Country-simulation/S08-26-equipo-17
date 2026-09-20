"use client";
import { useState, type FormEvent } from "react";
import { CUENTAS, type Perfil } from "@/lib/data";
import { Icon } from "./ui/Icon";

export function Login({ onEntrar, onRecuperar }:
  { onEntrar: (p: Perfil) => void; onRecuperar: () => void }) {
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const m = mail.trim().toLowerCase();
    if (!m || !pass) { setError("Completá el correo y la contraseña."); return; }
    const c = CUENTAS.find((a) => a.mail === m && a.pass === pass);
    if (!c) { setError("El correo o la contraseña no coinciden."); return; }
    setError(null);
    setEnviando(true);
    onEntrar(c.perfil);
  }

  return (
    <section className="screen login ingreso" aria-label="Iniciar sesión">
      {/* la fachada atrás; el formulario adelante, en vidrio */}
      <img className="lg-foto" src="/img/fachada.jpg" alt="" aria-hidden="true" />
      <div className="lg-card">
      <div className="lg-top">
        <img src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" />
      </div>

      <h1>Ingresá</h1>

      <form onSubmit={enviar} noValidate>
        <div>
          <label className="sr" htmlFor="mail">Correo electrónico</label>
          <div className="campo">
            <span className="glifo-campo"><Icon n="sobre" s={20} w={1.8} /></span>
            <input id="mail" type="email" autoComplete="username" placeholder="Correo electrónico"
              value={mail} onChange={(e) => { setMail(e.target.value); setError(null); }} />
          </div>
        </div>

        <div>
          <label className="sr" htmlFor="pass">Contraseña</label>
          <div className="campo pw">
            <span className="glifo-campo"><Icon n="candado" s={20} w={1.8} /></span>
            <input id="pass" type={verPass ? "text" : "password"} autoComplete="current-password"
              placeholder="Contraseña" value={pass}
              onChange={(e) => { setPass(e.target.value); setError(null); }} />
            <button className="ver" type="button" aria-pressed={verPass}
              aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setVerPass(!verPass)}>
              <Icon n="ojo" s={20} w={1.9} />
            </button>
          </div>
        </div>

        <div className="olvide-fila">
          <button className="olvide" type="button" onClick={onRecuperar}>Olvidé mi contraseña</button>
        </div>

        {error && (
          <div className="alerta" role="alert">
            <span style={{ flex: "none", marginTop: 1, color: "var(--error)" }}><Icon n="alerta" s={16} w={2} /></span>
            <p>{error}</p>
          </div>
        )}

        <button className="entrar" type="submit" aria-busy={enviando}>
          {enviando && <span className="giro" aria-hidden="true" />}
          {enviando ? "Entrando…" : "Ingresar"}
        </button>
      </form>
      </div>

      <div className="demo">
        <h2>Cuentas de demostración</h2>
        <ul>
          {CUENTAS.map((c) => (
            <li key={c.mail}>
              <button type="button" onClick={() => { setMail(c.mail); setPass(c.pass); setError(null); }}>
                <span><b>{c.nombre}</b><small>{c.mail}</small></span>
                <em>{c.etiqueta}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ayuda">
        <p>Al ingresar aceptás los <b>Términos</b> y la <b>Política de privacidad</b>.</p>
      </div>
    </section>
  );
}
