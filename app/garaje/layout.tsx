import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garaje",
  manifest: "/manifests/garaje.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Garaje",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/garaje/icon-180.png",
    icon: "/icons/garaje/icon-192.png",
  },
};

export default function GarajeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
