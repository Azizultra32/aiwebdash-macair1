import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let activateHandler: (event: any) => void;
let mockPostMessage: any;

beforeEach(async () => {
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

  (global as any).caches = {
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
  } as any;

  await import('../../../public/sw.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (global as any).self;
  delete (global as any).caches;
});

describe('service worker update check', () => {
  it('requests current version on activation', async () => {
    const waitUntil = vi.fn((promise: Promise<any>) => promise);

    await activateHandler({ waitUntil } as any);

    await waitUntil.mock.calls[0][0];
    await new Promise(resolve => setTimeout(resolve, 0));

    expect((global as any).self.clients.matchAll).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'GET_CURRENT_VERSION' });
  });
});

