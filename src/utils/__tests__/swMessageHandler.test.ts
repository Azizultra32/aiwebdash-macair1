import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store originals for globals we mock. They are assigned in beforeEach so that
// tests always start from a clean slate even if previous tests modified them.
let originalFetch: typeof global.fetch;
let originalSelf: any;
let originalCaches: any;
let originalGlobalWbManifest: any;
let originalSelfWbManifest: any;

// Explicitly type the expected shape of the message event handled by the
// service worker. This mirrors the structure used in `public/sw.js` when
// checking the current application version.
type VersionMessage = { type: string; version: string };
let messageHandler: (event: MessageEvent<VersionMessage>) => Promise<void>;
let mockPostMessage: ReturnType<typeof vi.fn>;
let addToCacheListSpy: ReturnType<typeof vi.spyOn>;

// Setup a faux service worker environment before importing the script
beforeEach(async () => {
  // Capture current global implementations so we can restore them later
  originalFetch = global.fetch;
  originalSelf = (global as any).self;
  originalCaches = (global as any).caches;
  originalGlobalWbManifest = (global as any).__WB_MANIFEST;
  originalSelfWbManifest = (global as any).self?.__WB_MANIFEST;

  // Reset the module registry to ensure a fresh import of the service worker
  // script for each test run. This avoids state leakage across tests.
  vi.resetModules();
  mockPostMessage = vi.fn();
  const { PrecacheController } = await import('workbox-precaching');
  addToCacheListSpy = vi.spyOn(PrecacheController.prototype, 'addToCacheList');

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
  // Provide a dummy entry to ensure PrecacheController.addToCacheList
  // receives an array of objects
  const manifest = [{ url: '/index.html', revision: '1' }];
  (global as any).self.__WB_MANIFEST = manifest;
  (global as any).__WB_MANIFEST = manifest;
  (global as any).caches = {
    delete: vi.fn().mockResolvedValue(true),
  } as any;

  global.fetch = vi
    .fn()
    .mockResolvedValue({ json: () => Promise.resolve({ version: '2' }) }) as any;

  await import('../../../public/sw.js');
});

afterEach(() => {
  // Restore the original fetch implementation to prevent test pollution
  global.fetch = originalFetch;
  addToCacheListSpy.mockRestore();
  
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
    const event = new MessageEvent<VersionMessage>('message', {
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
    expect(addToCacheListSpy).toHaveBeenCalledWith(expect.any(Array));
  });

  it('does nothing when versions match', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ json: () => Promise.resolve({ version: '1' }) }) as any;

    const event = new MessageEvent<VersionMessage>('message', {
      data: { type: 'CURRENT_VERSION', version: '1' },
    });
    await messageHandler(event);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalled();
    expect((global as any).caches.delete).not.toHaveBeenCalled();
    expect(mockPostMessage).not.toHaveBeenCalled();
    expect(addToCacheListSpy).toHaveBeenCalledWith(expect.any(Array));
  });
});
