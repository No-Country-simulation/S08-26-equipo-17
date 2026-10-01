/** La carga usa el isotipo master sin deformar su geometría ni simular un progreso. */
export function ReceptionLoading({ rol = "recepcion" }: { rol?: "recepcion" | "administracion" }) {
  const nombre = rol === "administracion" ? "administración" : "recepción";
  return <section className="desk recepcion rec-command-center rec-loading" aria-label={`Cargando ${nombre}`} aria-busy="true">
    <div className="desk-main">
      <div className="cc-utility" aria-hidden="true"><img className="rec-logo-light" src="/brand/CT_LOGO_LIGHT_V2.png" alt="" width={204} height={54} /><img className="rec-logo-dark" src="/brand/CT_LOGO_DARK_V2.png" alt="" width={204} height={54} /></div>
      <div className="rec-loading-content" role="status"><img className="rec-loading-mark" src="/brand/CT_MASTER_DUOTONE_DARK.svg" alt="" width={112} height={112} />
        <h1>Cargando {nombre}</h1><div className="rec-loading-bars" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
    </div>
  </section>;
}
