import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Divisor de gastos",
  manifest: "/manifests/gastos.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Gastos",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/gastos/icon-180.png",
    icon: "/icons/gastos/icon-192.png",
  },
};

export default function GastosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
