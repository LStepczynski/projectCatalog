import { describe, it, expect, vi } from 'vitest';

import { isValidString } from '@utils/validations/isValidString';

describe('isValidString', () => {
  it('should accept a valid string', () => {
    const str = 'valid string';
    const res = isValidString(str);
    expect(res).toBe(true);
  });

  it('should not accept a null var', () => {
    const str = null;
    const res = isValidString(str!);
    expect(res).toBe(false);
  });

  it('should not accept an undefined var', () => {
    const str = undefined;
    const res = isValidString(str!);
    expect(res).toBe(false);
  });

  it('should not accept an empty string', () => {
    const str = '';
    const res = isValidString(str);
    expect(res).toBe(false);
  });

  it('should not accept an empty string with white space', () => {
    const str = '   ';
    const res = isValidString(str);
    expect(res).toBe(false);
  });
});
