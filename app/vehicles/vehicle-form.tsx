"use client";

import { useActionState } from "react";
import type { VehicleActionState } from "./actions";

type Model = {
  id: string;
  make: string;
  model: string;
  generation: string | null;
};

export function VehicleForm({
  models,
  action,
  defaultValues,
}: {
  models: Model[];
  action: (
    state: VehicleActionState,
    formData: FormData
  ) => Promise<VehicleActionState>;
  defaultValues?: {
    id?: string;
    model_id?: string;
    nickname?: string;
    year?: number | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="model_id" className="text-sm font-medium">
          Model
        </label>
        <select
          id="model_id"
          name="model_id"
          defaultValue={defaultValues?.model_id ?? ""}
          required
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select a model…
          </option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.make} {m.model}
              {m.generation ? ` (${m.generation})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm font-medium">
          Nickname (optional)
        </label>
        <input
          id="nickname"
          name="nickname"
          defaultValue={defaultValues?.nickname ?? ""}
          placeholder="e.g. The Beast"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="year" className="text-sm font-medium">
          Year (optional)
        </label>
        <input
          id="year"
          name="year"
          type="number"
          inputMode="numeric"
          defaultValue={defaultValues?.year ?? ""}
          placeholder="e.g. 2016"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending
          ? "Saving…"
          : defaultValues?.id
            ? "Save changes"
            : "Add vehicle"}
      </button>
    </form>
  );
}
