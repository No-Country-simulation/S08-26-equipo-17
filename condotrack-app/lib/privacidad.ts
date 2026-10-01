"use client";
import { useSyncExternalStore } from "react";
import { RESIDENTE } from "./data";
import { pesos } from "./formato";

/** SYS-FIN · RES-003 · Mostrar/ocultar importes.
 *
 *  Es una preferencia de la persona, no un estado financiero: ocultar no
 *  cambia deuda, vencimiento ni la acción de pagar. Se guarda sólo el sí/no
 *  (nunca el importe) en el navegador, por usuario. Sin preferencia
 *  guardada los importes se ven, que es la composición aprobada del Home.
 *  Cuando está oculto, todas las copias del importe de la unidad —Inicio,
 *  Expensa, Movimientos, Pagar, Más y los avisos— se enmascaran también
 *  para lectores de pantalla. */
const CLAVE = `ct:importes-ocultos:${RESIDENTE.unidad}:${RESIDENTE.iniciales}`;
export const MASCARA = "$ ••••••";

function leer() {
  try { return typeof window !== "undefined" && window.localStorage.getItem(CLAVE) === "1"; }
  catch { return false; }
}
let oculto = leer();
const subs = new Set<() => void>();

export function setImportesOcultos(v: boolean) {
  oculto = v;
  try { window.localStorage.setItem(CLAVE, v ? "1" : "0"); } catch { /* sin almacenamiento: vale para la sesión */ }
  subs.forEach((f) => f());
}

export function useImportesOcultos() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => oculto,
    () => false,
  );
}

/** El importe como texto, respetando la preferencia. */
export const importeTexto = (n: number, ocultar: boolean) => (ocultar ? MASCARA : pesos(n));
