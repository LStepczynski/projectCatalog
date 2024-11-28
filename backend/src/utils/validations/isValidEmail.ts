/**
 * Validates whether the given string is a valid email address.
 *
 * A valid email must:
 * - Contain only one "@" symbol.
 * - Have a domain with at least one "." after the "@".
 * - Avoid spaces or invalid characters.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} `true` if the email is valid, otherwise `false`.
 *
 * @example
 * // Valid email
 * console.log(isValidEmail('user@example.com')); // true
 *
 * @example
 * // Invalid email (missing domain)
 * console.log(isValidEmail('user@.com')); // false
 *
 * @example
 * // Invalid email (extra spaces)
 * console.log(isValidEmail(' user@example.com ')); // false
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
