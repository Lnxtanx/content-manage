/**
 * Cache utilities for ensuring fresh data
 */

// Generate a cache-busting timestamp
export function getCacheBuster(): string {
  return `t=${new Date().getTime()}`;
}

// Standard headers to prevent caching
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
} as const;

// Fetch with cache busting
export async function fetchWithoutCache(url: string, options?: RequestInit): Promise<Response> {
  const separator = url.includes('?') ? '&' : '?';
  const urlWithCacheBuster = `${url}${separator}${getCacheBuster()}`;
  
  return fetch(urlWithCacheBuster, {
    ...options,
    cache: 'no-store',
    headers: {
      ...NO_CACHE_HEADERS,
      ...options?.headers,
    },
  });
}

// Clear browser storage (localStorage, sessionStorage)
export function clearBrowserCache(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Browser cache cleared');
  } catch (error) {
    console.warn('Failed to clear browser cache:', error);
  }
}

// Force page reload with cache bypass
export function hardRefresh(): void {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
