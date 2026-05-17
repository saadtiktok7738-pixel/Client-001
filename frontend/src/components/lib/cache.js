export const TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 5 * 60 * 1000, // 5 minutes
  BANNERS: 5 * 60 * 1000, // 5 minutes
};

const store = new Map();

export const appCache = {
  /** Return cached data regardless of age (for stale-while-revalidate). */
  get(key) {
    const e = store.get(key);
    return e ? e.data : null;
  },

  /** Return cached data only if it's within its TTL window. */
  getIfFresh(key) {
    const e = store.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > e.ttlMs) return null;
    return e.data;
  },

  /** Store data with an explicit TTL in milliseconds. */
  set(key, data, ttlMs) {
    store.set(key, {
      data,
      ts: Date.now(),
      ttlMs,
    });
  },

  /** True if the key is missing or older than its TTL. */
  isStale(key) {
    const e = store.get(key);
    if (!e) return true;
    return Date.now() - e.ts > e.ttlMs;
  },

  /** True if the key exists (data may be stale). */
  has(key) {
    return store.has(key);
  },

  /** Force-expire a key so the next read triggers a fresh fetch. */
  invalidate(key) {
    store.delete(key);
  },
};