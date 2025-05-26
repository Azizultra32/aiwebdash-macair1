import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, unformatPhoneNumber } from '../phone';

describe('phone utilities', () => {
  it('formats phone numbers correctly', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('1234567')).toBe('(123) 456-7');
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  it('unformats phone numbers', () => {
    expect(unformatPhoneNumber('(123) 456-7890')).toBe('1234567890');
    expect(unformatPhoneNumber('123-456-7890')).toBe('1234567890');
  });
});
