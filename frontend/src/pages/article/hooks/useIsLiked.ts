import React from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';

/**
 * Custom React hook to determine and manage if an article is liked by the current user.
 *
 * This hook fetches the "liked" status of an article from the backend using the `fetchWrapper` utility.
 * It supports caching for efficient data retrieval and uses an AbortController to prevent memory leaks
 * during component unmount or dependency changes.
 *
 * @param {any} article - The article object containing metadata (e.g., `ID`, `Rating`) for identifying the article.
 * @param {string} visibility - The visibility status of the article (e.g., 'public', 'private').
 * @returns {{ isLiked: boolean; setIsLiked: React.Dispatch<React.SetStateAction<boolean>> }} -
 *          An object containing:
 *          - `isLiked`: A boolean indicating whether the article is liked.
 *          - `setIsLiked`: A state setter function to manually update the `isLiked` value.
 *
 * @example
 * // Example usage in a component
 * const { isLiked, setIsLiked } = useIsLiked(article, 'public');
 *
 * console.log(isLiked); // true or false
 *
 * // Manually update the liked state
 * setIsLiked(true);
 */

export const useIsLiked = (article: any, visibility: string) => {
  // State to track if the article is liked by the user
  const [isLiked, setIsLiked] = React.useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    /**
     * Fetch the "liked" status of the article from the backend.
     *
     * @returns {Promise<void>}
     */
    const fetchIsLiked = () => {
      fetchWrapper(
        `${backendUrl}/user/isLiked?articleId=${article.metadata.ID}`,
        { signal },
        true, // Enable caching for this request
        60 * 60 // Cache duration of 1 hour
      ).then((data) => {
        setIsLiked(data.response.result || false);
      });
    };

    // Only fetch for public articles with a non-zero rating
    if (visibility == 'public' && article.metadata.Rating != 0) {
      fetchIsLiked();
    }

    // Cleanup function to abort the request if the component unmounts or dependencies change
    return () => {
      controller.abort();
    };
  }, []);

  // Return the isLiked state as part of an object
  return { isLiked, setIsLiked };
};
