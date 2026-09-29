"use client";

/** Filtro con marca deslizante: el cambio de pestaña no es brusco.
 *  Controlado desde afuera para que realmente filtre los datos. */
export function Chips<T extends string>({
  opciones, valor, onCambio, etiqueta,
}: {
  opciones: { id: T; rotulo: string }[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
}) {
  const i = Math.max(0, opciones.findIndex((o) => o.id === valor));
  const n = opciones.length;
  return (
    <div
      className="chips"
      role="group"
      aria-label={etiqueta}
      style={{ "--ancho": `calc((100% - 10px) / ${n})`, "--dx": `${i * 100}%` } as React.CSSProperties}
    >
      <span className="marca" aria-hidden="true" />
      {opciones.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === valor} onClick={() => onCambio(o.id)}>
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
