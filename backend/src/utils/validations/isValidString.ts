/**
 * Tests if a variable is a valid string that is not null, undefined, nor empty.
 *
 * @example
 * // Not a valid string
 * const variable = null;
 * console.log(isValidString(variable)); // false
 *
 * @example
 * // Not a valid string
 * const variable = '';
 * console.log(isValidString(variable)); // false
 * @example
 * // Not a valid string
 * const variable = undefined;
 * console.log(isValidString(variable)); // false
 *
 * @example
 * // Valid string
 * const variable = 'Hello, world!';
 * console.log(isValidString(variable)); // true
 *
 * @example
 * // Not a valid string (whitespace only)
 * const variable = '   ';
 * console.log(isValidString(variable)); // false
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} Returns `true` if the string is valid, otherwise `false`.
 */
export const isValidString = (str: string): boolean => {
  const isUndefined = str === undefined;
  const isNull = str === null;
  const isNotEmpty = typeof str === 'string' && str.trim() === '';

  return !isUndefined && !isNull && !isNotEmpty;
};
