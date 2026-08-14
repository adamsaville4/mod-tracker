"use client";

import { useActionState, useState } from "react";
import type { LogModActionState } from "./actions";
import { ModTypeahead } from "./mod-typeahead";

type SelectedMod = { id: string; name: string; brand: string | null };

// Native form controls default to a light background regardless of the
// page's dark-mode text color — without an explicit pairing here too,
// dark mode renders light text on a light control.
const FIELD_CLASSES =
  "rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function LogModForm({
  vehicleId,
  vehicleModelId,
  action,
  defaultValues,
  onCancel,
}: {
  vehicleId: string;
  vehicleModelId: string;
  action: (
    state: LogModActionState,
    formData: FormData
  ) => Promise<LogModActionState>;
  defaultValues?: {
    id?: string;
    mod?: SelectedMod | null;
    date_fitted?: string | null;
    cost_paid?: number | null;
    install_hours?: number | null;
    notes?: string | null;
  };
  onCancel?: () => void;
}) {
  const [selected, setSelected] = useState<SelectedMod | null>(
    defaultValues?.mod ?? null
  );
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEditing = Boolean(defaultValues?.id);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="mod_id" value={selected?.id ?? ""} />
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

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
          defaultValue={defaultValues?.date_fitted ?? ""}
          className={FIELD_CLASSES}
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
          defaultValue={defaultValues?.cost_paid ?? ""}
          className={FIELD_CLASSES}
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
          defaultValue={defaultValues?.install_hours ?? ""}
          className={FIELD_CLASSES}
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
          defaultValue={defaultValues?.notes ?? ""}
          className={FIELD_CLASSES}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !selected}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : isEditing ? "Save changes" : "Log mod"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
