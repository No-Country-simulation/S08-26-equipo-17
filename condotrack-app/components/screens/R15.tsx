"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Interruptor } from "../ui/Formulario";
import { Ficha, Dato } from "../ui/Panel";
import { Aviso } from "../ui/Estados";
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

  const titular = PERSONAS.find((p) => p.esTitular);

  return (
    <div className="vista" id="r15">
      <TopBar volverA="mas" ir={ir} />
      <div className="tit"><h1>Preferencias</h1><p>Qué te avisamos y cómo entrás.</p></div>

      <h3 className="grupo">Avisos</h3>
      <div className="lista-sw">
        <Interruptor etiqueta="Entregas" ayuda="Cuando recepción recibe algo para tu unidad."
          valor={entregas} onCambio={setEntregas} />
        <Interruptor etiqueta="Accesos" ayuda="Cuando se valida un pase o se registra un ingreso."
          valor={accesos} onCambio={setAccesos} />
        <Interruptor etiqueta="Reservas" ayuda="Confirmaciones, recordatorios y cancelaciones."
          valor={reservas} onCambio={setReservas} />
        <Interruptor etiqueta="Expensas" ayuda="Cuando se publica la expensa y cuando vence."
          valor={expensas} onCambio={setExpensas} />
        <Interruptor etiqueta="Comunicados del edificio" ayuda="Avisos generales de administración."
          valor={comunicados} onCambio={setComunicados} />
      </div>

      {!accesos && (
        <Aviso icono="alerta" tono="mal">
          Con los avisos de acceso apagados no vas a enterarte cuando alguien entre a
          tu unidad con un pase. Todo queda igual en el historial, pero no te llega
          nada en el momento.
        </Aviso>
      )}

      <h3 className="grupo">Tu cuenta</h3>
      <Ficha>
        <Dato k="Nombre" v={RESIDENTE.nombre} />
        <Dato k="Unidad" v={RESIDENTE.unidad} />
        <Dato k="Vínculo" v={titular?.esTitular ? "Titular de la unidad" : "Residente"} />
        <Dato k="Mail" v="felipe@araoz1280.com.ar" ancho />
      </Ficha>

      <div className="menu" style={{ marginTop: 14 }}>
        <button type="button">
          <span className="ic"><Icon n="candado" s={20} w={1.8} /></span>
          <span className="d"><b>Cambiar la contraseña</b><i>Te mandamos un enlace al mail</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={onSalir}>
          <span className="ic"><Icon n="salir" s={20} w={1.8} /></span>
          <span className="d"><b>Cerrar sesión</b></span>
        </button>
      </div>

      <FinLista texto="Fin de las preferencias" />
    </div>
  );
}
