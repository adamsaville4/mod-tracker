// Lowercase, strip to [a-z0-9-], collapse runs of hyphens, trim leading/
// trailing hyphens. Matches PROJECT.md's vehicle-slug rule.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
