import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateVehicle, deleteVehicle } from "../../actions";
import { VehicleForm } from "../../vehicle-form";
import { DeleteVehicleButton } from "../../delete-vehicle-button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, model_id, nickname, year, owner_id")
    .eq("id", id)
    .single();

  if (!vehicle || vehicle.owner_id !== user.id) {
    notFound();
  }

  const { data: models } = await supabase
    .from("vehicle_models")
    .select("id, make, model, generation")
    .order("make")
    .order("model")
    .order("generation");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Edit vehicle</h1>
      <VehicleForm
        models={models ?? []}
        action={updateVehicle}
        defaultValues={{
          id: vehicle.id,
          model_id: vehicle.model_id,
          nickname: vehicle.nickname ?? "",
          year: vehicle.year,
        }}
      />
      <form action={deleteVehicle}>
        <input type="hidden" name="id" value={vehicle.id} />
        <DeleteVehicleButton />
      </form>
    </main>
  );
}
