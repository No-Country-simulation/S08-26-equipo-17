"use client";
import { avisar } from "../sistema/Tostada";
import { useEffect, useRef, useState } from "react";
import { ReceptionPage } from "./ReceptionPage";
import { Icon } from "../ui/Icon";
import { Texto, Elegir, Adjuntar, Segmentos } from "../ui/Formulario";
import { Hoja } from "../ui/Hoja";
import { Segmentado } from "../sistema/Segmentado";
import {
  RECEPCION, ROTULO_ENTREGA, type Entrega, type TipoEntrega, type VistaP,
} from "@/lib/data";
import { UNIDADES, unidadPorCodigo } from "@/lib/edificio";
import { fechaHora, hace } from "@/lib/formato";
import { nuevoIdEntrega, useApp } from "@/lib/estado";
import { sinMovimiento } from "@/lib/movimiento";

/** P05 · Entregas. Referencia primaria: U05 Management.
 *
 *  USER GOAL: registrar lo que llega y entregarlo a quien corresponde.
 *  Felipe la marcó como de lo más fuerte: se conserva la estructura (lista
 *  clara de trabajo + módulo oscuro para registrar) y el flujo. Cambia la
 *  jerarquía de botones (un solo primario por contexto: el retiro por fila
 *  es secundario), el estado se lee como progresión Recibido → Avisado →
 *  Retirado, y la fila que se entrega muestra el cambio antes de irse. */

const TIPOS: { id: TipoEntrega; rotulo: string }[] = [
  { id: "paquete", rotulo: "Paquete" },
  { id: "sobre", rotulo: "Sobre" },
  { id: "delivery", rotulo: "Delivery" },
  { id: "otro", rotulo: "Otro" },
];
const PASOS = ["Recibido", "Avisado", "Retirado"] as const;
const estadoEntrega = (e: Entrega) => (e.estado === "retirado" ? "Retirado" : e.avisadoEl ? "Avisado" : "Recibido");

function Progresion({ estado }: { estado: (typeof PASOS)[number] }) {
  const n = PASOS.indexOf(estado);
  return <span className="en2-prog" aria-label={`Estado: ${estado}`}>
    <span className="en2-prog-marcas" aria-hidden="true">{PASOS.map((p, i) => <i key={p} data-hecho={i <= n || undefined} />)}</span>
    <span key={estado} className="en2-prog-rot ct-resuelve">{estado}</span>
  </span>;
}

