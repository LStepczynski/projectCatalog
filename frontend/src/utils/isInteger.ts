export const isInteger = (str: any): boolean => {
  // Check if the string is not empty and is a valid integer
  if (typeof str !== 'string') {
    return false;
  }
  return /^\-?\d+$/.test(str.trim());
};
