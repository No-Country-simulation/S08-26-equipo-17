"use client";
import { useEffect, useState } from "react";
import { Icon, type NombreIcono } from "./Icon";

type Tema = "auto" | "claro" | "oscuro";
const CLAVE = "condotrack:tema";
const OPCIONES: { id: Tema; rotulo: string; icono: NombreIcono }[] = [
  { id: "auto",   rotulo: "Seguir al dispositivo", icono: "engranaje" },
  { id: "claro",  rotulo: "Tema claro",            icono: "sol" },
  { id: "oscuro", rotulo: "Tema oscuro",           icono: "luna" },
];

/** El tema sigue al dispositivo por defecto. El selector existe porque en
 *  algunos navegadores móviles el ajuste del sistema no llega a la página,
 *  y porque hay que poder mostrar los dos en una demo. */
export function TemaToggle() {
  const [tema, setTema] = useState<Tema>("auto");

  useEffect(() => {
    let guardado: Tema = "auto";
    try { guardado = (localStorage.getItem(CLAVE) as Tema) ?? "auto"; } catch { /* modo privado */ }
    aplicar(guardado);
    setTema(guardado);
  }, []);

  function aplicar(t: Tema) {
    const raiz = document.documentElement;
    if (t === "auto") raiz.removeAttribute("data-tema");
    else raiz.setAttribute("data-tema", t);
    try { localStorage.setItem(CLAVE, t); } catch { /* modo privado */ }
  }

  function elegir(t: Tema) { setTema(t); aplicar(t); }

  return (
    <div className="tema" role="group" aria-label="Tema de la interfaz">
      {OPCIONES.map((o) => (
        <button key={o.id} type="button" aria-pressed={tema === o.id} title={o.rotulo}
          aria-label={o.rotulo} onClick={() => elegir(o.id)}>
          <Icon n={o.icono} s={14} w={1.9} />
        </button>
      ))}
    </div>
  );
}
