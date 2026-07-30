"use client";

import { useState } from "react";

export function CopyLinkButton({
  path,
  label = "Copiar enlace",
}: {
  path: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
    >
      {copied ? "Enlace copiado" : label}
    </button>
  );
}
