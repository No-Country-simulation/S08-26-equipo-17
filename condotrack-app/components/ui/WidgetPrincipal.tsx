"use client";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useIndicador } from "../sistema/useIndicador";
import { Icon, type NombreIcono } from "./Icon";

/** Primary Context Widget (ronda visual 01, §4).
 *
 *  No es una card: es el campo. Vive adentro de la zona oscura de arriba
 *  del home, y la cifra se apoya directo sobre ella, centrada, sin caja.
 *
 *  Cada cara responde UNA pregunta y trae UNA acción primaria:
 *    Expensas → cuánto debo, cuándo vence, qué hago
 *    Visitas  → cuántas, cuál es el pase que importa
 *    Entregas → qué tengo para retirar
 *    Reservas → cuál es la próxima
 *  Debajo, a lo sumo dos enlaces. Nada de métricas sueltas: los
 *  subtotales y porcentajes viven en el detalle (§5.2).
 *
 *  Los tabs son un control segmentado en vidrio, que acá sí tiene algo
 *  detrás (§1.5). Lo activo se marca con relleno y peso, no con amarillo:
 *  el amarillo es de la acción. */

export type EstadoWidget = {
  id: string;
  rotulo: string;
  volanta: string;
  titular: ReactNode;
  /** Un control junto al titular (el ojo de privacidad del importe). */
  accesorio?: ReactNode;
  /** El titular es un nombre y no una cifra: baja un escalón. */
  titularTexto?: boolean;
  detalle?: string;
  /* DEC-003 · RES-004. La pastilla es METADATA de estado, no un botón: sin
     relleno, sin borde, sin radio. `tono` separa estado de severidad, que
     es lo que pide SYS-STATUS: el texto dice qué pasa y el punto dice
     cuánto importa, y en escala de grises se sigue entendiendo porque la
     etiqueta va primero. */
  pastilla?: { texto: string; icono?: NombreIcono; apagada?: boolean;
    tono?: "vencida" | "ok" | "curso" };
  /** `acento`: la única acción amarilla del bloque (RES-HOME-02 · Pagar). */
  primaria?: { rotulo: string; icono?: NombreIcono; onIr: () => void; acento?: boolean };
  /** Hasta dos. El tercero no se muestra. */
  enlaces?: { rotulo: string; icono?: NombreIcono; onIr: () => void }[];
};

const RECORDADA = new Map<string, number>();

export function WidgetPrincipal({
  estados,
  etiqueta = "Estado de tu unidad",
  inicial = 0,
  memoria,
}: {
  estados: EstadoWidget[];
  etiqueta?: string;
  inicial?: number;
  /** Clave para recordar la categoría elegida al volver a la pantalla. */
  memoria?: string;
}) {
  const [n, setN] = useState(() =>
    Math.min(memoria ? RECORDADA.get(memoria) ?? inicial : inicial, Math.max(0, estados.length - 1)));
  const [cruce, setCruce] = useState("");
  const tabs = useRef<HTMLDivElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  /* SYS-SELECT · un indicador que se traslada a la pestaña activa y se
     queda un 3 % más grande mientras lo está. Tap, swipe y teclado pasan
     por el mismo `elegir`: no hay dos estados de selección. */
  const { medido, estilo } = useIndicador(tabs, '[aria-selected="true"]', [n, estados.length]);
  if (estados.length === 0) return null;
  const act = estados[Math.min(n, estados.length - 1)];

  function elegir(i: number, foco = false) {
    const j = Math.max(0, Math.min(estados.length - 1, i));
    if (j !== n) setCruce(j > n ? "cruza-izq" : "cruza-der");
    setN(j);
    if (memoria) RECORDADA.set(memoria, j);
    if (foco) tabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[j]?.focus();
  }
  function tecla(e: KeyboardEvent<HTMLButtonElement>) {
    const u = estados.length - 1;
    const j = e.key === "ArrowRight" ? (n + 1 > u ? 0 : n + 1) : e.key === "ArrowLeft" ? (n - 1 < 0 ? u : n - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? u : -1;
    if (j < 0) return;
    e.preventDefault();
    elegir(j, true);
  }
  /* Swipe horizontal sobre la cifra: más de 48 px y más horizontal que
     vertical, para no pelear con el scroll de la página. */
  function soltar(e: PointerEvent<HTMLDivElement>) {
    const t = toque.current; toque.current = null;
    if (!t || e.pointerType === "mouse") return;
    const dx = e.clientX - t.x, dy = e.clientY - t.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) elegir(dx < 0 ? n + 1 : n - 1);
  }

  return (
    <section className="widget en-campo" aria-label={etiqueta}>
      <div ref={tabs} className={"widget-tabs" + (medido ? " con-ind" : "")} role="tablist"
        aria-label={etiqueta} style={estilo}>
        <span className="widget-ind" aria-hidden="true" />
        {estados.map((e, i) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            id={"wt-" + e.id}
            aria-selected={i === n}
            aria-controls={"wp-" + e.id}
            tabIndex={i === n ? 0 : -1}
            onKeyDown={tecla}
            onClick={() => elegir(i)}
          >
            {e.rotulo}
          </button>
        ))}
      </div>

      <div key={act.id} className={"widget-panel " + cruce} role="tabpanel"
        id={"wp-" + act.id} aria-labelledby={"wt-" + act.id} tabIndex={0}
        onPointerDown={(e) => { toque.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={soltar} onPointerCancel={() => { toque.current = null; }}>
        {act.volanta && <span className="vol">{act.volanta}</span>}
        <span className="cifra-fila">
          <b className={"cifra" + (act.titularTexto ? " texto" : "")}>{act.titular}</b>
          {act.accesorio}
        </span>

        {(act.detalle || act.pastilla) && (
          <span className="det">
            {act.detalle && <span>{act.detalle}</span>}
            {act.pastilla && (
              <span className={"pastilla"
                + (act.pastilla.apagada ? " gris" : "")
                + (act.pastilla.tono ? " " + act.pastilla.tono : "")}>
                {act.pastilla.icono && <Icon n={act.pastilla.icono} s={12} />}
                {act.pastilla.texto}
              </span>
            )}
          </span>
        )}

        {act.primaria && (
          <button className={"entrar compacto" + (act.primaria.acento ? " acento" : "")} type="button" onClick={act.primaria.onIr}>
            {act.primaria.icono && <Icon n={act.primaria.icono} s={20} />}
            {act.primaria.rotulo}
          </button>
        )}

        {act.enlaces && act.enlaces.length > 0 && (
          <span className="widget-enlaces">
            {act.enlaces.slice(0, 2).map((e) => (
              <button key={e.rotulo} className="btn-sec claro" type="button" onClick={e.onIr}>
                {e.icono && <Icon n={e.icono} s={16} />}
                {e.rotulo}
              </button>
            ))}
          </span>
        )}
      </div>
    </section>
  );
}
