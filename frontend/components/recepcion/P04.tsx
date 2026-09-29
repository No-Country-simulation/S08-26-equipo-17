"use client";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { Linea, type Hito } from "../ui/Linea";
import { RECEPCION, type Visita, type VistaP } from "@/lib/data";
import { unidadPorCodigo } from "@/lib/edificio";
import { soloHora } from "@/lib/formato";
import { diaEnPalabras } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** P04 · Validar acceso.
 *
 *  DECISIÓN DE PRODUCTO, no un detalle de implementación: validar un pase y
 *  registrar un ingreso son DOS acciones distintas. Recepción primero
 *  verifica que la autorización esté vigente, ve el resultado, y recién
 *  después registra la entrada con un segundo toque. Las dos quedan en el
 *  historial de la unidad, con hora y responsable. No se unifican. */

/* El resultado guarda el id, no la visita: si guardara el objeto, después
   de registrar el ingreso seguiría mostrando la foto vieja del pase y el
   historial no reflejaría lo que acaba de pasar. */
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
  vigente: "Autorización vigente",
  programada: "Autorización para otro día",
  vencida: "Autorización ya usada o vencida",
  "de-baja": "Autorización dada de baja",
  "no-existe": "No encontramos ese pase",
};

export function P04({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  const { estado, hacer } = useApp();
  const [codigo, setCodigo] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);
  const [registrado, setRegistrado] = useState<"ingreso" | "egreso" | null>(null);

  /* Si venimos del escáner con un código, se valida solo. Escanear no
     registra nada: sólo completa el paso 1. */
  useEffect(() => {
    if (refe) {
      setCodigo(refe);
      setRes(evaluar(refe, estado.visitas));
    }
    // sólo al entrar con un código del escáner
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refe]);

  const v = res && "id" in res ? estado.visitas.find((x) => x.id === res.id) ?? null : null;
  const unidad = v ? unidadPorCodigo(v.unidad) : undefined;
  const adentro = Boolean(v?.ingresoEl && !v?.egresoEl);
  const puedeIngresar = res?.tipo === "vigente" && !adentro && !v?.egresoEl;
  const puedeEgresar = adentro;

  function validar() {
    if (!codigo.trim()) return;
    const r = evaluar(codigo, estado.visitas);
    setRes(r);
    setRegistrado(null);
    if ("id" in r && (r.tipo === "vigente" || r.tipo === "programada")) {
      hacer({ t: "acceso/validar", id: r.id, por: RECEPCION.nombre });
    }
  }

  function limpiar() { setCodigo(""); setRes(null); setRegistrado(null); }

  const hitos: Hito[] = v
    ? ([
        v.egresoEl && { id: "e", cuando: v.egresoEl, icono: "salir" as const,
          titulo: "Egreso registrado", autor: v.egresoPor ?? RECEPCION.nombre, rol: "Recepción" },
        v.ingresoEl && { id: "i", cuando: v.ingresoEl, icono: "check" as const,
          titulo: "Ingreso registrado", autor: v.ingresoPor ?? RECEPCION.nombre, rol: "Recepción" },
        v.validadaEl && { id: "v", cuando: v.validadaEl, icono: "qr" as const,
          titulo: "Pase validado", autor: v.validadaPor ?? RECEPCION.nombre, rol: "Recepción" },
        { id: "c", cuando: v.creadaEl, icono: "personaMas" as const,
          titulo: "Autorización creada", autor: v.creadaPor, rol: "Residente" },
      ].filter(Boolean) as Hito[])
    : [];
  if (hitos.length) hitos[0].destacado = true;

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Validar acceso</h1>
          <p>Primero verificás el pase. Registrar la entrada es el segundo paso.</p>
        </div>
        <div className="der">
          <button className="btn-desk" type="button" onClick={() => ir("p03")}>
            <Icon n="qr" s={16} w={1.9} />Escanear
          </button>
        </div>
      </div>

      <div className="validar">
        {/* paso 1 */}
        <section className="panel-v on">
          <span className="paso-t"><span className="n">1</span>Verificar la autorización</span>
          <h2>Código del pase</h2>
          <p>Pedí el pase al visitante o escaneá el QR. Verificar no registra el ingreso.</p>

          <div className="buscador" style={{ marginTop: 16 }}>
            <span className="gl"><Icon n="credencial" s={19} w={1.9} /></span>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") validar(); }}
              placeholder="CT 7D 4821" aria-label="Código del pase" autoComplete="off" />
            {codigo && (
              <button className="limpiar" type="button" onClick={limpiar} aria-label="Borrar el código">
                <Icon n="mas" s={15} w={2.4} />
              </button>
            )}
          </div>

          <div className="teclado">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button key={n} type="button" onClick={() => setCodigo(codigo + n)}>{n}</button>
            ))}
            <button className="aux" type="button" onClick={() => setCodigo(codigo + " ")}>espacio</button>
            <button type="button" onClick={() => setCodigo(codigo + "0")}>0</button>
            <button className="aux" type="button" onClick={() => setCodigo(codigo.slice(0, -1))}>borrar</button>
          </div>

          <button className="entrar" type="button" onClick={validar} disabled={!codigo.trim()}
            style={{ marginTop: 16 }}>
            Verificar el pase
          </button>

          {res && (
            <div className={"resultado" + (res.tipo === "vigente" || res.tipo === "programada" ? " ok" : " mal")}
              role="status" aria-live="polite">
              <div className="enc">
                <span className="gl">
                  <Icon n={res.tipo === "vigente" ? "check" : res.tipo === "programada" ? "reloj" : "alerta"}
                    s={20} w={2.2} />
                </span>
                <div>
                  <h3>{TITULO[res.tipo]}</h3>
                  <p className="quien">
                    {v ? `${v.nombre} · Unidad ${v.unidad}` : `Código ${codigo.trim()}`}
                  </p>
                </div>
              </div>

              {v && (
                <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: "var(--txt2)" }}>
                  {diaEnPalabras(new Date(v.fecha))} · {v.horario}
                  {unidad && ` · ${unidad.residentes[0]}`}
                  {unidad?.telefono && ` · ${unidad.telefono}`}
                  {v.nota && ` · Nota: ${v.nota}`}
                </p>
              )}
              {res.tipo === "no-existe" && (
                <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: "var(--error)" }}>
                  Revisá el código con el visitante. Si insiste, buscá la unidad y llamá al residente
                  antes de dejarlo pasar.
                </p>
              )}
              {res.tipo === "de-baja" && (
                <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: "var(--error)" }}>
                  El residente dio de baja este pase. No corresponde registrar el ingreso: llamalo antes.
                </p>
              )}
            </div>
          )}
        </section>

        {/* paso 2 */}
        <section className={"panel-v" + (res ? " on" : " apagado")}>
          <span className="paso-t"><span className="n">2</span>Registrar el movimiento</span>
          <h2>{puedeEgresar ? "Registrar la salida" : "Registrar el ingreso"}</h2>
          <p>
            Es una acción aparte a propósito: verificar dice si el pase sirve, registrar
            dice que la persona entró o salió. Las dos quedan en el historial de la unidad
            con tu nombre y la hora.
          </p>

          {!res && <p className="mensaje-vacio">Verificá un pase para habilitar este paso.</p>}

          {registrado && (
            <div className="resultado ok" role="status" aria-live="polite" style={{ marginTop: 16 }}>
              <div className="enc">
                <span className="gl"><Icon n="check" s={20} w={2.4} /></span>
                <div>
                  <h3>{registrado === "ingreso" ? "Ingreso registrado" : "Salida registrada"}</h3>
                  <p className="quien">{v?.nombre} · {soloHora(new Date().toISOString())} · {RECEPCION.nombre}</p>
                </div>
              </div>
            </div>
          )}

          {res && !registrado && (
            <>
              {puedeIngresar && (
                <button className="entrar" type="button" style={{ marginTop: 18 }}
                  onClick={() => { hacer({ t: "acceso/ingreso", id: v!.id, por: RECEPCION.nombre }); setRegistrado("ingreso"); }}>
                  Registrar el ingreso de {v!.nombre}
                </button>
              )}
              {puedeEgresar && (
                <button className="entrar" type="button" style={{ marginTop: 18 }}
                  onClick={() => { hacer({ t: "acceso/egreso", id: v!.id, por: RECEPCION.nombre }); setRegistrado("egreso"); }}>
                  Registrar la salida de {v!.nombre}
                </button>
              )}
              {!puedeIngresar && !puedeEgresar && (
                <p className="mensaje-vacio">
                  {res.tipo === "programada"
                    ? "El pase es para otro día. Si el residente lo confirma por teléfono, autorizá una visita nueva desde la unidad."
                    : res.tipo === "no-existe"
                      ? "Sin autorización no hay ingreso para registrar."
                      : "Este pase ya se usó o está dado de baja."}
                </p>
              )}
            </>
          )}

          {v && (
            <>
              <h2 style={{ marginTop: 24, fontSize: 15 }}>Historial de este pase</h2>
              <Linea hitos={hitos} />
              <button className="btn-desk" type="button" style={{ marginTop: 16 }}
                onClick={() => ir("p02", v.unidad)}>
                <Icon n="personas" s={16} w={1.9} />Ver la unidad {v.unidad}
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
