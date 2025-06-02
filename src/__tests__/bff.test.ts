import { describe, it, expect, beforeEach, vi } from 'vitest';


process.env.BFF_SUPABASE_URL = 'http://localhost';
process.env.BFF_SUPABASE_SERVICE_ROLE_KEY = 'key';

import request from 'supertest';

const fromMock = vi.fn();
const selectMock = vi.fn();
const orderMock = vi.fn();
const insertMock = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: (...args: any[]) => fromMock(...args),
    })),
  };
});

const { app } = require('../../server/index.cjs');

beforeEach(() => {
  fromMock.mockReset();
  selectMock.mockReset();
  orderMock.mockReset();
  insertMock.mockReset();
  fromMock.mockReturnValue({
    select: selectMock.mockReturnValue({ order: orderMock }),
    insert: insertMock,
  });
});

describe('BFF endpoints', () => {
  it('returns transcripts', async () => {
    const transcripts = [{ id: 1 }];
    orderMock.mockResolvedValue({ data: transcripts, error: null });
    const res: any = await request(app).get('/api/transcripts').send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(transcripts);
  });

  it('handles creation', async () => {
    insertMock.mockResolvedValue({ error: null });
    const t = { mid: '123' };
    const res: any = await request(app).post('/api/createTranscript').send(t);
    expect(insertMock).toHaveBeenCalledWith([t]);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ mid: '123' });
  });
});
