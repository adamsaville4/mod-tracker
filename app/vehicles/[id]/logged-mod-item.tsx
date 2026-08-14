"use client";

import { useState } from "react";
import { updateVehicleMod } from "./actions";
import { LogModForm } from "./log-mod-form";

type LoggedMod = {
  id: string;
  date_fitted: string | null;
  cost_paid: number | null;
  install_hours: number | null;
  notes: string | null;
  mods: { id: string; name: string; brand: string | null } | null;
};

export function LoggedModItem({
  entry,
  vehicleId,
  vehicleModelId,
}: {
  entry: LoggedMod;
  vehicleId: string;
  vehicleModelId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="rounded border border-zinc-200 px-4 py-3">
        <LogModForm
          vehicleId={vehicleId}
          vehicleModelId={vehicleModelId}
          action={updateVehicleMod}
          defaultValues={{
            id: entry.id,
            mod: entry.mods,
            date_fitted: entry.date_fitted,
            cost_paid: entry.cost_paid,
            install_hours: entry.install_hours,
            notes: entry.notes,
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="relative rounded border border-zinc-200 px-4 py-3">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label="Edit mod entry"
        className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      </button>
      <p className="pr-6 font-medium">
        {entry.mods?.brand ? `${entry.mods.brand} ` : ""}
        {entry.mods?.name}
      </p>
      <p className="text-sm text-zinc-600">
        {entry.date_fitted ?? "No date"}
        {entry.cost_paid ? ` · £${entry.cost_paid}` : ""}
        {entry.install_hours ? ` · ${entry.install_hours}h` : ""}
      </p>
      {entry.notes && <p className="mt-1 text-sm text-zinc-600">{entry.notes}</p>}
    </li>
  );
}
