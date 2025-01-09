import { describe, test, expect } from 'vitest';
import { isValidEmail } from '@utils/validations/isValidEmail';

describe('isValidEmail', () => {
  test('should return true for a valid email address', () => {
    const result = isValidEmail('user@example.com');
    expect(result).toBe(true);
  });

  test('should return false for an email missing "@" symbol', () => {
    const result = isValidEmail('userexample.com');
    expect(result).toBe(false);
  });

  test('should return false for an email missing the domain', () => {
    const result = isValidEmail('user@.com');
    expect(result).toBe(false);
  });

  test('should return false for an email missing the top-level domain', () => {
    const result = isValidEmail('user@example');
    expect(result).toBe(false);
  });

  test('should return false for an email with spaces', () => {
    const result = isValidEmail(' user@example.com ');
    expect(result).toBe(false);
  });

  test('should return false for an email with invalid characters', () => {
    const result = isValidEmail('user@exa#mple.com');
    expect(result).toBe(false);
  });

  test('should return false for an email with multiple "@" symbols', () => {
    const result = isValidEmail('user@@example.com');
    expect(result).toBe(false);
  });

  test('should return true for a valid email with subdomains', () => {
    const result = isValidEmail('user@sub.example.com');
    expect(result).toBe(true);
  });
});
