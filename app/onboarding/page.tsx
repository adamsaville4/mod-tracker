import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsernameForm } from "./username-form";

export default async function OnboardingPage() {
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

  if (profile?.username_chosen) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Choose a username</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This becomes part of your public build log URL. Lowercase letters,
          numbers and hyphens only, 3-30 characters.
        </p>
      </div>
      {/* Don't prefill with the placeholder username the signup trigger
          assigned — the whole point of onboarding is picking a real one. */}
      <UsernameForm />
    </main>
  );
}
