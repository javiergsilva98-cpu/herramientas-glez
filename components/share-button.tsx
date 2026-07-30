"use client";

import { useState } from "react";

export function ShareButton({
  path,
  title,
  text,
  light,
}: {
  path: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // El usuario ha cancelado el share sheet, no hacemos nada.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className={
        light
          ? "flex items-center gap-1 text-sm text-white/90 underline underline-offset-2 hover:text-white"
          : "flex items-center gap-1 text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
      }
    >
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
