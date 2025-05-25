import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hold originals of globals that will be mocked during tests
let originalFetch: typeof global.fetch;
let originalSetInterval: typeof global.setInterval;
let originalSelf: any;
let originalCaches: any;
let originalSelfWbManifest: any;

// Minimal ExtendableEvent implementation used for testing the activate handler
class TestExtendableEvent extends Event implements ExtendableEvent {
  constructor(public waitUntil: (promise: Promise<any>) => void) {
    super('activate');
  }
}

let activateHandler: (event: ExtendableEvent) => void;
let mockPostMessage: any;

beforeEach(async () => {
  // Save current global implementations so they can be restored in afterEach
  originalFetch = global.fetch;
  originalSetInterval = global.setInterval;
  originalSelf = (global as any).self;
  originalCaches = (global as any).caches;
  originalSelfWbManifest = (global as any).self?.__WB_MANIFEST;
  
  // Ensure a fresh module state before each test run
  vi.resetModules();
  
  mockPostMessage = vi.fn();

  (global as any).self = {
    addEventListener: (type: string, handler: any) => {
      if (type === 'activate') {
        activateHandler = handler;
      }
    },
    clients: {
      matchAll: vi.fn().mockResolvedValue([{ postMessage: mockPostMessage }]),
    },
  } as any;

  (global as any).self.__WB_MANIFEST = [];
  (global as any).__WB_MANIFEST = [];

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
  global.fetch = originalFetch;
  global.setInterval = originalSetInterval;
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
  if ((global as any).self) {
    if (originalSelfWbManifest === undefined) {
      delete (global as any).self.__WB_MANIFEST;
    } else {
      (global as any).self.__WB_MANIFEST = originalSelfWbManifest;
    }
  }
  vi.restoreAllMocks();
});

describe('service worker activation check', () => {
  it('requests current version on activate', async () => {
    const event = { waitUntil: vi.fn() };

    activateHandler(event as any);
    await event.waitUntil.mock.calls[0][0];

    expect((global as any).self.clients.matchAll).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'GET_CURRENT_VERSION' });
  });
});
