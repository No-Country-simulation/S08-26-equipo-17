import type { ReactNode } from "react";

export type NombreIcono =
  | "campana" | "volver" | "flechaDer" | "flechaDiag" | "chevron" | "mas"
  | "personaMas" | "persona" | "personas" | "chat" | "calendario" | "caja"
  | "credencial" | "reloj" | "pin" | "qr" | "check" | "casa" | "puntos"
  | "ojo" | "info" | "alerta" | "documento" | "lista" | "engranaje" | "salir"
  | "sol" | "luna" | "sobre" | "candado"
  | "rayo" | "herramienta" | "obra" | "escudo" | "banco" | "maletin" | "chispa"
  | "torta" | "telefono" | "descarga" | "camara";

const trazos: Record<NombreIcono, ReactNode> = {
  campana: <><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" /><path d="M10.2 18.5a2 2 0 0 0 3.6 0" /></>,
  volver: <path d="M19 12H6M12 5l-7 7 7 7" />,
  camara: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1 1 0 0 0 .84-.46l.92-1.42A1 1 0 0 1 9.3 4.6h5.4a1 1 0 0 1 .84.52l.92 1.42a1 1 0 0 0 .84.46h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" /><circle cx="12" cy="12.6" r="3.4" /></>,
  flechaDer: <path d="M5 12h13M12 5l7 7-7 7" />,
  flechaDiag: <><path d="M7 17 17 7" /><path d="M8.5 7H17v8.5" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  mas: <path d="M12 5.5v13M5.5 12h13" />,
  personaMas: <><circle cx="9.5" cy="8" r="3.5" /><path d="M3.6 19.4a6.2 6.2 0 0 1 11.8 0" /><path d="M18.6 7.4v5M16.1 9.9h5" /></>,
  persona: <><circle cx="12" cy="8" r="3.6" /><path d="M5.6 19.6a6.8 6.8 0 0 1 12.8 0" /></>,
  personas: <><circle cx="9" cy="8.4" r="3.1" /><path d="M3.6 19.2a5.9 5.9 0 0 1 10.8 0" /><circle cx="17.2" cy="8.8" r="2.4" /><path d="M16 14.4a5 5 0 0 1 4.4 4.8" /></>,
  chat: <path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4 20.6l1.5-3.7A6.8 6.8 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z" />,
  calendario: <><rect x="3.4" y="5" width="17.2" height="15.4" rx="3" /><path d="M3.4 10h17.2M8.2 3.2v3.6M15.8 3.2v3.6" /></>,
  caja: <><path d="M3.6 7.6 12 3.4l8.4 4.2v8.8L12 20.6l-8.4-4.2Z" /><path d="M3.6 7.6 12 11.9l8.4-4.3M12 11.9v8.7" /></>,
  credencial: <><rect x="2.6" y="5" width="18.8" height="14" rx="2.6" /><circle cx="9" cy="11.4" r="2" /><path d="M5.6 16.2a3.8 3.8 0 0 1 6.8 0M14.6 10.4h4M14.6 13.6h4" /></>,
  reloj: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.4v5l3.2 2" /></>,
  pin: <><path d="M12 21s6.6-5.7 6.6-10.4A6.6 6.6 0 0 0 5.4 10.6C5.4 15.3 12 21 12 21Z" /><circle cx="12" cy="10.4" r="2.3" /></>,
  qr: <><path d="M4 8.6V5.4A1.4 1.4 0 0 1 5.4 4h3.2M15.4 4h3.2A1.4 1.4 0 0 1 20 5.4v3.2M20 15.4v3.2a1.4 1.4 0 0 1-1.4 1.4h-3.2M8.6 20H5.4A1.4 1.4 0 0 1 4 18.6v-3.2" /><rect x="8" y="8" width="8" height="8" rx="1.4" /></>,
  check: <path d="m5 12.5 4.6 4.5L19 7" />,
  casa: <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" />,
  puntos: <path d="M5.5 12h.1M12 12h.1M18.5 12h.1" />,
  ojo: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8.2v.1" /></>,
  alerta: <><path d="M12 3.8 20.8 19H3.2Z" /><path d="M12 10v4M12 16.6v.1" /></>,
  documento: <><path d="M13.6 3.4H7a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.8Z" /><path d="M13.4 3.6v5.2h5.4M8.6 13h6.8M8.6 16.4h4.6" /></>,
  lista: <path d="M4.4 7h15.2M4.4 12h15.2M4.4 17h9.6" />,
  engranaje: <><circle cx="12" cy="12" r="3.1" /><path d="M19.4 14.6a1.7 1.7 0 0 0 .34 1.87l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.06-.06a1.7 1.7 0 0 0-2.88 1.2v.18a1.9 1.9 0 1 1-3.8 0v-.1a1.7 1.7 0 0 0-2.94-1.12l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06A1.7 1.7 0 0 0 3.6 13.6h-.18a1.9 1.9 0 1 1 0-3.8h.1a1.7 1.7 0 0 0 1.12-2.94l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.06A1.7 1.7 0 0 0 10.2 4.6v-.18a1.9 1.9 0 1 1 3.8 0v.1a1.7 1.7 0 0 0 2.94 1.12l.06-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.7 1.7 0 0 0-.24 2.06" /></>,
  sobre: <><rect x="2.8" y="5" width="18.4" height="14" rx="2.6" /><path d="m3.4 6.6 8.6 6 8.6-6" /></>,
  candado: <><rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.8" /><path d="M8 10.2V7.6a4 4 0 0 1 8 0v2.6" /></>,
  torta: <><path d="M12 3.4a8.6 8.6 0 1 0 8.6 8.6H12Z" /><path d="M15 3.9a8.6 8.6 0 0 1 5.1 5.1H15Z" /></>,
  telefono: <path d="M6.6 3.6h2.6l1.4 4.1-2 1.5a11.6 11.6 0 0 0 6.2 6.2l1.5-2 4.1 1.4v2.6a2 2 0 0 1-2.1 2A16.4 16.4 0 0 1 4.6 5.7a2 2 0 0 1 2-2.1Z" />,
  descarga: <><path d="M12 4v11.2M7.2 10.6 12 15.4l4.8-4.8" /><path d="M5 19.4h14" /></>,
  /* rubros de gasto */
  rayo: <path d="M13.4 2.8 5.6 13.4h5.2l-.6 7.8 7.8-10.6h-5.2Z" />,
  herramienta: <><path d="M14.8 6.2a3.8 3.8 0 0 1 5.1 4.9l-8.6 8.6a2.2 2.2 0 0 1-3.1-3.1l8.6-8.6" /><path d="M8.6 4.2 4.2 8.6l2.6 2.6 4.4-4.4Z" /></>,
  obra: <><path d="M4 20.4V8.6l7-3.4v15.2" /><path d="M11 11.4l8.6-2.8v11.8" /><path d="M3.2 20.4h17.6M7 10.6v.1M7 14v.1M15 13v.1M15 16.4v.1" /></>,
  escudo: <path d="M12 3.2 19.4 6v6.2c0 4.3-3.1 7.4-7.4 8.6-4.3-1.2-7.4-4.3-7.4-8.6V6Z" />,
  banco: <><path d="M3.4 9.4 12 4.2l8.6 5.2" /><path d="M5.6 9.8v8.2M10 9.8v8.2M14 9.8v8.2M18.4 9.8v8.2" /><path d="M3.4 20.4h17.2" /></>,
  maletin: <><rect x="3.2" y="7.4" width="17.6" height="12.4" rx="2.4" /><path d="M8.6 7.4V5.8a1.8 1.8 0 0 1 1.8-1.8h3.2a1.8 1.8 0 0 1 1.8 1.8v1.6" /><path d="M3.2 12.6h17.6" /></>,
  chispa: <path d="M12 3.4 13.9 9.5 20 11.4 13.9 13.3 12 19.4 10.1 13.3 4 11.4 10.1 9.5Z" />,
  sol: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7M18.6 18.6l-1.7-1.7M7.1 7.1 5.4 5.4" /></>,
  luna: <path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z" />,
  salir: <><path d="M14.4 4.6H6.8a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h7.6" /><path d="M17.6 15.4 21 12l-3.4-3.4M20.4 12H10" /></>,
};

/** El trazo lo fija el sistema según el tamaño, no cada pantalla.
 *  Había llamadas con 1.7, 1.8, 1.9, 2.1, 2.2 y 2.4 para íconos del mismo
 *  tamaño: la misma familia se veía de cuatro pesos distintos y ninguno
 *  conversaba con Satoshi. Ahora un ícono chico lleva un trazo más firme
 *  —si no, desaparece— y uno grande, uno más fino. Los puntos de "Más"
 *  son la única excepción: con el trazo normal son tres motas. */
const trazo = (n: NombreIcono, s: number) =>
  n === "puntos" ? 2.8 : s <= 15 ? 2.2 : s <= 18 ? 2 : s <= 22 ? 1.8 : 1.65;

export function Icon({
  n, s = 20, color,
}: {
  n: NombreIcono;
  s?: number;
  /** Ya no se usa: el trazo sale de `trazo()`. Queda para no romper las
   *  llamadas existentes. */
  w?: number;
  color?: string;
}) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"}
      strokeWidth={trazo(n, s)} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {trazos[n]}
    </svg>
  );
}
