import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogModForm } from "./log-mod-form";
import { RequestModForm } from "./request-mod-form";

export default async function VehicleDetailPage({
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
    .select(
      "id, nickname, year, slug, owner_id, vehicle_models(id, make, model, generation)"
    )
    .eq("id", id)
    .single();

  if (!vehicle || vehicle.owner_id !== user.id) {
    notFound();
  }

  const { data: loggedMods } = await supabase
    .from("vehicle_mods")
    .select(
      "id, date_fitted, cost_paid, install_hours, notes, mods(name, brand)"
    )
    .eq("vehicle_id", id)
    .order("date_fitted", { ascending: false, nullsFirst: false });

  const { data: categories } = await supabase
    .from("mod_categories")
    .select("id, name")
    .order("name");

  const model = vehicle.vehicle_models;
  const title =
    vehicle.nickname || `${model?.make ?? ""} ${model?.model ?? ""}`.trim();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/dashboard" className="text-sm underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-zinc-600">
          {model?.make} {model?.model}
          {model?.generation ? ` (${model.generation})` : ""}
          {vehicle.year ? ` · ${vehicle.year}` : ""}
        </p>
        <Link
          href={`/vehicles/${vehicle.id}/edit`}
          className="text-sm font-medium underline"
        >
          Edit vehicle
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Logged mods</h2>
        {loggedMods && loggedMods.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {loggedMods.map((entry) => (
              <li
                key={entry.id}
                className="rounded border border-zinc-200 px-4 py-3"
              >
                <p className="font-medium">
                  {entry.mods?.brand ? `${entry.mods.brand} ` : ""}
                  {entry.mods?.name}
                </p>
                <p className="text-sm text-zinc-600">
                  {entry.date_fitted ?? "No date"}
                  {entry.cost_paid ? ` · £${entry.cost_paid}` : ""}
                  {entry.install_hours ? ` · ${entry.install_hours}h` : ""}
                </p>
                {entry.notes && (
                  <p className="mt-1 text-sm text-zinc-600">{entry.notes}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600">No mods logged yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Log a mod</h2>
        {model?.id && (
          <LogModForm vehicleId={vehicle.id} vehicleModelId={model.id} />
        )}
      </div>

      <details className="flex flex-col gap-1">
        <summary className="cursor-pointer text-sm font-medium">
          Can&apos;t find your mod?
        </summary>
        <RequestModForm categories={categories ?? []} />
      </details>
    </main>
  );
}
