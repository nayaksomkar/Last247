/** UI fallbacks for optional fields, per UI_API_INTEGRATION.md §4. */
export const UNKNOWN = "Unknown";

/** Relative time from an ISO 8601 UTC timestamp. */
export function timeAgo(iso: string): string {
  const published = new Date(iso).getTime();
  if (Number.isNaN(published)) return "";

  const diff = Math.max(0, Date.now() - published);
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/** Rough reading time from description + content text. */
export function readMinutes(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

/** Formats an ISO 8601 UTC timestamp for display. */
export function formatUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
