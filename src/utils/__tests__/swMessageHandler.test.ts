import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let messageHandler: (event: any) => Promise<void>;
let mockPostMessage: any;

// Setup a faux service worker environment before importing the script
beforeEach(async () => {
  // Ensure a fresh module state before each test run
  vi.resetModules();

  mockPostMessage = vi.fn();

  (global as any).self = {
    addEventListener: (type: string, handler: any) => {
      if (type === 'message') {
        messageHandler = handler;
      }
    },
    clients: {
      matchAll: vi.fn().mockResolvedValue([{ postMessage: mockPostMessage }]),
    },
  } as any;

  // Workbox expects this manifest to be defined during tests
  (global as any).self.__WB_MANIFEST = [];
  // Some build setups reference __WB_MANIFEST on the global scope
  (global as any).__WB_MANIFEST = [];

  (global as any).caches = {
    delete: vi.fn().mockResolvedValue(true),
  } as any;

  global.fetch = vi
    .fn()
    .mockResolvedValue({ json: () => Promise.resolve({ version: '2' }) }) as any;

  await import('../../../public/sw.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  // Cleanup globals
  delete (global as any).self;
  delete (global as any).caches;
  delete (global as any).__WB_MANIFEST;
});

describe('service worker message handler', () => {
  it('posts UPDATE_AVAILABLE when versions differ', async () => {
    await messageHandler({ data: { type: 'CURRENT_VERSION', version: '1' } });
    // Allow queued promises inside the service worker handler to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/version.json'),
      expect.any(Object)
    );
    expect((global as any).caches.delete).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'UPDATE_AVAILABLE',
      version: '2',
    });
  });
});
