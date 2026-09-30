"use client";
import { Icon, type NombreIcono } from "./Icon";

/** El botón firma (D-06).
 *
 *  Es el botón con flecha que vive en "Visitas hoy" y que funciona. Deja de
 *  ser una regla suelta de R01 y pasa a ser componente: autorizar visita,
 *  hacer reclamo, reservar espacio, administración, recepción y volver.
 *
 *  Dos tonos, porque el material no se comporta igual en las dos partes de
 *  la app. Sobre foto o carbón, el vidrio es blanco translúcido con filo
 *  blanco —eso es lo aprobado—. Sobre el fondo claro ese mismo blanco al
 *  12% no existe: ahí el vidrio es --vidrio con el filo de gradiente, que
 *  es el mismo material leído en la otra dirección.
 *
 *  .circulo NO se va: sigue siendo la acción secundaria (cerrar, filtrar,
 *  el perfil del header). Lo que cambia con D-06 es cuál de los dos es la
 *  firma. */
export function BotonGlass({
  etiqueta,
  icono = "flechaDiag",
  onClick,
  tono = "sobrio",
  tamano = "m",
  tipo = "button",
  deshabilitado,
  decorativo,
}: {
  /** Obligatoria: el botón no tiene texto visible. */
  etiqueta: string;
  icono?: NombreIcono;
  onClick?: () => void;
  /** "claro" = sobre foto o carbón · "sobrio" = sobre el fondo de la app. */
  tono?: "sobrio" | "claro";
  tamano?: "m" | "s";
  tipo?: "button" | "submit";
  deshabilitado?: boolean;
  /** Cuando la acción ya es la card entera. Dibuja el mismo material pero
   *  como span: dos botones anidados no son HTML válido, y el área táctil
   *  tiene que ser la card, no la flechita. */
  decorativo?: boolean;
}) {
  const clase =
    "bglass" + (tono === "claro" ? " claro" : "") + (tamano === "s" ? " ch" : "");
  const glifo = <Icon n={icono} s={20} w={2.1} />;

  if (decorativo) {
    return <span className={clase} aria-hidden="true">{glifo}</span>;
  }

  return (
    <button
      type={tipo}
      className={clase}
      aria-label={etiqueta}
      onClick={onClick}
      disabled={deshabilitado}
    >
      {glifo}
    </button>
  );
}
