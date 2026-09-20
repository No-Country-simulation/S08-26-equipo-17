"use client";
import { useMemo, useRef, useState } from "react";
import { TopBar } from "../ui/TopBar";
import { Icon } from "../ui/Icon";
import { Texto, Area, Segmentos, Interruptor, PieForm } from "../ui/Formulario";
import { Panel } from "../ui/Panel";
import { Confirmacion } from "../ui/Estados";
import {
  FRANJAS_VISITA, RESIDENTE, ROTULO_TIPO_VISITA,
  type TipoVisita, type Vista,
} from "@/lib/data";
import { dias, diaCorto, numDia, esHoy, mesCorto } from "@/lib/reservas";
import { nuevoCodigoPase, nuevoIdVisita, useApp } from "@/lib/estado";

/** F01 · Autorizar visita (lock V02).
 *
 *  Tres datos a la vista: quién, qué día, en qué horario. Documento, tipo,
 *  si se repite y la nota para recepción van plegados en "Más datos": son
 *  opcionales y casi nunca cambian.
 *
 *  Al confirmar se emite el pase, la visita entra en el historial de la
 *  unidad y recepción la ve en su pantalla. Las tres cosas pasan de verdad
 *  en el prototipo, no son un cartel. */

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
  /* "Más datos" se abre solo si hay un error adentro, y queda abierto. */
  const [masAbierto, setMasAbierto] = useState(false);

  const [tocado, setTocado] = useState(false);

  /* La tira de días se arrastra también con el mouse. El gesto se toma
     recién a los 8 px, así un toque sigue eligiendo el día. */
  const arrastreTira = useRef<{ x: number; scroll: number; activo: boolean } | null>(null);
  const arrastroTira = useRef(false);
  function tomarTira(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;   // el touch ya scrollea nativo
    arrastreTira.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft, activo: false };
    arrastroTira.current = false;
  }
  function moverTira(e: React.PointerEvent<HTMLDivElement>) {
    const g = arrastreTira.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.activo) {
      if (Math.abs(dx) < 8) return;
      g.activo = true; arrastroTira.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.scrollSnapType = "none";
    }
    e.currentTarget.scrollLeft = g.scroll - dx;
  }
  function soltarTira(e: React.PointerEvent<HTMLDivElement>) {
    const g = arrastreTira.current;
    arrastreTira.current = null;
    if (g?.activo && e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.scrollSnapType = "";
  }
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
    if (errDoc) setMasAbierto(true);
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
      <div className="tit"><h1>Autorizar una visita</h1></div>

      <Texto etiqueta="Nombre y apellido" valor={nombre} onCambio={setNombre}
        placeholder="Martín López" icono="persona"
        error={tocado ? errNombre : undefined} />

      <div className="campo-f">
        <span className="et">Día</span>
        <div className="tira" role="radiogroup" aria-label="Elegí el día de la visita"
          onPointerDown={tomarTira} onPointerMove={moverTira}
          onPointerUp={soltarTira} onPointerCancel={soltarTira}
          onClickCapture={(e) => {
            if (arrastroTira.current) { e.preventDefault(); e.stopPropagation(); arrastroTira.current = false; }
          }}>
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

      <Segmentos etiqueta="Horario" valor={franjaId} onCambio={setFranjaId}
        opciones={FRANJAS_VISITA.map((f) => ({ id: f.id, rotulo: f.rotulo }))}
        ayuda={franja.horario} />

      <div className="mas-datos">
        <Panel key={masAbierto ? "abierto" : "cerrado"} abiertoPorDefecto={masAbierto}
          titulo="Más datos"
          resumen={[ROTULO_TIPO_VISITA[tipo], documento.trim() && "DNI " + documento.trim(),
            recurrente && "Todas las semanas", nota.trim() && "Con nota"].filter(Boolean).join(" · ")}>
          <Texto etiqueta="Documento" valor={documento} onCambio={setDocumento} opcional
            placeholder="32.884.109" icono="credencial"
            error={tocado ? errDoc : undefined} />
          <Segmentos etiqueta="Tipo" valor={tipo} onCambio={setTipo} opciones={TIPOS} />
          <div style={{ marginTop: 14 }}>
            <Interruptor etiqueta="Se repite todas las semanas"
              valor={recurrente} onCambio={setRecurrente} />
          </div>
          <Area etiqueta="Nota para recepción" valor={nota} onCambio={setNota} opcional
            placeholder="Viene con herramientas." filas={3} />
        </Panel>
      </div>

      <PieForm
        accion="Autorizar visita"
        onAccion={confirmar}
        onCancelar={() => ir("r06")}
        cargando={enviando}
      />
    </div>
  );
}
