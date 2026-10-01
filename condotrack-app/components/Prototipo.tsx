"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Onboarding } from "./Onboarding";
import { Login } from "./Login";
import { Recuperar } from "./Recuperar";
import { ReceptionLoading } from "./recepcion/ReceptionLoading";
import { Carga } from "./Carga";
import { ShellResidente } from "./ShellResidente";
import { ShellRecepcion } from "./ShellRecepcion";
import { ShellAdmin } from "./ShellAdmin";
import { TemaToggle } from "./ui/TemaToggle";
import { Sello } from "./ui/Sello";
import { ScrollSuave } from "./sistema/ScrollSuave";
import { ProveedorEstado } from "@/lib/estado";
import { modoDeUrl } from "@/lib/movimiento";
import { CtxNavegacion } from "@/lib/navegacion";
import {
  ROTULOS, ROTULOS_A, ROTULOS_P,
  type Perfil, type Vista, type VistaA, type VistaP,
} from "@/lib/data";

const CLAVE = "condotrack:onboarding-visto";
const CLAVE_MOV = "condotrack:movimiento-demo";
type Pantalla = "onb" | "login" | "recuperar" | "carga" | "app";

function leer(k: string) { try { return localStorage.getItem(k); } catch { return null; } }

const PANTALLAS: Pantalla[] = ["onb", "login", "recuperar", "carga", "app"];
const VISTAS = Object.keys(ROTULOS) as Vista[];
const VISTAS_P = Object.keys(ROTULOS_P) as VistaP[];
const VISTAS_A = Object.keys(ROTULOS_A) as VistaA[];
const PERFILES: Perfil[] = ["residente", "recepcion", "administracion"];

/** Marco por perfil. Sale de 00_MASTER_UI_SYSTEM_LOCK: el residente es
 *  mobile-first, recepción tablet/desktop y administración desktop. */
const MARCO: Record<Perfil, { clase: string; medida: string }> = {
  residente: { clase: "", medida: "390 × 844" },
  recepcion: { clase: " ancho", medida: "1440 × 900" },
  administracion: { clase: " extra", medida: "1440 × 900" },
};

/* Enlace directo a una pantalla:
     ?p=app&v=r20&ref=rc1&tema=oscuro&limpio=1
     ?perfil=recepcion&p=app&v=p04
     ?perfil=administracion&p=app&v=a05&ref=7D
   Cada vista queda en su propia URL para poder importarla de a una
   (html.to.design y similares capturan una URL, no un estado interno).
   limpio=1 oculta la barra del escenario para que no entre en la captura.
   motionreduce=0 fuerza el movimiento normal, motionreduce=1 lo fuerza
   reducido; sin parámetro manda la preferencia del sistema (lib/movimiento). */
function deLaUrl() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const p = q.get("p") as Pantalla | null;
  const v = q.get("v");
  const perfil = q.get("perfil") as Perfil | null;
  return {
    pantalla: p && PANTALLAS.includes(p) ? p : null,
    vista: v && VISTAS.includes(v as Vista) ? (v as Vista) : null,
    vistaP: v && VISTAS_P.includes(v as VistaP) ? (v as VistaP) : null,
    vistaA: v && VISTAS_A.includes(v as VistaA) ? (v as VistaA) : null,
    refe: q.get("ref") ?? undefined,
    perfil: perfil && PERFILES.includes(perfil) ? perfil : null,
    tema: q.get("tema"),
    limpio: q.get("limpio") === "1",
    movimiento: modoDeUrl(q),
  };
}
function guardar(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* modo privado */ } }
function borrar(k: string) { try { localStorage.removeItem(k); } catch { /* modo privado */ } }

const ROTULO_PANTALLA: Partial<Record<Pantalla, string>> = {
  onb: "Onboarding",
  login: "G01 Inicio de sesión",
  recuperar: "G02 Recuperar acceso",
  carga: "Carga",
};

