/**
 * Utility functions for safely validating and handling image URLs in Next.js
 */

export const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_ARTICLE_IMAGE =
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_LOGO_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&h=200&q=80';

export const DEFAULT_FALLBACK_IMAGE = DEFAULT_PROPERTY_IMAGE;

/**
 * Checks if a string is a safe, valid image URL that next/image can load without throwing.
 */
export function isValidImageUrl(url: unknown): url is string {
  if (!url || typeof url !== 'string') return false;
  let trimmed = url.trim();

  // Guard against CLI flags, turbopack flags, or empty strings
  if (!trimmed || trimmed === '--turbopack' || trimmed.startsWith('--')) {
    return false;
  }

  // Relative public paths starting with '/' (e.g., /assets/logo.png, /placeholder.jpg)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Data URLs (e.g., inline SVG or base64)
  if (trimmed.startsWith('data:image/')) {
    return true;
  }

  // Auto-prepend https:// if domain format
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.includes('.') && !trimmed.includes(' ') && !trimmed.startsWith('/')) {
      trimmed = 'https://' + trimmed;
    }
  }

  // Absolute HTTP/HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Returns a guaranteed valid image URL, falling back to a default high-quality image if invalid.
 */
export function sanitizeImageUrl(
  url: unknown,
  fallback: string = ''
): string {
  if (typeof url === 'string') {
    let trimmed = url.trim();
    if (!trimmed) {
      return '';
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
      if (trimmed.includes('.') && !trimmed.includes(' ')) {
        trimmed = 'https://' + trimmed;
      }
    }
    if (isValidImageUrl(trimmed)) {
      return trimmed;
    }
  }
  if (fallback && isValidImageUrl(fallback)) {
    return fallback.trim();
  }
  return '';
}
