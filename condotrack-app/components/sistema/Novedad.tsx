"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Novedad = { cuenta: number; pulso: boolean; marcarVistas: () => void; nuevas: string[] };
const Ctx = createContext<Novedad>({ cuenta: 0, pulso: false, marcarVistas: () => {}, nuevas: [] });

/** Sensor de novedad · patrón de producto, igual en los tres roles.
 *
 *  Recibe las claves de lo que existe (visitas, entregas, casos…). La
 *  primera lectura es la línea de base: lo que ya estaba no es nuevo. Cada
 *  clave que aparece después suma a la cuenta y dispara exactamente dos
 *  pulsos (2 × 800 ms); después queda el punto quieto. Vive en el shell:
 *  cambiar de destino, montar un componente o pasar el mouse no lo repite. */
export function ProveedorNovedad({ claves, children }: { claves: string[]; children: ReactNode }) {
  const firma = claves.join("|");
  const conocidas = useRef<Set<string> | null>(null);
  const [nuevas, setNuevas] = useState<string[]>([]);
  const [pulso, setPulso] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const actuales = firma ? firma.split("|") : [];
    if (!conocidas.current) { conocidas.current = new Set(actuales); return; }
    const agregadas = actuales.filter(k => !conocidas.current!.has(k));
    actuales.forEach(k => conocidas.current!.add(k));
    if (!agregadas.length) return;
    setNuevas(v => [...v, ...agregadas]);
    setPulso(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setPulso(false), 1600);
  }, [firma]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  const valor: Novedad = { cuenta: nuevas.length, pulso, nuevas, marcarVistas: () => { setNuevas([]); setPulso(false); clearTimeout(reloj.current); } };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useNovedad = () => useContext(Ctx);
