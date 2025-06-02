// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';
import request from 'supertest';

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
