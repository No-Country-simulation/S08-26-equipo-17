"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Interruptor } from "../ui/Formulario";
import { Aviso } from "../ui/Estados";
import { Hoja } from "../ui/Hoja";
import { FinLista } from "../ui/FinLista";
import { RESIDENTE, type Vista } from "@/lib/data";
import { PERSONAS } from "@/lib/unidad";

/** R15 · Preferencias y seguridad. */
export function R15({ ir, onSalir }: { ir: (v: Vista, ref?: string) => void; onSalir: () => void }) {
  const [entregas, setEntregas] = useState(true);
  const [accesos, setAccesos] = useState(true);
  const [reservas, setReservas] = useState(true);
  const [expensas, setExpensas] = useState(true);
  const [comunicados, setComunicados] = useState(false);
  /* Cambiar la contraseña no llevaba a ningún lado: ahora abre la hoja y
     el enlace se manda de verdad dentro del prototipo. */
  const [clave, setClave] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const titular = PERSONAS.find((p) => p.esTitular);

  return (
    <div className="vista" id="r15">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Preferencias</h1></div>

      <h3 className="grupo">Avisos</h3>
      <div className="lista-sw">
        <Interruptor etiqueta="Entregas"
          valor={entregas} onCambio={setEntregas} />
        <Interruptor etiqueta="Accesos"
          valor={accesos} onCambio={setAccesos} />
        <Interruptor etiqueta="Reservas"
          valor={reservas} onCambio={setReservas} />
        <Interruptor etiqueta="Expensas"
          valor={expensas} onCambio={setExpensas} />
        <Interruptor etiqueta="Comunicados del edificio"
          valor={comunicados} onCambio={setComunicados} />
      </div>

      {!accesos && (
        <Aviso icono="alerta" tono="mal">
          Con esto apagado no te enterás cuando alguien entra con un pase.
        </Aviso>
      )}

      <section className="bloque-cuenta">
        <h3 className="grupo">Tu cuenta</h3>
        <div className="datos-quietos">
          <p><span>Nombre</span><b>{RESIDENTE.nombre}</b></p>
          <p><span>Unidad</span><b>{RESIDENTE.unidad}</b></p>
          <p><span>Vínculo</span><b>{titular?.esTitular ? "Titular de la unidad" : "Residente"}</b></p>
          <p><span>Mail</span><b>felipe@araoz1280.com.ar</b></p>
        </div>

        <div className="menu">
          <button type="button" onClick={() => setClave(true)}>
            <span className="ic"><Icon n="candado" s={20} w={1.8} /></span>
            <span className="d"><b>Cambiar la contraseña</b><i>Te mandamos un enlace al mail</i></span>
            <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
          </button>
          <button className="salir" type="button" onClick={onSalir}>
            <span className="ic"><Icon n="salir" s={20} w={1.8} /></span>
            <span className="d"><b>Cerrar sesión</b></span>
          </button>
        </div>
      </section>

      {clave && (
        <Hoja titulo="Cambiar la contraseña"
          texto={enviado
            ? "Te mandamos el enlace a felipe@araoz1280.com.ar. Vence en 30 minutos."
            : "Te mandamos un enlace a felipe@araoz1280.com.ar para que elijas una nueva."}
          confirmar={enviado ? undefined : "Mandar el enlace"}
          onConfirmar={enviado ? undefined : () => setEnviado(true)}
          cerrarRotulo={enviado ? "Listo" : "Cancelar"}
          onCancelar={() => { setClave(false); setEnviado(false); }}
        />
      )}

      <FinLista texto="Fin de las preferencias" />
    </div>
  );
}
