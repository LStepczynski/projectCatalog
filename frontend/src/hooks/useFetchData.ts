import React from 'react';
import { fetchWrapper } from '@utils/fetchWrapper';

// Custom hook for fetching data
export const useFetchData = <T>(
  url: string,
  dependencies: React.DependencyList = [],
  fetchParams: RequestInit = {},
  cache: boolean = false,
  cacheDuration: number = 360
): { data: T | null; error: any; isLoading: boolean } => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWrapper(
          url,
          { signal, ...fetchParams },
          cache,
          cacheDuration
        );
        setData(response?.response?.return ?? null);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url, fetchParams, cache, cacheDuration, ...dependencies]);

  return { data, error, isLoading };
};
