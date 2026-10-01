"use client";
import { useEffect, useState, type CSSProperties } from "react";

/** Fecha y hora comparten un objeto, como en U01; las agujas usan la misma hora real. */
export function ReceptionClock({ ahora }: { ahora: Date }) {
  const [tiempo, setTiempo] = useState(ahora);
  const [origen] = useState(() => Math.floor(ahora.getTime() / 60000) * 60000);
  useEffect(() => {
    const reloj = window.setInterval(() => setTiempo(new Date()), 1000);
    return () => window.clearInterval(reloj);
  }, []);
  ahora = tiempo;
  // Ángulo continuo sin salto al cambiar de minuto ni valores de época enormes.
  const estilo = { "--hora": `${(ahora.getHours() % 12) * 30 + ahora.getMinutes() / 2}deg`, "--minuto": `${ahora.getMinutes() * 6}deg`, "--segundo": `${Math.floor((ahora.getTime() - origen) / 1000) * 6}deg` } as CSSProperties;
  return <div className="rec-time-object">
    <div className="rec-analog" style={estilo} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <em key={i} style={{ transform: `rotate(${i * 30}deg)` }} />)}<i /><i /><i className="rec-second-hand" /><b /></div>
    <div className="rec-clock"><time className="rec-time" suppressHydrationWarning dateTime={ahora.toISOString()}>{new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(ahora)}</time>
      <time className="rec-date" suppressHydrationWarning dateTime={ahora.toISOString()}>{new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(ahora)}</time>
    </div>
  </div>;
}
