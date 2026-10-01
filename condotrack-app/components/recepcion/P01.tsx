"use client";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { ReceptionClock } from "./ReceptionClock";
import { ContextualActions, type AccionRiel } from "./ContextualActions";
import { FolderGlassCard } from "../sistema/FolderGlassCard";
import { StatusTag, Severidad } from "../sistema/Estado";
import { type VistaP } from "@/lib/data";
import { AGENDA, ROTULO_AGENDA, ROTULO_GRAVEDAD } from "@/lib/edificio";
import { soloHora, hace } from "@/lib/formato";
import { useApp } from "@/lib/estado";
import { accesosPrevistos, actividadDelDia, agendaOperativa, mismoDiaOperativo } from "@/lib/recepcion";

const dos = (n: number) => n.toString().padStart(2, "0");

/** P01 · Home de Recepción. Referencia primaria: U02 Volvo.
 *
 *  USER GOAL: saber qué viene y actuar rápido en el mostrador.
 *  Arriba, la superficie de mando: reloj y dos rieles simétricos que abren
 *  su carpeta contextual (izquierda = lo que pasa hoy, derecha = lo que se
 *  hace). Abajo, tres módulos que ganan su tamaño con información: accesos
 *  segmentados por estado real, la actividad con sus últimos movimientos y
 *  las entregas por estado. */
