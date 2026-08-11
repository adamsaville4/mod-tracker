"use client";

import { useActionState } from "react";
import { requestMod } from "./actions";

type Category = { id: string; name: string };

export function RequestModForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(requestMod, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input
        name="name"
        placeholder="Mod name"
        required
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="brand"
        placeholder="Brand (optional)"
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      <select
        name="category_id"
        defaultValue=""
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="">Category (optional)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={2}
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Sending…" : "Request this mod"}
      </button>
    </form>
  );
}
