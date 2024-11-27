/**
 * Validates if a password meets security requirements.
 *
 * @param {string} pass - The password to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
export const validatePassword = (pass: string): string => {
  if (pass.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[0-9]/.test(pass)) {
    return 'Password must include at least one number.';
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
    return 'Password must include at least one symbol (e.g., !@#$%^&*).';
  }

  if (!/[A-Z]/.test(pass)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (!/[a-z]/.test(pass)) {
    return 'Password must include at least one lowercase letter.';
  }

  return ''; // Return an empty string if the password is valid
};
