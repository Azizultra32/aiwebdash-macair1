import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeTranscripts } from '@/hooks/useCreateTranscript';

// Mocks
var channelMock: any;
const unsubscribes: Array<vi.Mock> = [];
vi.mock('@/supabase', () => {
  channelMock = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(cb => {
      const unsub = vi.fn();
      unsubscribes.push(unsub);
      cb('SUBSCRIBED');
      return { unsubscribe: unsub };
    }),
  }));
  return { __esModule: true, default: { channel: channelMock } };
});
vi.mock('@/utils/logger', () => ({ logger: { debug: vi.fn() } }));

function TestComponent() {
  useRealtimeTranscripts(true);
  return <div>test</div>;
}

describe('useRealtimeTranscripts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    unsubscribes.length = 0;
    channelMock.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates independent subscriptions for each mount', () => {
    const client = new QueryClient();
    const { unmount } = render(
      <QueryClientProvider client={client}>
        <TestComponent />
      </QueryClientProvider>
    );
    vi.runAllTimers();
    expect(channelMock).toHaveBeenCalledTimes(1);
    unmount();
    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);

    const { unmount: unmount2 } = render(
      <QueryClientProvider client={client}>
        <TestComponent />
      </QueryClientProvider>
    );
    vi.runAllTimers();
    expect(channelMock).toHaveBeenCalledTimes(2);
    unmount2();
    expect(unsubscribes[1]).toHaveBeenCalledTimes(1);
  });
});
