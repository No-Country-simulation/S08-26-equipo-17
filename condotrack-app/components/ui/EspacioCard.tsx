"use client";
import { Icon } from "./Icon";
import type { Espacio } from "@/lib/data";

/** Card de un espacio común (G15-01/02 · R05-04/07).
 *
 *  Una sola composición para Mi edificio y para "Explorar espacios" en
 *  Reservar. v04 · A2: antes era la foto entera con el nombre y un botón de
 *  vidrio al centro, y no decía nada del lugar. Ahora la foto va arriba
 *  (con la acción en vidrio sobre ella) y abajo, sobre la superficie cálida,
 *  el nombre, dónde está y para cuántos, y la disponibilidad de hoy. Tocar
 *  la card abre la ficha del espacio. */
export function EspacioCard({
  espacio, sinFoto, accion, onAccion, onVer, elegida, disponible,
}: {
  espacio: Espacio;
  sinFoto?: boolean;
  accion: string;
  onAccion: () => void;
  /** Abrir la ficha del espacio tocando la card. */
  onVer?: () => void;
  elegida?: boolean;
  /** La disponibilidad de hoy, en palabras (semáforo: ok / poco / nada). */
  disponible?: { texto: string; tono: "ok" | "poco" | "nada" };
}) {
  return (
    <div className={"esp-card" + (sinFoto ? " sin-foto" : "") + (elegida ? " elegida" : "")}>
      <div className="esp-card-foto">
        {!sinFoto && <img src={espacio.img} alt="" />}
        {sinFoto && <span className="esp-card-ic" aria-hidden="true"><Icon n="rayo" s={28} /></span>}
      </div>
      {onVer && <button className="esp-card-ver" type="button" onClick={onVer} aria-label={"Ver " + espacio.nombre} />}
      <div className="esp-card-pie">
        <b>{espacio.nombre}</b>
        <i>{espacio.piso} · {espacio.capacidad.replace(/^Hasta /, "")}</i>
        {disponible && <span className="esp-card-disp" data-tono={disponible.tono}>{disponible.texto}</span>}
      </div>
      <button className="esp-card-cta" type="button" onClick={onAccion}
        aria-pressed={elegida === undefined ? undefined : elegida}
        aria-label={elegida === undefined ? `${accion} ${espacio.nombre}` : `${espacio.nombre}${elegida ? ", elegido" : ""}`}>
        {elegida && <Icon n="check" s={15} w={2.6} />}
        {elegida ? "Elegido" : accion}
      </button>
    </div>
  );
}
