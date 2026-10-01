"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type NombreIcono } from "../ui/Icon";
import { useIndicador } from "../sistema/useIndicador";
import { useNavegacion } from "@/lib/navegacion";
import { ADMINISTRACION, EDIFICIO, type VistaA } from "@/lib/data";

/* ── Destinos del menú lateral (Figma 23204:130822) ──────────────────
   Grupos por intención, filas repetibles, indicador sobrio de carbón. Las
   vistas de detalle (A03, A05, A07) marcan a su lista madre. */
export const GRUPOS_A: { nombre: string; items: { id: VistaA; texto: string; icono: NombreIcono }[] }[] = [
  { nombre: "General", items: [{ id: "a01", texto: "Inicio", icono: "casa" }] },
  { nombre: "Operación", items: [
    { id: "a12", texto: "Casos", icono: "alerta" },
    { id: "a08", texto: "Accesos", icono: "credencial" },
    { id: "a09", texto: "Entregas", icono: "caja" },
    { id: "a10", texto: "Reservas", icono: "calendario" },
  ] },
  { nombre: "Edificio", items: [
    { id: "a02", texto: "Edificios", icono: "obra" },
    { id: "a04", texto: "Unidades", icono: "personas" },
    { id: "a06", texto: "Personas", icono: "persona" },
    { id: "a13", texto: "Documentos", icono: "documento" },
  ] },
  { nombre: "Economía", items: [
    { id: "a15", texto: "Expensas", icono: "torta" },
    { id: "a16", texto: "Gastos", icono: "recibo" },
    { id: "a17", texto: "Cobranza", icono: "banco" },
  ] },
];
const MADRE: Partial<Record<VistaA, VistaA>> = { a03: "a02", a05: "a04", a07: "a06" };
export const ROTULO_CORTO_A: Record<VistaA, string> = {
  a01: "Inicio", a02: "Edificios", a03: "Edificio", a04: "Unidades", a05: "Unidad", a06: "Personas", a07: "Persona",
  a08: "Accesos", a09: "Entregas", a10: "Reservas", a12: "Casos", a13: "Documentos", a15: "Expensas", a16: "Gastos", a17: "Cobranza",
};

/* Familias plegadas: se recuerdan durante la sesión (y en el navegador si
   se puede), así el shell queda como lo dejó la persona al cambiar de ruta. */
const CLAVE_PLEGADAS = "ct:admin:familias-plegadas";
/* ADM-SIDEBAR-01 · el menú entero se colapsa a íconos; se recuerda */
const CLAVE_MINI = "ct:admin:menu-mini";
function leerPlegadas(): string[] {
  try { return JSON.parse(window.localStorage.getItem(CLAVE_PLEGADAS) ?? "[]"); } catch { return []; }
}

