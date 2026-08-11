"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mirrors the DB check constraint on profiles.username (PROJECT.md
// "Identifier rules"). Validated here too so the error message is
// specific, rather than a raw constraint-violation from Postgres.
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/;

export type UsernameActionState = { error?: string } | undefined;

export async function setUsername(
  _prevState: UsernameActionState,
  formData: FormData
): Promise<UsernameActionState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Usernames must be 3-30 characters: lowercase letters, numbers and hyphens only, starting with a letter or number.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, username_chosen: true })
    .eq("id", user.id);

  if (error) {
    // 23505 = unique_violation (profiles.username is unique)
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}
