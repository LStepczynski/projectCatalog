export const fetchWrapper = async (
  url: string,
  options: RequestInit = {},
  cache: boolean = false,
  cacheDuration: number = 360
) => {
  const now = Math.floor(Date.now() / 1000);

  if (cache) {
    const cachedRes = sessionStorage.getItem(url);
    if (cachedRes) {
      try {
        const data = JSON.parse(cachedRes);
        if (now < data.exp) {
          return data.data;
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Get the user and check for an expiration date
  const user = getUser();

  if (user && user.exp) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Request a new token if it is expired
    if (now > user.exp) {
      const renewReq = await fetch(`${backendUrl}/user/token-refresh`, {
        credentials: 'include',
      });
      const renewRes = await renewReq.json();
      if (renewRes.status != 200) {
        // Log out on error
        logOut();
        throw Error('User token verification failed');
      }
      localStorage.setItem('user', JSON.stringify(renewRes.response.user));
    }
  }

  // Check if the body is FormData
  const isFormData = options.body instanceof FormData;

  // Set default headers if not provided
  // Ensure defaultHeaders is always a valid HeadersInit
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

  try {
    const response = await fetch(url, fetchOptions);

    // Parse response as JSON if content-type is application/json
    const data = await response.json();

    // Example of setting user data to localStorage
    if (data.response?.user) {
      localStorage.setItem('user', JSON.stringify(data.response.user));
    }

    if (cache) {
      const storageData = {
        data: data,
        exp: now + (data.status == 200 ? cacheDuration : 90),
      };
      sessionStorage.setItem(url, JSON.stringify(storageData));
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw error to be handled by caller
  }
};
