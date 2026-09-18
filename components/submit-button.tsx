"use client";

import { useFormStatus } from "react-dom";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: React.ReactNode;
};

/**
 * Botón de envío que se desactiva en cuanto se pulsa (useFormStatus refleja
 * el estado "pending" antes de que vuelva la respuesta del servidor), para
 * que un doble clic en una acción lenta no la dispare dos veces.
 */
export function SubmitButton({
  children,
  pendingText,
  className = "",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
