export type SanitizeHandleResult = { value: string | null } | { error: string };

// Accepts a raw handle ("foo"), an @-prefixed handle ("@foo"), or a
// pasted profile URL ("https://instagram.com/foo/", "tiktok.com/@foo")
// and reduces all of them to the bare handle. Empty input is valid
// (clears the field to null) — anything else must be alphanumeric,
// underscore or period only.
export function sanitizeHandle(raw: string, label: string): SanitizeHandleResult {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null };

  const withoutProtocol = trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");

  const lastSegment = (
    withoutProtocol.includes("/")
      ? (withoutProtocol.split("/").filter(Boolean).pop() ?? "")
      : withoutProtocol
  ).split(/[?#]/)[0];

  const handle = lastSegment.replace(/^@/, "");

  if (!/^[A-Za-z0-9_.]+$/.test(handle)) {
    return {
      error: `${label} can only contain letters, numbers, underscores and periods.`,
    };
  }

  return { value: handle };
}
