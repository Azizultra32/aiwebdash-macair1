import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initIndexedDB,
  saveAudioChunk,
  getAllPatientMids,
  closeIndexedDB,
} from '../indexedDB';

class FakeWorker {
  onmessage: ((e: { data: any }) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  emit(data: any) {
    this.onmessage?.({ data } as any);
  }
}

class FakeFileReader {
  result: string | ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsDataURL(_blob: Blob) {
    this.result = 'data:audio/mp3;base64,dGVzdA==';
    this.onloadend?.();
  }
}

describe('indexedDB helpers', () => {
  let originalWorker: typeof Worker | undefined;
  let originalFileReader: typeof FileReader | undefined;
  let worker: FakeWorker;

  beforeEach(() => {
    worker = new FakeWorker();
    originalWorker = globalThis.Worker;
    (globalThis as any).Worker = vi.fn(() => worker);
    originalFileReader = globalThis.FileReader;
    (globalThis as any).FileReader = FakeFileReader as any;
  });

  afterEach(() => {
    closeIndexedDB();
    if (originalWorker) {
      (globalThis as any).Worker = originalWorker;
    } else {
      delete (globalThis as any).Worker;
    }
    if (originalFileReader) {
      (globalThis as any).FileReader = originalFileReader;
    } else {
      delete (globalThis as any).FileReader;
    }
    vi.restoreAllMocks();
  });

  it('initializes the worker', async () => {
    const promise = initIndexedDB();
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'init' });
    worker.emit({ type: 'init', status: 'success' });
    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects saving when worker not initialized', async () => {
    await expect(
      saveAudioChunk('id', 1, new Blob(['test']))
    ).rejects.toThrow('Database worker not initialized');
  });

  it('saves an audio chunk', async () => {
    const initPromise = initIndexedDB();
    worker.emit({ type: 'init', status: 'success' });
    await initPromise;

    const savePromise = saveAudioChunk('p1', 2, new Blob(['test']));
    expect(worker.postMessage).toHaveBeenLastCalledWith({
      type: 'save',
      data: { patientMidUUID: 'p1', chunk: 2, audioData: 'data:audio/mp3;base64,dGVzdA==' },
    });
    worker.emit({ type: 'save', status: 'success' });
    await expect(savePromise).resolves.toBeUndefined();
  });

  it('retrieves all patient mids', async () => {
    const initPromise = initIndexedDB();
    worker.emit({ type: 'init', status: 'success' });
    await initPromise;

    const midsPromise = getAllPatientMids();
    expect(worker.postMessage).toHaveBeenLastCalledWith({ type: 'getAllPatientMids' });
    worker.emit({ type: 'getAllPatientMids', status: 'success', result: ['a', 'b'] });
    await expect(midsPromise).resolves.toEqual(['a', 'b']);
  });
});
