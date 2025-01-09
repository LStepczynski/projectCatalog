import React from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';

import { categories as appCategories } from '@config/categories';

export const useFetchCategories = () => {
  // Initialize categories as a dict of {categoryName: null}
  const [categories, setCategories] = React.useState(() => {
    const initialArticles = appCategories.reduce((acc: any, category) => {
      acc[category.value] = null;
      return acc;
    }, {});

    return initialArticles;
  });
  const [error, setError] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch articles for each category in the `categories` dict
        const newArticles: any = {};
        for (const category of Object.keys(categories)) {
          const data = await fetchWrapper(
            `${backendUrl}/articles/${category}?limit=5`,
            { signal },
            true,
            60 * 60 * 5
          );
          newArticles[category] = data.response.return;
        }
        setCategories(newArticles);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();

    return () => {
      controller.abort();
    };
  }, []);

  return { categories, error, isLoading };
};
