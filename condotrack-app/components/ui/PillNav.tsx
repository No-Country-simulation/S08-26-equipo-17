"use client";
import { Icon, type NombreIcono } from "./Icon";
import type { Vista } from "@/lib/data";

/** Barra inferior · cinco destinos con acción central (D-04).
 *
 *  `Inicio · Mi edificio · [ACCESO] · Reservas · Más`
 *
 *  El criterio de qué está acá es frecuencia, no inventario: la barra no
 *  es un directorio de funcionalidades. Lo de media frecuencia vive
 *  adentro de su sección y lo de baja, en Más.
 *
 *  La acción central es el patrón *bottom app bar with docked FAB*: un
 *  squircle más ancho que alto, no un círculo, apoyado sobre la barra.
 *  Es la única acción primaria permanente de la app, y por eso es lo
 *  único amarillo acá adentro: el destino activo se marca con peso
 *  tipográfico y color sólido (D-05). */
const DESTINOS: {
  id: Vista; rotulo: string; icono: NombreIcono; central?: boolean; etiqueta?: string;
}[] = [
  { id: "r01", rotulo: "Inicio",      icono: "casa" },
  { id: "r02", rotulo: "Mi edificio", icono: "obra" },
  { id: "r07", rotulo: "Acceso",      icono: "qr", central: true,
    etiqueta: "Acceso: tu credencial y los pases vigentes" },
  { id: "r05", rotulo: "Reservas",    icono: "calendario" },
  { id: "mas", rotulo: "Más",         icono: "puntos" },
];

/** Cada vista de segundo nivel ilumina su destino padre.
 *  Se extiende, no se reemplaza: los IDs que ya estaban siguen valiendo.
 *  Cambia quién es el padre de r07 (ahora es raíz de Acceso), de g15 y r02
 *  (los dos cuelgan de Mi edificio, D-07) y de r14 (Documentos se va de Más
 *  a la tercera pestaña de Mi edificio). */
const PADRE: Record<Vista, Vista> = {
  r01: "r01", r17: "r01",
  r02: "r02", g15: "r02", r06: "r02", r08: "r02", r16: "r02", g11: "r02", r14: "r02",
  r07: "r07", f01: "r07",
  r05: "r05", r18: "r05", r13: "r05",
  mas: "mas", r03: "mas", r09: "mas", g10: "mas", f02: "mas",
  r15: "mas", r19: "mas", r24: "mas",
  r20: "mas", r21: "mas", r22: "mas", r23: "mas", f03: "mas",
};

export function PillNav({ actual, ir }: { actual: Vista; ir: (v: Vista) => void }) {
  const activo = PADRE[actual];
  return (
    <nav className="pill" aria-label="Navegación principal">
      {DESTINOS.map((d) => (
        <button key={d.id} type="button"
          className={d.central ? "central" : undefined}
          onClick={() => ir(d.id)}
          aria-label={d.etiqueta}
          aria-current={activo === d.id ? "page" : undefined}>
          <span className={d.central ? "squircle" : "circ"}>
            <Icon n={d.icono} s={d.central ? 22 : 20} w={d.icono === "puntos" ? 2.4 : 1.9} />
          </span>
          {d.rotulo}
        </button>
      ))}
    </nav>
  );
}
