"use client";
import { useMemo, useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Hoja } from "../ui/Hoja";
import { Rail } from "../ui/Rail";
import { CalendarioMes } from "../ui/CalendarioMes";
import { Confirmacion } from "../ui/Estados";
import { ESPACIOS, RESIDENTE, type Recurso, type Vista } from "@/lib/data";
import {
  turnos, cupoDelDia, turnosDelDia, SIN_FOTO, hora, diaYMes,
  diaCon, diaEnPalabras, proximas, dias, diaCorto, numDia, esHoy, mismoDia,
  type Turno,
} from "@/lib/reservas";
import { nuevoIdReserva, useApp } from "@/lib/estado";
import { useNavegacion } from "@/lib/navegacion";

/** R05 · Reservar (lock V02, fase 3).
 *
 *  espacio → día → hoja corta de horarios → confirmar → éxito → volver.
 *
 *  Arriba el espacio, con foto; abajo el calendario. Elegir un día abre la
 *  hoja con los horarios y ahí mismo se confirma: la pantalla no crece.
 *
 *  Las cards de espacios que había debajo del calendario repetían el
 *  selector de arriba. Viven en Mi edificio · Espacios, que es donde se
 *  mira un lugar; acá se reserva.
 *
 *  Confirmar es un botón, no un deslizar: la reserva se cancela desde Mis
 *  reservas, no es irreversible (D-10). Las normas van plegadas. */

