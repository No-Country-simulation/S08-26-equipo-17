"use client";
import { useEffect, useRef } from "react";
import { useSinMovimiento } from "@/lib/movimiento";

/** R05-03 · Fondo shader (WebGL).
 *
 *  Un degradé de malla vivo: tres focos de luz —uno con el amarillo de la
 *  marca, uno cálido y uno salvia— que se mueven muy lento sobre el color
 *  de la página, con la trama deformada como tela y un grano fino. Va
 *  detrás del título y del calendario y se funde con la página hacia abajo
 *  (máscara en CSS), así el texto se lee igual que sobre el fondo liso.
 *
 *  · Se dibuja a 3/4 de resolución (el degradé es suave: no se nota) y a
 *    30 cuadros por segundo; se pausa fuera de la vista o con la pestaña
 *    oculta.
 *  · Con movimiento reducido dibuja un solo cuadro quieto.
 *  · Sin WebGL no dibuja nada y queda la luz ambiente en CSS de antes. */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_base;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;
uniform float u_grano;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  uv.y=1.0-uv.y;
  float ar=u_res.x/u_res.y;
  vec2 q=vec2(uv.x*ar,uv.y);
  float t=u_t*0.05;
  q+=0.07*vec2(sin(q.y*4.2+t*3.1),cos(q.x*3.6-t*2.4));
  q+=0.03*vec2(sin(q.y*9.0-t*1.7),cos(q.x*8.0+t*1.9));
  vec2 a=vec2(ar*(0.86+0.08*sin(t*1.7)),0.12+0.07*cos(t*1.3));
  vec2 b=vec2(ar*(0.06+0.10*cos(t*1.1)),0.40+0.09*sin(t*1.5));
  vec2 c=vec2(ar*(0.52+0.22*sin(t*0.9)),0.70+0.08*cos(t*1.2));
  float wa=1.0/(pow(distance(q,a),2.4)+0.030);
  float wb=1.0/(pow(distance(q,b),2.4)+0.045);
  float wc=1.0/(pow(distance(q,c),2.4)+0.060);
  float w0=9.0;
  vec3 col=(u_base*w0+u_a*wa+u_b*wb+u_c*wc)/(w0+wa+wb+wc);
  col+=(hash(gl_FragCoord.xy+fract(u_t*0.37)*91.0)-0.5)*u_grano;
  gl_FragColor=vec4(col,1.0);
}`;

type Paleta = { base: number[]; a: number[]; b: number[]; c: number[]; grano: number };

const hex = (h: string) => {
  const m = h.trim().replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((x) => x + x).join("") : m, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function paletaActual(el: HTMLElement): Paleta {
  const fondo = getComputedStyle(el).getPropertyValue("--fondo") || "#F1F2ED";
  const base = hex(fondo);
  const oscuro = base[0] + base[1] + base[2] < 1.2;
  return oscuro
    ? { base, a: hex("#3A3612"), b: hex("#33291B"), c: hex("#1B2620"), grano: 0.035 }
    : { base, a: hex("#F1E7A4"), b: hex("#EAD7B6"), c: hex("#CCD7C8"), grano: 0.03 };
}

export function FondoShader({ className = "fondo-shader" }: { className?: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const quieto = useSinMovimiento();

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const sh = (tipo: number, src: string) => {
      const s = gl.createShader(tipo)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("u_res"), uT = u("u_t"), uBase = u("u_base"), uA = u("u_a"), uB = u("u_b"), uC = u("u_c"), uG = u("u_grano");

    let pal = paletaActual(cv);
    const ponerPaleta = () => {
      pal = paletaActual(cv);
      gl.uniform3fv(uBase, pal.base); gl.uniform3fv(uA, pal.a);
      gl.uniform3fv(uB, pal.b); gl.uniform3fv(uC, pal.c); gl.uniform1f(uG, pal.grano);
    };
    const medir = () => {
      const k = 0.75;
      const w = Math.max(1, Math.round(cv.clientWidth * k)), h = Math.max(1, Math.round(cv.clientHeight * k));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    const t0 = performance.now();
    /* arranca en un punto de la animación con buena composición */
    const desfase = 18;
    const dibujar = (ahora: number) => {
      gl.uniform1f(uT, desfase + (quieto ? 0 : (ahora - t0) / 1000));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    ponerPaleta(); medir(); dibujar(t0);
    cv.classList.add("vivo");
    cv.closest(".vista")?.classList.add("con-shader");

    let raf = 0, ultimo = 0, visible = true;
    const cuadro = (ahora: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (ahora - ultimo >= 33) { ultimo = ahora; dibujar(ahora); }
      raf = requestAnimationFrame(cuadro);
    };
    const seguir = () => { if (!quieto && !raf) raf = requestAnimationFrame(cuadro); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) seguir(); });
    io.observe(cv);
    const ro = new ResizeObserver(() => { medir(); dibujar(performance.now()); });
    ro.observe(cv);
    /* el tema puede cambiar con la pantalla abierta */
    const mo = new MutationObserver(() => { ponerPaleta(); dibujar(performance.now()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const alEsquema = () => { ponerPaleta(); dibujar(performance.now()); };
    mq.addEventListener("change", alEsquema);
    const alVisibilidad = () => seguir();
    document.addEventListener("visibilitychange", alVisibilidad);
    seguir();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      mq.removeEventListener("change", alEsquema);
      document.removeEventListener("visibilitychange", alVisibilidad);
      cv.classList.remove("vivo");
      cv.closest(".vista")?.classList.remove("con-shader");
      /* sin loseContext: en desarrollo React monta dos veces y un contexto
         perdido no vuelve; el lienzo se libera solo al desmontarse */
    };
  }, [quieto]);

  /* con otra clave, un lienzo nuevo: un contexto WebGL perdido no se reusa */
  return <canvas key={quieto ? "q" : "m"} ref={lienzo} className={className} aria-hidden="true" />;
}
