/**
 * Helper to convert various audio link formats (including Google Drive)
 * into direct playable audio stream URLs via Next.js proxy stream.
 */
export function formatAudioUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // If already relative API proxy URL, return as is
  if (trimmed.startsWith('/api/drive-stream')) {
    return trimmed;
  }

  // Handle Google Drive file link formats:
  // Format A: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Format B: https://drive.google.com/open?id=FILE_ID
  // Format C: https://drive.google.com/uc?id=FILE_ID
  
  const driveFilePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveOpenPattern = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const driveUcPattern = /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;

  let fileId: string | null = null;

  const matchA = trimmed.match(driveFilePattern);
  if (matchA && matchA[1]) {
    fileId = matchA[1];
  } else {
    const matchB = trimmed.match(driveOpenPattern);
    if (matchB && matchB[1]) {
      fileId = matchB[1];
    } else {
      const matchC = trimmed.match(driveUcPattern);
      if (matchC && matchC[1]) {
        fileId = matchC[1];
      }
    }
  }

  if (fileId) {
    // Route through server-side proxy route to stream Google Drive MP3 reliably
    return `/api/drive-stream?id=${fileId}`;
  }

  return trimmed;
}

export const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80';

/**
 * Helper to convert Google Drive image links or invalid image URLs
 * into direct displayable image URLs with fallback handling.
 *
 * Google Drive image links are routed through our server-side /api/drive-image
 * proxy to bypass CORS restrictions and Google's hotlink blocking.
 */
export function formatImageUrl(url?: string, fallback = DEFAULT_COVER_IMAGE): string {
  if (!url || !url.trim()) return fallback;

  const trimmed = url.trim();

  // If already our proxy URL, return as is
  if (trimmed.startsWith('/api/drive-image')) return trimmed;

  // Extract Google Drive file ID from any of these URL formats:
  // Format A: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Format B: https://drive.google.com/open?id=FILE_ID
  // Format C: https://drive.google.com/uc?id=FILE_ID (or uc?export=...)
  const driveFilePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveOpenPattern = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const driveUcPattern = /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;

  let fileId: string | null = null;
  const matchA = trimmed.match(driveFilePattern);
  if (matchA && matchA[1]) {
    fileId = matchA[1];
  } else {
    const matchB = trimmed.match(driveOpenPattern);
    if (matchB && matchB[1]) {
      fileId = matchB[1];
    } else {
      const matchC = trimmed.match(driveUcPattern);
      if (matchC && matchC[1]) {
        fileId = matchC[1];
      }
    }
  }

  if (fileId) {
    // Route through server-side proxy — avoids CORS, hotlink blocks, and auth redirects
    return `/api/drive-image?id=${fileId}`;
  }

  // Return URL unchanged if it's already a direct image URL (Unsplash, Firebase Storage, etc.)
  return trimmed;
}
