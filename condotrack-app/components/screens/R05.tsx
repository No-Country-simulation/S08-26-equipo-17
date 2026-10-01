"use client";
import { useMemo, useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Hoja } from "../ui/Hoja";
import { EspacioCard } from "../ui/EspacioCard";
import { CalendarioMes } from "../ui/CalendarioMes";
import { ExitoProtagonista } from "../ui/Estados";
import { Rail } from "../ui/Rail";
import { ESPACIOS, RECURSOS, RESIDENTE, type Recurso, type Vista } from "@/lib/data";
import {
  turnos, cupoDelDia, turnosDelDia, SIN_FOTO, hora, diaYMes,
  diaCon, diaEnPalabras, proximas, mismoDia, activas, proximoLibre,
  type Turno,
} from "@/lib/reservas";
import { nuevoIdReserva, useApp } from "@/lib/estado";
import { useNavegacion } from "@/lib/navegacion";

/** R05 · Reservar (lock V02, fase 3 · ronda 2 de Felipe).
 *
 *  espacio → día → hoja corta de horarios → confirmar → éxito → volver.
 *
 *  Arriba el selector de espacio con su foto (vuelve: era el correcto);
 *  después el calendario, que dice solo qué está reservado; abajo "Explorar
 *  espacios", que abre la ficha de cada lugar (no elige días). Elegir un
 *  día abre la hoja con los horarios y ahí mismo se confirma.
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
  const [hecho, setHecho] = useState<{ cuando: string; donde: string; dia: string; horario: string; piso?: string; id: string } | null>(null);
  const [conflicto, setConflicto] = useState(false);

  const espacio = ESPACIOS.find((e) => e.id === espacioId)!;
  const lista = useMemo(
    () => (dia ? turnos(espacio, dia, estado.reservas) : []),
    [espacio, dia, estado.reservas]
  );
  const libres = lista.filter((t) => !t.bloqueo).length;
  const porRecurso = espacio.tipoReserva === "recurso";
  const turnoElegido = elegido ? lista[elegido.n] : null;
  const mias = proximas(estado.reservas).length;
  /* R05-06 · días con una reserva propia en este espacio: el calendario los
     marca con el filo amarillo. */
  const misDias = useMemo(() => {
    const ids = new Set(RECURSOS.filter((r) => r.espacioId === espacio.id).map((r) => r.id));
    return activas(estado.reservas).filter((r) => ids.has(r.recursoId)).map((r) => new Date(r.inicio));
  }, [espacio, estado.reservas]);
  const tengoEseDia = (d: Date) => misDias.some((x) => mismoDia(x, d));

  /* v04 · A2 · Explorar espacios dice la disponibilidad de hoy de cada
     lugar (semáforo: libre / quedan pocos / completo y cuándo sí hay). */
  const disponibleHoy = (e: (typeof ESPACIOS)[number]) => {
    const hoy = diaCon(0);
    const cupo = cupoDelDia(e, hoy, estado.reservas);
    if (cupo === 0) {
      /* si hoy ya no quedan turnos (el día terminó o está lleno), dice
         cuándo sí hay: mañana o el próximo día libre */
      const manana = cupoDelDia(e, diaCon(1), estado.reservas);
      if (manana > 0) return { texto: `Mañana: ${manana} ${manana === 1 ? "libre" : "libres"}`, tono: manana <= 2 ? "poco" as const : "ok" as const };
      const otro = proximoLibre(e, hoy, estado.reservas);
      return { texto: otro ? `Libre el ${diaYMes(otro)}` : "Sin turnos", tono: "nada" as const };
    }
    if (cupo <= 2) return { texto: cupo === 1 ? "Hoy queda 1" : `Hoy quedan ${cupo}`, tono: "poco" as const };
    return { texto: `Hoy: ${cupo} libres`, tono: "ok" as const };
  };


  /* El espacio elegido se anota como el ref de esta pantalla: si entrás a
     un espacio y volvés, sigue elegido el que habías tocado (A4). */
  const nav = useNavegacion();
  function elegirEspacio(id: string) {
    setEspacioId(id); setElegido(null);
    nav?.reemplazarRef(id);
  }
  function elegirDia(d: Date) {
    setDia(d); setElegido(null); setPaso("horario"); setHoja(true); setConflicto(false);
    /* SYS-CAL · el mes a la vista sigue al día elegido desde la tira: en la
       revisión se veía "Julio" en el calendario con "10 oct" en la hoja. */
    if (d.getMonth() !== ancla.getMonth() || d.getFullYear() !== ancla.getFullYear())
      setAncla(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  function cerrarHoja() { setHoja(false); setElegido(null); setPaso("horario"); }

  function tocarTurno(n: number, t: Turno) {
    if (t.bloqueo) return;
    setElegido({ n, recurso: t.libres[0] });
  }

  function confirmar() {
    if (!turnoElegido || !elegido || !dia) return;
    /* Revalidación final: si entre elegir y confirmar el turno se ocupó,
       no se confirma; se conserva el día y se pide otro horario. */
    const fresco = turnos(espacio, dia, estado.reservas)[elegido.n];
    if (!fresco || fresco.bloqueo || !fresco.libres.some((r) => r.id === elegido.recurso.id)) {
      setConflicto(true); setElegido(null); setPaso("horario");
      return;
    }
    const donde = espacio.nombre;
    const cuando = `${diaYMes(dia)} · ${hora(turnoElegido.franja.inicio)}`;
    const id = nuevoIdReserva();
    hacer({
      t: "reserva/crear",
      rotulo: donde,
      reserva: {
        id,
        recursoId: elegido.recurso.id,
        unidad: RESIDENTE.unidad,
        inicio: turnoElegido.franja.inicio.toISOString(),
        fin: turnoElegido.franja.fin.toISOString(),
        estado: "confirmada",
        creadaPor: RESIDENTE.nombre,
        creadaEl: new Date().toISOString(),
      },
    });
    setHecho({
      cuando, donde, id, piso: espacio.piso,
      dia: diaEnPalabras(dia),
      horario: `${hora(turnoElegido.franja.inicio)} a ${hora(turnoElegido.franja.fin)}`,
    });
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
        {/* Ronda 3 · la misma lógica que "Visita autorizada" */}
        <ExitoProtagonista
          titulo="Reserva confirmada"
          resumen={<><b>{hecho.donde}</b> · {hecho.dia}</>}
          detalle={
            <dl className="exito-datos">
              <div><dt>Horario</dt><dd>{hecho.horario}</dd></div>
              {hecho.piso && <div><dt>Dónde</dt><dd>{hecho.piso}</dd></div>}
              <div><dt>Estado</dt><dd>Confirmada</dd></div>
            </dl>
          }
          nota="La podés cancelar desde Mis reservas hasta 30 minutos antes."
          accion="Ver la reserva"
          onAccion={() => ir("r18", hecho.id)}
          alterna="Listo"
          onAlterna={() => {
            if (nav?.hayVuelta) nav.volver();
            else { setHecho(null); setDia(null); }
          }}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="r05">
      {/* v04 · A2 · sin el degradé: el fondo queda limpio y la profundidad la
          da el panel (referencia Planet Clock Calendar) */}
      <TopBar volverA="r01" ir={ir} />
      <div className="tit"><h1>Reservá tu espacio</h1></div>
      <p className="res-contexto" aria-live="polite">
        <b>{espacio.nombre}</b> · {dia ? diaEnPalabras(dia) : "elegí un día"}
      </p>

      {/* v04 · A2 · un solo panel (Planet Clock Calendar): arriba el
          selector de espacio en su riel, al medio el calendario sobre una
          superficie elevada, abajo la pista o el día elegido. */}
      <div className="res-panel">
      {/* QUÉ ESPACIO — el selector con foto vuelve arriba (Felipe, ronda 2:
          "era el correcto"), en vidrio. */}
      <Rail className="esp-selector" rol="radiogroup" etiqueta="Espacio">
        {ESPACIOS.map((e) => {
          const sel = e.id === espacioId;
          return (
            <button key={e.id} type="button" role="radio" aria-checked={sel}
              className={"esp-op" + (SIN_FOTO.has(e.id) ? " sin-foto" : "")}
              onClick={() => { elegirEspacio(e.id); setDia(null); }}>
              {SIN_FOTO.has(e.id)
                ? <span className="ic" aria-hidden="true"><Icon n="rayo" s={18} /></span>
                : <img src={e.mini} alt="" />}
              <span className="nb">{e.nombre}</span>
            </button>
          );
        })}
      </Rail>

      {/* EL CALENDARIO — protagonista, sobre su panel de vidrio. Cada día
          dice solo lo que tiene reservado. */}
      <section className="res-cal" id="r05-cal" aria-label={"Calendario de " + espacio.nombre}>
      <CalendarioMes
        ancla={ancla}
        onAncla={setAncla}
        dia={dia}
        onDia={elegirDia}
        etiqueta={"Disponibilidad de " + espacio.nombre}
        estadoDe={(c) => {
          if (!c.dentroDeVentana || !c.delMes) {
            return { punto: "sin", deshabilitado: true, detalle: "Fuera de la ventana de reserva" };
          }
          /* Lo reservado se cuenta turno por turno: un turno está tomado si
             alguien (vos u otra unidad) ya tiene una reserva en él. */
          const ts = turnos(espacio, c.fecha, estado.reservas).filter((t) => t.bloqueo !== "pasada");
          const total = ts.length || turnosDelDia(espacio, c.fecha);
          const tomados = ts.filter((t) => t.ocupados.length > 0).length;
          const cupo = cupoDelDia(espacio, c.fecha, estado.reservas);
          const mio = tengoEseDia(c.fecha);
          const completo = cupo === 0 && ts.length > 0;
          return {
            punto: cupo > 0 ? (cupo <= 2 ? "poco" : "lleno") : "sin",
            deshabilitado: cupo === 0 && !mio,
            marca: mio ? "propia" : undefined,
            ocupacion: total ? tomados / total : 0,
            completo,
            detalle: (mio ? "Tenés una reserva. " : "")
              + (completo ? "Completo, sin turnos libres"
                : tomados === 0 ? "Sin reservas, todos los turnos libres"
                : `${tomados} de ${total} turnos reservados, ${cupo} libres`),
          };
        }}
      />
      </section>

      {/* R05-05/06 · sin leyenda: el estado del día elegido se dice en
          palabras, justo debajo del calendario. */}
      {dia ? (
        <button className="dia-elegido" type="button" onClick={() => setHoja(true)}>
          <span className="d">
            <b>{diaEnPalabras(dia)}</b>
            <i>{espacio.nombre} · {libres === 0 ? "sin horarios libres" : libres === 1 ? "queda 1 horario" : libres <= 2 ? `quedan ${libres} horarios` : libres + " horarios libres"}{tengoEseDia(dia) ? " · tenés una reserva ese día" : ""}</i>
          </span>
          <span className="btn-sec">Ver horarios</span>
        </button>
      ) : (
        /* RES-R05-04 · sin leyenda: una frase dice lo que marca el amarillo */
        /* v05 · sin hablar de bordes: el mensaje mismo va destacado */
        <p className="res-pista">Tocá un día para ver sus horarios.{misDias.length > 0 && <> <span className="res-pista-mia">Tus reservas están destacadas</span></>}</p>
      )}
      </div>

      {/* EXPLORAR ESPACIOS — para conocer cada lugar: abre su ficha (fotos,
          capacidad, normas). No elige días: eso es el selector de arriba. */}
      <h2 className="sec res-explorar">Explorar espacios</h2>
      <div className="dos esp-grilla">
        {ESPACIOS.map((e) => (
          <EspacioCard key={e.id} espacio={e} sinFoto={SIN_FOTO.has(e.id)} disponible={disponibleHoy(e)}
            accion="Ver espacio" onAccion={() => ir("r13", e.id)} onVer={() => ir("r13", e.id)} />
        ))}
      </div>

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
              {conflicto && (
                <p className="hoja-conflicto" role="alert">Ese horario se ocupó recién. Elegí otro del mismo día.</p>
              )}
              {libres === 0 && <p className="hoja-vacio">Sin horarios libres este día</p>}
              {/* RES-016 · todos los turnos del día: libres para elegir,
                  ocupados y el tuyo marcados con texto. Nunca de quién es
                  un turno ajeno. */}
              <div className="horas" role="radiogroup" aria-label="Horario">
                {lista.map((t, n) => {
                  if (t.bloqueo === "pasada") return null;
                  const propia = t.ocupaciones.some((o) => o.unidad === RESIDENTE.unidad);
                  const estadoT = propia ? "Tu reserva"
                    : t.bloqueo === "ocupada" ? "Ocupado"
                    : t.bloqueo === "superpuesta" ? "Tenés otra"
                    : t.bloqueo ? "No disponible" : "";
                  return (
                    <button key={n} type="button" role="radio" aria-checked={elegido?.n === n}
                      disabled={Boolean(t.bloqueo)}
                      className={propia ? "propia" : t.bloqueo ? "ocupada" : undefined}
                      aria-label={hora(t.franja.inicio) + (estadoT ? ", " + estadoT.toLowerCase() : ", libre")}
                      onClick={() => tocarTurno(n, t)}>
                      <b>{hora(t.franja.inicio)}</b>
                      {estadoT && <small>{estadoT}</small>}
                    </button>
                  );
                })}
              </div>
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
