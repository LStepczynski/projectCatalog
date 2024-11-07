interface User {
  [key: string]: any;
}

export const getUser = (): User | undefined => {
  // Retrieve the string from localStorage
  const userString = localStorage.getItem('user');

  // If no user is found, return undefined
  if (!userString) {
    return undefined;
  }

  // Parse the string into a User object (assuming it's stored as JSON)
  try {
    const user: User = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage', error);
    return undefined;
  }
};
