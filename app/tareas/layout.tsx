import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista de tareas",
  manifest: "/manifests/tareas.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tareas",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/tareas/icon-180.png",
    icon: "/icons/tareas/icon-192.png",
  },
};

export default function TareasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
