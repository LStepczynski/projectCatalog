export const getRelativeDate = (timestamp: number): string => {
  const now = new Date().getTime();
  const date = new Date(timestamp * 1000).getTime();
  const elapsedTime = now - date;

  const msInMinute = 60 * 1000;
  const msInHour = 60 * msInMinute;
  const msInDay = 24 * msInHour;
  const msInWeek = 7 * msInDay;
  const msInMonth = 30 * msInDay;
  const msInYear = 365 * msInDay;

  if (elapsedTime < msInDay) {
    return 'Today';
  } else if (elapsedTime < msInWeek) {
    const daysAgo = Math.floor(elapsedTime / msInDay);
    return `${daysAgo} Day${daysAgo > 1 ? 's' : ''} ago`;
  } else if (elapsedTime < msInMonth) {
    const weeksAgo = Math.floor(elapsedTime / msInWeek);
    return `${weeksAgo} Week${weeksAgo > 1 ? 's' : ''} ago`;
  } else if (elapsedTime < msInYear) {
    const monthsAgo = Math.floor(elapsedTime / msInMonth);
    return `${monthsAgo} Month${monthsAgo > 1 ? 's' : ''} ago`;
  } else {
    const yearsAgo = Math.floor(elapsedTime / msInYear);
    return `${yearsAgo} Year${yearsAgo > 1 ? 's' : ''} ago`;
  }
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
    console.error("Error parsing user from localStorage", error);
    return undefined;
  }
};

export const logOut = () => {
  localStorage.removeItem('user');
  window.location.href = '/sign-in';
};

export const fetchWrapper = async (url: string, options: RequestInit = {}) => {
  // Check if the body is FormData
  const isFormData = options.body instanceof FormData;

  // Set default headers if not provided
  // Ensure defaultHeaders is always a valid HeadersInit
  const defaultHeaders: HeadersInit = !isFormData ? {
    'Content-Type': 'application/json',
    ...options.headers,
  } : options.headers ?? {}; // Use an empty object if headers is undefined

  // Create the full options object with default headers
  const fetchOptions: RequestInit = {
    method: 'GET', // Default method
    headers: defaultHeaders,
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Check if the response status indicates an error
    if (!response.ok) {
      const errorDetails = await response.text(); // Use text to handle potential non-JSON error messages
      throw new Error(`HTTP Error: ${response.status}. ${errorDetails}`);
    }

    // Parse response as JSON if content-type is application/json
    const contentType = response.headers.get('Content-Type');
    let data: any;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      data = await response.text();
    }

    // Example of setting user data to localStorage
    if (data.response?.user) {
      localStorage.setItem('user', JSON.stringify(data.response.user));
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw error to be handled by caller
  }
};

