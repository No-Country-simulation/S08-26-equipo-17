"use client";
import { avisar } from "../sistema/Tostada";
import { useEffect, useRef, useState } from "react";
import { ReceptionPage } from "./ReceptionPage";
import { Icon, type NombreIcono } from "../ui/Icon";
import { Linea, type Hito } from "../ui/Linea";
import { RECEPCION, ROTULO_TIPO_VISITA, type Visita, type VistaP } from "@/lib/data";
import { unidadPorCodigo } from "@/lib/edificio";
import { soloHora } from "@/lib/formato";
import { diaEnPalabras } from "@/lib/reservas";
import { mismoDiaOperativo } from "@/lib/recepcion";
import { useApp } from "@/lib/estado";
import { sinMovimiento } from "@/lib/movimiento";

/** P04 · Validar acceso. Referencia primaria: U06 Security Dashboard.
 *
 *  USER GOAL: saber si esta persona puede pasar y dejarlo registrado.
 *  Validar y registrar el ingreso son DOS acciones (decisión de producto):
 *  VERIFICAR → IDENTIDAD + ESTADO → REGISTRAR. El registro no existe antes
 *  de una verificación válida y editar el código la invalida.
 *
 *  De U06: un resumen compacto arriba (no tres tarjetas para tres números) y
 *  el resultado como una barra de estados posibles donde el que ocurrió se
 *  llena. El estado se lee por posición y nombre antes que por color. */

type Resultado =
  | { tipo: "vigente" | "programada" | "vencida" | "de-baja"; id: string }
  | { tipo: "no-existe"; codigo: string };

function evaluar(codigo: string, visitas: Visita[]): Resultado {
  const limpio = codigo.replace(/\s+/g, "").toUpperCase();
  const v = visitas.find((x) => x.codigo.replace(/\s+/g, "").toUpperCase() === limpio);
  if (!v) return { tipo: "no-existe", codigo };
  if (v.estado === "cancelada") return { tipo: "de-baja", id: v.id };
  if (v.estado === "finalizada") return { tipo: "vencida", id: v.id };
  if (v.estado === "vigente") return { tipo: "vigente", id: v.id };
  return { tipo: "programada", id: v.id };
}

const TITULO: Record<Resultado["tipo"], string> = {
  vigente: "AUTORIZADO", programada: "PROGRAMADO", vencida: "VENCIDO", "de-baja": "ANULADO", "no-existe": "NO ENCONTRADO",
};

function segmentos(res: Resultado | null) {
  const medio = res && (res.tipo === "programada" || res.tipo === "de-baja") ? TITULO[res.tipo] : "VENCIDO";
  return [
    { id: "ok", rotulo: "AUTORIZADO", icono: "check" as NombreIcono, activo: res?.tipo === "vigente", tono: "ok" },
    { id: "no-vigente", rotulo: medio, icono: (res?.tipo === "programada" ? "reloj" : "alerta") as NombreIcono,
      activo: res?.tipo === "vencida" || res?.tipo === "programada" || res?.tipo === "de-baja", tono: res?.tipo === "programada" ? "neutro" : "error" },
    { id: "no-existe", rotulo: "NO ENCONTRADO", icono: "alerta" as NombreIcono, activo: res?.tipo === "no-existe", tono: "error" },
  ];
}

