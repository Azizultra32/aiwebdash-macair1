import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store originals for globals we mock so they can be restored after each test
let originalFetch: typeof global.fetch;
let originalSelf: any;
let originalCaches: any;
let originalGlobalWbManifest: any;
let originalSelfWbManifest: any;

// Explicitly type the expected shape of the message event handled by the
// service worker. This mirrors the structure used in `public/sw.js` when
// checking the current application version.
let messageHandler: (event: MessageEvent<{ type: string; version: string }>) => Promise<void>;
let mockPostMessage: any;

// Setup a faux service worker environment before importing the script
beforeEach(async () => {
  // Capture current global implementations so we can restore them later
  originalFetch = global.fetch;
  originalSelf = (global as any).self;
  originalCaches = (global as any).caches;
  originalGlobalWbManifest = (global as any).__WB_MANIFEST;
  originalSelfWbManifest = (global as any).self?.__WB_MANIFEST;
  
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
  (global as any).__WB_MANIFEST = [];
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
  global.fetch = originalFetch;
  if (originalSelf === undefined) {
    delete (global as any).self;
  } else {
    (global as any).self = originalSelf;
  }
  if (originalCaches === undefined) {
    delete (global as any).caches;
  } else {
    (global as any).caches = originalCaches;
  }
  if (originalGlobalWbManifest === undefined) {
    delete (global as any).__WB_MANIFEST;
  } else {
    (global as any).__WB_MANIFEST = originalGlobalWbManifest;
  }
  if ((global as any).self) {
    if (originalSelfWbManifest === undefined) {
      delete (global as any).self.__WB_MANIFEST;
    } else {
      (global as any).self.__WB_MANIFEST = originalSelfWbManifest;
    }
  }
  vi.restoreAllMocks();
});

describe('service worker message handler', () => {
  it('posts UPDATE_AVAILABLE when versions differ', async () => {
    const event = new MessageEvent<{ type: string; version: string }>('message', {
      data: { type: 'CURRENT_VERSION', version: '1' },
    });
    await messageHandler(event);
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

  it('does nothing when versions match', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ json: () => Promise.resolve({ version: '1' }) }) as any;

    const event = new MessageEvent<{ type: string; version: string }>('message', {
      data: { type: 'CURRENT_VERSION', version: '1' },
    });
    await messageHandler(event);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalled();
    expect((global as any).caches.delete).not.toHaveBeenCalled();
    expect(mockPostMessage).not.toHaveBeenCalled();
  });
});
