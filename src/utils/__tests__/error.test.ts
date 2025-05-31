import { describe, it, expect } from 'vitest';
import { isError } from '../error';

describe('isError', () => {
  it('identifies Error instances', () => {
    expect(isError(new Error('fail'))).toBe(true);
  });

  it('identifies objects with message property', () => {
    expect(isError({ message: 'oops' })).toBe(true);
  });

  it('returns false for other values', () => {
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
    expect(isError({})).toBe(false);
  });
});
