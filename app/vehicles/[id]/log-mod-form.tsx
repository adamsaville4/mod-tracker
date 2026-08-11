"use client";

import { useActionState, useState } from "react";
import { logMod } from "./actions";
import { ModTypeahead } from "./mod-typeahead";

type SelectedMod = { id: string; name: string; brand: string | null };

export function LogModForm({
  vehicleId,
  vehicleModelId,
}: {
  vehicleId: string;
  vehicleModelId: string;
}) {
  const [selected, setSelected] = useState<SelectedMod | null>(null);
  const [state, formAction, pending] = useActionState(logMod, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="mod_id" value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between rounded border border-zinc-300 px-3 py-2 text-sm">
          <span>
            {selected.brand ? `${selected.brand} ` : ""}
            {selected.name}
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs font-medium underline"
          >
            Change
          </button>
        </div>
      ) : (
        <ModTypeahead vehicleModelId={vehicleModelId} onSelect={setSelected} />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="date_fitted" className="text-sm font-medium">
          Date fitted
        </label>
        <input
          id="date_fitted"
          name="date_fitted"
          type="date"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cost_paid" className="text-sm font-medium">
          Cost paid (optional)
        </label>
        <input
          id="cost_paid"
          name="cost_paid"
          type="number"
          step="0.01"
          inputMode="decimal"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="install_hours" className="text-sm font-medium">
          Install hours (optional)
        </label>
        <input
          id="install_hours"
          name="install_hours"
          type="number"
          step="0.5"
          inputMode="decimal"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !selected}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Log mod"}
      </button>
    </form>
  );
}
