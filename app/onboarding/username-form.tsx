"use client";

import { useActionState } from "react";
import { setUsername, type UsernameActionState } from "./actions";

const initialState: UsernameActionState = undefined;

export function UsernameForm() {
  const [state, action, pending] = useActionState(setUsername, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          placeholder="e.g. focus-st-dan"
          pattern="[a-z0-9][a-z0-9-]{2,29}"
          required
          autoComplete="off"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
