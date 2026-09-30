import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CondoTrack · Prototipo",
  description: "Prototipo navegable del bloque residente de CondoTrack.",
  icons: {
    icon: "/brand/CT_APPICON_V2.png",
    apple: "/brand/CT_APPLE_TOUCH_V2.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F5F1" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1210" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        {/* Satoshi, de Fontshare (Indian Type Foundry). Cuatro pesos estáticos,
            uno por rol: 400 cuerpo, 500 labels y navegación, 700 botones y
            titulares, 900 importes. No hay itálicas en el pedido —si alguna
            regla las pide, el navegador las sintetiza y se ve mal; usar peso,
            no inclinación. Mientras dure el prototipo va por CDN; para
            producción conviene bajar los .woff2 y servirlos con next/font. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@400,500,700,900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
