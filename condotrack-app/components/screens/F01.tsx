"use client";
import { useMemo, useState } from "react";
import { TopBar } from "../ui/TopBar";
import { Icon } from "../ui/Icon";
import { Texto, Area, Segmentos, Interruptor, PieForm } from "../ui/Formulario";
import { Confirmacion, Aviso } from "../ui/Estados";
import {
  FRANJAS_VISITA, RESIDENTE, ROTULO_TIPO_VISITA,
  type TipoVisita, type Vista,
} from "@/lib/data";
import { dias, diaCorto, numDia, esHoy, mesCorto } from "@/lib/reservas";
import { nuevoCodigoPase, nuevoIdVisita, useApp } from "@/lib/estado";

/** F01 · Autorizar visita.
 *
 *  Es la pantalla que faltaba: hasta ahora había un botón para autorizar y
 *  no había a quién. Al confirmar se emite el pase, la visita entra en el
 *  historial de la unidad y recepción la ve en su pantalla. Las tres cosas
 *  pasan de verdad en el prototipo, no son un cartel. */

const TIPOS: { id: TipoVisita; rotulo: string }[] = [
  { id: "visita", rotulo: ROTULO_TIPO_VISITA.visita },
  { id: "proveedor", rotulo: ROTULO_TIPO_VISITA.proveedor },
  { id: "servicio", rotulo: ROTULO_TIPO_VISITA.servicio },
];

export function F01({ ir }: { ir: (v: Vista, ref?: string) => void }) {
  const { hacer } = useApp();
  const listaDias = useMemo(() => dias(), []);

  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [tipo, setTipo] = useState<TipoVisita>("visita");
  const [diaN, setDiaN] = useState(0);
  const [franjaId, setFranjaId] = useState(FRANJAS_VISITA[2].id);
  const [recurrente, setRecurrente] = useState(false);
  const [nota, setNota] = useState("");

  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState<{ codigo: string; cuando: string } | null>(null);

  const dia = listaDias[diaN];
  const franja = FRANJAS_VISITA.find((f) => f.id === franjaId)!;

  const errNombre =
    !nombre.trim() ? "Escribí el nombre y el apellido de quien va a entrar."
    : nombre.trim().length < 3 ? "El nombre es muy corto para que recepción lo identifique."
    : undefined;
  const errDoc =
    documento.trim() && !/^[\d.\s-]{6,12}$/.test(documento.trim())
      ? "El documento va sólo con números, puntos o guiones."
      : undefined;

  const hayError = Boolean(errNombre || errDoc);

  function confirmar() {
    setTocado(true);
    if (hayError) return;
    setEnviando(true);
    const codigo = nuevoCodigoPase();
    const cuando = `${esHoy(dia) ? "Hoy" : `${diaCorto(dia)} ${numDia(dia)} ${mesCorto(dia)}`} · ${franja.horario}`;

    /* La demora representa la emisión del pase del lado del servidor. */
    window.setTimeout(() => {
      hacer({
        t: "visita/crear",
        visita: {
          id: nuevoIdVisita(),
          nombre: nombre.trim(),
          documento: documento.trim() || undefined,
          tipo,
          horario: franja.horario,
          dia: esHoy(dia) ? undefined : `${diaCorto(dia)} ${numDia(dia)} ${mesCorto(dia)}`,
          fecha: dia.toISOString(),
          recurrente,
          nota: nota.trim() || undefined,
          estado: esHoy(dia) ? "vigente" : "programada",
          cuando: esHoy(dia) ? "hoy" : "proximas",
          codigo,
          creadaPor: RESIDENTE.nombre,
          creadaEl: new Date().toISOString(),
          unidad: RESIDENTE.unidad,
        },
      });
      setEnviando(false);
      setHecho({ codigo, cuando });
    }, 700);
  }

  if (hecho) {
    return (
      <div className="vista" id="f01">
        <TopBar volverA="r06" ir={ir} />
        <Confirmacion
          titulo="Visita autorizada"
          principal={nombre.trim()}
          secundario={`${hecho.cuando} · pase ${hecho.codigo}`}
          registro="Recepción ya la ve en su pantalla y la autorización quedó en el historial de tu unidad, con la hora y con tu nombre."
          accion="Ver el pase"
          onAccion={() => ir("r07")}
          alterna="Autorizar otra visita"
          onAlterna={() => {
            setHecho(null); setNombre(""); setDocumento(""); setNota("");
            setRecurrente(false); setTocado(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="vista" id="f01">
      <TopBar volverA="r06" ir={ir} />
      <div className="tit">
        <h1>Autorizar una visita</h1>
        <p>Emitimos el pase y avisamos a recepción.</p>
      </div>

      <Texto etiqueta="Nombre y apellido" valor={nombre} onCambio={setNombre}
        placeholder="Martín López" icono="persona"
        error={tocado ? errNombre : undefined}
        ayuda="Es lo que recepción va a ver cuando llegue." />

      <Texto etiqueta="Documento" valor={documento} onCambio={setDocumento} opcional
        placeholder="32.884.109" icono="credencial"
        error={tocado ? errDoc : undefined}
        ayuda="Ayuda a validar la identidad si el pase falla." />

      <Segmentos etiqueta="Tipo" valor={tipo} onCambio={setTipo} opciones={TIPOS} />

      {/* Tira de días deslizable: el mismo gesto que la de reservas. */}
      <div className="campo-f">
        <span className="et">Día</span>
        <div className="tira" role="radiogroup" aria-label="Elegí el día de la visita">
          {listaDias.map((d, n) => (
            <button key={n} type="button" role="radio" aria-checked={n === diaN}
              onClick={() => setDiaN(n)}>
              <i>{esHoy(d) ? "hoy" : diaCorto(d)}</i>
              <b>{numDia(d)}</b>
              <span className="cupo" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <Segmentos etiqueta="Franja horaria" valor={franjaId} onCambio={setFranjaId}
        opciones={FRANJAS_VISITA.map((f) => ({ id: f.id, rotulo: f.rotulo }))}
        ayuda={`${franja.horario}. El pase se activa 30 minutos antes.`} />

      <div style={{ marginTop: 14 }}>
        <Interruptor etiqueta="Se repite todas las semanas"
          ayuda="Se emite un pase por semana hasta que lo des de baja."
          valor={recurrente} onCambio={setRecurrente} />
      </div>

      <Area etiqueta="Nota para recepción" valor={nota} onCambio={setNota} opcional
        placeholder="Viene con herramientas, sube por el ascensor de servicio."
        filas={3} />

      {recurrente && (
        <Aviso icono="candado">
          Una visita que se repite todas las semanas se parece a un permiso permanente.
          La diferencia es que esta vence sola y la ves en Mis visitas; el permiso
          permanente no vence y vive en Mi unidad.
        </Aviso>
      )}

      {tocado && hayError && (
        <div className="alerta" role="alert" style={{ marginTop: 14 }}>
          <span style={{ flex: "none", color: "var(--error)" }}><Icon n="alerta" s={17} w={2} /></span>
          <p>Faltan datos para emitir el pase. Revisá lo que está marcado arriba.</p>
        </div>
      )}

      <PieForm
        accion="Autorizar y emitir el pase"
        deslizar
        onAccion={confirmar}
        onCancelar={() => ir("r06")}
        cargando={enviando}
        nota="Al confirmar, la autorización queda registrada en el historial de tu unidad con tu nombre y la hora."
      />
    </div>
  );
}
