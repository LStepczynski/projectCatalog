import { UserObject } from '@type/user';

export const getUser = (): UserObject | undefined => {
  // Retrieve the string from localStorage
  const userString = localStorage.getItem('user');

  // If no user is found, return undefined
  if (!userString) {
    return undefined;
  }

  // Parse the string into a User object (assuming it's stored as JSON)
  try {
    const user: UserObject = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage', error);
    return undefined;
  }
};
