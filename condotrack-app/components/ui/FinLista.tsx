/** Cierre de lista. Una lista larga que simplemente se corta deja la duda de
 *  si faltaba cargar algo. Esto lo responde. */
export function FinLista({ texto }: { texto: string }) {
  return (
    <div className="fin-lista" role="presentation">
      <span>{texto}</span>
    </div>
  );
}