export function P01({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const { estado } = useApp();
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const hoy = (iso?: string) => Boolean(iso) && mismoDiaOperativo(iso!, ahora);
  const accesos = accesosPrevistos(estado, ahora);
  const proximo = accesos.find(a => new Date(a.cuando) >= ahora) ?? accesos[0];
  const esperados = estado.visitas.filter(v => !v.ingresoEl && v.estado !== "cancelada" && v.estado !== "finalizada" && hoy(v.fecha));
  const dentro = estado.visitas.filter(v => v.ingresoEl && !v.egresoEl);
  const salieron = estado.visitas.filter(v => hoy(v.egresoEl));
  const pendientes = estado.entregas.filter(e => e.estado === "retirar").sort((a, b) => b.recibidoEl.localeCompare(a.recibidoEl));
  const avisadas = pendientes.filter(e => e.avisadoEl);
  const incidencias = estado.incidencias.filter(i => i.estado !== "cerrada");
  const altas = incidencias.filter(i => i.gravedad === "alta");
  const actividad = actividadDelDia(estado, ahora);
  const agendaHoy = agendaOperativa(estado).filter(a => hoy(a.hora));
  const proximosAgenda = agendaHoy.filter(a => new Date(a.hora) >= ahora).slice(0, 3);
  /* v05 · si hoy ya no queda nada, "Lo que sigue" muestra lo de mañana */
  const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 12);
  const sigueManana = proximosAgenda.length ? [] : agendaOperativa(estado).filter(a => mismoDiaOperativo(a.hora, manana)).slice(0, 3);
  const sigue = proximosAgenda.length ? proximosAgenda : sigueManana;
  const proveedoresHoy = estado.visitas.filter(v => v.tipo === "proveedor" && v.estado !== "cancelada" && hoy(v.fecha)).length
    + AGENDA.filter(a => a.tipo === "proveedor" && hoy(a.hora)).length;
  const reservasHoy = estado.reservas.filter(r => r.estado !== "cancelada" && hoy(r.inicio)).length;

  const izquierda: AccionRiel[] = [
    { id: "agenda", nombre: "Agenda de hoy", icono: "calendario", pestana: `${dos(agendaHoy.length)} eventos`, cta: "Ver agenda", onCta: () => ir("p08"),
      contenido: proximosAgenda.length ? <ol className="rx-mini-lista rx-mini-agenda">{proximosAgenda.map((e, n) => <li key={e.id} data-primero={n === 0 || undefined}><time>{soloHora(e.hora)}</time><span><b>{e.titulo}</b><small><span className="rx-mini-tipo">{ROTULO_AGENDA[e.tipo]}</span>{e.unidad ? `Unidad ${e.unidad}` : ""}</small></span></li>)}</ol>
        : <p>No quedan eventos para hoy.</p> },
    { id: "resumen", nombre: "Resumen de hoy", icono: "reloj", pestana: "Jornada", cta: "Ver actividad", onCta: () => ir("p09"),
      contenido: <dl className="rx-mini-cifras">{([["Visitas", esperados.length + dentro.length + salieron.length, "persona"], ["Proveedores", proveedoresHoy, "herramienta"], ["Entregas", pendientes.length, "caja"], ["Reservas", reservasHoy, "calendario"], ["Incidencias", incidencias.length, "alerta"]] as const).map(([k, v, ic]) => <div key={k}><dt><Icon n={ic} s={16} />{k}</dt><dd className="ct-cifra">{dos(v)}</dd></div>)}</dl> },
    { id: "incidencias", nombre: "Ver incidencias", icono: "lista", pestana: `${dos(incidencias.length)} abiertas`, cta: "Ver incidencias", onCta: () => ir("p07"),
      contenido: incidencias.length ? <ul className="rx-mini-lista rx-mini-inc">{incidencias.slice(0, 3).map(i => <li key={i.id} data-g={i.gravedad}><span className="rx-mini-sev" aria-hidden="true"><Icon n="alerta" s={16} /></span><span><b>{i.titulo}</b><small><Severidad g={i.gravedad}>{ROTULO_GRAVEDAD[i.gravedad]}</Severidad>{i.lugar}</small></span></li>)}</ul>
        : <p>No hay incidencias abiertas.</p> },
  ];
  const derecha: AccionRiel[] = [
    { id: "escanear", nombre: "Escanear acceso", icono: "qr", pestana: "Acceso", principal: true, cta: "Abrir escáner", onCta: () => ir("p03"),
      secundaria: { label: "Cargar el código a mano", onClick: () => ir("p04") },
      contenido: <><p>Leé el QR del visitante. Verificar no registra el ingreso: eso es el paso siguiente.</p>
        {proximo && <p className="rx-mini-dato"><time>{soloHora(proximo.cuando)}</time> Próximo · {proximo.nombre}</p>}</> },
    { id: "entrega", nombre: "Registrar entrega", icono: "caja", pestana: "Entrega", cta: "Registrar entrega", onCta: () => ir("p05", "registrar"),
      contenido: <><p>Unidad, remitente y foto. Al registrarla, la unidad recibe el aviso.</p><p className="rx-mini-dato"><b>{dos(pendientes.length)}</b> sin retirar en recepción</p></> },
    { id: "incidencia", nombre: "Reportar incidencia", icono: "mas", pestana: "Alta", cta: "Reportar incidencia", onCta: () => ir("p07", "nueva"),
      contenido: <><p>Qué pasó, dónde y con qué gravedad. Queda a tu nombre.</p><p className="rx-mini-dato"><b>{dos(incidencias.length)}</b> abiertas{altas.length ? ` · ${altas.length} de gravedad alta` : ""}</p></> },
  ];

  return <div className="rx-home">
    <section className="rx-mando" aria-label="Centro de recepción">
      <ContextualActions lado="left" acciones={izquierda} etiqueta="Lo que pasa hoy" />
      <div className="rx-mando-centro">
        <div className="rx-mando-izq">
          <span className="ct-eyebrow">Centro operativo</span>
          <h1 className="rx-mando-titulo">Recepción</h1>
          <div className="rx-mando-reloj"><ReceptionClock ahora={ahora} /></div>
          <p className="rx-mando-frase">Accesos, entregas e incidencias en un solo flujo.</p>
        </div>
        {/* v05 · el sector que quedaba en blanco: lo que sigue en la agenda
            de hoy (cada evento abre su detalle). No repite los rieles. */}
        <aside className="rx-sigue" aria-labelledby="rx-sigue-h">
          <header><h2 id="rx-sigue-h">Lo que sigue{!proximosAgenda.length && sigue.length > 0 && <small> · mañana</small>}</h2>
            <button type="button" className="rx-sigue-ver" onClick={() => ir("p08")}>Ver agenda<Icon n="flechaDer" s={15} /></button></header>
          {sigue.length ? <ol>{sigue.map((a, n) => <li key={a.id}>
            <button type="button" onClick={() => ir("p08", a.id)} data-primero={n === 0 || undefined}
              aria-label={`${soloHora(a.hora)}, ${a.titulo}, ${ROTULO_AGENDA[a.tipo]}. Ver en la agenda`}>
              <time>{soloHora(a.hora)}</time>
              <span><b>{a.titulo}</b><small>{ROTULO_AGENDA[a.tipo]}{a.unidad ? ` · Unidad ${a.unidad}` : ""}</small></span>
              <Icon n="chevron" s={15} />
            </button></li>)}</ol>
            : <p className="rx-sigue-vacio"><Icon n="check" s={16} />Todo en orden: no hay nada agendado.</p>}
        </aside>
      </div>
      <ContextualActions lado="right" acciones={derecha} etiqueta="Acciones rápidas" />
    </section>

    <div className="rx-modulos ct-escalonar">
      {/* REC-005 · la solapa no repite "Accesos": el encabezado del módulo
          ("Accesos de hoy") es el único título. La silueta de carpeta queda. */}
      <FolderGlassCard className="rx-modulo" material="denso" aria-labelledby="rx-mod-accesos">
        <header><div className="rx-mod-tit"><h2 id="rx-mod-accesos" className="ct-h2">Accesos de hoy</h2><p className="rx-mod-sub"><b className="ct-cifra">{dos(esperados.length + dentro.length + salieron.length)}</b> en el día</p></div><button type="button" className="ct-icono-btn" aria-label="Ver accesos" onClick={() => ir("p04")}><Icon n="flechaDiag" s={18} /></button></header>
        <dl className="rx-segmentos">
          <div><dt>Esperados</dt><dd className="ct-cifra">{dos(esperados.length)}</dd></div>
          <div><dt>Dentro</dt><dd className="ct-cifra">{dos(dentro.length)}</dd></div>
          <div><dt>Salieron</dt><dd className="ct-cifra">{dos(salieron.length)}</dd></div>
        </dl>
        {proximo ? <button type="button" className="rx-proximo" onClick={() => ir(proximo.destino.vista, proximo.destino.ref)}>
          <time className="ct-cifra">{soloHora(proximo.cuando)}<small>{hoy(proximo.cuando) ? "Hoy" : new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(new Date(proximo.cuando))}</small></time>
          <span><span className="ct-label">Próximo</span><b>{proximo.nombre}</b><small>{proximo.contexto}</small></span>
          <StatusTag tono={proximo.estado === "Autorizado" || proximo.estado === "Aprobada" ? "ok" : "pendiente"}>{proximo.estado}</StatusTag>
        </button> : <p className="rx-vacio">Sin accesos previstos.</p>}
        <button type="button" className="rx-ver" onClick={() => ir("p04")}>Ver accesos<Icon n="flechaDer" s={18} /></button>
      </FolderGlassCard>

      <FolderGlassCard className="rx-modulo" material="denso" aria-labelledby="rx-mod-actividad" id="rec-bitacora" tabIndex={-1}>
        <header><div className="rx-mod-tit"><h2 id="rx-mod-actividad" className="ct-h2">Movimientos de hoy</h2><p className="rx-mod-sub"><b className="ct-cifra">{dos(actividad.length)}</b> {actividad.length === 1 ? "registrado" : "registrados"}</p></div><button type="button" className="ct-icono-btn" aria-label="Ver actividad" onClick={() => ir("p09")}><Icon n="flechaDiag" s={18} /></button></header>
        {actividad.length ? <ol className="rx-eventos">{actividad.slice(0, 3).map(m => <li key={m.id}>
          <time>{soloHora(m.cuando)}</time><span className="rx-evento-icono" aria-hidden="true"><Icon n={m.icono} s={16} /></span>
          <span><b>{m.titulo}</b><small>{m.contexto} · {m.actor}</small></span>
        </li>)}</ol> : <p className="rx-vacio">Sin actividad registrada hoy.</p>}
        <button type="button" className="rx-ver" onClick={() => ir("p09")}>Ver actividad<Icon n="flechaDer" s={18} /></button>
      </FolderGlassCard>

      <FolderGlassCard className="rx-modulo" material="denso" aria-labelledby="rx-mod-entregas">
        <header><div className="rx-mod-tit"><h2 id="rx-mod-entregas" className="ct-h2">Entregas</h2><p className="rx-mod-sub"><b className="ct-cifra">{dos(pendientes.length)}</b> sin retirar</p></div><button type="button" className="ct-icono-btn" aria-label="Ver entregas" onClick={() => ir("p05")}><Icon n="flechaDiag" s={18} /></button></header>
        <dl className="rx-segmentos dos">
          <div><dt>Recibido</dt><dd className="ct-cifra">{dos(pendientes.length - avisadas.length)}</dd></div>
          <div><dt>Avisado</dt><dd className="ct-cifra">{dos(avisadas.length)}</dd></div>
        </dl>
        {pendientes.length ? <ul className="rx-entregas">{pendientes.slice(0, 2).map(e => <li key={e.id}>
          <span className="rx-evento-icono" aria-hidden="true"><Icon n="caja" s={16} /></span>
          <span><b>{e.remitente}</b><small>Unidad {e.unidad} · {hace(e.recibidoEl)}</small></span>
          <StatusTag tono={e.avisadoEl ? "ok" : "pendiente"}>{e.avisadoEl ? "Avisado" : "Recibido"}</StatusTag>
        </li>)}</ul> : <p className="rx-vacio">No queda nada guardado en recepción.</p>}
        <button type="button" className="rx-ver" onClick={() => ir("p05")}>Ver entregas<Icon n="flechaDer" s={18} /></button>
      </FolderGlassCard>
    </div>

    <footer className="rx-home-pie"><nav aria-label="Accesos operativos">{([["Accesos", "p04"], ["Entregas", "p05"], ["Agenda", "p08"], ["Incidencias", "p07"], ["Actividad", "p09"]] as const).map(([label, v]) => <button type="button" key={label} onClick={() => ir(v)}>{label}<Icon n="flechaDiag" s={14} /></button>)}</nav><p>Conectando personas.<br />Mejores comunidades.</p></footer>
  </div>;
}
