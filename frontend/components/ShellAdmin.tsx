"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, type NombreIcono } from "./ui/Icon";
import { Linea, type Hito } from "./ui/Linea";
import { Ficha, Dato } from "./ui/Panel";
import { Aviso } from "./ui/Estados";
import {
  EDIFICIO, ADMINISTRACION, RESIDENTE, RECEPCION,
  ESPACIOS, RECURSOS,
  type VistaA,
} from "@/lib/data";
import { type Reclamo, rotuloCategoria } from "@/lib/gestiones";
import {
  EDIFICIOS, UNIDADES, buscarUnidades, unidadPorCodigo, resolverUnitUuid,
  type Unidad, type Edificio,
} from "@/lib/edificio";
import { api, type UnitOverviewResponse } from "@/lib/api";
import { PERMISOS, ROTULO_PERMISO, historialOrdenado, ICONO_EVENTO } from "@/lib/unidad";
import { hace, pesos, fechaCorta, fechaHora } from "@/lib/formato";
import { diaEnPalabras } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** Escritorio de administración. 1440 × 900.
 *  Permite al administrador o síndico auditar la operación del edificio,
 *  acceder a la Visión 360° de cada unidad (US-09), autorizar mudanzas (US-07),
 *  gestionar tickets de mantenimiento (US-08) y consultar la auditoría inmutable (US-10). */

const DESTINOS: { id: VistaA; rotulo: string; icono: NombreIcono }[] = [
  { id: "a01", rotulo: "Panel General", icono: "casa" },
  { id: "a05", rotulo: "Visión 360°", icono: "personas" },
  { id: "a02", rotulo: "Edificios", icono: "obra" },
  { id: "a10", rotulo: "Mudanzas y Reservas", icono: "calendario" },
  { id: "a12", rotulo: "Incidentes", icono: "alerta" },
  { id: "a08", rotulo: "Auditoría", icono: "reloj" },
];

