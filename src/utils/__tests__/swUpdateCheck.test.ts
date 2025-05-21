import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hold originals of globals that will be mocked during tests
let originalFetch: typeof global.fetch;
let originalSetInterval: typeof global.setInterval;

let activateHandler: (event: ExtendableEvent) => void;
let mockClients: any[];

beforeEach(async () => {
  // Save current global implementations so they can be restored in afterEach
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
      const EventCtor =
        (global as any).ExtendableEvent ??
        class ExtendableEvent extends Event {
          waitUntil(_p: Promise<any>): void {}
        };
      const event = new EventCtor('activate') as ExtendableEvent;
      (event as any).waitUntil = (p: Promise<void>) => p.then(resolve);
      activateHandler(event);
    });

    for (const client of mockClients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'GET_CURRENT_VERSION',
      });
    }
  });
});
