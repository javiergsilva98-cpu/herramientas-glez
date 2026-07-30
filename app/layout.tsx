import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Herramientas Glez",
  description: "Herramientas personales para el día a día",
  manifest: "/manifests/home.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Herramientas Glez",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/home/icon-180.png",
    icon: "/icons/home/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#334155",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
