"use client";
import { createContext, useContext } from "react";

/** Historial de navegación del prototipo (BUG-02 y BUG-03).
 *
 *  Hasta acá, "volver" no era volver: cada pantalla declaraba un destino
 *  fijo en el prop `volverA` de TopBar. Desde el historial de la unidad
 *  siempre caías en el pase de acceso y desde el Reglamento siempre en el
 *  panel central, vinieras de donde vinieras. Es el mismo bug contado dos
 *  veces.
 *
 *  Acá el prototipo lleva una pila. `volverA` sigue existiendo y sigue
 *  sirviendo: es el destino de arranque cuando entrás por enlace directo
 *  —`?p=app&v=r17`— y no hay ninguna pantalla anterior a la que volver. */
export type Navegacion = {
  volver: () => void;
  /** false cuando la pila está vacía: ahí manda `volverA`. */
  hayVuelta: boolean;
  /** Corrige el ref con el que esta pantalla va a quedar en la pila: el
   *  contexto que eligió el usuario, o nada si el ref era una orden de un
   *  solo uso. No re-renderiza. */
  reemplazarRef: (ref?: string) => void;
  /** La pantalla de la que venís (id de vista y ref), para ofrecer un
   *  "Volver a…" con nombre cuando una acción te llevó más adentro. */
  anterior?: { v: string; ref?: string };
  /** Vuelve hacia atrás hasta `v` (sacando de la pila lo que haya
   *  encima). Si `v` no está en la pila, va a `v` y la pila queda vacía:
   *  es el "volver al inicio" de un flujo terminado. */
  volverHasta?: (v: string) => void;
  /** Navega sin apilar la pantalla actual: para salir de una pantalla de
   *  éxito sin que "Volver" regrese al formulario ya enviado. */
  reemplazar?: (v: string, ref?: string) => void;
};

export const CtxNavegacion = createContext<Navegacion | null>(null);

export const useNavegacion = () => useContext(CtxNavegacion);
