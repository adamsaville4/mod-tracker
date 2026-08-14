"use client";

import { useActionState } from "react";
import type { VehicleActionState } from "./actions";
import { getPlateYearOptions } from "@/lib/uk-plate-year";

type Model = {
  id: string;
  make: string;
  model: string;
  generation: string | null;
};

// Native form controls (select popups included) default to a light
// background regardless of the page's dark-mode text color — left
// alone, that's a light background with light text. Set both
// explicitly, in sync.
const FIELD_CLASSES =
  "rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const OPTION_CLASSES = "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100";

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
    instagram_handle?: string | null;
    tiktok_handle?: string | null;
    x_handle?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const plateYearOptions = getPlateYearOptions();

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
          className={FIELD_CLASSES}
        >
          <option value="" disabled className={OPTION_CLASSES}>
            Select a model…
          </option>
          {models.map((m) => (
            <option key={m.id} value={m.id} className={OPTION_CLASSES}>
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
          className={FIELD_CLASSES}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="year" className="text-sm font-medium">
          Year (optional)
        </label>
        <select
          id="year"
          name="year"
          defaultValue={defaultValues?.year ?? ""}
          className={FIELD_CLASSES}
        >
          <option value="" className={OPTION_CLASSES}>
            Year (optional)
          </option>
          {plateYearOptions.map((opt) => (
            <option key={opt.label} value={opt.year} className={OPTION_CLASSES}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="instagram_handle" className="text-sm font-medium">
          Instagram (optional)
        </label>
        <input
          id="instagram_handle"
          name="instagram_handle"
          defaultValue={defaultValues?.instagram_handle ?? ""}
          placeholder="yourhandle"
          className={FIELD_CLASSES}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tiktok_handle" className="text-sm font-medium">
          TikTok (optional)
        </label>
        <input
          id="tiktok_handle"
          name="tiktok_handle"
          defaultValue={defaultValues?.tiktok_handle ?? ""}
          placeholder="yourhandle"
          className={FIELD_CLASSES}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="x_handle" className="text-sm font-medium">
          X (optional)
        </label>
        <input
          id="x_handle"
          name="x_handle"
          defaultValue={defaultValues?.x_handle ?? ""}
          placeholder="yourhandle"
          className={FIELD_CLASSES}
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
