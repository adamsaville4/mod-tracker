"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export type VehicleActionState = { error?: string } | undefined;

const MAX_SLUG_ATTEMPTS = 50;

function parseYear(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) ? year : null;
}

export async function createVehicle(
  _prevState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const modelId = String(formData.get("model_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim() || null;
  const year = parseYear(formData.get("year"));

  if (!modelId) {
    return { error: "Choose a model." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: model, error: modelError } = await supabase
    .from("vehicle_models")
    .select("model")
    .eq("id", modelId)
    .single();

  if (modelError || !model) {
    return { error: "That model doesn't exist." };
  }

  // Slug source: nickname if set, otherwise the model name (PROJECT.md
  // Identifier rules — e.g. two owners can both have "focus-st").
  const slugBase = slugify(nickname ?? model.model) || "vehicle";

  let vehicleId: string | undefined;
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? slugBase : `${slugBase}-${attempt + 1}`;

    const { data, error } = await supabase
      .from("vehicles")
      .insert({ owner_id: user.id, model_id: modelId, nickname, year, slug })
      .select("id")
      .single();

    if (!error) {
      vehicleId = data.id;
      break;
    }

    // 23505 = unique_violation on (owner_id, slug) — try the next suffix.
    if (error.code !== "23505") {
      return { error: "Something went wrong. Please try again." };
    }
  }

  if (!vehicleId) {
    return { error: "Couldn't generate a unique URL for this vehicle." };
  }

  redirect("/dashboard");
}

export async function updateVehicle(
  _prevState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const id = String(formData.get("id") ?? "");
  const modelId = String(formData.get("model_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim() || null;
  const year = parseYear(formData.get("year"));

  if (!id || !modelId) {
    return { error: "Choose a model." };
  }

  const supabase = await createClient();

  // Slug is intentionally left untouched on edit — it's stable once
  // created so shared public build-log URLs don't break.
  const { error } = await supabase
    .from("vehicles")
    .update({ model_id: modelId, nickname, year })
    .eq("id", id);

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function deleteVehicle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("vehicles").delete().eq("id", id);

  redirect("/dashboard");
}
