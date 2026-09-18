"use client";
import { Icon, type NombreIcono } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { FinLista } from "../ui/FinLista";
import { AVISOS, RESIDENTE, type Vista } from "@/lib/data";
import { avisosExpensa, expensaDelMes } from "@/lib/expensas";
import { pesos, vencimientoEnPalabras } from "@/lib/formato";
import { useApp } from "@/lib/estado";

/** R04 · Más. */

type Item = {
  icono: NombreIcono; titulo: string; desc?: string;
  contador?: number; va?: Vista; destacado?: boolean;
};

export function Mas({ ir, onSalir }: { ir: (v: Vista, ref?: string) => void; onSalir: () => void }) {
  const { estado } = useApp();
  const exp = expensaDelMes();

  /* El contador sale de los avisos reales, no de un número escrito a mano. */
  const sinLeer = estado.avisosLeidos
    ? 0
    : [...avisosExpensa(), ...AVISOS].filter((a) => a.estado === "sinleer").length;
  const abiertos = estado.reclamos.filter(
    (r) => r.estado !== "resuelto" && r.estado !== "cerrado"
  ).length;
  const aRetirar = estado.entregas.filter(
    (e) => e.unidad === RESIDENTE.unidad && e.estado === "retirar"
  ).length;

  /* "Mi edificio" y "Documentos" salieron de esta lista: el primero es un
     destino de la barra y el segundo es su tercera pestaña (D-07). Más es
     lo de baja frecuencia, no un directorio de todo lo que existe. */
  const EDIFICIO_ITEMS: Item[] = [
    { icono: "campana", titulo: "Notificaciones",
      desc: sinLeer > 0 ? `${sinLeer} sin leer` : "Todo leído",
      contador: sinLeer || undefined, va: "r03" },
    { icono: "lista", titulo: "Votaciones", desc: "1 abierta · cierra esta semana", va: "r24" },
    { icono: "lista", titulo: "Historial de la unidad",
      desc: "Todo lo que pasó, quién lo hizo y cuándo", va: "r17" },
  ];

  const PLATA: Item[] = [
    { icono: "documento", titulo: "Expensa del mes",
      desc: `${pesos(exp.total)} · ${vencimientoEnPalabras(exp.vencimiento).toLowerCase()}`,
      va: "r20", destacado: exp.estado !== "pagada" },
    { icono: "check", titulo: "Informar un pago", desc: "Para que lo concilien más rápido", va: "f03" },
    { icono: "lista", titulo: "Estado de cuenta", desc: "Histórico de la unidad y saldo", va: "r23" },
    { icono: "credencial", titulo: "Medios de pago", desc: "CBU, alias y pago presencial", va: "r22" },
    { icono: "rayo", titulo: "Gastos del consorcio", desc: "En qué se fue la plata del edificio", va: "r21" },
  ];

  const GESTIONES: Item[] = [
    { icono: "caja", titulo: "Entregas",
      desc: aRetirar > 0 ? `${aRetirar} para retirar` : "Nada pendiente",
      contador: aRetirar || undefined, va: "r08" },
    { icono: "chat", titulo: "Reclamos",
      desc: abiertos > 0 ? `${abiertos} en curso` : "Crear y seguir reclamos",
      contador: abiertos || undefined, va: "r09" },
    { icono: "credencial", titulo: "Mis visitas", desc: "Autorizaciones y pases", va: "r06" },
  ];

  const APOYO: Item[] = [
    { icono: "info", titulo: "Preguntas frecuentes", desc: "Cómo funciona el edificio", va: "r19" },
    { icono: "lista", titulo: "Reglamento", desc: "Convivencia, espacios, accesos y expensas", va: "r19" },
  ];

  const fila = (it: Item) => (
    <button key={it.titulo} type="button" onClick={() => it.va && ir(it.va)}>
      <span className={"ic" + (it.destacado ? " am" : "")}><Icon n={it.icono} s={20} w={1.8} /></span>
      <span className="d"><b>{it.titulo}</b>{it.desc && <i>{it.desc}</i>}</span>
      {it.contador != null && <span className="contador">{it.contador}</span>}
      <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
    </button>
  );

  return (
    <div className="vista" id="mas">
      <TopBar volverA="r01" ir={ir} />
      <div className="tit"><h1>Más</h1><p>Tu cuenta y tu edificio.</p></div>

      <button className="perfil" type="button" onClick={() => ir("r15")}>
        <span className="avatar">{RESIDENTE.iniciales}</span>
        <span className="d">
          <b>{RESIDENTE.nombre}</b>
          <i>{RESIDENTE.rol} · Unidad {RESIDENTE.unidad}</i>
        </span>
        <span className="flech"><Icon n="chevron" s={18} w={2.1} /></span>
      </button>

      <h3 className="grupo">Expensas</h3>
      <div className="menu">{PLATA.map(fila)}</div>

      <h3 className="grupo">Edificio</h3>
      <div className="menu">{EDIFICIO_ITEMS.map(fila)}</div>

      <h3 className="grupo">Gestiones</h3>
      <div className="menu">{GESTIONES.map(fila)}</div>

      <h3 className="grupo">Ayuda</h3>
      <div className="menu">{APOYO.map(fila)}</div>

      <h3 className="grupo">Mi cuenta</h3>
      <div className="menu">
        <button type="button" onClick={() => ir("r15")}>
          <span className="ic"><Icon n="engranaje" s={20} w={1.8} /></span>
          <span className="d"><b>Preferencias y seguridad</b><i>Avisos y contraseña</i></span>
          <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
        </button>
        <button type="button" onClick={onSalir}>
          <span className="ic"><Icon n="salir" s={20} w={1.8} /></span>
          <span className="d"><b>Cerrar sesión</b></span>
        </button>
      </div>

      <FinLista texto="Fin del menú" />
    </div>
  );
}