export function Prototipo() {
  const [pantalla, setPantalla] = useState<Pantalla>("onb");
  const [perfil, setPerfil] = useState<Perfil>("residente");
  const [vista, setVista] = useState<Vista>("r01");
  const [vistaP, setVistaP] = useState<VistaP>("p01");
  const [vistaA, setVistaA] = useState<VistaA>("a01");
  const [refe, setRefe] = useState<string | undefined>();
  const [limpio, setLimpio] = useState(false);
  /* Movimiento de la demo: el sistema de Felipe pide reducirlo y la app lo
     respeta, así que en revisión el motion no se veía. Este control de la
     barra del escenario (no de la app) lo fuerza sin tocar la URL. */
  const [mov, setMov] = useState<"sistema" | "forzado" | "reducido">("sistema");
  const cambiarMov = () => {
    const sig = mov === "sistema" ? "forzado" : mov === "forzado" ? "reducido" : "sistema";
    setMov(sig);
    if (sig === "sistema") { borrar(CLAVE_MOV); document.documentElement.removeAttribute("data-movimiento"); }
    else { guardar(CLAVE_MOV, sig); document.documentElement.setAttribute("data-movimiento", sig); }
  };

  // el onboarding no se repite en cada ingreso; la URL tiene prioridad
  useEffect(() => {
    const u = deLaUrl();
    if (u?.limpio) setLimpio(true);
    /* La URL manda; si no hay parámetro, la preferencia elegida en la barra
       de demo; si tampoco, el sistema operativo. */
    const pref = leer(CLAVE_MOV);
    const modo = u?.movimiento ?? (pref === "forzado" || pref === "reducido" ? pref : null);
    /* lo que pidió la URL queda como preferencia: Reiniciar demo o abrir la
       demo sin el parámetro ya no vuelve el movimiento al del sistema */
    if (u?.movimiento) guardar(CLAVE_MOV, u.movimiento);
    if (modo) document.documentElement.setAttribute("data-movimiento", modo);
    else document.documentElement.removeAttribute("data-movimiento");
    setMov(modo ?? "sistema");
    if (u?.tema === "claro" || u?.tema === "oscuro") {
      document.documentElement.setAttribute("data-tema", u.tema);
    }
    if (u?.perfil) setPerfil(u.perfil);
    if (u?.vista) setVista(u.vista);
    if (u?.vistaP) { setVistaP(u.vistaP); if (!u.perfil) setPerfil("recepcion"); }
    if (u?.vistaA) { setVistaA(u.vistaA); if (!u.perfil) setPerfil("administracion"); }
    if (u?.refe) { setRefe(u.refe); refeParaVolver.current = u.refe; }
    if (u?.pantalla) { setPantalla(u.pantalla); return; }
    if (leer(CLAVE)) setPantalla("login");
  }, []);

  /* Pila de navegación: sin esto, "volver" es un destino fijo por pantalla
     y no la pantalla anterior (BUG-02 y BUG-03). Guarda de dónde venías,
     no a dónde vas. Tope de 24: es un prototipo, no un navegador. */
  const [pila, setPila] = useState<{ v: string; ref?: string }[]>([]);
  const apilar = useCallback((actual: string, ref?: string) => {
    setPila((p) => [...p, { v: actual, ref }].slice(-24));
  }, []);

  /* Lo que se guarda en la pila al irse de una pantalla no es siempre el
     ref con el que se entró (lock V02, A4 y A5):
     · si la pantalla cambió de contexto adentro —elegiste Cowork en
       Reservas—, al volver tiene que estar Cowork, no el de la entrada;
     · si el ref era una orden de un solo uso —"pagar" abre la hoja—, al
       volver no se tiene que repetir.
     Cada pantalla lo corrige con reemplazarRef(). Es una ref y no estado a
     propósito: cambiarlo no re-renderiza ni mueve el scroll. Se asigna en
     el momento de navegar, antes de que la pantalla nueva monte, así su
     propio efecto puede pisarlo. */
  const refeParaVolver = useRef<string | undefined>(undefined);
  const reemplazarRef = useCallback((r?: string) => { refeParaVolver.current = r; }, []);

  const [direccion, setDireccion] = useState<"adelante" | "atras">("adelante");
  const ir = useCallback((v: Vista, ref?: string) => {
    if (v === vista && ref === refe) return;
    setDireccion("adelante");
    apilar(vista, refeParaVolver.current); refeParaVolver.current = ref;
    setVista(v); setRefe(ref);
  }, [vista, refe, apilar]);
  const irP = useCallback((v: VistaP, ref?: string) => {
    if (v === vistaP && ref === refe) return;
    apilar(vistaP, refeParaVolver.current); refeParaVolver.current = ref;
    setVistaP(v); setRefe(ref);
  }, [vistaP, refe, apilar]);
  const irA = useCallback((v: VistaA, ref?: string) => {
    if (v === vistaA && ref === refe) return;
    apilar(vistaA, refeParaVolver.current); refeParaVolver.current = ref;
    setVistaA(v); setRefe(ref);
  }, [vistaA, refe, apilar]);

  const volver = useCallback(() => {
    setDireccion("atras");
    setPila((p) => {
      const previa = p[p.length - 1];
      if (!previa) return p;
      if (perfil === "residente") setVista(previa.v as Vista);
      else if (perfil === "recepcion") setVistaP(previa.v as VistaP);
      else setVistaA(previa.v as VistaA);
      setRefe(previa.ref);
      refeParaVolver.current = previa.ref;
      return p.slice(0, -1);
    });
  }, [perfil]);

  /* RES-FIN-01 · salir de un flujo terminado. Después de "Pago informado",
     Volver no puede regresar al formulario: se vuelve hasta el origen. */
  const volverHasta = useCallback((v: string) => {
    setDireccion("atras");
    setPila((p) => {
      const i = p.map((x) => x.v).lastIndexOf(v);
      const destino = i >= 0 ? p[i] : { v, ref: undefined };
      if (perfil === "residente") setVista(destino.v as Vista);
      else if (perfil === "recepcion") setVistaP(destino.v as VistaP);
      else setVistaA(destino.v as VistaA);
      setRefe(destino.ref);
      refeParaVolver.current = destino.ref;
      return i >= 0 ? p.slice(0, i) : [];
    });
  }, [perfil]);
  const reemplazar = useCallback((v: string, ref?: string) => {
    setDireccion("adelante");
    refeParaVolver.current = ref;
    if (perfil === "residente") setVista(v as Vista);
    else if (perfil === "recepcion") setVistaP(v as VistaP);
    else setVistaA(v as VistaA);
    setRefe(ref);
  }, [perfil]);

  const navegacion = useMemo(
    () => ({ volver, hayVuelta: pila.length > 0, reemplazarRef, anterior: pila[pila.length - 1], volverHasta, reemplazar }),
    [volver, pila, reemplazarRef, volverHasta, reemplazar]);

  const entrar = useCallback((p: Perfil) => {
    setPerfil(p);
    setPantalla("carga");
    setRefe(undefined);
    setPila([]);
    refeParaVolver.current = undefined;
    // representa la resolución de sesión y contexto, sin demora inventada
    window.setTimeout(() => {
      if (p === "residente") setVista("r01");
      if (p === "recepcion") setVistaP("p01");
      if (p === "administracion") setVistaA("a01");
      setPantalla("app");
    }, 550);
  }, []);

  const salir = useCallback(() => setPantalla("login"), []);

  const rotulo =
    pantalla === "app"
      ? perfil === "residente" ? ROTULOS[vista]
        : perfil === "recepcion" ? ROTULOS_P[vistaP]
        : ROTULOS_A[vistaA]
      : ROTULO_PANTALLA[pantalla] ?? "";

  const marco = pantalla === "app" || (pantalla === "carga" && perfil !== "residente") ? MARCO[perfil] : MARCO.residente;

  return (
    <ProveedorEstado>
      <CtxNavegacion.Provider value={navegacion}>
      <main className="stage">
        {/* v05 · scroll suave (lerp) en las tres apps */}
        <ScrollSuave />
        {!limpio && <div className="stage-bar">
          <span>{rotulo} · {marco.medida}</span>
          <Sello />
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => { borrar(CLAVE); setPantalla("onb"); }}>
              Reiniciar demo
            </button>
            <button type="button" className="stage-mov" onClick={cambiarMov} aria-label={`Movimiento: ${mov === "sistema" ? "según el sistema" : mov === "forzado" ? "activado" : "reducido"}. Cambiar`}>
              Movimiento: {mov === "sistema" ? "sistema" : mov === "forzado" ? "activado" : "reducido"}
            </button>
            <TemaToggle />
          </span>
        </div>}

        <div className={"device" + marco.clase}>
          {pantalla === "onb" && (
            <Onboarding onTerminar={() => { guardar(CLAVE, "1"); setPantalla("login"); }} />
          )}
          {pantalla === "login" && (
            <Login onEntrar={entrar} onRecuperar={() => setPantalla("recuperar")} />
          )}
          {pantalla === "recuperar" && <Recuperar onVolver={() => setPantalla("login")} />}
          {pantalla === "carga" && (perfil === "residente" ? <Carga /> : <ReceptionLoading rol={perfil} />)}
          {pantalla === "app" && perfil === "residente" && (
            <ShellResidente vista={vista} refe={refe} ir={ir} onSalir={salir} direccion={direccion} />
          )}
          {pantalla === "app" && perfil === "recepcion" && (
            <ShellRecepcion vista={vistaP} refe={refe} ir={irP} onSalir={salir} onCambiarPerfil={entrar} />
          )}
          {pantalla === "app" && perfil === "administracion" && (
            <ShellAdmin vista={vistaA} refe={refe} ir={irA} onSalir={salir} onCambiarPerfil={entrar} />
          )}
        </div>
      </main>
      </CtxNavegacion.Provider>
    </ProveedorEstado>
  );
}
