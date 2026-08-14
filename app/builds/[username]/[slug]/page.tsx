import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Params = { username: string; slug: string };

const getBuild = cache(async (username: string, slug: string) => {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select(
      "id, nickname, year, slug, instagram_handle, tiktok_handle, x_handle, vehicle_models(make, model, generation)"
    )
    .eq("owner_id", profile.id)
    .eq("slug", slug)
    .single();

  if (!vehicle) return null;

  const { data: mods } = await supabase
    .from("vehicle_mods")
    .select(
      "id, date_fitted, cost_paid, install_hours, notes, mods(name, brand, mod_categories(name))"
    )
    .eq("vehicle_id", vehicle.id)
    // Chronological, like the forum build-threads this is meant to replace:
    // oldest mod first, undated entries pushed to the end.
    .order("date_fitted", { ascending: true, nullsFirst: false });

  return { profile, vehicle, mods: mods ?? [] };
});

function buildTitle(
  nickname: string | null,
  model: { make: string; model: string } | null
) {
  return nickname || `${model?.make ?? ""} ${model?.model ?? ""}`.trim();
}

function formatCost(value: number) {
  return Number.isInteger(value) ? `£${value}` : `£${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// No icon library is installed — small inline glyphs, generic
// representations rather than the platforms' actual brand marks.
function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l8-2v11" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="14" r="3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

type SocialLink = { label: string; href: string; Icon: () => React.JSX.Element };

function getSocialLinks(vehicle: {
  instagram_handle: string | null;
  tiktok_handle: string | null;
  x_handle: string | null;
}): SocialLink[] {
  const links: (SocialLink | null)[] = [
    vehicle.instagram_handle
      ? {
          label: "Instagram",
          href: `https://instagram.com/${vehicle.instagram_handle}`,
          Icon: InstagramIcon,
        }
      : null,
    vehicle.tiktok_handle
      ? {
          label: "TikTok",
          href: `https://tiktok.com/@${vehicle.tiktok_handle}`,
          Icon: TikTokIcon,
        }
      : null,
    vehicle.x_handle
      ? { label: "X", href: `https://x.com/${vehicle.x_handle}`, Icon: XIcon }
      : null,
  ];

  return links.filter((link): link is SocialLink => link !== null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const build = await getBuild(username, slug);

  if (!build) {
    return { title: "Build not found" };
  }

  const model = build.vehicle.vehicle_models;
  const title = buildTitle(build.vehicle.nickname, model);

  return {
    title: `${title} — @${username}'s build log`,
    description: `Follow @${username}'s ${[model?.make, model?.model]
      .filter(Boolean)
      .join(" ")}${model?.generation ? ` (${model.generation})` : ""} build on Mod Tracker.`,
  };
}

export default async function BuildLogPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username, slug } = await params;
  const build = await getBuild(username, slug);

  if (!build) {
    notFound();
  }

  const { vehicle, mods } = build;
  const model = vehicle.vehicle_models;
  const title = buildTitle(vehicle.nickname, model);
  const socialLinks = getSocialLinks(vehicle);

  const totalCost = mods.reduce((sum, m) => sum + (m.cost_paid ?? 0), 0);
  const totalHours = mods.reduce((sum, m) => sum + (m.install_hours ?? 0), 0);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
      <header className="mb-10 sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
          Build log
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          {[model?.make, model?.model].filter(Boolean).join(" ")}
          {model?.generation ? ` (${model.generation})` : ""}
          {vehicle.year ? ` · ${vehicle.year}` : ""}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          by{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            @{username}
          </span>
        </p>
        {socialLinks.length > 0 && (
          <div className="mt-2 flex gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <Icon />
              </a>
            ))}
          </div>
        )}
      </header>

      {mods.length > 0 && (
        <dl className="mb-12 grid grid-cols-3 gap-4 border-y border-zinc-200 py-6 sm:mb-16 dark:border-zinc-800">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">
              Mods
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {mods.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">
              Spent
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {totalCost > 0 ? formatCost(totalCost) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">
              Install hours
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {totalHours > 0 ? totalHours : "—"}
            </dd>
          </div>
        </dl>
      )}

      <section>
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Modifications
        </h2>

        {mods.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No mods logged yet — check back soon.
          </p>
        ) : (
          <ol className="relative">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-1.5 w-px bg-zinc-200 dark:bg-zinc-800"
            />
            {mods.map((entry) => (
              <li key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div className="relative z-10 mt-1.5 h-3 w-3 flex-none rounded-full bg-amber-500 ring-4 ring-white dark:ring-zinc-950" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {entry.date_fitted
                      ? formatDate(entry.date_fitted)
                      : "Date unknown"}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {entry.mods?.brand ? `${entry.mods.brand} ` : ""}
                    {entry.mods?.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {entry.mods?.mod_categories?.name && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        {entry.mods.mod_categories.name}
                      </span>
                    )}
                    {entry.cost_paid != null && (
                      <span>{formatCost(entry.cost_paid)}</span>
                    )}
                    {entry.install_hours != null && (
                      <span>{entry.install_hours}h to fit</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
