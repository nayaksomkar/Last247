// Cross-component UI events. Articles are opened by ID; the reader fetches
// the full article via `GET /api/news/{id}`.

export const OPEN_ARTICLE_EVENT = "last247:open-article";

/** Ask the story reader to open an article by its ID. */
export function openArticle(id: string) {
  window.dispatchEvent(
    new CustomEvent(OPEN_ARTICLE_EVENT, { detail: { id } }),
  );
}
