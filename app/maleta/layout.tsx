import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maleta",
  manifest: "/manifests/maleta.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Maleta",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/maleta/icon-180.png",
    icon: "/icons/maleta/icon-192.png",
  },
};

export default function MaletaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
