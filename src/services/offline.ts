/**
 * Offline Queue Manager
 *
 * Persists queries to SQLite when offline, flushes on reconnect.
 */

import {
  insertOfflineQuery,
  getPendingQueries,
  markQuerySent,
} from './storage';

// ─── Connectivity Check ──────────────────────────────────────────────

/**
 * Simple fetch-based connectivity check.
 * Tries to reach a lightweight endpoint; falls back to offline if it fails.
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}

// ─── Queue Operations ────────────────────────────────────────────────

/**
 * Queue a query for later sending when connectivity is restored.
 */
export async function queueQuery(query: string): Promise<number> {
  return insertOfflineQuery(query);
}

/**
 * Get the number of pending (unsent) queries in the offline queue.
 */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingQueries();
  return pending.length;
}

/**
 * Callback type for processing queued queries.
 * Should return true if the query was successfully sent.
 */
export type QuerySender = (query: string) => Promise<boolean>;

/**
 * Flush all pending queries.
 * Calls the sender function for each query; marks as sent on success.
 * Stops on first failure (preserves queue order).
 *
 * @returns Number of queries successfully flushed.
 */
export async function flushQueue(sender: QuerySender): Promise<number> {
  const isOnline = await checkConnectivity();
  if (!isOnline) return 0;

  const pending = await getPendingQueries();
  let flushed = 0;

  for (const item of pending) {
    try {
      const success = await sender(item.query);
      if (success && item.id !== undefined) {
        await markQuerySent(item.id);
        flushed++;
      } else {
        // Stop on failure to preserve order
        break;
      }
    } catch {
      break;
    }
  }

  return flushed;
}
