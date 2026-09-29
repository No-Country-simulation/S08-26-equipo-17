"use client";

/** Navegación secundaria (03 · IA).
 *
 *  Se usa en tres lugares y en ninguno más: Mi edificio (Unidad · Edificio ·
 *  Documentos), Reservas (Espacios · Mis reservas · Historial) y Reclamos
 *  (Abiertos · En seguimiento · Cerrados). Cuando varias vistas pertenecen
 *  al mismo ámbito, van acá; no se abre un destino nuevo en la barra.
 *
 *  Sin amarillo. El amarillo marca acción primaria, selección y fecha
 *  elegida (D-05); esto es navegación, y se distingue por peso y por una
 *  barra sólida abajo. Mismo criterio que la barra inferior. */
export function SubNav<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: { id: T; rotulo: string; contador?: number }[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
}) {
  return (
    <nav className="subnav" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-current={o.id === valor ? "page" : undefined}
          onClick={() => onCambio(o.id)}
        >
          <span>{o.rotulo}</span>
          {o.contador != null && o.contador > 0 && <em>{o.contador}</em>}
        </button>
      ))}
    </nav>
  );
}
