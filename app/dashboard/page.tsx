import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, username_chosen")
    .eq("id", user.id)
    .single();

  if (!profile?.username_chosen) {
    redirect("/onboarding");
  }

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, nickname, year, slug, vehicle_models(make, model, generation)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, @{profile.username}</h1>
          <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your vehicles</h2>
          <Link
            href="/vehicles/new"
            className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white"
          >
            Add vehicle
          </Link>
        </div>

        {vehicles && vehicles.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {vehicles.map((vehicle) => (
              <li
                key={vehicle.id}
                className="flex items-center justify-between rounded border border-zinc-200 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="font-medium underline"
                  >
                    {vehicle.nickname ||
                      `${vehicle.vehicle_models?.make} ${vehicle.vehicle_models?.model}`}
                  </Link>
                  <p className="text-sm text-zinc-600">
                    {vehicle.vehicle_models?.make} {vehicle.vehicle_models?.model}
                    {vehicle.vehicle_models?.generation
                      ? ` (${vehicle.vehicle_models.generation})`
                      : ""}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                </div>
                <Link
                  href={`/vehicles/${vehicle.id}/edit`}
                  className="text-sm font-medium underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600">
            No vehicles yet. Add one to start logging mods.
          </p>
        )}
      </div>
    </main>
  );
}
