import crypto from 'node:crypto';

/**
 * In-Memory LRU Prompt Cache
 * - Max 100 entries
 * - TTL 1 hour
 * - Key: sha256(prompt + modelId)
 */

const MAX_ENTRIES = 100;
const TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map();

function makeKey(prompt, modelId) {
    return crypto.createHash('sha256').update(`${prompt.trim().toLowerCase()}::${modelId}`).digest('hex');
}

/**
 * Get cached result for a prompt + model combination
 * @returns {{ imageUrl: string, type: string } | null}
 */
export function getCache(prompt, modelId) {
    const key = makeKey(prompt, modelId);
    const entry = cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.createdAt > TTL_MS) {
        cache.delete(key);
        return null;
    }

    // Move to end (LRU touch)
    cache.delete(key);
    cache.set(key, { ...entry, hits: (entry.hits || 0) + 1 });
    return entry.result;
}

/**
 * Store a generation result in cache
 * @param {string} prompt
 * @param {string} modelId
 * @param {{ imageUrl: string, type?: string }} result
 */
export function setCache(prompt, modelId, result) {
    if (!prompt || !modelId || !result?.imageUrl) return;

    const key = makeKey(prompt, modelId);

    // Evict oldest if at capacity
    if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }

    cache.set(key, {
        result,
        createdAt: Date.now(),
        hits: 0
    });
}

/**
 * Get cache statistics for admin dashboard
 */
export function getCacheStats() {
    let totalHits = 0;
    let expired = 0;
    const now = Date.now();
    const topEntries = [];

    for (const [key, entry] of cache) {
        if (now - entry.createdAt > TTL_MS) {
            expired++;
            continue;
        }
        totalHits += entry.hits || 0;
        topEntries.push({ hits: entry.hits || 0, age: Math.round((now - entry.createdAt) / 1000) });
    }

    return {
        size: cache.size,
        maxSize: MAX_ENTRIES,
        totalHits,
        expired,
        ttlMinutes: TTL_MS / 60000
    };
}

/**
 * Clear expired entries (can be called periodically)
 */
export function purgeExpired() {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of cache) {
        if (now - entry.createdAt > TTL_MS) {
            cache.delete(key);
            purged++;
        }
    }
    return purged;
}
