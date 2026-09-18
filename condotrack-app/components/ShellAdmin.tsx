"use client";
import { Pendiente } from "./Pendiente";
import type { VistaA } from "@/lib/data";

/** Escritorio de administración. En construcción: por ahora muestra la
 *  pantalla de pendiente con los destinos que ya define el mapa de
 *  navegación. Se reemplaza entero en la fase 5. */
export function ShellAdmin({
  vista, refe, ir, onSalir,
}: {
  vista: VistaA; refe?: string;
  ir: (v: VistaA, ref?: string) => void;
  onSalir: () => void;
}) {
  return <Pendiente perfil="administracion" onSalir={onSalir} />;
}
