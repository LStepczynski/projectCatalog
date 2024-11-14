import { getUser } from './getUser';
import { logOut } from './logOut';

/**
 * Checks if the provided user object is expired by checking the user.exp propery
 *
 * @async
 * @param {*} user
 * @returns {void}
 */
const checkUserExpiration = async (user: any) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const now = Math.floor(Date.now() / 1000);

  // Check if the user object expired
  if (now > user.exp) {
    // Request a new user object
    const renewReq = await fetch(`${backendUrl}/user/token-refresh`, {
      credentials: 'include',
    });
    const renewRes = await renewReq.json();

    // Log out on error
    if (renewRes.status != 200) {
      logOut();
      throw Error('User token verification failed');
    }

    // Save the new user object in storage
    localStorage.setItem('user', JSON.stringify(renewRes.response.user));
  }
};

/**
 * Saves the object {data} under name {url} and sets the expiration to {cacheDuration}
 *
 * @param {string} url - Name under which the data is stored
 * @param {*} data - Data to store
 * @param {number} cacheDuration - Duration after which the data will expire
 */
const saveToCache = (url: string, data: any, cacheDuration: number) => {
  const now = Math.floor(Date.now() / 1000);

  const storageData = {
    data,
    exp: now + (data.status == 200 ? cacheDuration : 90),
  };
  sessionStorage.setItem(url, JSON.stringify(storageData));
};

/**
 * Create options for the fetch function from {options} and preset values
 *
 * @param {*} options
 * @returns {RequestInit}
 */
const getFetchOptions = (options: any) => {
  const isFormData = options.body instanceof FormData;

  // Set default headers if not provided
  const defaultHeaders: HeadersInit = !isFormData
    ? {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    : options.headers ?? {}; // Use an empty object if headers is undefined

  // Create the full options object with default headers
  const fetchOptions: RequestInit = {
    method: 'GET', // Default method
    headers: defaultHeaders,
    credentials: 'include',
    ...options,
  };

  return fetchOptions;
};

export const fetchWrapper = async (
  url: string,
  options: RequestInit = {},
  cache: boolean = false,
  cacheDuration: number = 360
) => {
  // Current Time
  const now = Math.floor(Date.now() / 1000);

  // Check for cached requests
  if (cache) {
    const cachedRes = sessionStorage.getItem(url);
    if (cachedRes) {
      const data = JSON.parse(cachedRes);

      // Return the cache if it is not outdated
      if (now < data.exp) {
        return data.data;
      }
    }
  }

  // Get the user and check for an expiration date
  const user = getUser();

  // Check for user expiration
  if (user && user.exp) {
    await checkUserExpiration(user);
  }

  const fetchOptions = getFetchOptions(options);

  const response = await fetch(url, fetchOptions);

  // Parse response as JSON if content-type is application/json
  const data = await response.json();

  // If the response contains an user object, save it to storage
  if (data.response?.user) {
    localStorage.setItem('user', JSON.stringify(data.response.user));
  }

  // Save the response to the cache if enabled
  if (cache) {
    saveToCache(url, data, cacheDuration);
  }

  return data;
};
