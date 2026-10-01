/** @type {import('next').NextConfig} */

/* Sello de build: se evalúa cuando Next carga esta config, o sea una vez por
   build. Se muestra en la barra del escenario para saber de un vistazo si lo
   que estás mirando es lo último o un deploy viejo. */
const sello = new Date().toLocaleString("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
});

const nextConfig = {
  reactStrictMode: true,
  /* CT_DIST_DIR permite correr un `next dev` de QA sin pisar el .next de un
     `next start` que ya esté sirviendo el build (por defecto, .next). */
  distDir: process.env.CT_DIST_DIR || ".next",
  env: { NEXT_PUBLIC_BUILD: sello },
};
export default nextConfig;
