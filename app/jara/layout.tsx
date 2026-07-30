import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jara",
  manifest: "/manifests/jara.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Jara",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/jara/icon-180.png",
    icon: "/icons/jara/icon-192.png",
  },
};

export default function JaraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
