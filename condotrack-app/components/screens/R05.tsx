"use client";
import { useMemo, useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { SwipeButton } from "../ui/SwipeButton";
import { Hoja } from "../ui/Hoja";
import { CalendarioMes } from "../ui/CalendarioMes";
import { Confirmacion, Aviso } from "../ui/Estados";
import { ESPACIOS, REGLAS, RESIDENTE, type Espacio, type Recurso, type Reserva, type Vista } from "@/lib/data";
import {
  turnos, cupoDelDia, turnosDelDia, rango,
  diaCon, diaEnPalabras, MOTIVO, proximas, type Turno,
} from "@/lib/reservas";
import { nuevoIdReserva, useApp } from "@/lib/estado";

/** R05 · Reservar.
 *
 *  El calendario es la pantalla, no una tira perdida entre otras cosas.
 *  Ocupa la parte de arriba, se desliza de mes en mes, y los horarios
 *  aparecen recién cuando elegís un día: teniéndolos siempre a la vista,
 *  todo quedaba chico y apretado.
 *
 *  Los espacios quedan abajo, con material Foto, como exploración y no
 *  como paso obligatorio. */

/** Primer día con lugar a partir del que estás mirando, dentro de la
 *  ventana de reserva. Es para la copia de las cards de espacios. */
function proximoLibre(espacio: Espacio, desde: Date, reservas: Reserva[]) {
  for (let n = 1; n <= REGLAS.ventanaDias; n++) {
    const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + n);
    if (cupoDelDia(espacio, d, reservas) > 0) return d;
  }
  return null;
}

