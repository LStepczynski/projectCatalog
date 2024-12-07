import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetArticles } from '@pages/category/hooks/useGetArticles';
import { useFetchData } from '@hooks/useFetchData';

import { SkeletonCategoryPanel } from '@components/common/skeletons/skeletonCategoryPanel';
import { NotFound } from '@pages/category/components/main/notFound';

import { Box, Pagination } from '@primer/react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const Category: React.FC = () => {
  const { getArticlesToRender } = useGetArticles();

  const { categoryName, page } = useParams<{
    categoryName: string;
    page: string;
  }>();

  const { data, isLoading }: any = useFetchData(
    `${backendUrl}/articles/${categoryName}?page=${page}`,
    [],
    {},
    true
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <SkeletonCategoryPanel />
      </Box>
    );
  }

  if (data.length == 0) {
    return <NotFound />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {getArticlesToRender(data)}
      </Box>

      <Pagination
        currentPage={Number(page) || 1}
        pageCount={99}
        hrefBuilder={(page) => {
          return `/categories/${categoryName}/${page}`;
        }}
      />
    </Box>
  );
};