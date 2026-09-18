"use client";
import { useEffect, useState } from "react";

/** Sello de build. Se pinta recién después de montar: en desarrollo el
 *  servidor recalcula la fecha en cada recarga y el cliente conserva la del
 *  bundle, así que renderizarlo en el HTML inicial rompía la hidratación y
 *  React redibujaba toda la pantalla. */
export function Sello() {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => { setV(process.env.NEXT_PUBLIC_BUILD ?? "dev"); }, []);
  return (
    <span className="sello" title="Fecha del build que estás viendo">
      {v ? `build ${v}` : ""}
    </span>
  );
}
