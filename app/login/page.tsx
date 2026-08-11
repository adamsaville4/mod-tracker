"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithMagicLink,
} from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const passwordAction =
    mode === "signin" ? signInWithPassword : signUpWithPassword;
  const [passwordState, passwordFormAction, passwordPending] =
    useActionState(passwordAction, undefined);
  const [magicState, magicFormAction, magicPending] = useActionState(
    signInWithMagicLink,
    undefined
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold">Mod Tracker</h1>

      {callbackError && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          That link is invalid or has expired. Please try again.
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={mode === "signin" ? "text-black underline" : "text-zinc-500"}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "text-black underline" : "text-zinc-500"}
          >
            Sign up
          </button>
        </div>

        <form action={passwordFormAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={6}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          {passwordState?.error && (
            <p className="text-sm text-red-600">{passwordState.error}</p>
          )}
          {passwordState?.message && (
            <p className="text-sm text-green-700">{passwordState.message}</p>
          )}
          <button
            type="submit"
            disabled={passwordPending}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {passwordPending
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        or
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form action={magicFormAction} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Email for magic link"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
        {magicState?.error && (
          <p className="text-sm text-red-600">{magicState.error}</p>
        )}
        {magicState?.message && (
          <p className="text-sm text-green-700">{magicState.message}</p>
        )}
        <button
          type="submit"
          disabled={magicPending}
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {magicPending ? "Sending…" : "Send magic link"}
        </button>
      </form>
    </main>
  );
}
