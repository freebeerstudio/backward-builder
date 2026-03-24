/**
 * Google Workspace document content fetcher.
 *
 * Extracts the document ID from a Google Docs/Slides/Sheets URL,
 * fetches the content via the Google Docs export API (public documents)
 * or our Google Workspace MCP (authenticated), and returns plain text
 * for AI scoring.
 *
 * This is critical for the performance task submission flow — without
 * reading the actual document content, the AI can't score against the rubric.
 */

/**
 * Detect if a URL is a Google Workspace document and extract the ID.
 */
export function parseGoogleUrl(url: string): {
  type: "doc" | "slides" | "sheets";
  id: string;
} | null {
  const trimmed = url.trim();

  // Google Docs: https://docs.google.com/document/d/{ID}/...
  const docMatch = trimmed.match(
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/
  );
  if (docMatch) return { type: "doc", id: docMatch[1] };

  // Google Slides: https://docs.google.com/presentation/d/{ID}/...
  const slidesMatch = trimmed.match(
    /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/
  );
  if (slidesMatch) return { type: "slides", id: slidesMatch[1] };

  // Google Sheets: https://docs.google.com/spreadsheets/d/{ID}/...
  const sheetsMatch = trimmed.match(
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/
  );
  if (sheetsMatch) return { type: "sheets", id: sheetsMatch[1] };

  return null;
}

/**
 * Fetch the plain-text content of a Google Workspace document.
 *
 * Strategy:
 * 1. Try the public export URL (works for "anyone with link" docs)
 * 2. Fall back to a descriptive error message
 *
 * For the contest MVP, we use the public export endpoint which works
 * when the document sharing is set to "Anyone with the link can view."
 */
export async function fetchGoogleDocContent(url: string): Promise<string | null> {
  const parsed = parseGoogleUrl(url);
  if (!parsed) return null;

  try {
    if (parsed.type === "doc") {
      // Google Docs exports as plain text via this URL
      const exportUrl = `https://docs.google.com/document/d/${parsed.id}/export?format=txt`;
      const response = await fetch(exportUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "BackwardBuilder/1.0",
        },
      });

      if (response.ok) {
        const text = await response.text();
        // Clean up: remove excessive whitespace but keep structure
        const cleaned = text
          .replace(/\r\n/g, "\n")
          .replace(/\n{4,}/g, "\n\n\n")
          .trim();

        if (cleaned.length > 0) {
          console.log(`Google Docs: Fetched ${cleaned.length} chars from doc ${parsed.id}`);
          return cleaned;
        }
      } else {
        console.log(`Google Docs export failed: ${response.status} — document may not be publicly shared`);
      }
    }

    if (parsed.type === "slides") {
      // Google Slides exports as plain text
      const exportUrl = `https://docs.google.com/presentation/d/${parsed.id}/export?format=txt`;
      const response = await fetch(exportUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "BackwardBuilder/1.0",
        },
      });

      if (response.ok) {
        const text = await response.text();
        const cleaned = text.replace(/\r\n/g, "\n").trim();
        if (cleaned.length > 0) {
          console.log(`Google Slides: Fetched ${cleaned.length} chars from presentation ${parsed.id}`);
          return cleaned;
        }
      }
    }

    if (parsed.type === "sheets") {
      // Google Sheets exports as CSV
      const exportUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv`;
      const response = await fetch(exportUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "BackwardBuilder/1.0",
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (text.trim().length > 0) {
          console.log(`Google Sheets: Fetched ${text.length} chars from spreadsheet ${parsed.id}`);
          return `[Google Sheets data — CSV format]\n\n${text.trim()}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch Google document:", error);
    return null;
  }
}
