import { useFetchData } from '@hooks/useFetchData';

import { categories as appCategories } from '@config/categories';
import { PublicArticle } from '@type/article';

interface ReturnVal {
  categories: Record<string, PublicArticle[]> | null;
  error: any;
  isLoading: boolean;
  maxPage: number;
}

export const useFetchCategories = (page: number): ReturnVal => {
  const maxPage = Math.ceil(appCategories.length / 4);
  if (page > maxPage) {
    page = maxPage;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { data, error, isLoading } = useFetchData(
    `${backendUrl}/articles/category/overview?page=${page}`,
    [page],
    {},
    true,
    900
  );

  // Transform `data` to match `categories`
  const categories =
    data && typeof data === 'object'
      ? (data as Record<string, PublicArticle[]>)
      : null;

  return { categories, error, isLoading, maxPage };
};