export function R05({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { estado, hacer } = useApp();
  const [espacioId, setEspacioId] = useState(ESPACIOS[0].id);
  const [dia, setDia] = useState<Date | null>(null);
  const [ancla, setAncla] = useState(() => diaCon(0));
  const [elegido, setElegido] = useState<{ n: number; recurso: Recurso } | null>(null);
  const [hecho, setHecho] = useState<{ cuando: string; donde: string } | null>(null);

  const espacio = ESPACIOS.find((e) => e.id === espacioId)!;
  const lista = useMemo(
    () => (dia ? turnos(espacio, dia, estado.reservas) : []),
    [espacio, dia, estado.reservas]
  );
  const porRecurso = espacio.tipoReserva === "recurso";
  const turnoElegido = elegido ? lista[elegido.n] : null;
  const mias = proximas(estado.reservas).length;

  function elegirEspacio(id: string) { setEspacioId(id); setElegido(null); }
  function elegirDia(d: Date) { setDia(d); setElegido(null); }

  function tocarTurno(n: number, t: Turno) {
    if (t.bloqueo) return;
    setElegido(elegido?.n === n ? null : { n, recurso: t.libres[0] });
  }

  function confirmar() {
    if (!turnoElegido || !elegido || !dia) return;
    const donde = espacio.nombre + (porRecurso ? ` · ${elegido.recurso.nombre}` : "");
    const cuando = `${diaEnPalabras(dia)} · ${rango(turnoElegido.franja)}`;
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
    setHecho({ cuando, donde });
    setElegido(null);
  }

  if (hecho) {
    return (
      <div className="vista" id="r05">
        <TopBar volverA="r01" ir={ir} />
        <Confirmacion
          titulo="Reserva confirmada"
          principal={hecho.donde}
          secundario={hecho.cuando}
          registro="Podés cancelarla desde Mis reservas hasta 30 minutos antes. La reserva quedó en el historial de tu unidad."
          accion="Ver mis reservas"
          onAccion={() => ir("r18")}
          alterna="Reservar otro espacio"
          onAlterna={() => { setHecho(null); setDia(null); }}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="r05">
      <TopBar volverA="r01" ir={ir} />
      <h1 className="solo-lectores">Reservar un espacio</h1>

      {/* Filtro del calendario: qué espacio estás mirando. Compacto a
          propósito — la pantalla es el calendario. */}
      <div className="filtro-esp" role="radiogroup" aria-label="Espacio o servicio">
        {ESPACIOS.map((e) => (
          <button key={e.id} type="button" role="radio" aria-checked={e.id === espacioId}
            onClick={() => elegirEspacio(e.id)}>
            {e.nombre}
          </button>
        ))}
      </div>

      {/* EL CALENDARIO — es la pantalla (D-08).
          Los puntos reemplazan a los textos "hay lugar / quedan pocos /
          sin lugar": el estado se cuenta una vez, no tres. */}
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

      {/* LOS HORARIOS — recién cuando elegiste el día */}
      {!dia ? (
        <p className="pista-cal">
          <Icon n="calendario" s={18} w={1.8} />
          Elegí un día del calendario para ver los horarios de {espacio.nombre}.
        </p>
      ) : (
        <div className="paso entra-abajo" key={dia.toDateString() + espacioId}>
          <span className="paso-n">
            {diaEnPalabras(dia)}
            <em>{espacio.aperturaMin / 60}:00 a {espacio.cierreMin / 60}:00</em>
          </span>
          <div className="franjas">
            {lista.map((t, n) => {
              const sel = elegido?.n === n;
              /* Cada franja tomada dice quién la tiene: es un edificio. */
              const quien = t.ocupaciones.length
                ? t.ocupaciones
                    .map((o) => (o.unidad === RESIDENTE.unidad ? "tu unidad" : `unidad ${o.unidad}`)
                      + (porRecurso ? ` · ${o.recurso.nombre}` : ""))
                    .join(" · ")
                : null;
              return (
                <div key={n} className={"franja" + (t.bloqueo ? " no" : "") + (sel ? " sel" : "")}>
                  <button type="button" disabled={!!t.bloqueo} onClick={() => tocarTurno(n, t)}>
                    <b>{rango(t.franja)}</b>
                    <i>
                      {t.bloqueo === "ocupada" && quien ? `Tomado por ${quien}`
                        : t.bloqueo ? MOTIVO[t.bloqueo]
                        : porRecurso ? `${t.libres.length} de ${t.libres.length + t.ocupados.length} máquinas`
                        : "Disponible"}
                      {!t.bloqueo && quien ? ` · tomado por ${quien}` : ""}
                    </i>
                    {!t.bloqueo && <span className="radio" aria-hidden="true" />}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="regla">
            Hasta {REGLAS.topePorEspacio} reservas por espacio · se puede reservar
            con {REGLAS.ventanaDias} días de anticipación.
          </p>

          {lista.every((t) => t.bloqueo) && (
            <Aviso icono="info">
              {diaEnPalabras(dia)} no queda ningún turno de {espacio.nombre}. Probá otro día
              en el calendario o cambiá de espacio.
            </Aviso>
          )}
        </div>
      )}

      {/* Explorá los espacios: abajo, como algo agregado, con foto a sangre.
          La disponibilidad que muestran es la del día que estás mirando en
          el calendario. Si dijeran siempre "hoy", a las siete de la tarde
          las cuatro cards dicen "sin lugar" mientras arriba el calendario
          muestra otro día con lugar de sobra. */}
      <div className="subtit"><h2>Explorá los espacios</h2></div>
      <p className="bajada">
        Lo que tiene este edificio, con su disponibilidad
        {dia ? ` del ${diaEnPalabras(dia)}` : " de hoy"}.
      </p>
      <div className="dos">
        {ESPACIOS.map((e) => {
          const cuando = dia ?? diaCon(0);
          const cupo = cupoDelDia(e, cuando, estado.reservas);
          /* Si el día que estás mirando está lleno, la card no se queda en
             "sin lugar": dice cuándo sí. Un cartel que sólo dice que no se
             puede es la mitad de la respuesta. */
          const proximo = cupo > 0 ? null : proximoLibre(e, cuando, estado.reservas);
          const texto = cupo > 0
            ? (cupo === 1 ? "1 turno libre" : `${cupo} turnos libres`)
            : proximo
            ? `libre ${diaEnPalabras(proximo).toLowerCase()}`
            : "sin turnos por ahora";
          return (
            <button className="esp mat-foto" type="button" key={e.id} onClick={() => ir("r13", e.id)}>
              <img src={e.img} alt="" />
              <span className="sobre">
                <span className="tx">
                  <b>{e.nombre}</b>
                  <i>{e.piso} · {texto}</i>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button className="fila aire" type="button" onClick={() => ir("r18")} style={{ marginTop: 14 }}>
        <span className="ic"><Icon n="calendario" s={24} w={1.8} /></span>
        <span className="cu">
          <span className="t">Mis reservas</span>
          <span className="m">{mias === 1 ? "1 próxima" : `${mias} próximas`} · historial del edificio</span>
        </span>
        <span className="flech"><Icon n="chevron" s={17} w={2.1} /></span>
      </button>

      {/* Elegiste la franja: sube la hoja. No hace falta una pantalla
          entera para confirmar tres datos. */}
      {turnoElegido && elegido && dia && (
        <Hoja
          titulo={`${espacio.nombre} · ${diaEnPalabras(dia)}`}
          onCancelar={() => setElegido(null)}
          sinAcciones
        >
          <div className="resumen-hoja">
            <span className="k">Franja</span>
            <b>{rango(turnoElegido.franja)}</b>
          </div>

          {porRecurso && (
            <>
              <span className="et-hoja">Elegí la máquina</span>
              <div className="maquinas">
                {turnoElegido.libres.map((r) => (
                  <button key={r.id} type="button"
                    aria-pressed={elegido.recurso.id === r.id}
                    onClick={() => setElegido({ n: elegido.n, recurso: r })}>
                    {r.nombre}
                  </button>
                ))}
                {turnoElegido.ocupaciones.map((o) => (
                  <span key={o.recurso.id} className="tomada">
                    {o.recurso.nombre} · {o.unidad}
                  </span>
                ))}
              </div>
            </>
          )}

          <ul className="reglas-hoja">
            {espacio.reglas.map((r) => <li key={r}>{r}</li>)}
          </ul>

          <div style={{ marginTop: 18, marginBottom: 20 }}>
            <SwipeButton rotulo="Deslizá para confirmar" pista="Deslizá" onConfirm={confirmar} />
          </div>
        </Hoja>
      )}
    </div>
  );
}
