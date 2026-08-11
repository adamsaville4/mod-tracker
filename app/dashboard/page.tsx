import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

// Minimal stub to prove the auth + onboarding flow end to end.
// Full dashboard (vehicle list) is a later build step.
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

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, @{profile.username}</h1>
        <p className="mt-2 text-sm text-zinc-600">{user.email}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
