import { openDB } from 'idb';

// As seen in the idb README, we can create a promise-based wrapper for our DB.
const dbPromise = openDB('club-db', 1, {
  upgrade(db) {
    // This store will hold club data, keyed by a unique division identifier.
    db.createObjectStore('clubs-by-division');
  },
});

/**
 * Fetches club data for a specific division, using IndexedDB for caching.
 * This service now calls the backend API instead of fetching static files.
 * @param {string} region - The user-facing region name, e.g., 'Zaterdag West 1'
 * @param {string} division - The user-facing division name, e.g., 'Eerste Klasse A'
 * @returns {Promise<Array>} - A promise that resolves to an array of clubs.
 */
export async function getClubsByDivision(region, division) {
  const db = await dbPromise;
  // The cache key should be consistent. Using user-facing names is fine.
  const cacheKey = `${region}-${division}`;
  
  // 1. Check the cache first
  const cachedData = await db.get('clubs-by-division', cacheKey);
  if (cachedData) {
    console.log(`Serving '${cacheKey}' from cache.`);
    return cachedData;
  }

  // 2. If not in cache, fetch from the network
  console.log(`Fetching '${cacheKey}' from network...`);
  // Use URLSearchParams to safely encode the query parameters.
  // NOTE: /api/clubs requires region and division. For all clubs, use /api/clubs/all
  const params = new URLSearchParams({ region, division });
  const response = await fetch(`/api/clubs?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Could not load club data for ${region}/${division}`);
  }
  const data = await response.json();

  // 3. Store in cache for next time
  await db.put('clubs-by-division', data, cacheKey);

  return data;
}

/**
 * Auto-selects the best XI for a club (real backend call)
 * @param {number|string} clubId
 * @returns {Promise<Array>} - Promise resolving to an array of player objects
 */
export async function autoSelectBestXI(clubId) {
  const res = await fetch(`/api/game/club/${clubId}/best-xi`);
  if (!res.ok) throw new Error('Failed to fetch best XI');
  const data = await res.json();
  return data.bestXI;
}

/**
 * Sets the starting XI for a club (real backend call)
 * @param {number|string} clubId
 * @param {Array} xi - Array of player objects with id, position, order
 * @returns {Promise<{success: boolean}>}
 */
export async function setStartingXI(clubId, xi) {
  const res = await fetch(`/api/game/club/${clubId}/starting-xi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xi })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to set starting XI');
  }
  return await res.json();
}

// Example usage in a UI component:
//
// getClubsByDivision('Zaterdag West 1', 'Eerste Klasse A').then(clubs => {
//   // now you have the clubs for that specific division
//   // and can update your UI state.
// });