export function P04({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  const { estado, hacer } = useApp();
  const [codigo, setCodigo] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [registrado, setRegistrado] = useState<"ingreso" | "egreso" | null>(null);
  const [ahora, setAhora] = useState(() => new Date());
  const reloj = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => { const id = window.setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => () => clearTimeout(reloj.current), []);

  /* Con un código (escáner, agenda, búsqueda) se verifica solo. Verificar no
     registra nada. */
  useEffect(() => {
    if (refe) { setCodigo(refe); verificar(refe); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refe]);

  const v = res && "id" in res ? estado.visitas.find((x) => x.id === res.id) ?? null : null;
  const unidad = v ? unidadPorCodigo(v.unidad) : undefined;
  const adentro = Boolean(v?.ingresoEl && !v?.egresoEl);
  const puedeIngresar = res?.tipo === "vigente" && !adentro && !v?.egresoEl;
  const puedeEgresar = adentro;

  const esperados = estado.visitas
    .filter((x) => mismoDiaOperativo(x.fecha, ahora) && (x.estado === "vigente" || x.estado === "programada") && !x.ingresoEl)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const dentro = estado.visitas.filter((x) => x.ingresoEl && !x.egresoEl);
  const validados = estado.visitas
    .filter((x) => x.validadaEl && mismoDiaOperativo(x.validadaEl, ahora))
    .sort((a, b) => (b.validadaEl ?? "").localeCompare(a.validadaEl ?? ""));

  /* Verificar: un estado de consulta corto (lo que tarda un servidor real) y
     después el resultado. Sin movimiento, el resultado es inmediato. */
  function verificar(valor = codigo) {
    if (!valor.trim()) return;
    clearTimeout(reloj.current);
    setRegistrado(null);
    const resolver = () => {
      const r = evaluar(valor, estado.visitas);
      setRes(r); setVerificando(false);
      if ("id" in r && (r.tipo === "vigente" || r.tipo === "programada")) hacer({ t: "acceso/validar", id: r.id, por: RECEPCION.nombre });
    };
    if (sinMovimiento()) { resolver(); return; }
    setRes(null); setVerificando(true);
    reloj.current = setTimeout(resolver, 360);
  }
  function editarCodigo(valor: string) { clearTimeout(reloj.current); setVerificando(false); setCodigo(valor); setRes(null); setRegistrado(null); }

  const hitos: Hito[] = v
    ? ([
        v.egresoEl && { id: "e", cuando: v.egresoEl, icono: "salir" as const, titulo: "Egreso registrado", autor: v.egresoPor ?? RECEPCION.nombre, rol: "Recepción" },
        v.ingresoEl && { id: "i", cuando: v.ingresoEl, icono: "check" as const, titulo: "Ingreso registrado", autor: v.ingresoPor ?? RECEPCION.nombre, rol: "Recepción" },
        v.validadaEl && { id: "v", cuando: v.validadaEl, icono: "qr" as const, titulo: "Pase validado", autor: v.validadaPor ?? RECEPCION.nombre, rol: "Recepción" },
        { id: "c", cuando: v.creadaEl, icono: "personaMas" as const, titulo: "Autorización creada", autor: v.creadaPor, rol: "Residente" },
      ].filter(Boolean) as Hito[])
    : [];
  if (hitos.length) hitos[0].destacado = true;

  const recuperacion = !res ? null
    : res.tipo === "no-existe" ? "Revisá el código con el visitante. Si insiste, buscá la unidad y llamá al residente antes de dejarlo pasar."
    : res.tipo === "de-baja" ? "El residente dio de baja este pase. No corresponde registrar el ingreso: llamalo antes."
    : res.tipo === "programada" ? "El pase es para otro día. Si el residente lo confirma, tiene que autorizar una visita para hoy."
    : res.tipo === "vencida" && !puedeEgresar ? "El pase ya se usó o venció. Para volver a entrar hace falta una autorización nueva."
    : null;
  const claveRes = res ? res.tipo + ("id" in res ? res.id : res.codigo) : "vacio";

  return (
    <ReceptionPage titulo="Validar acceso" descripcion="Primero verificás el pase. Registrar la entrada es el segundo paso." icono="credencial" clase="acc"
      acciones={<button className="ct-btn ct-btn--secundario" type="button" onClick={() => ir("p03")}><Icon n="qr" s={18} />Escanear QR</button>}>
      <dl className="acc-resumen" aria-label="Resumen del mostrador">
        <div><dt>Esperados hoy</dt><dd><b className="ct-cifra">{String(esperados.length).padStart(2, "0")}</b><small>{esperados[0] ? `Próximo ${soloHora(esperados[0].fecha)} · ${esperados[0].nombre}` : "Nadie más por hoy"}</small></dd></div>
        <div><dt>Dentro ahora</dt><dd><b className="ct-cifra">{String(dentro.length).padStart(2, "0")}</b><small>{dentro.length ? dentro.map((x) => x.nombre).join(", ") : "Nadie adentro con pase"}</small></dd></div>
        <div><dt>Validados hoy</dt><dd><b className="ct-cifra">{String(validados.length).padStart(2, "0")}</b><small>{validados[0] ? `Último ${soloHora(validados[0].validadaEl!)} · ${validados[0].nombre}` : "Sin validaciones"}</small></dd></div>
      </dl>

      <div className="acc-validar">
        <section className="acc-codigo" aria-labelledby="acc-codigo-t">
          <p className="acc-paso"><b>1</b>Verificar</p>
          <h2 id="acc-codigo-t" className="ct-h2">Código del pase</h2>
          <div className="acc-campo">
            <Icon n="credencial" s={22} />
            <input value={codigo} onChange={(e) => editarCodigo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") verificar(); }}
              placeholder="CT 7D 4821" aria-label="Código del pase" autoComplete="off" spellCheck={false} />
            {codigo && <button type="button" className="ct-icono-btn" onClick={() => editarCodigo("")} aria-label="Borrar el código"><Icon n="cerrar" s={18} /></button>}
          </div>
          <div className="acc-teclado">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => <button key={n} type="button" onClick={() => editarCodigo(codigo + n)}>{n}</button>)}
            <button className="aux" type="button" onClick={() => editarCodigo(codigo + " ")}>espacio</button>
            <button type="button" onClick={() => editarCodigo(codigo + "0")}>0</button>
            <button className="aux" type="button" onClick={() => editarCodigo(codigo.slice(0, -1))}>borrar</button>
          </div>
          <button className="ct-btn ct-btn--fuerte ct-btn--ancho" type="button" onClick={() => verificar()} disabled={!codigo.trim() || verificando}>
            {verificando ? "Verificando…" : "Verificar el pase"}
          </button>
        </section>

        <section className="acc-resultado" aria-labelledby="acc-res-t" data-estado={verificando ? "verificando" : res ? res.tipo : "vacio"}>
          <p className="acc-paso" id="acc-res-t"><b>2</b>Identidad y estado</p>
          <div className="acc-estados" role="status" aria-live="polite" aria-label={res ? `Resultado: ${TITULO[res.tipo]}` : verificando ? "Verificando el pase" : "Sin verificar"}>
            {segmentos(res).map((s) => <span key={s.id} className="acc-seg" data-activo={s.activo} data-tono={s.tono}>
              <i aria-hidden="true">{s.activo && <Icon n={s.icono} s={16} />}</i>{s.rotulo}
            </span>)}
            {verificando && <span className="acc-barrido" aria-hidden="true" />}
          </div>

          {!res && !verificando && <div className="acc-espera"><Icon n="candado" s={24} /><p>Verificá un pase: acá aparecen la persona, su unidad y si puede pasar.</p></div>}
          {verificando && <div className="acc-espera"><p>Consultando la autorización de <b>{codigo.trim()}</b>…</p></div>}

          {res && <div key={claveRes} className="acc-ficha ct-resuelve">
            <h3 className="acc-quien">{v ? v.nombre : `Código ${codigo.trim()}`}</h3>
            <p className="acc-quien-sub">{v ? `${ROTULO_TIPO_VISITA[v.tipo]} · Unidad ${v.unidad}` : "No hay una autorización con ese código"}</p>
            {v && <dl className="acc-datos">
              <div><dt>Válido</dt><dd>{diaEnPalabras(new Date(v.fecha))} · {v.horario}</dd></div>
              {unidad && <div><dt>Autoriza</dt><dd>{unidad.residentes[0]}{unidad.telefono ? ` · ${unidad.telefono}` : ""}</dd></div>}
              <div><dt>Pase</dt><dd>{v.codigo}</dd></div>
              {v.nota && <div><dt>Nota</dt><dd>{v.nota}</dd></div>}
            </dl>}
            {recuperacion && <p className="acc-recuperar" data-tono={res.tipo === "programada" ? "neutro" : "error"}><Icon n="info" s={18} />{recuperacion}</p>}

            <p className="acc-paso acc-paso-3"><b>3</b>Registrar</p>
            {registrado ? <p className="acc-hecho ct-resuelve" role="status"><span><Icon n="check" s={18} /></span>
              <b>{registrado === "ingreso" ? "Ingreso registrado" : "Salida registrada"}</b> · {v?.nombre} · {soloHora(new Date().toISOString())} · {RECEPCION.nombre}</p>
              : puedeIngresar ? <button className="ct-btn ct-btn--primario ct-btn--ancho acc-registrar" type="button"
                  onClick={() => { hacer({ t: "acceso/ingreso", id: v!.id, por: RECEPCION.nombre }); setRegistrado("ingreso"); avisar({ titulo: "Ingreso registrado", detalle: `${v!.nombre} · unidad ${v!.unidad} · la unidad recibe el aviso`, icono: "check" }); }}>Registrar el ingreso de {v!.nombre}</button>
              : puedeEgresar ? <button className="ct-btn ct-btn--primario ct-btn--ancho acc-registrar" type="button"
                  onClick={() => { hacer({ t: "acceso/egreso", id: v!.id, por: RECEPCION.nombre }); setRegistrado("egreso"); avisar({ titulo: "Salida registrada", detalle: `${v!.nombre} · unidad ${v!.unidad}`, icono: "salir" }); }}>Registrar la salida de {v!.nombre}</button>
              : <p className="acc-bloqueado">No hay registro posible con este resultado.</p>}

            {v && <div className="acc-pie">
              <details className="acc-historial"><summary>Historial de este pase · {hitos.length}</summary><Linea hitos={hitos} /></details>
              <button className="ct-btn ct-btn--secundario ct-btn--chico" type="button" onClick={() => ir("p02", v.unidad)}><Icon n="personas" s={16} />Ver la unidad {v.unidad}</button>
            </div>}
          </div>}
        </section>
      </div>
    </ReceptionPage>
  );
}