export function AdminMenu({ vista, ir, cuentas, abierto, onCerrar }: {
  vista: VistaA; ir: (v: VistaA, ref?: string) => void; cuentas: Partial<Record<VistaA, number>>; abierto: boolean; onCerrar: () => void;
}) {
  const caja = useRef<HTMLElement>(null);
  const activa = MADRE[vista] ?? vista;
  /* ADM-001 · tres familias con encabezado que pliega y despliega. Plegar
     no navega; el destino activo sigue a la vista aunque su familia esté
     cerrada, y los pendientes de lo oculto se suman en el encabezado. */
  const [plegadas, setPlegadas] = useState<string[]>(() => (typeof window === "undefined" ? [] : leerPlegadas()));
  const alternar = (g: string) => setPlegadas(p => {
    const n = p.includes(g) ? p.filter(x => x !== g) : [...p, g];
    try { window.localStorage.setItem(CLAVE_PLEGADAS, JSON.stringify(n)); } catch { /* sólo sesión */ }
    return n;
  });
  /* ADM-SIDEBAR-01 · colapsable real: el toggle achica el menú a logo
     compacto + íconos, conserva el activo y los contadores, y nunca se
     colapsa solo. En modo mini los rótulos de familia se ocultan y todos
     los destinos quedan a la vista (el plegado por familia es del menú
     ancho). */
  const [mini, setMini] = useState(() => { try { return typeof window !== "undefined" && window.localStorage.getItem(CLAVE_MINI) === "1"; } catch { return false; } });
  const alternarMini = () => setMini(m => { const n = !m; try { window.localStorage.setItem(CLAVE_MINI, n ? "1" : "0"); } catch { /* sólo sesión */ } return n; });
  useEffect(() => {
    document.querySelector(".ad-shell")?.setAttribute("data-mini", mini ? "true" : "false");
  }, [mini]);
  const { medido, estilo } = useIndicador(caja, '[aria-current="page"]', [activa, plegadas.join(), mini]);
  return <nav ref={caja} className="ad-menu" data-abierto={abierto} data-mini={mini || undefined} aria-label="Administración" data-medido={medido ? "" : undefined} style={estilo}>
    <div className="ad-menu-marca">
      <img className="rec-logo-light ad-logo-ancho" src="/brand/CT_LOGO_LIGHT_V2.png" alt="CondoTrack" width={170} height={45} />
      <img className="rec-logo-dark ad-logo-ancho" src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" width={170} height={45} />
      <img className="ad-logo-mini" src="/brand/CT_FAVICON.svg" alt="CondoTrack" width={30} height={30} />
      <button type="button" className="ct-icono-btn ad-menu-cerrar" aria-label="Cerrar menú" onClick={onCerrar}><Icon n="cerrar" s={18} /></button>
    </div>
    <button type="button" className="ad-menu-mini" aria-label={mini ? "Expandir el menú" : "Colapsar el menú a íconos"} aria-expanded={!mini}
      title={mini ? "Expandir el menú" : "Colapsar el menú"} onClick={alternarMini}>
      <Icon n="chevron" s={16} w={2.4} />
    </button>
    <span className="ad-menu-ind" aria-hidden="true" />
    {GRUPOS_A.map(g => {
      const familia = g.nombre !== "General";
      const cerrada = familia && !mini && plegadas.includes(g.nombre);
      const visible = (d: { id: VistaA }) => !cerrada || d.id === activa;
      const ocultas = g.items.filter(d => !visible(d)).reduce((a, d) => a + (cuentas[d.id] ?? 0), 0);
      const idItems = `ad-fam-${g.nombre.toLowerCase()}`;
      return <div className="ad-menu-grupo" key={g.nombre} data-cerrada={cerrada || undefined}>
        {familia && <button type="button" className="ad-menu-rot" aria-expanded={!cerrada} aria-controls={idItems}
          onClick={() => alternar(g.nombre)}>
          <span>{g.nombre}</span>
          {cerrada && ocultas > 0 && <b className="ad-menu-rot-cuenta" aria-label={`${ocultas} pendientes en ${g.nombre}`}>{ocultas}</b>}
          <Icon n="chevron" s={14} w={2.4} />
        </button>}
        {/* A01-02 · los destinos no se desmontan al plegar: se cierran con
            altura y fundido (240 ms E1), y el activo queda a la vista */}
        <div id={idItems} className="ad-menu-items">
          {g.items.map(d => { const oculto = !visible(d); return <button key={d.id} type="button" aria-current={activa === d.id ? "page" : undefined}
            data-oculto={oculto || undefined} tabIndex={oculto ? -1 : undefined} aria-hidden={oculto || undefined}
            aria-label={mini ? `${d.texto}${cuentas[d.id] ? `, ${cuentas[d.id]} pendientes` : ""}` : undefined} title={mini ? d.texto : undefined}
            onClick={() => { onCerrar(); ir(d.id); }}>
            <Icon n={d.icono} s={19} /><span>{d.texto}</span>{Boolean(cuentas[d.id]) && <b aria-label={`${cuentas[d.id]} pendientes`}>{cuentas[d.id]}</b>}
          </button>; })}
        </div>
      </div>;
    })}
    {/* A01-09 · el pie cierra el menú: el usuario y, debajo, la firma
        discreta de CondoTrack (el símbolo, no el logo entero de arriba) */}
    <footer className="ad-menu-pie">
      <div className="ad-menu-yo"><span className="ct-avatar grande" aria-hidden="true">{ADMINISTRACION.iniciales}</span><div><b>{ADMINISTRACION.nombre}</b><small>{ADMINISTRACION.estudio}</small></div></div>
      <p className="ad-menu-firma"><img src="/brand/CT_FAVICON.svg" alt="" aria-hidden="true" width={16} height={16} />CondoTrack · Administración</p>
    </footer>
  </nav>;
}

/** Cabecera de pantalla de Administración: afuera de las superficies,
 *  con el camino de vuelta cuando se llegó desde otra pantalla. */
export function AdminPagina({ titulo, descripcion, eyebrow, acciones, children, clase = "", volver = true }: {
  titulo: ReactNode; descripcion?: ReactNode; eyebrow?: string; acciones?: ReactNode; children: ReactNode; clase?: string; volver?: boolean;
}) {
  const nav = useNavegacion();
  const previa = nav?.anterior?.v as VistaA | undefined;
  return <div className={`ad-pagina ${clase}`}>
    <header className="ct-cabecera">
      <div>
        {volver && nav?.hayVuelta && previa && ROTULO_CORTO_A[previa] && <button type="button" className="ct-volver" onClick={nav.volver}><Icon n="volver" s={16} />Volver a {ROTULO_CORTO_A[previa]}</button>}
        <span className="ct-eyebrow">{eyebrow ?? `Administración · ${EDIFICIO.nombre}`}</span>
        <h1 className="ct-h1">{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="ct-cabecera-acciones">{acciones}</div>}
    </header>
    {children}
  </div>;
}
