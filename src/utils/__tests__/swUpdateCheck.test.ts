import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// References to globals we mock, assigned fresh in beforeEach so modifications
// in one test do not leak into another.
let originalFetch: typeof global.fetch;
let originalSetInterval: typeof global.setInterval;
let originalSelf: any;
let originalCaches: any;
let originalSelfWbManifest: any;
let intervalId: ReturnType<typeof setInterval> | undefined;

// Define ExtendableEvent interface for TypeScript
interface ExtendableEvent extends Event {
  waitUntil: (promise: Promise<any>) => void;
}

// Minimal ExtendableEvent implementation used for testing the activate handler
class TestExtendableEvent extends Event implements ExtendableEvent {
  constructor(public waitUntil: (promise: Promise<any>) => void) {
    super('activate');
  }
}

// Capture the activate event handler typed with our TestExtendableEvent helper
let activateHandler: (event: TestExtendableEvent) => void;
let mockPostMessage: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  // Capture the current implementations so they can be restored in afterEach.
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
  global.setInterval = vi.fn().mockImplementation(() => {
    intervalId = 1 as any;
    return intervalId as any;
  }) as unknown as typeof setInterval;
  global.fetch = vi.fn().mockResolvedValue({ json: vi.fn() }) as any;

  await import('../../../public/sw.js');
});

afterEach(() => {
  global.fetch = originalFetch;
  global.setInterval = originalSetInterval;
  if (intervalId !== undefined) {
    clearInterval(intervalId as any);
    intervalId = undefined;
  }
  if ((global as any).self?.__versionCheckInterval) {
    delete (global as any).self.__versionCheckInterval;
  }
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
