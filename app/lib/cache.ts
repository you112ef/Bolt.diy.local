const CACHE_PREFIX = 'bolt_ai_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheEntry<T> {
  data: T;
  expires: number;
}

/**
 * Generates a simple hash from a string.
 * Not cryptographically secure, but good enough for a cache key.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}


export const cache = {
  /**
   * Retrieves an item from the cache.
   * Returns null if the item is not found or has expired.
   */
  get: <T = any>(keySuffix: string): T | null => {
    if (typeof localStorage === 'undefined') return null;

    const key = CACHE_PREFIX + simpleHash(keySuffix);
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    try {
      const item = JSON.parse(itemStr) as CacheEntry<T>;
      if (Date.now() > item.expires) {
        localStorage.removeItem(key);
        console.log(`Cache: Expired item removed for key suffix "${keySuffix}"`);
        return null;
      }
      console.log(`Cache: Item retrieved for key suffix "${keySuffix}"`);
      return item.data;
    } catch (error) {
      console.error(`Cache: Error parsing item for key suffix "${keySuffix}"`, error);
      localStorage.removeItem(key); // Remove corrupted item
      return null;
    }
  },

  /**
   * Sets an item in the cache with an optional Time-To-Live (TTL).
   * @param keySuffix The suffix for the cache key (will be hashed).
   * @param value The value to store.
   * @param ttlInMilliseconds Optional TTL in milliseconds. Defaults to DEFAULT_TTL (24 hours).
   */
  set: <T = any>(keySuffix: string, value: T, ttlInMilliseconds: number = DEFAULT_TTL): void => {
    if (typeof localStorage === 'undefined') return;

    const key = CACHE_PREFIX + simpleHash(keySuffix);
    const expires = Date.now() + ttlInMilliseconds;
    const item: CacheEntry<T> = { data: value, expires };

    try {
      localStorage.setItem(key, JSON.stringify(item));
      console.log(`Cache: Item set for key suffix "${keySuffix}", expires in ${ttlInMilliseconds / 1000}s`);
    } catch (error) {
      console.error(`Cache: Error setting item for key suffix "${keySuffix}"`, error);
      // Potentially handle quota exceeded errors here, e.g., by clearing some old cache.
      // For now, we'll just log the error.
    }
  },

  /**
   * Removes an item from the cache.
   */
  remove: (keySuffix: string): void => {
    if (typeof localStorage === 'undefined') return;
    const key = CACHE_PREFIX + simpleHash(keySuffix);
    localStorage.removeItem(key);
    console.log(`Cache: Item removed for key suffix "${keySuffix}"`);
  },

  /**
   * Clears all items from this application's cache (matching CACHE_PREFIX).
   */
  clearAll: (): void => {
    if (typeof localStorage === 'undefined') return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cache: All AI responses cleared.');
  }
};

// Example: Clear cache if it grows too large (simple strategy)
// This is a very basic approach. A more sophisticated LRU cache might be better for large scale.
if (typeof localStorage !== 'undefined' && localStorage.length > 50) { // Arbitrary limit
  // Find and remove the oldest non-Bolt cache items if possible, or just clear our cache
  // For now, let's just warn if it's getting large.
  // A real implementation would need a more robust eviction strategy.
  let totalSize = 0;
  for(let i=0; i<localStorage.length; i++) {
    const key = localStorage.key(i);
    if(key && key.startsWith(CACHE_PREFIX)) {
      totalSize += (localStorage.getItem(key)?.length || 0) * 2; // Estimate size in bytes
    }
  }
  console.log(`Cache: Current estimated AI cache size: ${(totalSize / 1024).toFixed(2)} KB`);
  if (totalSize > 5 * 1024 * 1024) { // 5MB limit for example
     console.warn("Cache: AI cache size is large, consider clearing or implementing LRU eviction.");
     // cache.clearAll(); // Or a more selective clearing
  }
}
