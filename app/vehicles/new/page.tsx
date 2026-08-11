import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createVehicle } from "../actions";
import { VehicleForm } from "../vehicle-form";

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username_chosen")
    .eq("id", user.id)
    .single();

  // Onboarding must be completed before creating a vehicle (PROJECT.md).
  if (!profile?.username_chosen) {
    redirect("/onboarding");
  }

  const { data: models } = await supabase
    .from("vehicle_models")
    .select("id, make, model, generation")
    .order("make")
    .order("model")
    .order("generation");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Add a vehicle</h1>
      <VehicleForm models={models ?? []} action={createVehicle} />
    </main>
  );
}