function Reloj() {
  const [h, setH] = useState<string>("");
  useEffect(() => {
    const f = () => setH(new Intl.DateTimeFormat("es-AR", {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()));
    f();
    const t = window.setInterval(f, 30000);
    return () => window.clearInterval(t);
  }, []);
  return <span className="reloj">{h}</span>;
}

export function ShellAdmin({
  vista, refe, ir, onSalir,
}: {
  vista: VistaA; refe?: string;
  ir: (v: VistaA, ref?: string) => void;
  onSalir: () => void;
}) {
  const { estado, hacer } = useApp();
  const caja = useRef<HTMLDivElement | null>(null);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string>(refe ?? "101");
  const [filtroModulo, setFiltroModulo] = useState<string>("TODOS");
  const [busquedaUnidad, setBusquedaUnidad] = useState<string>("");
  const [overviewData, setOverviewData] = useState<UnitOverviewResponse | null>(null);
  const [cargando360, setCargando360] = useState<boolean>(false);
  const [conectadoApi, setConectadoApi] = useState<boolean>(false);

  useEffect(() => { caja.current?.scrollTo(0, 0); }, [vista, refe]);
  useEffect(() => { if (refe) setUnidadSeleccionada(refe); }, [refe]);

  useEffect(() => {
    if (vista !== "a05" && vista !== "a04") return;
    let ativo = true;
    setCargando360(true);

    const unitUuid = resolverUnitUuid(unidadSeleccionada);
    api.getUnitOverview(unitUuid)
      .then((data) => {
        if (!ativo) return;
        if (data && data.unit) {
          setOverviewData(data);
          setConectadoApi(true);
        } else {
          setOverviewData(null);
          setConectadoApi(false);
        }
      })
      .catch((err) => {
        if (!ativo) return;
        console.warn("Backend 360 overview offline o error:", err);
        setOverviewData(null);
        setConectadoApi(false);
      })
      .finally(() => {
        if (ativo) setCargando360(false);
      });

    return () => {
      ativo = false;
    };
  }, [vista, unidadSeleccionada]);

  const u: Unidad | undefined = unidadPorCodigo(unidadSeleccionada) ?? UNIDADES[0];
  const unidadesFiltradas = buscarUnidades(busquedaUnidad);

  // Datos 360 de la unidad
  const visitas = estado.visitas.filter((v) => v.unidad === u?.codigo);
  const entregas = estado.entregas.filter((e) => e.unidad === u?.codigo);
  const entregasPendientes = entregas.filter((e) => e.estado === "retirar");
  const reservasUnidad = estado.reservas.filter((r) => r.unidad === u?.codigo && r.estado !== "cancelada");
  const reclamosUnidad = estado.reclamos.filter((r) => r.unidad === u?.codigo);
  const permisos = u?.codigo === RESIDENTE.unidad ? estado.permisos.filter((p) => p.activo) : [];
  const eventosUnidad = historialOrdenado(estado.eventos).filter((ev) => !ev.unidad || ev.unidad === u?.codigo);

  // Mudanzas de demostración
  const [mudanzas, setMudanzas] = useState([
    { id: "m-01", unidad: "7D", solicitante: "Felipe Osorio", tipo: "IN", fecha: "2026-10-05", turno: "Mañana (09:00 - 13:00)", estado: "PENDIENTE", montacargas: true },
    { id: "m-02", unidad: "3B", solicitante: "Nicolás Duarte", tipo: "OUT", fecha: "2026-10-08", turno: "Tarde (14:00 - 18:00)", estado: "APROBADA", montacargas: true },
    { id: "m-03", unidad: "1B", solicitante: "Hernán Costa", tipo: "IN", fecha: "2026-10-12", turno: "Mañana (09:00 - 13:00)", estado: "PENDIENTE", montacargas: false },
  ]);

  const aprobarMudanza = async (id: string) => {
    try {
      await api.approveMove(id, "Aprobado por administración");
    } catch (err) {
      console.warn("Backend move review unavailable, actualizando estado local:", err);
    }
    setMudanzas((prev) => prev.map((m) => m.id === id ? { ...m, estado: "APROBADA" } : m));
  };

  const rechazarMudanza = async (id: string) => {
    try {
      await api.rejectMove(id, "Rechazado por administración");
    } catch (err) {
      console.warn("Backend move review unavailable, actualizando estado local:", err);
    }
    setMudanzas((prev) => prev.map((m) => m.id === id ? { ...m, estado: "RECHAZADA" } : m));
  };

  useEffect(() => {
    if (vista !== "a10") return;
    let ativo = true;
    api.getMoves()
      .then((data) => {
        if (!ativo || !data || !Array.isArray(data) || data.length === 0) return;
        const mapped = data.map((m) => ({
          id: m.id,
          unidad: m.unitNumber || "101",
          solicitante: m.userName || "Residente",
          tipo: m.moveType || "IN",
          fecha: m.scheduledDate || "2026-10-15",
          turno: m.shift === "MORNING" ? "Mañana (09:00 - 13:00)" : "Tarde (14:00 - 18:00)",
          estado: m.status === "REQUESTED" ? "PENDIENTE" : m.status === "APPROVED" ? "APROBADA" : m.status === "REJECTED" ? "RECHAZADA" : m.status,
          montacargas: true,
        }));
        setMudanzas((prev) => {
          const ids = new Set(mapped.map((x) => x.id));
          return [...mapped, ...prev.filter((p) => !ids.has(p.id))];
        });
      })
      .catch((err) => {
        console.warn("Backend moves offline, usando datos locales:", err);
      });
    return () => {
      ativo = false;
    };
  }, [vista]);

  // Avanzar reclamo
  const avanzarReclamo = (recId: string) => {
    hacer({
      t: "reclamo/avanzar",
      id: recId,
      estado: "asignado",
      texto: "Técnico asignado por la Administración. Inspección programada.",
      autor: ADMINISTRACION.nombre,
    });
  };

  const resolverReclamo = (recId: string) => {
    hacer({
      t: "reclamo/avanzar",
      id: recId,
      estado: "resuelto",
      texto: "Reparación concluida satisfactoriamente.",
      autor: ADMINISTRACION.nombre,
    });
  };

  return (
    <section className="desk" aria-label="CondoTrack administración">
      <nav className="desk-rail" aria-label="Acciones de administración">
        <span className="logo" aria-hidden="true">
          <img src="/brand/CT_SYMBOL_PRIMARY_TRANSPARENT.svg" alt="" width={22} height={22} />
        </span>
        {DESTINOS.map((d) => (
          <button key={d.id} type="button" onClick={() => ir(d.id)}
            aria-current={vista === d.id ? "page" : undefined}>
            <span className="gl"><Icon n={d.icono} s={19} w={1.9} /></span>
            {d.rotulo}
          </button>
        ))}
        <span className="sep" />
        <button className="salir" type="button" onClick={onSalir}>
          <span className="gl"><Icon n="salir" s={19} w={1.9} /></span>
          Salir
        </button>
      </nav>

      <div className="desk-main">
        <header className="desk-top">
          <span className="ctx">
            <b>{EDIFICIO.nombreLargo}</b>
            <i>{ADMINISTRACION.estudio} · {ADMINISTRACION.rol}</i>
          </span>
          <Reloj />
          <span className="yo">
            <span className="av">{ADMINISTRACION.iniciales}</span>
            <span>
              <b>{ADMINISTRACION.nombre}</b>
              <i>{ADMINISTRACION.mail}</i>
            </span>
          </span>
        </header>

        <div className="desk-cuerpo" ref={caja} style={{ padding: "24px 32px" }}>

          {/* VISTA A01: PANEL GENERAL */}
          {vista === "a01" && (
            <div>
              <div className="ent-cab">
                <div>
                  <span className="id" style={{ fontSize: 24 }}>Tablero de Control del Edificio</span>
                  <p className="meta">{EDIFICIO.nombreLargo} · {EDIFICIOS[0].unidades} unidades · {EDIFICIOS[0].ocupadas} ocupadas</p>
                </div>
                <div className="der">
                  <span className="pastilla"><Icon n="check" s={13} /> Sistema en línea</span>
                </div>
              </div>

              {/* Indicadores KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
                <div className="tarjeta" style={{ padding: 18 }}>
                  <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>Ocupación</span>
                  <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>96%</div>
                  <span style={{ fontSize: 12, color: "var(--tx-ter)" }}>23 de 24 departamentos</span>
                </div>
                <div className="tarjeta" style={{ padding: 18 }}>
                  <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>Paquetes en Portería</span>
                  <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>
                    {estado.entregas.filter((e) => e.estado === "retirar").length}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--tx-ter)" }}>Aguardando retiro</span>
                </div>
                <div className="tarjeta" style={{ padding: 18 }}>
                  <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>Incidentes Abiertos</span>
                  <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>
                    {estado.reclamos.filter((r) => r.estado !== "resuelto").length}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--tx-ter)" }}>Requieren seguimiento</span>
                </div>
                <div className="tarjeta" style={{ padding: 18 }}>
                  <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>Mudanzas Pendientes</span>
                  <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>
                    {mudanzas.filter((m) => m.estado === "PENDIENTE").length}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--tx-ter)" }}>Turnos por aprobar</span>
                </div>
              </div>

              {/* Acceso Rápido a Visión 360 */}
              <div className="tarjeta" style={{ marginTop: 24, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon n="personas" s={18} /> Acceso Rápido: Visión 360° por Departamento
                  </h2>
                  <button className="btn-desk" type="button" onClick={() => ir("a05")}>
                    Ver explorador completo <Icon n="flechaDer" s={14} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {UNIDADES.slice(0, 10).map((un) => (
                    <button
                      key={un.codigo}
                      type="button"
                      onClick={() => { setUnidadSeleccionada(un.codigo); ir("a05", un.codigo); }}
                      style={{
                        padding: "8px 16px", borderRadius: 8, border: "1px solid var(--borde)",
                        background: un.codigo === "7D" ? "var(--amarillo)" : "var(--superficie)",
                        color: un.codigo === "7D" ? "#111" : "inherit",
                        fontWeight: 600, cursor: "pointer", display: "flex", gap: 6, alignItems: "center"
                      }}
                    >
                      <span>U {un.codigo}</span>
                      <small style={{ opacity: 0.7 }}>Piso {un.piso}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mantenimientos Recientes */}
              <div className="columnas" style={{ marginTop: 20 }}>
                <section className="tarjeta">
                  <h2><Icon n="alerta" s={17} /> Incidentes Operativos Prioritarios</h2>
                  <div className="cuerpo">
                    {estado.reclamos.slice(0, 3).map((rec) => (
                      <div className="fila-op" key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <b>{rotuloCategoria(rec.categoria)}</b>
                          <i>{rec.ubicacion} · {rec.codigo} · {rec.descripcion}</i>
                        </div>
                        <span className={"pastilla " + (rec.estado === "resuelto" ? "gris" : "")}>
                          {rec.estado.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="tarjeta">
                  <h2><Icon n="calendario" s={17} /> Próximas Mudanzas</h2>
                  <div className="cuerpo">
                    {mudanzas.map((m) => (
                      <div className="fila-op" key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <b>Unidad {m.unidad} — {m.tipo === "IN" ? "Ingreso" : "Egreso"}</b>
                          <i>{m.fecha} · {m.turno}</i>
                        </div>
                        <span className={"pastilla " + (m.estado === "APROBADA" ? "gris" : "")}>
                          {m.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* VISTA A05: VISIÓN 360° DE LA UNIDAD (CORE MVP US-09 / FR-18) */}
          {(vista === "a05" || vista === "a04") && u && (
            <div>
              {/* Barra de Búsqueda y Selector de Unidades */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                <input
                  type="search"
                  placeholder="Buscar departamento o morador (ej. 101, 7D, Osorio, Sofia)..."
                  value={busquedaUnidad}
                  onChange={(e) => setBusquedaUnidad(e.target.value)}
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: 8,
                    border: "1px solid var(--borde)", background: "var(--superficie)",
                    fontSize: 14, color: "inherit"
                  }}
                />
                <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>
                  {unidadesFiltradas.length} departamentos encontrados
                </span>
              </div>

              {/* Selector horizontal rápido */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
                {unidadesFiltradas.slice(0, 16).map((item) => (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => setUnidadSeleccionada(item.codigo)}
                    style={{
                      padding: "6px 14px", borderRadius: 6,
                      border: "1px solid " + (item.codigo === unidadSeleccionada ? "var(--amarillo)" : "var(--borde)"),
                      background: item.codigo === unidadSeleccionada ? "var(--amarillo)" : "var(--superficie)",
                      color: item.codigo === unidadSeleccionada ? "#111" : "inherit",
                      fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    Dpto {item.codigo}
                  </button>
                ))}
              </div>

              {/* Cabecera Dossier 360 */}
              <div className="ent-cab" style={{ background: "var(--superficie)", padding: 20, borderRadius: 12, border: "1px solid var(--borde)" }}>
                <div>
                  <span className="id" style={{ fontSize: 32 }}>
                    Unidad {overviewData ? overviewData.unit.numberCode : u.codigo}
                  </span>
                  <p className="meta" style={{ fontSize: 14, marginTop: 4 }}>
                    {overviewData ? overviewData.unit.buildingName : EDIFICIO.nombreLargo}
                    {overviewData?.unit.block ? ` · Bloque ${overviewData.unit.block}` : ""}
                    {` · Piso ${overviewData ? overviewData.unit.floor : u.piso} · ${u.ambientes} · ${u.metros} m²`}
                    {u.telefono && ` · Teléfono de contacto: ${u.telefono}`}
                  </p>
                </div>
                <div className="der" style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {/* Estado da Conexão com a API em tempo real */}
                  {cargando360 ? (
                    <span className="pastilla" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#2563eb", border: "1px solid #3b82f6", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                      <span className="giro" style={{ width: 12, height: 12, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                      Consultando API 360°…
                    </span>
                  ) : conectadoApi && overviewData ? (
                    <span className="pastilla verde" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid #10b981", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                      Conectado à API em tempo real
                    </span>
                  ) : (
                    <span className="pastilla gris" style={{ background: "rgba(156, 163, 175, 0.12)", color: "var(--tx-sec)", border: "1px solid var(--borde)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Icon n="reloj" s={13} />
                      Modo local / Respaldo offline
                    </span>
                  )}

                  <span className={"pastilla " + (u.cuenta === "al-dia" ? "gris" : "")} style={{ fontSize: 13 }}>
                    <Icon n={u.cuenta === "al-dia" ? "check" : "reloj"} s={13} />
                    {u.cuenta === "al-dia" ? "Cuenta al día" : `Saldo pendiente: ${pesos(u.saldo)}`}
                  </span>
                  <div style={{ fontSize: 11, color: "var(--tx-sec)" }}>
                    UUID: <code style={{ fontSize: 11, background: "rgba(0,0,0,0.06)", padding: "2px 5px", borderRadius: 4 }}>{resolverUnitUuid(unidadSeleccionada)}</code>
                  </div>
                </div>
              </div>

              {/* Grilla 360: Moradores, Paquetes, Visitas, Reservas, Mudanza, Reclamos, Auditoría */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20, opacity: cargando360 ? 0.7 : 1, transition: "opacity 0.2s" }}>

                {/* 1. QUIÉNES VIVEN ACÁ (MORADORES VINCULADOS) */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="personas" s={18} /> Moradores Vinculados{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.residents.length : u.residentes.length}
                    </span>
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.residents.length === 0 ? (
                        <p className="mensaje-vacio">No hay moradores vinculados a esta unidad en la API.</p>
                      ) : (
                        overviewData.residents.map((r) => {
                          const relLabel =
                            r.relationshipType === "OWNER"
                              ? "Propietario / Titular"
                              : r.relationshipType === "TENANT"
                              ? "Inquilino / Locatario"
                              : r.relationshipType === "FAMILY_MEMBER"
                              ? "Familiar / Conviviente"
                              : r.relationshipType;
                          return (
                            <div className="fila-op" key={r.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span className="av">{r.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                                <div>
                                  <b>{r.name}</b>
                                  <i>{relLabel}</i>
                                </div>
                              </div>
                              {r.phone && <span style={{ fontSize: 12, color: "var(--tx-sec)" }}>{r.phone}</span>}
                            </div>
                          );
                        })
                      )
                    ) : (
                      /* Fallback local */
                      u.residentes.map((r, i) => (
                        <div className="fila-op" key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span className="av">{r.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                            <div>
                              <b>{r}</b>
                              <i>{i === 0 ? "Titular / Propietario" : "Residente / Familiar"}</i>
                            </div>
                          </div>
                          {u.telefono && <span style={{ fontSize: 12, color: "var(--tx-sec)" }}>{u.telefono}</span>}
                        </div>
                      ))
                    )}
                    {permisos.length > 0 && !overviewData && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--borde)" }}>
                        <b style={{ fontSize: 13, color: "var(--tx-sec)" }}>Autorizaciones Permanentes:</b>
                        {permisos.map((p) => (
                          <div key={p.id} style={{ fontSize: 13, marginTop: 6 }}>
                            • {p.nombre} ({ROTULO_PERMISO[p.tipo]}) - {p.detalle}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. ENCOMIENDAS / PAQUETES PENDIENTES */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="caja" s={18} /> Paquetes y Encomiendas{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.pendingPackages.length : entregas.length}
                    </span>
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.pendingPackages.length === 0 ? (
                        <p className="mensaje-vacio">No hay paquetes pendientes de retiro para esta unidad.</p>
                      ) : (
                        overviewData.pendingPackages.map((p) => (
                          <div className="fila-op" key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{p.carrierName} · Guía {p.trackingCode}</b>
                              <i>Recibido: {p.receivedAt ? hace(p.receivedAt) : "Reciente"}</i>
                            </div>
                            <span className="pastilla">Pendiente Retiro</span>
                          </div>
                        ))
                      )
                    ) : (
                      /* Fallback local */
                      entregas.length === 0 ? (
                        <p className="mensaje-vacio">No hay paquetes registrados para esta unidad.</p>
                      ) : (
                        entregas.map((e) => (
                          <div className="fila-op" key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{e.titulo} · {e.remitente}</b>
                              <i>Recibido: {hace(e.recibidoEl)}</i>
                            </div>
                            <span className={"pastilla " + (e.estado === "retirado" ? "gris" : "")}>
                              {e.estado === "retirar" ? "Pendiente Retiro" : "Entregado"}
                            </span>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </section>

                {/* 3. ACCESOS Y VISITAS RECIENTES */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="credencial" s={18} /> Visitas y Accesos Recientes{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.recentAccesses.length : visitas.length}
                    </span>
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.recentAccesses.length === 0 ? (
                        <p className="mensaje-vacio">Sin visitas o accesos recientes registrados en la API.</p>
                      ) : (
                        overviewData.recentAccesses.map((a, idx) => (
                          <div className="fila-op" key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{a.visitorName} {a.visitorDocument ? `(Doc: ${a.visitorDocument})` : ""}</b>
                              <i>Sentido: {a.direction === "ENTRY" ? "Ingreso" : "Egreso"} · Controlado por: {a.checkedByOperator} · {a.timestamp ? hace(a.timestamp) : "Hoy"}</i>
                            </div>
                            <span className={"pastilla " + (a.direction === "ENTRY" ? "" : "gris")}>
                              {a.direction === "ENTRY" ? "Ingreso" : "Egreso"}
                            </span>
                          </div>
                        ))
                      )
                    ) : (
                      /* Fallback local */
                      visitas.length === 0 ? (
                        <p className="mensaje-vacio">Sin visitas registradas.</p>
                      ) : (
                        visitas.map((v) => (
                          <div className="fila-op" key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{v.nombre} {v.documento ? `(DNI: ${v.documento})` : ""}</b>
                              <i>Pase {v.codigo} · {v.horario} · Creado por {v.creadaPor}</i>
                            </div>
                            <span className={"pastilla " + (v.estado === "vigente" ? "" : "gris")}>
                              {v.estado === "vigente" ? "Vigente" : v.estado}
                            </span>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </section>

                {/* 4. RESERVAS DE ESPACIOS */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="calendario" s={18} /> Reservas de Espacios Comunes{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.upcomingReservations.length : reservasUnidad.length}
                    </span>
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.upcomingReservations.length === 0 ? (
                        <p className="mensaje-vacio">Sin reservas activas o futuras registradas.</p>
                      ) : (
                        overviewData.upcomingReservations.map((r, idx) => {
                          const ini = new Date(r.startTime);
                          const fin = new Date(r.endTime);
                          const horaStr = `${ini.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} a ${fin.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                          return (
                            <div className="fila-op" key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <b>{r.commonAreaName}</b>
                                <i>{diaEnPalabras(ini)} · {horaStr}</i>
                              </div>
                              <span className={"pastilla " + (r.status === "CONFIRMED" ? "" : "gris")}>
                                {r.status === "CONFIRMED" ? "Confirmada" : r.status}
                              </span>
                            </div>
                          );
                        })
                      )
                    ) : (
                      /* Fallback local */
                      reservasUnidad.length === 0 ? (
                        <p className="mensaje-vacio">Sin reservas activas.</p>
                      ) : (
                        reservasUnidad.map((r) => {
                          const rec = RECURSOS.find((x) => x.id === r.recursoId);
                          const esp = ESPACIOS.find((x) => x.id === rec?.espacioId);
                          const tituloEspacio = esp ? `${esp.nombre} (${rec?.nombre})` : r.recursoId;
                          const ini = new Date(r.inicio);
                          const fin = new Date(r.fin);
                          const horaStr = `${ini.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} a ${fin.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                          return (
                            <div className="fila-op" key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <b>{tituloEspacio}</b>
                                <i>{diaEnPalabras(ini)} · {horaStr}</i>
                              </div>
                              <span className="pastilla">{r.estado === "confirmada" ? "Confirmada" : r.estado}</span>
                            </div>
                          );
                        })
                      )
                    )}
                  </div>
                </section>

                {/* 5. MUDANZA AGENDADA */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="calendario" s={18} /> Mudanza Agendada
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.scheduledMove ? (
                        <div className="fila-op" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <b>
                              Mudanza de {overviewData.scheduledMove.moveType === "IN" ? "Ingreso (Entrada)" : "Egreso (Salida)"}
                            </b>
                            <i>
                              Fecha: {overviewData.scheduledMove.scheduledDate} · Turno: {overviewData.scheduledMove.shift === "MORNING" ? "Mañana (09:00 - 13:00)" : "Tarde (14:00 - 18:00)"}
                            </i>
                          </div>
                          <span className={"pastilla " + (overviewData.scheduledMove.status === "APPROVED" ? "verde" : "")}>
                            {overviewData.scheduledMove.status === "APPROVED" ? "Aprobada" : overviewData.scheduledMove.status === "REQUESTED" ? "Solicitada" : overviewData.scheduledMove.status}
                          </span>
                        </div>
                      ) : (
                        <p className="mensaje-vacio">No hay mudanzas programadas para esta unidad.</p>
                      )
                    ) : (
                      /* Fallback local */
                      (() => {
                        const m = mudanzas.find((item) => item.unidad === u.codigo);
                        return m ? (
                          <div className="fila-op" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>Mudanza de {m.tipo === "IN" ? "Ingreso (Entrada)" : "Egreso (Salida)"}</b>
                              <i>Fecha: {m.fecha} · Turno: {m.turno} · Solicitante: {m.solicitante}</i>
                            </div>
                            <span className={"pastilla " + (m.estado === "APROBADA" ? "verde" : "")}>
                              {m.estado}
                            </span>
                          </div>
                        ) : (
                          <p className="mensaje-vacio">No hay mudanzas programadas para esta unidad.</p>
                        );
                      })()
                    )}
                  </div>
                </section>

                {/* 6. CHAMADOS ABIERTOS / TICKETS DE MANTENIMIENTO */}
                <section className="tarjeta">
                  <h2>
                    <Icon n="alerta" s={18} /> Tickets de Mantenimiento{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.openIncidents.length : reclamosUnidad.length}
                    </span>
                  </h2>
                  <div className="cuerpo">
                    {overviewData ? (
                      overviewData.openIncidents.length === 0 ? (
                        <p className="mensaje-vacio">No hay incidentes abiertos para esta unidad en la API.</p>
                      ) : (
                        overviewData.openIncidents.map((inc) => (
                          <div className="fila-op" key={inc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{inc.title}</b>
                              <i>Prioridad: {inc.priority} · {inc.createdAt ? hace(inc.createdAt) : "Reciente"}</i>
                            </div>
                            <span className="pastilla">{inc.status}</span>
                          </div>
                        ))
                      )
                    ) : (
                      /* Fallback local */
                      reclamosUnidad.length === 0 ? (
                        <p className="mensaje-vacio">No hay incidentes reportados.</p>
                      ) : (
                        reclamosUnidad.map((rec) => (
                          <div className="fila-op" key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <b>{rotuloCategoria(rec.categoria)}</b>
                              <i>{rec.codigo} · {rec.ubicacion} · {hace(rec.creadoEl)}</i>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span className={"pastilla " + (rec.estado === "resuelto" ? "gris" : "")}>
                                {rec.estado}
                              </span>
                              {rec.estado !== "resuelto" && (
                                <button
                                  type="button"
                                  onClick={() => resolverReclamo(rec.id)}
                                  style={{
                                    padding: "4px 8px", fontSize: 11, borderRadius: 4,
                                    border: "1px solid var(--borde)", background: "var(--amarillo)",
                                    color: "#111", cursor: "pointer", fontWeight: 600
                                  }}
                                >
                                  Resolver
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </section>

                {/* 7. TIMELINE CRONOLÓGICA DE AUDITORÍA 360° */}
                <section className="tarjeta" style={{ gridColumn: "1 / -1" }}>
                  <h2>
                    <Icon n="reloj" s={18} /> Auditoría y Trazabilidad Inmutable 360°{" "}
                    <span className="cnt">
                      {overviewData ? overviewData.recentAuditTimeline.length : eventosUnidad.length}
                    </span>
                  </h2>
                  <div className="cuerpo" style={{ maxHeight: 320, overflowY: "auto" }}>
                    {overviewData ? (
                      overviewData.recentAuditTimeline.length === 0 ? (
                        <p className="mensaje-vacio">Sin eventos auditados en el timeline de la unidad.</p>
                      ) : (
                        <div className="linea-tiempo">
                          {overviewData.recentAuditTimeline.map((item, idx) => (
                            <div key={idx} style={{ padding: "8px 0", borderBottom: "1px solid var(--borde)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--tx-sec)" }}>
                                <span><b>{item.module}</b> · Acción: <code>{item.action}</code></span>
                                <span>{item.timestamp ? hace(item.timestamp) : "Reciente"} ({item.timestamp ? fechaHora(item.timestamp) : ""})</span>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3 }}>{item.description}</div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      /* Fallback local */
                      eventosUnidad.length === 0 ? (
                        <p className="mensaje-vacio">Sin eventos auditados.</p>
                      ) : (
                        <div className="linea-tiempo">
                          {eventosUnidad.map((ev) => (
                            <div key={ev.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--borde)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--tx-sec)" }}>
                                <span>{ev.responsable} ({ev.rol})</span>
                                <span>{hace(ev.cuando)}</span>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{ev.titulo}</div>
                              {ev.detalle && <div style={{ fontSize: 12, color: "var(--tx-ter)", marginTop: 2 }}>{ev.detalle}</div>}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}

          {/* VISTA A10: MUDANZAS Y RESERVAS */}
          {vista === "a10" && (
            <div>
              <div className="ent-cab">
                <div>
                  <span className="id" style={{ fontSize: 24 }}>Aprobación de Mudanzas y Turnos de Elevador</span>
                  <p className="meta">Gestión de conflictos, turnos y uso de montacargas (US-07)</p>
                </div>
              </div>

              <div className="tarjeta" style={{ marginTop: 20 }}>
                <h2><Icon n="calendario" s={18} /> Solicitudes de Mudanza</h2>
                <div className="cuerpo">
                  {mudanzas.map((m) => (
                    <div key={m.id} className="fila-op" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>
                          Unidad {m.unidad} — Mudanza de {m.tipo === "IN" ? "Ingreso (Entrada)" : "Egreso (Salida)"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--tx-sec)", marginTop: 4 }}>
                          Solicitante: <b>{m.solicitante}</b> · Fecha programada: <b>{m.fecha}</b> · Turno: <b>{m.turno}</b>
                        </div>
                        {m.montacargas && (
                          <div style={{ fontSize: 12, color: "#1976d2", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon n="check" s={13} /> Bloqueo exclusivo de ascensor de servicio
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span className={"pastilla " + (m.estado === "APROBADA" ? "gris" : "")}>
                          {m.estado}
                        </span>
                        {m.estado === "PENDIENTE" && (
                          <>
                            <button
                              type="button"
                              onClick={() => aprobarMudanza(m.id)}
                              style={{
                                padding: "6px 14px", borderRadius: 6, border: "none",
                                background: "var(--amarillo)", color: "#111", fontWeight: 600,
                                cursor: "pointer", fontSize: 13
                              }}
                            >
                              Aprobar Turno
                            </button>
                            <button
                              type="button"
                              onClick={() => rechazarMudanza(m.id)}
                              style={{
                                padding: "6px 14px", borderRadius: 6, border: "1px solid var(--borde)",
                                background: "var(--superficie)", color: "inherit", fontWeight: 600,
                                cursor: "pointer", fontSize: 13
                              }}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VISTA A12: INCIDENTES */}
          {vista === "a12" && (
            <div>
              <div className="ent-cab">
                <div>
                  <span className="id" style={{ fontSize: 24 }}>Tablero de Reclamos e Incidentes</span>
                  <p className="meta">Control de fallas, asignación de técnicos y ciclo de vida de mantenimiento (US-08)</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
                {/* Columna Abiertos */}
                <div className="tarjeta">
                  <h2><Icon n="alerta" s={16} /> Abiertos ({estado.reclamos.filter((r) => r.estado === "nuevo").length})</h2>
                  <div className="cuerpo">
                    {estado.reclamos.filter((r) => r.estado === "nuevo").map((r) => (
                      <div key={r.id} style={{ padding: 12, border: "1px solid var(--borde)", borderRadius: 8, marginBottom: 10, background: "var(--superficie)" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{rotuloCategoria(r.categoria)}</div>
                        <div style={{ fontSize: 12, color: "var(--tx-sec)", margin: "4px 0" }}>{r.ubicacion} · {r.codigo}</div>
                        <div style={{ fontSize: 13, margin: "6px 0" }}>{r.descripcion}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span className="pastilla">NUEVO</span>
                          <button
                            type="button"
                            onClick={() => avanzarReclamo(r.id)}
                            style={{
                              padding: "4px 10px", borderRadius: 6, border: "none",
                              background: "var(--amarillo)", color: "#111", fontWeight: 600, fontSize: 12, cursor: "pointer"
                            }}
                          >
                            Asignar Técnico
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna En Tratamiento */}
                <div className="tarjeta">
                  <h2><Icon n="reloj" s={16} /> En Tratamiento ({estado.reclamos.filter((r) => r.estado === "en-gestion" || r.estado === "asignado").length})</h2>
                  <div className="cuerpo">
                    {estado.reclamos.filter((r) => r.estado === "en-gestion" || r.estado === "asignado").map((r) => (
                      <div key={r.id} style={{ padding: 12, border: "1px solid var(--borde)", borderRadius: 8, marginBottom: 10, background: "var(--superficie)" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{rotuloCategoria(r.categoria)}</div>
                        <div style={{ fontSize: 12, color: "var(--tx-sec)", margin: "4px 0" }}>{r.ubicacion} · {r.codigo}</div>
                        <div style={{ fontSize: 13, margin: "6px 0" }}>{r.descripcion}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span className="pastilla gris">EN GESTIÓN</span>
                          <button
                            type="button"
                            onClick={() => resolverReclamo(r.id)}
                            style={{
                              padding: "4px 10px", borderRadius: 6, border: "none",
                              background: "var(--amarillo)", color: "#111", fontWeight: 600, fontSize: 12, cursor: "pointer"
                            }}
                          >
                            Marcar Resuelto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna Resueltos */}
                <div className="tarjeta">
                  <h2><Icon n="check" s={16} /> Resueltos ({estado.reclamos.filter((r) => r.estado === "resuelto" || r.estado === "cerrado").length})</h2>
                  <div className="cuerpo">
                    {estado.reclamos.filter((r) => r.estado === "resuelto" || r.estado === "cerrado").map((r) => (
                      <div key={r.id} style={{ padding: 12, border: "1px solid var(--borde)", borderRadius: 8, marginBottom: 10, background: "var(--superficie)" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{rotuloCategoria(r.categoria)}</div>
                        <div style={{ fontSize: 12, color: "var(--tx-sec)", margin: "4px 0" }}>{r.ubicacion} · {r.codigo}</div>
                        <div style={{ fontSize: 13, margin: "6px 0" }}>{r.descripcion}</div>
                        <span className="pastilla gris" style={{ display: "inline-block", marginTop: 8 }}>RESUELTO</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISTA A08: AUDITORÍA GLOBAL */}
          {vista === "a08" && (
            <div>
              <div className="ent-cab">
                <div>
                  <span className="id" style={{ fontSize: 24 }}>Trilha de Auditoria Geral (US-10)</span>
                  <p className="meta">Registro cronológico e imutável de eventos operacionais</p>
                </div>
                <div className="der">
                  <div style={{ display: "flex", gap: 6 }}>
                    {["TODOS", "AUTORIZACION", "ENTREGA", "RESERVA", "RECLAMO"].map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => setFiltroModulo(mod)}
                        style={{
                          padding: "6px 12px", borderRadius: 6,
                          border: "1px solid " + (filtroModulo === mod ? "var(--amarillo)" : "var(--borde)"),
                          background: filtroModulo === mod ? "var(--amarillo)" : "var(--superficie)",
                          color: filtroModulo === mod ? "#111" : "inherit",
                          fontWeight: 600, fontSize: 12, cursor: "pointer"
                        }}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tarjeta" style={{ marginTop: 20 }}>
                <h2><Icon n="reloj" s={18} /> Eventos Auditados</h2>
                <div className="cuerpo">
                  {historialOrdenado(estado.eventos)
                    .filter((ev) => filtroModulo === "TODOS" || ev.tipo.toUpperCase() === filtroModulo)
                    .map((ev) => (
                      <div key={ev.id} className="fila-op" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.titulo}</div>
                          <div style={{ fontSize: 12, color: "var(--tx-sec)", marginTop: 2 }}>
                            {ev.detalle} {ev.unidad && `· Unidad ${ev.unidad}`}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="pastilla gris">{ev.rol} · {ev.responsable}</span>
                          <div style={{ fontSize: 11, color: "var(--tx-ter)", marginTop: 4 }}>{hace(ev.cuando)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* VISTA A02: EDIFICIOS Y UNIDADES */}
          {vista === "a02" && (
            <div>
              <div className="ent-cab">
                <div>
                  <span className="id" style={{ fontSize: 24 }}>Padrón de Inmuebles y Edificios (US-02)</span>
                  <p className="meta">Gestión de cartera condominal y unidades funcionales</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
                {EDIFICIOS.map((ed) => (
                  <div key={ed.id} className="tarjeta" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="pastilla" style={{ background: ed.activo ? "var(--amarillo)" : undefined, color: ed.activo ? "#111" : undefined }}>
                        {ed.activo ? "Activo" : "Cartera"}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--tx-sec)" }}>{ed.unidades} departamentos</span>
                    </div>
                    <h3 style={{ fontSize: 18, margin: "14px 0 6px 0" }}>{ed.nombre}</h3>
                    <p style={{ fontSize: 13, color: "var(--tx-sec)", margin: 0 }}>{ed.direccion}</p>

                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--borde)", fontSize: 13 }}>
                      <div><b>Encargado:</b> {ed.encargado}</div>
                      <div style={{ marginTop: 4 }}><b>Recepción:</b> {ed.recepcion}</div>
                      <div style={{ marginTop: 4 }}><b>Ocupación:</b> {ed.ocupadas}/{ed.unidades} ({Math.round(ed.ocupadas / ed.unidades * 100)}%)</div>
                    </div>

                    <button
                      type="button"
                      className="btn-desk"
                      style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
                      onClick={() => ir("a05")}
                    >
                      Ver departamentos 360°
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
