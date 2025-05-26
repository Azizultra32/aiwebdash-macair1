import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// References to globals we mock, assigned fresh in beforeEach so modifications
// in one test do not leak into another.
let originalFetch: typeof global.fetch;
let originalSetInterval: typeof global.setInterval;

// Minimal representation of the service worker `activate` event used in tests.
interface ActivateEvent {
  waitUntil(promise: Promise<void>): void;
}

let activateHandler: (event: ActivateEvent) => void;
let mockClients: any[];

beforeEach(async () => {
  // Capture the current implementations so they can be restored in afterEach.
  originalFetch = global.fetch;
  originalSetInterval = global.setInterval;
  mockClients = [{ postMessage: vi.fn() }, { postMessage: vi.fn() }];

  (global as any).self = {
    addEventListener: (type: string, handler: any) => {
      if (type === 'activate') {
        activateHandler = handler;
      }
    },
    clients: {
      matchAll: vi.fn().mockResolvedValue(mockClients),
    },
  } as any;

  (global as any).self.__WB_MANIFEST = [];

  (global as any).caches = {
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
  } as any;

  // Mock the interval setter used inside the service worker logic
  global.setInterval = vi.fn() as unknown as typeof setInterval;
  global.fetch = vi.fn().mockResolvedValue({ json: vi.fn() }) as any;

  await import('../../../public/sw.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
  global.setInterval = originalSetInterval;
  delete (global as any).self;
  delete (global as any).caches;
});

describe('checkForUpdates', () => {
  it('sends GET_CURRENT_VERSION to all matched clients', async () => {
    await new Promise<void>((resolve) => {
      activateHandler({
        waitUntil: (p: Promise<void>) => p.then(resolve),
      } as unknown as ActivateEvent);
    });

    for (const client of mockClients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'GET_CURRENT_VERSION',
      });
    }
  });
});
