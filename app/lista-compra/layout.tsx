import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista de la compra",
  manifest: "/manifests/lista-compra.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Compra",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/lista-compra/icon-180.png",
    icon: "/icons/lista-compra/icon-192.png",
  },
};

export default function ListaCompraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
