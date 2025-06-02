// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AddressInfo } from 'net';
import { createRequire } from 'module';

const selectMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
const orderMock = vi.fn();
const eqMock = vi.fn();
const fromMock = vi.fn(() => ({
  select: selectMock,
  insert: insertMock,
  update: updateMock,
  delete: deleteMock,
}));


process.env.BFF_SUPABASE_URL = 'http://localhost';
process.env.BFF_SUPABASE_SERVICE_ROLE_KEY = 'test-key';

const require = createRequire(import.meta.url);
const supabaseKey = require.resolve('@supabase/supabase-js');
const originalModule = require(supabaseKey);
require.cache[supabaseKey] = {
  exports: { createClient: vi.fn(() => ({ from: fromMock })) },
};
const app = require('../../server/index.cjs');
afterAll(() => {
  require.cache[supabaseKey] = { exports: originalModule };
});

type Response = { status: number; body: any };
function request(target: any) {
  return {
    get: (path: string) => perform('GET', path),
    delete: (path: string) => perform('DELETE', path),
    post: (path: string) => ({ send: (body: any) => perform('POST', path, body) }),
  };

  async function perform(method: string, path: string, body?: any): Promise<Response> {
    const server = target.listen(0);
    await new Promise(res => server.once('listening', res));
    const port = (server.address() as AddressInfo).port;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    await new Promise(res => server.close(res));
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }
    return { status: res.status, body: parsed };
  }
}

describe('BFF API', () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
    orderMock.mockReset();
    eqMock.mockReset();
  });

  it('lists transcripts', async () => {
    const data = [{ mid: '1' }];
    orderMock.mockResolvedValue({ data, error: null });
    selectMock.mockReturnValue({ order: orderMock });
    const res = await request(app).get('/api/transcripts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });

  it('creates a transcript', async () => {
    insertMock.mockResolvedValue({ error: null });
    const transcript = { mid: 'abc', patient_code: '1' };
    const res = await request(app).post('/api/createTranscript').send(transcript);
    expect(insertMock).toHaveBeenCalledWith([transcript]);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ mid: 'abc' });
  });

  it('updates a transcript', async () => {
    eqMock.mockResolvedValue({ error: null });
    updateMock.mockReturnValue({ eq: eqMock });
    const transcript = { mid: 'abc', patient_code: '2' };
    const res = await request(app).post('/api/updateTranscript').send(transcript);
    expect(updateMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('mid', 'abc');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mid: 'abc' });
  });

  it('deletes a transcript', async () => {
    eqMock.mockResolvedValue({ error: null });
    deleteMock.mockReturnValue({ eq: eqMock });
    const res = await request(app).delete('/api/transcripts/abc');
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('mid', 'abc');
    expect(res.status).toBe(204);
  });
});
