"use client";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { TopBar } from "../ui/TopBar";
import { Copiar } from "../ui/Descarga";
import { Hoja } from "../ui/Hoja";
import { Vacio } from "../ui/Vacio";
import { Aviso } from "../ui/Estados";
import { type Vista } from "@/lib/data";
import { diaEnPalabras } from "@/lib/reservas";
import { useApp } from "@/lib/estado";

/** Matriz de demostración: geometría de QR (tres patrones de posición y
 *  módulos deterministas a partir del código del pase). No codifica datos
 *  reales — el pase real lo emite el backend. */
function matriz(semilla: number, n = 25) {
  const m: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  let s = semilla;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rnd() < 0.46;
  const limpiar = (fx: number, fy: number) => {
    for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) {
      const py = fy + y, px = fx + x;
      if (py >= 0 && py < n && px >= 0 && px < n) m[py][px] = false;
    }
  };
  const finder = (fx: number, fy: number) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const borde = x === 0 || y === 0 || x === 6 || y === 6;
      const centro = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[fy + y][fx + x] = borde || centro;
    }
  };
  limpiar(0, 0); limpiar(n - 7, 0); limpiar(0, n - 7);
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return m;
}

const semillaDe = (codigo: string) =>
  [...codigo].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);

export function R07({ ir, refe }: { ir: (v: Vista, r?: string) => void; refe?: string }) {
  const { estado, hacer } = useApp();
  const [revocar, setRevocar] = useState(false);

  const vigentes = estado.visitas.filter((v) => v.estado === "vigente" || v.estado === "programada");
  const v = estado.visitas.find((x) => x.id === refe) ?? vigentes[0];

  if (!v) {
    return (
      <div className="vista" id="r07">
        <TopBar volverA="r06" ir={ir} />
        <div className="tit"><h1>Pase de acceso</h1><p>Mostralo en recepción o en el lector de la entrada.</p></div>
        <Vacio icono="qr" titulo="No hay ningún pase vigente"
          texto="Autorizá una visita y el pase queda disponible en el momento."
          accion="Autorizar visita" onAccion={() => ir("f01")} />
      </div>
    );
  }

  const M = matriz(semillaDe(v.codigo));

  return (
    <div className="vista" id="r07">
      <TopBar volverA="r06" ir={ir} />
      <div className="tit"><h1>Pase de acceso</h1><p>Mostralo en recepción o en el lector de la entrada.</p></div>

      <div className="pase mat-carbon">
        <div className="et">Visita autorizada</div>
        <h2>{v.nombre}</h2>
        <div className="meta">
          {v.dia ? `${v.dia} · ${v.horario}` : `${diaEnPalabras(new Date(v.fecha))} · ${v.horario}`}
          {" · Unidad "}{v.unidad}
        </div>

        <div className="qr">
          <svg viewBox={`0 0 ${M.length} ${M.length}`} role="img"
            aria-label={`Código del pase ${v.codigo}`}>
            <rect width={M.length} height={M.length} fill="#ffffff" />
            {M.map((fila, y) =>
              fila.map((on, x) =>
                on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#111614" /> : null
              )
            )}
          </svg>
        </div>

        <div className="codigo">{v.codigo}</div>
        <div className="vence">El pase se activa 30 minutos antes y vence al terminar la franja.</div>
      </div>

      <div className="acciones">
        <button className="prim" type="button"><Icon n="flechaDiag" s={18} w={2.1} />Compartir</button>
        <button className="sec" type="button" onClick={() => setRevocar(true)}>
          <Icon n="alerta" s={18} w={1.9} />Dar de baja
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <Copiar valor={v.codigo} etiqueta="el código del pase" />
      </div>

      {vigentes.length > 1 && (
        <>
          <div className="subtit"><h2>Otros pases</h2><span>{vigentes.length - 1}</span></div>
          <div className="menu">
            {vigentes.filter((x) => x.id !== v.id).map((x) => (
              <button key={x.id} type="button" onClick={() => ir("r07", x.id)}>
                <span className="ic"><Icon n="qr" s={19} w={1.8} /></span>
                <span className="d">
                  <b>{x.nombre}</b>
                  <i>{x.dia ? `${x.dia} · ${x.horario}` : `${diaEnPalabras(new Date(x.fecha))} · ${x.horario}`}</i>
                </span>
                <span className="flech"><Icon n="chevron" s={16} w={2.1} /></span>
              </button>
            ))}
          </div>
        </>
      )}

      <Aviso icono="info">
        Validar el pase no registra el ingreso. Recepción primero verifica que la
        autorización esté vigente y después registra la entrada: son dos acciones
        distintas y las dos quedan en el historial de la unidad.
      </Aviso>

      {revocar && (
        <Hoja
          titulo={`Dar de baja el pase de ${v.nombre}`}
          texto="El código deja de servir enseguida. Si la visita llega igual, recepción va a ver que la autorización está dada de baja."
          confirmar="Dar de baja"
          peligro
          onConfirmar={() => { hacer({ t: "visita/cancelar", id: v.id }); setRevocar(false); ir("r06"); }}
          onCancelar={() => setRevocar(false)}
        />
      )}
    </div>
  );
}
