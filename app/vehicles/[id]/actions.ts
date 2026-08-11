"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LogModActionState = { error?: string } | undefined;
export type RequestModActionState =
  | { error?: string; message?: string }
  | undefined;

function parseNumber(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function logMod(
  _prevState: LogModActionState,
  formData: FormData
): Promise<LogModActionState> {
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const modId = String(formData.get("mod_id") ?? "");
  const dateFitted = String(formData.get("date_fitted") ?? "").trim() || null;
  const costPaid = parseNumber(formData.get("cost_paid"));
  const installHours = parseNumber(formData.get("install_hours"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!vehicleId || !modId) {
    return { error: "Search for and select a mod first." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("model_id, owner_id")
    .eq("id", vehicleId)
    .single();

  if (!vehicle || vehicle.owner_id !== user.id) {
    return { error: "Vehicle not found." };
  }

  // Belt-and-braces: the typeahead already filters by fitment, but a
  // resubmitted form shouldn't be able to attach an incompatible mod.
  const { data: fitment } = await supabase
    .from("mod_fitment")
    .select("mod_id")
    .eq("mod_id", modId)
    .eq("vehicle_model_id", vehicle.model_id)
    .maybeSingle();

  if (!fitment) {
    return { error: "That mod doesn't fit this vehicle." };
  }

  const { error } = await supabase.from("vehicle_mods").insert({
    vehicle_id: vehicleId,
    mod_id: modId,
    date_fitted: dateFitted,
    cost_paid: costPaid,
    install_hours: installHours,
    notes,
  });

  if (error) {
    // 23505 = unique_violation on (vehicle_id, mod_id)
    if (error.code === "23505") {
      return { error: "You've already logged this mod for this vehicle." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect(`/vehicles/${vehicleId}`);
}

export async function requestMod(
  _prevState: RequestModActionState,
  formData: FormData
): Promise<RequestModActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) {
    return { error: "Tell us the mod's name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("mod_requests").insert({
    requested_by: user.id,
    name,
    brand,
    category_id: categoryId,
    notes,
  });

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  return { message: "Thanks — we'll review it and add it to the catalogue." };
}
