import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let activateHandler: (event: any) => Promise<void> | void;
let mockPostMessage1: any;
let mockPostMessage2: any;

beforeEach(async () => {
  mockPostMessage1 = vi.fn();
  mockPostMessage2 = vi.fn();

  (global as any).self = {
    addEventListener: (type: string, handler: any) => {
      if (type === 'activate') {
        activateHandler = handler;
      }
    },
    clients: {
      matchAll: vi
        .fn()
        .mockResolvedValue([{ postMessage: mockPostMessage1 }, { postMessage: mockPostMessage2 }]),
    },
  } as any;

  (global as any).self.__WB_MANIFEST = [];
  (global as any).__WB_MANIFEST = [];

  (global as any).caches = {
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
  } as any;

  global.setInterval = vi.fn();

  await import('../../../public/sw.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (global as any).self;
  delete (global as any).caches;
  delete (global as any).__WB_MANIFEST;
});

describe('service worker update check', () => {
  it('sends GET_CURRENT_VERSION to all clients on activate', async () => {
    await activateHandler({
      waitUntil: (p: Promise<any>) => p,
    });

    // Flush any queued microtasks
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockPostMessage1).toHaveBeenCalledWith({ type: 'GET_CURRENT_VERSION' });
    expect(mockPostMessage2).toHaveBeenCalledWith({ type: 'GET_CURRENT_VERSION' });
  });
});
