import { validateSignUpFields } from '@utils/validations/validateSignUpFields';
import { UserError } from '@utils/statusError';

describe('validateSignUpFields', () => {
  it('should throw an error if required fields are missing', () => {
    const invalidBody = {
      username: 'johndoe',
      password: '', // Missing password
      email: '', // Missing email
    };

    expect(() => validateSignUpFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignUpFields(invalidBody)).toThrow(
      'Missing fields: password, email'
    );
  });

  it('should throw an error if email format is invalid', () => {
    const invalidBody = {
      username: 'johndoe',
      password: 'Password123!',
      email: 'invalidemail', // Invalid email format
    };

    expect(() => validateSignUpFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignUpFields(invalidBody)).toThrow(
      'Invalid email format.'
    );
  });

  it('should throw an error if the password does not meet requirements', () => {
    const invalidBody = {
      username: 'johndoe',
      password: 'short', // Weak password
      email: 'johndoe@example.com',
    };

    expect(() => validateSignUpFields(invalidBody)).toThrow(UserError);
    expect(() => validateSignUpFields(invalidBody)).toThrow(
      'Password must be at least 8 characters.'
    );
  });

  it('should pass validation for a valid input', () => {
    const validBody = {
      username: 'johndoe',
      password: 'StrongPassword123!',
      email: 'johndoe@example.com',
    };

    expect(() => validateSignUpFields(validBody)).not.toThrow();
  });
});
