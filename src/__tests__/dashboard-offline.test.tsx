import React, { useEffect } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

vi.mock('@/hooks/useCreateTranscript', () => ({
  __esModule: true,
  createTranscriptAsync: vi.fn().mockResolvedValue(undefined),
  updateTranscriptAsync: vi.fn().mockResolvedValue(undefined),
  deleteTranscriptAsync: vi.fn().mockResolvedValue(undefined),
}));

function TestComponent() {
  const isOnline = useOnlineStatus();
  const { queueAction, offlineQueueCount, processQueue } = useOfflineQueue();

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  const addAction = () => {
    queueAction({
      type: 'create',
      data: { patient_code: '123', patient_tag: 1, mid: '1', language: 'en', token_count: 0 },
    });
  };

  return (
    <div>
      <button onClick={addAction}>queue</button>
      <span data-testid="count">{offlineQueueCount}</span>
    </div>
  );
}

describe('Dashboard offline queue', () => {
  let navigatorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    navigatorSpy = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
  });

  afterEach(() => {
    navigatorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('processes queued actions when coming online', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TestComponent />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('queue'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    navigatorSpy.mockReturnValue(true);
    window.dispatchEvent(new Event('online'));

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });
});
