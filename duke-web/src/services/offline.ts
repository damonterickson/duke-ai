/**
 * Offline Service — Web version
 *
 * Simple connectivity check using navigator.onLine.
 * Queue is a no-op on web (localStorage storage handles persistence).
 */

/**
 * Check if the browser is currently online.
 */
export function checkConnectivity(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * No-op offline queue for web.
 * On web, localStorage handles persistence and we don't need
 * a separate queue mechanism.
 */
export const offlineQueue = {
  enqueue: (_item: unknown): void => {
    // No-op on web
  },
  flush: async (): Promise<void> => {
    // No-op on web
  },
  getPending: (): unknown[] => {
    return [];
  },
};
