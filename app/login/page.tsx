import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { PasswordLoginForm } from "./password-login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Herramientas Glez</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        o con contraseña
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <Suspense>
        <PasswordLoginForm />
      </Suspense>
    </main>
  );
}
