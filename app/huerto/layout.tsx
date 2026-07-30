import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tareas del huerto",
  manifest: "/manifests/huerto.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Huerto",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/huerto/icon-180.png",
    icon: "/icons/huerto/icon-192.png",
  },
};

export default function HuertoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
