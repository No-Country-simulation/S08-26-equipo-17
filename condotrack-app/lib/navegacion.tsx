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
};

export const CtxNavegacion = createContext<Navegacion | null>(null);

export const useNavegacion = () => useContext(CtxNavegacion);
