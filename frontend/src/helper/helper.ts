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

export const getUserFromJWT = () => {
  const jwtToken = localStorage.getItem('verificationToken') || '';
  if (jwtToken == '') {
    return undefined;
  }
  return decodeJWT(jwtToken);
};

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return undefined;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const user = JSON.parse(jsonPayload);
    const requiredFields = [
      'Username',
      'ProfilePic',
      'Email',
      'AccountCreated',
      'iat',
    ];

    if (requiredFields.some((field) => user[field] === undefined)) {
      return undefined;
    }

    return user;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return undefined;
  }
};

export const logOut = () => {
  localStorage.removeItem('verificationToken');
  window.location.href = '/sign-in';
};
