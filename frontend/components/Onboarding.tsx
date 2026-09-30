"use client";
import { useEffect, useState } from "react";
import { ONBOARDING } from "@/lib/data";
import { SwipeButton } from "./ui/SwipeButton";

/** El onboarding no se toca: corre solo, con un fundido lento. El usuario
 *  mira, y cuando quiere entra. Los puntos son indicador, no control. */
const INTERVALO = 5200;

export function Onboarding({ onTerminar }: { onTerminar: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(
      () => setI((v) => (v + 1) % ONBOARDING.length),
      INTERVALO
    );
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="screen onb" aria-label="Presentación del producto">
      {/* el lockup va siempre sobre foto oscura, así que usa la versión
          para fondo oscuro en los dos temas */}
      <div className="onb-top">
        <img src="/brand/CT_LOGO_DARK_V2.png" alt="CondoTrack" />
      </div>

      <div className="mosaico" aria-hidden="true">
        {ONBOARDING.map((s, n) => (
          <figure key={s.img} data-on={n === i ? "1" : "0"}>
            <img src={s.img} alt="" />
          </figure>
        ))}
      </div>

      <div className="onb-txt" aria-live="polite">
        {ONBOARDING.map((s, n) => (
          <div className="par" key={s.h} data-on={n === i ? "1" : "0"} aria-hidden={n !== i}>
            <h1>{s.h}</h1>
            <p>{s.p}</p>
          </div>
        ))}
      </div>

      <div className="onb-foot">
        <div className="puntos" aria-hidden="true">
          {ONBOARDING.map((s, n) => (
            <span key={s.img} data-on={n === i ? "1" : "0"} />
          ))}
        </div>
        <SwipeButton rotulo="Empezar" onConfirm={onTerminar} />
      </div>
    </section>
  );
}
