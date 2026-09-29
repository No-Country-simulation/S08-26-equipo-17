"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { Texto, Elegir, Adjuntar, Segmentos } from "../ui/Formulario";
import { Hoja } from "../ui/Hoja";
import { Aviso } from "../ui/Estados";
import {
  RECEPCION, ROTULO_ENTREGA, type Entrega, type TipoEntrega, type VistaP,
} from "@/lib/data";
import { UNIDADES, unidadPorCodigo } from "@/lib/edificio";
import { fechaHora, hace } from "@/lib/formato";
import { nuevoIdEntrega, useApp } from "@/lib/estado";

/** P05 · Entregas.
 *  Registrar: unidad, remitente, tipo, foto. Notifica al residente.
 *  Retirar: quién retiró, cuándo y quién se la entregó. */

const TIPOS: { id: TipoEntrega; rotulo: string }[] = [
  { id: "paquete", rotulo: "Paquete" },
  { id: "sobre", rotulo: "Sobre" },
  { id: "delivery", rotulo: "Delivery" },
  { id: "otro", rotulo: "Otro" },
];

export function P05({ ir }: { ir: (v: VistaP, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [unidad, setUnidad] = useState(UNIDADES[0].codigo);
  const [remitente, setRemitente] = useState("");
  const [tipo, setTipo] = useState<TipoEntrega>("paquete");
  const [foto, setFoto] = useState<string | undefined>();
  const [tocado, setTocado] = useState(false);
  const [recienCreada, setRecienCreada] = useState<string | null>(null);
  const [retirando, setRetirando] = useState<Entrega | null>(null);
  const [quienRetira, setQuienRetira] = useState("");

  const sinRetirar = estado.entregas.filter((e) => e.estado === "retirar");
  const retiradas = estado.entregas
    .filter((e) => e.estado === "retirado")
    .sort((a, b) => (b.retiradoEl ?? "").localeCompare(a.retiradoEl ?? ""));

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
        recibidoEl: new Date().toISOString(), recibidoPor: RECEPCION.nombre,
        foto,
      },
    });
    setRecienCreada(u ? `${u.codigo} · ${u.residentes[0]}` : unidad);
    setRemitente(""); setFoto(undefined); setTocado(false);
  }

  return (
    <>
      <div className="desk-tit">
        <div>
          <h1>Entregas</h1>
          <p>Lo que llega al mostrador y lo que se lleva cada uno.</p>
        </div>
      </div>

      <div className="columnas dos">
        <section className="tarjeta">
          <h2>
            <Icon n="caja" s={17} w={1.9} />
            Sin retirar
            <span className="cnt">{sinRetirar.length}</span>
          </h2>
          <div className="cuerpo">
            {sinRetirar.length === 0 ? (
              <p className="mensaje-vacio">No queda nada guardado en recepción.</p>
            ) : (
              sinRetirar.map((e) => {
                const u = unidadPorCodigo(e.unidad);
                return (
                  <div className="fila-op" key={e.id}>
                    <span className="ic"><Icon n="caja" s={18} w={1.8} /></span>
                    <span className="d">
                      <b>{e.titulo}</b>
                      <i>
                        Unidad {e.unidad}
                        {u && ` · ${u.residentes[0]}`}
                        {" · recibido "}{hace(e.recibidoEl)}
                      </i>
                    </span>
                    <span className="der">
                      <button className="btn-desk fuerte" type="button"
                        onClick={() => { setRetirando(e); setQuienRetira(u?.residentes[0] ?? ""); }}>
                        Entregar
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {retiradas.length > 0 && (
            <>
              <h2 style={{ borderTop: "1px solid var(--borde)" }}>
                <Icon n="check" s={17} w={2.2} />
                Retiradas
                <span className="cnt">{retiradas.length}</span>
              </h2>
              <div className="cuerpo">
                {retiradas.slice(0, 5).map((e) => (
                  <div className="fila-op" key={e.id}>
                    <span className="ic"><Icon n="check" s={18} w={2.2} /></span>
                    <span className="d">
                      <b>{e.titulo}</b>
                      <i>
                        Unidad {e.unidad} · retiró {e.retiradoPor} · entregó {e.entregadoPor} ·{" "}
                        {fechaHora(e.retiradoEl!)}
                      </i>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="tarjeta">
          <h2><Icon n="mas" s={17} w={2.4} />Registrar una entrega</h2>
          <div className="cuerpo">
            {recienCreada && (
              <Aviso icono="check">
                Registrada y avisada a {recienCreada}. El residente la ve en su app y en el
                historial de la unidad.
              </Aviso>
            )}

            <Elegir etiqueta="Unidad" valor={unidad} onCambio={setUnidad}
              opciones={UNIDADES.map((u) => ({
                id: u.codigo, rotulo: `${u.codigo} · ${u.residentes[0]}`,
              }))} />

            <Texto etiqueta="Remitente o quién la trajo" valor={remitente} onCambio={setRemitente}
              placeholder="Correo Argentino" icono="persona"
              error={tocado ? errRemitente : undefined} />

            <Segmentos etiqueta="Tipo" valor={tipo} onCambio={setTipo} opciones={TIPOS} />

            <Adjuntar etiqueta="Foto del paquete" archivo={foto} onCambio={setFoto}
              nombreSugerido="paquete-mostrador.jpg" />

            <button className="entrar" type="button" onClick={registrar} style={{ marginTop: 20 }}>
              Registrar y avisar al residente
            </button>
          </div>
        </section>
      </div>

      {retirando && (
        <Hoja
          titulo="Entregar el paquete"
          texto={`${retirando.titulo} · Unidad ${retirando.unidad}. Queda registrado quién lo retiró, a qué hora y que se lo entregaste vos.`}
          confirmar="Confirmar la entrega"
          onConfirmar={() => {
            hacer({
              t: "entrega/retirar", id: retirando.id,
              quien: quienRetira.trim() || "Sin identificar", por: RECEPCION.nombre,
            });
            setRetirando(null); setQuienRetira("");
          }}
          onCancelar={() => { setRetirando(null); setQuienRetira(""); }}
        >
          <Texto etiqueta="Quién lo retira" valor={quienRetira} onCambio={setQuienRetira}
            placeholder="Nombre y apellido" icono="persona"
            ayuda="Si no es el residente, anotá el nombre de quien se lo lleva." />
        </Hoja>
      )}
    </>
  );
}
