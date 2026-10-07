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

/** Strips internal processing markers (e.g. "[+2092 chars]") that can ride
 *  along in LLM-parsed content stored by the backend. */
export function cleanContent(text: string): string {
  return text.replace(/\[\+\d+\s*chars\]/gi, "").trim();
}

/**
 * Removes duplicated opening from article content when it matches the summary.
 * Returns the content with the duplicated prefix removed, or empty string if
 * nothing meaningful remains.
 */
export function deduplicateContent(content: string, summary: string): string {
  if (!content || !summary) return content;

  const cleanContent = content.trim();
  const cleanSummary = summary.trim();

  if (!cleanContent || !cleanSummary) return cleanContent;

  // Normalize whitespace for comparison
  const normContent = cleanContent.replace(/\s+/g, " ");
  const normSummary = cleanSummary.replace(/\s+/g, " ");

  // Check if content starts with summary (allowing for minor differences)
  if (normContent.startsWith(normSummary)) {
    const remaining = cleanContent.slice(cleanSummary.length).trim();
    // Only return remaining if it has meaningful content (> 50 chars)
    return remaining.length > 50 ? remaining : "";
  }

  // Check for substantial overlap: summary is contained at start of content
  // with up to 20% extra characters (handles added lead-in phrases)
  const maxOverlapLen = Math.floor(cleanSummary.length * 1.2);
  const contentPrefix = cleanContent.slice(0, maxOverlapLen);

  if (contentPrefix.includes(cleanSummary)) {
    const summaryIndex = contentPrefix.indexOf(cleanSummary);
    const remaining = cleanContent.slice(summaryIndex + cleanSummary.length).trim();
    return remaining.length > 50 ? remaining : "";
  }

  return cleanContent;
}

/** Rough reading time from actual text; "" when there is nothing to read. */
export function readMinutes(text: string): string {
  const words = cleanContent(text)
    .split(/\s+/)
    .filter(Boolean).length;
  return words === 0 ? "" : `${Math.max(1, Math.ceil(words / 200))} min read`;
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
