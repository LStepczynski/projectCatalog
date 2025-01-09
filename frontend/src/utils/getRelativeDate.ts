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
