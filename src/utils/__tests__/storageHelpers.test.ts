import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { saveToOfflineQueue, loadOfflineQueue, clearOfflineQueue } from '../storageHelpers';
import type { OfflineAction } from '../storageHelpers';

const sampleAction: OfflineAction = {
  type: 'create',
  data: { patient_code: '123', patient_tag: 1, token_count: 0 },
};

describe('storageHelpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('saves actions to localStorage and retrieves them', () => {
    saveToOfflineQueue(sampleAction);

    const queue = loadOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(sampleAction);
  });

  it('clears the queue', () => {
    saveToOfflineQueue(sampleAction);
    clearOfflineQueue();

    const queue = loadOfflineQueue();
    expect(queue).toHaveLength(0);
  });
});
