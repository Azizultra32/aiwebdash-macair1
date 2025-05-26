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
let mockClients: { postMessage: ReturnType<typeof vi.fn> }[];

beforeEach(async () => {
  // Save current global implementations so they can be restored in afterEach
  originalFetch = global.fetch;
  originalSetInterval = global.setInterval;
  originalSelf = (global as any).self;
  originalCaches = (global as any).caches;
  originalSelfWbManifest = (global as any).self?.__WB_MANIFEST;
  vi.resetModules();
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

describe('service worker update check', () => {
  it('requests current version on activation', async () => {
    // Create a waitUntil function that returns the promise it's given
    const waitUntil = vi.fn((promise: Promise<any>) => promise);

    // Invoke the activation handler with a minimal ExtendableEvent instance
    await activateHandler(new TestExtendableEvent(waitUntil));

    // Ensure the promise passed to waitUntil completes
    await waitUntil.mock.calls[0][0];
    // Allow any microtasks to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify clients were checked and the message was sent
    expect((global as any).self.clients.matchAll).toHaveBeenCalled();
    for (const client of mockClients) {
      expect(client.postMessage).toHaveBeenCalledWith({
        type: 'GET_CURRENT_VERSION',
      });
    }
  });
});
