import type { Transcript as TranscriptT } from '@/types/types';

const LOCALSTORAGE_KEY = 'offlineTranscripts';
const OFFLINE_QUEUE_KEY = 'offlineQueue';

export const saveToLocalStorage = (transcripts: TranscriptT[]) => {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(transcripts));
};

export const loadFromLocalStorage = (): TranscriptT[] => {
  const storedData = localStorage.getItem(LOCALSTORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

export const saveToOfflineQueue = (action: { type: string; data: any }) => {
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const loadOfflineQueue = () => {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};
