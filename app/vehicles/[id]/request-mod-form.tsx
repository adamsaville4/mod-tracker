"use client";

import { useActionState } from "react";
import { requestMod } from "./actions";

type Category = { id: string; name: string };

// Native form controls default to a light background regardless of the
// page's dark-mode text color — without an explicit pairing here too,
// dark mode renders light text on a light control.
const FIELD_CLASSES =
  "rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const OPTION_CLASSES = "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100";

export function RequestModForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(requestMod, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input
        name="name"
        placeholder="Mod name"
        required
        className={FIELD_CLASSES}
      />
      <input name="brand" placeholder="Brand (optional)" className={FIELD_CLASSES} />
      <select name="category_id" defaultValue="" className={FIELD_CLASSES}>
        <option value="" className={OPTION_CLASSES}>
          Category (optional)
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id} className={OPTION_CLASSES}>
            {c.name}
          </option>
        ))}
      </select>
      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={2}
        className={FIELD_CLASSES}
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
