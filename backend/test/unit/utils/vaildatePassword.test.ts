import { describe, test, expect } from 'vitest';
import { validatePassword } from '@utils/validatePassword';

describe('validatePassword', () => {
  test('should return an error if the password is less than 8 characters', () => {
    const result = validatePassword('Short1!');
    expect(result).toBe('Password must be at least 8 characters.');
  });

  test('should return an error if the password does not include a number', () => {
    const result = validatePassword('NoNumber!');
    expect(result).toBe('Password must include at least one number.');
  });

  test('should return an error if the password does not include a symbol', () => {
    const result = validatePassword('NoSymbol1');
    expect(result).toBe(
      'Password must include at least one symbol (e.g., !@#$%^&*).'
    );
  });

  test('should return an error if the password does not include an uppercase letter', () => {
    const result = validatePassword('nouppercase1!');
    expect(result).toBe('Password must include at least one uppercase letter.');
  });

  test('should return an error if the password does not include a lowercase letter', () => {
    const result = validatePassword('NOLOWERCASE1!');
    expect(result).toBe('Password must include at least one lowercase letter.');
  });

  test('should return an empty string for a valid password', () => {
    const result = validatePassword('ValidPass1!');
    expect(result).toBe('');
  });
});