export function R05({ ir, refe }: { ir: (v: Vista, ref?: string) => void; refe?: string }) {
  const { estado, hacer } = useApp();
  /* Si llegás desde un espacio ("Reservar Cowork"), el calendario abre con
     ese espacio elegido: no te manda al calendario genérico (§9.5). */
  const [espacioId, setEspacioId] = useState(() =>
    ESPACIOS.some((e) => e.id === refe) ? (refe as string) : ESPACIOS[0].id);
  const [dia, setDia] = useState<Date | null>(null);
  const [hoja, setHoja] = useState(false);
  const [ancla, setAncla] = useState(() => diaCon(0));
  const [elegido, setElegido] = useState<{ n: number; recurso: Recurso } | null>(null);
  const [paso, setPaso] = useState<"horario" | "confirmar">("horario");
  const [hecho, setHecho] = useState<{ cuando: string; donde: string; img?: string } | null>(null);

  const espacio = ESPACIOS.find((e) => e.id === espacioId)!;
  const lista = useMemo(
    () => (dia ? turnos(espacio, dia, estado.reservas) : []),
    [espacio, dia, estado.reservas]
  );
  const libres = lista.filter((t) => !t.bloqueo).length;
  const porRecurso = espacio.tipoReserva === "recurso";
  const turnoElegido = elegido ? lista[elegido.n] : null;
  const mias = proximas(estado.reservas).length;
  const proximosDias = useMemo(() => dias(), []);

  /* El espacio elegido se anota como el ref de esta pantalla: si entrás a
     un espacio y volvés, sigue elegido el que habías tocado (A4). */
  const nav = useNavegacion();
  function elegirEspacio(id: string) {
    setEspacioId(id); setElegido(null);
    nav?.reemplazarRef(id);
  }
  function elegirDia(d: Date) { setDia(d); setElegido(null); setPaso("horario"); setHoja(true); }
  function cerrarHoja() { setHoja(false); setElegido(null); setPaso("horario"); }

  function tocarTurno(n: number, t: Turno) {
    if (t.bloqueo) return;
    setElegido({ n, recurso: t.libres[0] });
  }

  function confirmar() {
    if (!turnoElegido || !elegido || !dia) return;
    const donde = espacio.nombre;
    const cuando = `${diaYMes(dia)} · ${hora(turnoElegido.franja.inicio)}`;
    hacer({
      t: "reserva/crear",
      rotulo: donde,
      reserva: {
        id: nuevoIdReserva(),
        recursoId: elegido.recurso.id,
        unidad: RESIDENTE.unidad,
        inicio: turnoElegido.franja.inicio.toISOString(),
        fin: turnoElegido.franja.fin.toISOString(),
        estado: "confirmada",
        creadaPor: RESIDENTE.nombre,
        creadaEl: new Date().toISOString(),
      },
    });
    setHecho({ cuando, donde, img: espacio.img });
    setElegido(null);
    setPaso("horario");
    setHoja(false);
  }

  /* Éxito mínimo: qué, cuándo, y listo. "Listo" vuelve a donde estabas;
     si Reservas era el punto de partida, vuelve al calendario. */
  if (hecho) {
    return (
      <div className="vista" id="r05">
        <TopBar volverA="r01" ir={ir} />
        <Confirmacion
          titulo="Reserva confirmada"
          principal={`${hecho.donde} · ${hecho.cuando}`}
          pieza={
            <div className="reserva ticket listo-ticket">
              {hecho.img && <img src={hecho.img} alt="" aria-hidden="true" />}
              <div className="bo">
                <div>
                  <h3>{hecho.donde}</h3>
                  <div className="dato"><Icon n="reloj" s={16} />{hecho.cuando}</div>
                </div>
              </div>
              <div className="corte" aria-hidden="true" />
              <div className="tk-pie"><span className="tk-estado">Confirmada</span></div>
            </div>
          }
          accion="Listo"
          onAccion={() => {
            if (nav?.hayVuelta) nav.volver();
            else { setHecho(null); setDia(null); }
          }}
          alterna="Ver reserva"
          onAlterna={() => ir("r18")}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="r05">
      <TopBar volverA="r01" ir={ir} />
      <div className="tit"><h1>Reservá tu espacio</h1></div>

      {/* 1 · QUÉ ESPACIO — foto y nombre. La foto dice qué lugar es antes
          que el nombre. */}
      <Rail className="esp-selector" rol="radiogroup" etiqueta="Espacio o servicio">
        {ESPACIOS.map((e) => {
          const sel = e.id === espacioId;
          return (
            <button key={e.id} type="button" role="radio" aria-checked={sel}
              className={"esp-op" + (SIN_FOTO.has(e.id) ? " sin-foto" : "")}
              onClick={() => elegirEspacio(e.id)}>
              {SIN_FOTO.has(e.id)
                ? <span className="ic" aria-hidden="true"><Icon n="rayo" s={20} /></span>
                : <img src={e.mini} alt="" />}
              <span className="nb">{e.nombre}</span>
              {sel && <span className="tilde" aria-hidden="true"><Icon n="check" s={12} /></span>}
            </button>
          );
        })}
      </Rail>

      {/* Rail rápido: los próximos días a un toque, con el mismo lenguaje
          de fecha de Autorizar visita. El mes entero queda abajo para
          cuando hay que ir más lejos. */}
      <Rail className="tira" rol="radiogroup" etiqueta="Próximos días">
        {proximosDias.map((d, n) => {
          const libre = cupoDelDia(espacio, d, estado.reservas) > 0;
          const sel = dia ? mismoDia(d, dia) : false;
          return (
            <button key={n} type="button" role="radio" aria-checked={sel} disabled={!libre}
              onClick={() => elegirDia(d)}>
              <i>{esHoy(d) ? "hoy" : diaCorto(d)}</i>
              <b>{numDia(d)}</b>
              <span className={"cupo" + (libre ? "" : " sin")} aria-hidden="true" />
            </button>
          );
        })}
      </Rail>

      {/* 2 · EL CALENDARIO — un mes, flechas y gesto simple (D-08). */}
      <CalendarioMes
        ancla={ancla}
        onAncla={setAncla}
        dia={dia}
        onDia={elegirDia}
        etiqueta={"Disponibilidad de " + espacio.nombre}
        estadoDe={(c) => {
          const cupo = c.dentroDeVentana ? cupoDelDia(espacio, c.fecha, estado.reservas) : 0;
          const total = turnosDelDia(espacio, c.fecha);
          const libre = c.dentroDeVentana && cupo > 0;
          return {
            punto: libre ? (cupo <= 2 ? "poco" : "lleno") : "sin",
            deshabilitado: !libre,
            detalle: !c.dentroDeVentana
              ? "Fuera de la ventana de reserva"
              : cupo === 0
              ? "Sin turnos disponibles"
              : cupo + " de " + total + " turnos disponibles",
          };
        }}
      />

      {/* Con un día elegido, una sola línea para volver a sus horarios. */}
      {dia && (
        <button className="dia-elegido" type="button" onClick={() => setHoja(true)}>
          <span className="d">
            <b>{diaEnPalabras(dia)}</b>
            <i>{espacio.nombre} · {libres === 0 ? "sin horarios libres" : libres === 1 ? "1 horario libre" : libres + " horarios libres"}</i>
          </span>
          <span className="btn-sec">Ver horarios</span>
        </button>
      )}

      <button className="fila aire" type="button" onClick={() => ir("r18")} style={{ marginTop: 14 }}>
        <span className="ic"><Icon n="calendario" s={20} /></span>
        <span className="cu">
          <span className="t">Mis reservas</span>
          <span className="m">{mias === 0 ? "Ninguna próxima" : mias === 1 ? "1 próxima" : `${mias} próximas`}</span>
        </span>
        <span className="flech"><Icon n="chevron" s={16} /></span>
      </button>

      {/* LA HOJA — corta, como en una app de delivery: horarios en chips,
          uno elegido, Continuar; después el resumen y Confirmar. Las normas
          viven en la ficha del espacio; la máquina se asigna sola. */}
      {hoja && dia && (
        <Hoja titulo={paso === "confirmar" && turnoElegido ? espacio.nombre : `${espacio.nombre} · ${diaYMes(dia)}`}
          onCancelar={cerrarHoja}
          cerrarRotulo="Cerrar" sinAcciones>
          {paso === "horario" || !turnoElegido ? (
            <>
              {libres === 0 ? (
                <p className="hoja-vacio">Sin horarios</p>
              ) : (
                <div className="horas" role="radiogroup" aria-label="Horario">
                  {lista.map((t, n) => t.bloqueo ? null : (
                    <button key={n} type="button" role="radio" aria-checked={elegido?.n === n}
                      onClick={() => tocarTurno(n, t)}>
                      {hora(t.franja.inicio)}
                    </button>
                  ))}
                </div>
              )}
              <button className="entrar hoja-cta" type="button" disabled={!elegido}
                onClick={() => setPaso("confirmar")}>
                Continuar
              </button>
            </>
          ) : (
            <>
              <div className="confirma-res">
                <b>{diaYMes(dia)} · {hora(turnoElegido.franja.inicio)}</b>
              </div>
              <button className="entrar hoja-cta" type="button" onClick={confirmar}>
                Confirmar reserva
              </button>
            </>
          )}
        </Hoja>
      )}
    </div>
  );
}
