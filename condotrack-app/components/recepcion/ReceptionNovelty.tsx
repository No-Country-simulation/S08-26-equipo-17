"use client";
import type { ReactNode } from "react";
import { useApp } from "@/lib/estado";
import { AGENDA } from "@/lib/edificio";
import { ProveedorNovedad, useNovedad } from "../sistema/Novedad";

/** Qué cuenta como novedad para Recepción: visitas, entregas, incidencias y
 *  mudanzas aprobadas. El sensor es el del sistema (dos pulsos y quieto). */
export function ReceptionNovelty({ children }: { children: ReactNode }) {
  const { estado } = useApp();
  const claves = [...estado.visitas.map(v => `v:${v.id}`), ...estado.entregas.map(e => `e:${e.id}`), ...estado.incidencias.map(i => `i:${i.id}`), ...AGENDA.filter(a => a.tipo === "mudanza").map(a => `m:${a.id}`)];
  return <ProveedorNovedad claves={claves}>{children}</ProveedorNovedad>;
}
export const useReceptionNovelty = useNovedad;
