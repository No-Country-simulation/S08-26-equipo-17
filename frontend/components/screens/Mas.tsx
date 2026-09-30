"use client";
import { Icon, type NombreIcono } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
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
      contador: sinLeer || undefined, va: "r03" },
    { icono: "lista", titulo: "Votaciones", desc: "1 abierta", va: "r24" },
    { icono: "reloj", titulo: "Historial", va: "r17" },
  ];

  /* "Expensas" llevaba a una pantalla que repetía el hero del home. El
     destino canónico de la plata es Estado de cuenta: ahí está el saldo,
     los movimientos y los comprobantes. */
  const PLATA: Item[] = [
    { icono: "lista", titulo: "Estado de cuenta",
      desc: `${pesos(exp.total)} · ${vencimientoEnPalabras(exp.vencimiento).toLowerCase()}`, va: "r23" },
    { icono: "credencial", titulo: "Medios de pago", va: "r22" },
    { icono: "torta", titulo: "Gastos", va: "r21" },
    { icono: "check", titulo: "Informar un pago", va: "f03" },
  ];

  const GESTIONES: Item[] = [
    { icono: "caja", titulo: "Entregas",
      desc: aRetirar > 0 ? `${aRetirar} para retirar` : undefined, va: "r08" },
    { icono: "chat", titulo: "Reclamos",
      desc: abiertos > 0 ? `${abiertos} en curso` : undefined, va: "r09" },
    { icono: "personaMas", titulo: "Visitas", va: "r06" },
  ];

  const APOYO: Item[] = [
    { icono: "info", titulo: "Preguntas frecuentes", va: "r19" },
    { icono: "documento", titulo: "Reglamento", va: "r19" },
  ];

  const fila = (it: Item) => (
    <button key={it.titulo} type="button" onClick={() => it.va && ir(it.va)}>
      <span className="ic"><Icon n={it.icono} s={20} /></span>
      <span className="d"><b>{it.titulo}</b>{it.desc && <i>{it.desc}</i>}</span>
      {it.contador != null && <span className="contador">{it.contador}</span>}
      <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
    </button>
  );

  return (
    <div className="vista" id="mas">
      <TopBar volverA="r01" ir={ir} />
      <div className="tit"><h1>Más</h1></div>

      <button className="perfil" type="button" onClick={() => ir("r15")}>
        <span className="avatar">{RESIDENTE.iniciales}</span>
        <span className="d">
          <b>{RESIDENTE.nombre}</b>
          <i>{RESIDENTE.rol} · Unidad {RESIDENTE.unidad}</i>
        </span>
        <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
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
          <span className="d"><b>Preferencias y seguridad</b></span>
          <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
        </button>
        <button className="salir" type="button" onClick={onSalir}>
          <span className="ic"><Icon n="salir" s={20} w={1.8} /></span>
          <span className="d"><b>Cerrar sesión</b></span>
        </button>
      </div>

    </div>
  );
}
