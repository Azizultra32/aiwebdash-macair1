import type { TranscriptData } from '@/types/types';

export type OfflineAction =
  | { type: 'create'; data: TranscriptData }
  | { type: 'update'; data: { mid: string; token_count: number } }
  | { type: 'delete'; data: { mid: string } };

const OFFLINE_QUEUE_KEY = 'offlineQueue';

/**
 * Save an action to the offline queue stored in localStorage.
 */
export const saveToOfflineQueue = (action: OfflineAction): void => {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Load all actions currently queued offline.
 */
export const loadOfflineQueue = (): OfflineAction[] => {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
};

/**
 * Remove all offline actions from storage.
 */
export const clearOfflineQueue = (): void => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};