export function P05({ ir, refe }: { ir: (v: VistaP, ref?: string) => void; refe?: string }) {
  void ir;
  const [formAbierto, setFormAbierto] = useState(true);
  const [vista, setVista] = useState<"pendientes" | "retiradas">("pendientes");
  const formulario = useRef<HTMLElement>(null);
  useEffect(() => {
    if (refe === "registrar") {
      setFormAbierto(true);
      formulario.current?.scrollIntoView({ block: "nearest" });
      formulario.current?.querySelector<HTMLElement>("button")?.focus();
    }
  }, [refe]);
  const { estado, hacer } = useApp();
  const [unidad, setUnidad] = useState(UNIDADES[0].codigo);
  const [remitente, setRemitente] = useState("");
  const [tipo, setTipo] = useState<TipoEntrega>("paquete");
  const [foto, setFoto] = useState<string | undefined>();
  const [tocado, setTocado] = useState(false);
  const [recienCreada, setRecienCreada] = useState<{ id: string; rotulo: string } | null>(null);
  const [retirando, setRetirando] = useState<Entrega | null>(null);
  const [quienRetira, setQuienRetira] = useState("");
  /* La entrega recién retirada sigue en la lista un momento, ya como
     Retirado: el cambio se ve antes de que la fila se vaya. */
  const [entregada, setEntregada] = useState<string | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(reloj.current), []);

  const sinRetirar = estado.entregas.filter((e) => e.estado === "retirar" || e.id === entregada);
  const retiradas = estado.entregas
    .filter((e) => e.estado === "retirado")
    .sort((a, b) => (b.retiradoEl ?? "").localeCompare(a.retiradoEl ?? ""));
  const pendientes = sinRetirar.filter(e => e.estado === "retirar").length;

  const errRemitente = !remitente.trim() ? "Poné de dónde viene: es lo que el residente va a leer." : undefined;

  function registrar() {
    setTocado(true);
    if (errRemitente) return;
    const id = nuevoIdEntrega();
    const u = unidadPorCodigo(unidad);
    hacer({
      t: "entrega/registrar",
      entrega: {
        id, unidad,
        titulo: `${ROTULO_ENTREGA[tipo]} de ${remitente.trim()}`,
        tipo, remitente: remitente.trim(), estado: "retirar",
        recibidoEl: new Date().toISOString(), avisadoEl: new Date().toISOString(), recibidoPor: RECEPCION.nombre,
        foto,
      },
    });
    setRecienCreada({ id, rotulo: u ? `${u.codigo} · ${u.residentes[0]}` : unidad });
    avisar({ titulo: "Entrega registrada · unidad avisada", detalle: `${remitente.trim()} para ${u ? `la unidad ${u.codigo} · ${u.residentes[0]}` : unidad}`, icono: "caja" });
    setRemitente(""); setFoto(undefined); setTocado(false);
    setVista("pendientes");
  }
  function confirmarRetiro() {
    if (!retirando || !quienRetira.trim()) return;
    hacer({ t: "entrega/retirar", id: retirando.id, quien: quienRetira.trim(), por: RECEPCION.nombre });
    avisar({ titulo: "Entrega retirada", detalle: `${retirando.remitente} · retiró ${quienRetira.trim()} · unidad ${retirando.unidad}`, icono: "check" });
    setEntregada(retirando.id);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setEntregada(null), sinMovimiento() ? 1600 : 1400);
    setRetirando(null); setQuienRetira("");
  }

  const abrirFormulario = () => {
    setFormAbierto(true);
    requestAnimationFrame(() => { formulario.current?.scrollIntoView({ block: "nearest" }); formulario.current?.querySelector<HTMLInputElement>("input, select")?.focus({ preventScroll: true }); });
  };

  const filas = vista === "pendientes" ? sinRetirar : retiradas;

  return (
    <ReceptionPage titulo="Entregas" descripcion="Recepción, custodia y retiro de paquetes." icono="caja" clase="en2"
      acciones={!formAbierto ? <button className="ct-btn ct-btn--primario" type="button" onClick={abrirFormulario}><Icon n="mas" s={18} />Registrar entrega</button> : undefined}>
      <div className="en2-barra">
        <p><b className="ct-cifra">{String(pendientes).padStart(2, "0")}</b> {pendientes === 1 ? "entrega espera" : "entregas esperan"} retiro en recepción</p>
        <Segmentado etiqueta="Qué entregas mostrar" valor={vista} onCambio={setVista}
          opciones={[{ id: "pendientes", label: "Sin retirar", cuenta: pendientes }, { id: "retiradas", label: "Retiradas", cuenta: retiradas.length }]} />
      </div>

      <div className="en2-marco" data-form={formAbierto}>
        <section className="en2-lista" aria-label={vista === "pendientes" ? "Entregas sin retirar" : "Entregas retiradas"}>
          <div className="ct-tabla-cab en2-cols" aria-hidden="true"><span>Entrega</span><span>Estado</span><span /></div>
          {filas.length === 0 && <p className="en2-vacio">{vista === "pendientes" ? "No queda nada guardado en recepción." : "Todavía no se retiró ninguna."}</p>}
          <ul key={vista} className="ct-refiltra">
            {filas.map((e) => {
              const u = unidadPorCodigo(e.unidad);
              const est = estadoEntrega(e);
              return <li key={e.id} className={`en2-fila en2-cols${recienCreada?.id === e.id ? " ct-insertado" : ""}`} data-entregada={e.id === entregada || undefined}>
                <span className="en2-txt"><span className="en2-icono" aria-hidden="true"><Icon n={e.estado === "retirado" ? "check" : "caja"} s={18} /></span>
                  <span><b>{e.titulo}</b>
                  <small>{e.estado === "retirado"
                    ? `Unidad ${e.unidad} · retiró ${e.retiradoPor} · entregó ${e.entregadoPor} · ${fechaHora(e.retiradoEl!)}`
                    : `Unidad ${e.unidad}${u ? ` · ${u.residentes[0]}` : ""} · recibido ${hace(e.recibidoEl)}`}</small></span>
                </span>
                <Progresion estado={est} />
                <span className="en2-accion">{e.estado === "retirar" && <button className="ct-btn ct-btn--secundario ct-btn--chico" type="button"
                  onClick={() => { setRetirando(e); setQuienRetira(u?.residentes[0] ?? ""); }}>Registrar retiro</button>}
                  {e.id === entregada && <span className="en2-ok ct-resuelve" role="status"><Icon n="check" s={16} />Entregada</span>}</span>
              </li>;
            })}
          </ul>
        </section>

        {formAbierto && <section className="en-registro en2-registro ct-panel" ref={formulario} aria-label="Registrar una entrega">
          <header><h2 className="ct-h2">Registrar una entrega</h2><button type="button" className="ct-panel-cerrar" onClick={() => setFormAbierto(false)}><Icon n="cerrar" s={16} />Cerrar</button></header>
          <div className="cuerpo">
            {recienCreada && <p className="en2-aviso ct-resuelve" role="status"><Icon n="check" s={16} />Registrada y avisada a {recienCreada.rotulo}.</p>}
            <Elegir etiqueta="Unidad" valor={unidad} onCambio={setUnidad}
              opciones={UNIDADES.map((u) => ({ id: u.codigo, rotulo: `${u.codigo} · ${u.residentes[0]}` }))} />
            <Texto etiqueta="Remitente o quién la trajo" valor={remitente} onCambio={setRemitente}
              placeholder="Correo Argentino" icono="persona" error={tocado ? errRemitente : undefined} />
            <Segmentos etiqueta="Tipo" valor={tipo} onCambio={setTipo} opciones={TIPOS} />
            <Adjuntar etiqueta="Foto del paquete" archivo={foto} onCambio={setFoto} nombreSugerido="paquete-mostrador.jpg" />
            <button className="ct-btn ct-btn--primario ct-btn--ancho" type="button" onClick={registrar}>Registrar y avisar al residente</button>
          </div>
        </section>}
      </div>

      {retirando && (
        <Hoja
          titulo="Entregar el paquete"
          texto={`${retirando.titulo} · Unidad ${retirando.unidad}. Queda registrado quién lo retiró, a qué hora y que se lo entregaste vos.`}
          confirmar="Confirmar entrega"
          bloqueado={!quienRetira.trim()}
          onConfirmar={confirmarRetiro}
          onCancelar={() => { setRetirando(null); setQuienRetira(""); }}
        >
          <Texto etiqueta="Quién lo retira" valor={quienRetira} onCambio={setQuienRetira}
            placeholder="Nombre y apellido" icono="persona"
            error={!quienRetira.trim() ? "Anotá quién se lo lleva: sin ese dato no se puede entregar." : undefined}
            ayuda="Si no es el residente, anotá el nombre de quien se lo lleva." />
        </Hoja>
      )}
    </ReceptionPage>
  );
}
