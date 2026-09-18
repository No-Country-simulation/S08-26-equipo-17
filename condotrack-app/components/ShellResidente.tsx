"use client";
import { useEffect, useRef } from "react";
import { PillNav } from "./ui/PillNav";
import { R01 } from "./screens/R01";
import { R02 } from "./screens/R02";
import { R03 } from "./screens/R03";
import { R05 } from "./screens/R05";
import { R06 } from "./screens/R06";
import { R07 } from "./screens/R07";
import { R08 } from "./screens/R08";
import { R09 } from "./screens/R09";
import { R13 } from "./screens/R13";
import { R14 } from "./screens/R14";
import { R15 } from "./screens/R15";
import { R16 } from "./screens/R16";
import { R17 } from "./screens/R17";
import { R18 } from "./screens/R18";
import { R19 } from "./screens/R19";
import { R20 } from "./screens/R20";
import { R21 } from "./screens/R21";
import { R22 } from "./screens/R22";
import { R23 } from "./screens/R23";
import { R24 } from "./screens/R24";
import { G10 } from "./screens/G10";
import { G11 } from "./screens/G11";
import { G15 } from "./screens/G15";
import { F01 } from "./screens/F01";
import { F02 } from "./screens/F02";
import { F03 } from "./screens/F03";
import { Mas } from "./screens/Mas";
import type { Vista } from "@/lib/data";

export function ShellResidente({
  vista, refe, ir, onSalir,
}: {
  vista: Vista;
  refe?: string;
  ir: (v: Vista, ref?: string) => void;
  onSalir: () => void;
}) {
  const caja = useRef<HTMLDivElement | null>(null);

  // cada cambio de vista arranca arriba
  useEffect(() => { caja.current?.querySelector(".vista")?.scrollTo(0, 0); }, [vista, refe]);

  return (
    <section className="screen" aria-label="CondoTrack residente" ref={caja}>
      {vista === "r01" && <R01 ir={ir} />}
      {vista === "r02" && <R02 ir={ir} />}
      {vista === "r03" && <R03 ir={ir} />}
      {vista === "r05" && <R05 ir={ir} />}
      {vista === "r06" && <R06 ir={ir} />}
      {vista === "r07" && <R07 ir={ir} refe={refe} />}
      {vista === "r08" && <R08 ir={ir} />}
      {vista === "r09" && <R09 ir={ir} />}
      {vista === "r13" && <R13 ir={ir} refe={refe} />}
      {vista === "r14" && <R14 ir={ir} />}
      {vista === "r15" && <R15 ir={ir} onSalir={onSalir} />}
      {vista === "r16" && <R16 ir={ir} refe={refe} />}
      {vista === "r17" && <R17 ir={ir} />}
      {vista === "r18" && <R18 ir={ir} />}
      {vista === "r19" && <R19 ir={ir} />}
      {vista === "r20" && <R20 ir={ir} />}
      {vista === "r21" && <R21 ir={ir} />}
      {vista === "r22" && <R22 ir={ir} />}
      {vista === "r23" && <R23 ir={ir} />}
      {vista === "r24" && <R24 ir={ir} />}
      {vista === "g10" && <G10 ir={ir} refe={refe} />}
      {vista === "g11" && <G11 ir={ir} refe={refe} />}
      {vista === "g15" && <G15 ir={ir} />}
      {vista === "f01" && <F01 ir={ir} />}
      {vista === "f02" && <F02 ir={ir} />}
      {vista === "f03" && <F03 ir={ir} />}
      {vista === "mas" && <Mas ir={ir} onSalir={onSalir} />}
      <PillNav actual={vista} ir={ir} />
    </section>
  );
}
