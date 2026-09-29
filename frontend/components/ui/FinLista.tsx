/** Cierre de lista. Una lista larga que simplemente se corta deja la duda de
 *  si faltaba cargar algo. Esto lo responde, y abajo firma la marca: es lo
 *  que cierra la pantalla cuando queda aire. */
export function FinLista({ texto, sinMarca }: { texto: string; sinMarca?: boolean }) {
  return (
    <>
      <div className="fin-lista" role="presentation">
        <span>{texto}</span>
      </div>
      {!sinMarca && (
        <div className="marca-pie" aria-hidden="true">
          <img className="marca-claro" src="/brand/CT_LOGO_LIGHT_V2.png" alt="" />
          <img className="marca-oscuro" src="/brand/CT_LOGO_DARK_V2.png" alt="" />
        </div>
      )}
    </>
  );
}
