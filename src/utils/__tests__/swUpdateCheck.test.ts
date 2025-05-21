import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Preserve originals for globals we mock
const originalFetch = global.fetch;
const originalSetInterval = global.setInterval;

let activateHandler: any;
let mockClients: any[];

beforeEach(async () => {
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

  global.setInterval = vi.fn();
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
      activateHandler({ waitUntil: (p: Promise<void>) => p.then(resolve) });
    });

    for (const client of mockClients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'GET_CURRENT_VERSION',
      });
    }
  });
});
