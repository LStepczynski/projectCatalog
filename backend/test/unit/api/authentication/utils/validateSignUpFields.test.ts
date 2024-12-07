import { validateSignFields } from '@api/authentication/utils';
import { UserError } from '@utils/statusError';

describe('validateSignUpFields', () => {
  it('should throw an error if required fields are missing', () => {
    const invalidBody = {
      username: 'johndoe',
      password: '', // Missing password
      email: '', // Missing email
    };

    expect(() => validateSignFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignFields(invalidBody)).toThrow(
      'Missing fields: password, email'
    );
  });

  it('should throw an error if email format is invalid', () => {
    const invalidBody = {
      username: 'johndoe',
      password: 'Password123!',
      email: 'invalidemail', // Invalid email format
    };

    expect(() => validateSignFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignFields(invalidBody)).toThrow(
      'Invalid email format.'
    );
  });

  it('should throw an error if the password does not meet requirements', () => {
    const invalidBody = {
      username: 'johndoe',
      password: 'short', // Weak password
      email: 'johndoe@example.com',
    };

    expect(() => validateSignFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignFields(invalidBody)).toThrow(
      'Password must be at least 8 characters.'
    );
  });

  it('should pass validation for a valid input', () => {
    const validBody = {
      username: 'johndoe',
      password: 'StrongPassword123!',
      email: 'johndoe@example.com',
    };

    expect(() => validateSignFields(validBody)).not.toThrow();
  });
});
