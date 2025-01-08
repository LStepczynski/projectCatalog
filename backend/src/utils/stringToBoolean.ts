export const stringToBoolean = (value: any): boolean | null => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null; // Return null for non-boolean strings
};
