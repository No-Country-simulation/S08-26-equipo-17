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
  env: { NEXT_PUBLIC_BUILD: sello },
};
export default nextConfig;
