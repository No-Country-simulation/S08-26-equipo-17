"use client";
import { Icon, type NombreIcono } from "./Icon";
import { RESIDENTE, type Vista } from "@/lib/data";
import { useApp } from "@/lib/estado";
import { proximas, esHoy } from "@/lib/reservas";

/** Barra inferior (D-04, revisada en la ronda visual 01).
 *
 *  Deja de ser una píldora negra flotando: es una barra pegada al borde,
 *  del color del fondo y en vidrio, con una línea arriba. Lo que la hace
 *  reconocible es el centro, no la caja.
 *
 *  El activo se marca con tres cosas a la vez —color sólido, peso y una
 *  barra arriba del ícono—, así no depende de una sola señal.
 *
 *  EL CENTRO ES DINÁMICO (D-25). No es un destino fijo: es la acción que
 *  más te conviene tocar ahora, elegida por un orden de prioridad escrito
 *  acá y en el decision log, para que se pueda discutir en vez de adivinar:
 *
 *    1. tenés un pase vigente ahora                 → Pase
 *    2. hay algo tuyo para retirar en recepción     → Retirar
 *    3. tenés una reserva hoy                       → Reserva
 *    4. nada de lo anterior                         → Acceso
 *
 *  Pagar NO está (lock V02, decisión de Felipe): vive en el home y en
 *  Expensas como acción de su contexto, y la barra no repite una acción
 *  que ya está a la vista. Sin datos de uso reales, el orden es una
 *  hipótesis de producto. */

type Central = { rotulo: string; icono: NombreIcono; va: Vista; refe?: string; etiqueta: string };

function accionCentral(estado: ReturnType<typeof useApp>["estado"]): Central {
  const pase = estado.visitas.find((v) => v.estado === "vigente");
  if (pase) {
    return { rotulo: "Pase", icono: "qr", va: "r07", refe: pase.id,
      etiqueta: "Pase activo de " + pase.nombre };
  }
  const paquete = estado.entregas.find((e) => e.unidad === RESIDENTE.unidad && e.estado === "retirar");
  if (paquete) {
    return { rotulo: "Retirar", icono: "caja", va: "g11", refe: paquete.id,
      etiqueta: "Ver lo que tenés para retirar en recepción" };
  }
  const hoy = proximas(estado.reservas).find((r) => esHoy(new Date(r.inicio)));
  if (hoy) {
    return { rotulo: "Reserva", icono: "calendario", va: "r18",
      etiqueta: "Ver tu reserva de hoy" };
  }
  return { rotulo: "Acceso", icono: "qr", va: "r07", etiqueta: "Tu credencial y los pases vigentes" };
}

const LADO_A: { id: Vista; rotulo: string; icono: NombreIcono }[] = [
  { id: "r01", rotulo: "Inicio",      icono: "casa" },
  { id: "r02", rotulo: "Mi edificio", icono: "obra" },
];
const LADO_B: { id: Vista; rotulo: string; icono: NombreIcono }[] = [
  { id: "r05", rotulo: "Reservas",    icono: "calendario" },
  { id: "mas", rotulo: "Más",         icono: "puntos" },
];

/** Cada vista de segundo nivel ilumina su destino padre. El pase y
 *  autorizar una visita ya no tienen destino propio en la barra: cuelgan
 *  de Mi edificio, que es donde viven las visitas. */
const PADRE: Record<Vista, Vista> = {
  r01: "r01", r17: "r01",
  r02: "r02", g15: "r02", r06: "r02", r08: "r02", r16: "r02", g11: "r02", r14: "r02",
  r07: "r02", f01: "r02",
  r05: "r05", r18: "r05", r13: "r05",
  mas: "mas", r03: "mas", r09: "mas", g10: "mas", f02: "mas",
  r15: "mas", r19: "mas", r24: "mas",
  r20: "mas", r21: "mas", r22: "mas", r23: "mas", f03: "mas",
};

export function PillNav({ actual, ir }: { actual: Vista; ir: (v: Vista, ref?: string) => void }) {
  const { estado } = useApp();
  const activo = PADRE[actual];
  const centro = accionCentral(estado);

  const destino = (d: { id: Vista; rotulo: string; icono: NombreIcono }) => (
    <button key={d.id} type="button" className="dest" onClick={() => ir(d.id)}
      aria-current={activo === d.id ? "page" : undefined}>
      <span className="circ"><Icon n={d.icono} s={21} /></span>
      {d.rotulo}
    </button>
  );

  return (
    <nav className="pill" aria-label="Navegación principal">
      {LADO_A.map(destino)}
      {/* El centro es una acción, no un destino: no se marca activo. Si
          lo hiciera, en la expensa habría dos cosas encendidas a la vez. */}
      <button type="button" className="central" aria-label={centro.etiqueta}
        onClick={() => ir(centro.va, centro.refe)}>
        <span className="squircle">
          <Icon n={centro.icono} s={19} />
          <span className="rot">{centro.rotulo}</span>
        </span>
      </button>
      {LADO_B.map(destino)}
    </nav>
  );
}
