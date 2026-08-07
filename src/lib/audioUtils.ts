/** Cloudflare R2 CDN base URL — files are served directly, no proxy needed */
export const R2_CDN_URL = 'https://cdn.mafangniyai.com';

/** Fallback cover image (used when no cover is set or image fails to load) */
export const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';

/**
 * Encode non-ASCII characters in a URL path while preserving
 * the scheme, host, and already-encoded sequences.
 */
function encodeUrlPath(url: string): string {
  try {
    const u = new URL(url);
    // Encode each path segment individually (handles Thai, spaces, +, etc.)
    u.pathname = u.pathname
      .split('/')
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join('/');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Extract a Google Drive file ID from a Drive share URL.
 * Returns null if the URL is not a Drive link.
 */
function extractDriveFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Convert any audio URL into a playable URL:
 *  - Cloudflare R2 (cdn.mafangniyai.com) → encode path and serve directly (no proxy)
 *  - Google Drive share links → route through /api/drive-stream proxy
 *  - Everything else → return as-is (already a direct URL)
 */
export function formatAudioUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Already a proxy URL — pass through
  if (trimmed.startsWith('/api/drive-stream')) return trimmed;

  // R2 CDN URL — encode path for non-ASCII chars and serve directly
  if (trimmed.startsWith(R2_CDN_URL)) return encodeUrlPath(trimmed);

  // Google Drive — route through server-side proxy
  const driveId = extractDriveFileId(trimmed);
  if (driveId) return `/api/drive-stream?id=${driveId}`;

  return trimmed;
}

/**
 * Convert any image URL into a displayable URL:
 *  - Cloudflare R2 (cdn.mafangniyai.com) → encode path and serve directly (no proxy)
 *  - Google Drive share links → route through /api/drive-image proxy
 *  - Everything else → return as-is
 */
export function formatImageUrl(url?: string, fallback = DEFAULT_COVER_IMAGE): string {
  if (!url || !url.trim()) return fallback;
  const trimmed = url.trim();

  // Already a proxy URL — pass through
  if (trimmed.startsWith('/api/drive-image')) return trimmed;

  // R2 CDN URL — encode path for non-ASCII chars and serve directly (no proxy needed)
  if (trimmed.startsWith(R2_CDN_URL)) return encodeUrlPath(trimmed);

  // Google Drive — route through server-side proxy
  const driveId = extractDriveFileId(trimmed);
  if (driveId) return `/api/drive-image?id=${driveId}`;

  // Direct URL (Unsplash, Firebase Storage legacy, etc.) — return as-is
  return trimmed;
}
