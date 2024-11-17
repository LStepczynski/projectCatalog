import React from 'react';
import { useParams } from 'react-router-dom';

import { useCheckPermission } from '@pages/adminView/hooks/useCheckPermission';
import { useScreenWidth } from '@hooks/useScreenWidth';
import { useFetchData } from '@hooks/useFetchData';

import { SkeletonCategoryPanel } from '@components/common/skeletons/skeletonCategoryPanel';
import { QuerySettings } from '@pages/adminView/components/main/querySettings';
import { ArticlePrivate } from '@components/articles/articlePrivate';
import { Separator } from '@components/animation/separator';

import { Box, Heading, Pagination } from '@primer/react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AdminView = () => {
  const [status, setStatus] = React.useState<'review' | 'private'>('review');
  const { page } = useParams();

  useCheckPermission();

  const { data, isLoading }: { data: any; error: any; isLoading: boolean } =
    useFetchData(
      `${backendUrl}/articles/private?status=${status}&page=${page}`
    );

  const screenWidth = useScreenWidth();

  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '70px',
        gap: 2,
        mb: '100px',
      }}
    >
      <Heading sx={{ fontSize: screenWidth < 768 ? '28px' : '42px' }}>
        Article Review
      </Heading>

      <Separator />

      {/* Allows to query for articles that are 'private' or 'review' */}
      <QuerySettings setStatus={setStatus} />

      {/* Render articles */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          width: '90%',
          mt: 4,
        }}
      >
        {!isLoading ? (
          <>
            {data.map((item: any, index: any) => (
              <ArticlePrivate key={index} article={item} />
            ))}
          </>
        ) : (
          <SkeletonCategoryPanel bigArticles={false} />
        )}
      </Box>

      {/* Switch between pages */}
      <Pagination
        currentPage={Number(page) || 1}
        pageCount={99}
        hrefBuilder={(page) => {
          return `/adminView/${page}`;
        }}
      />
    </Box>
  );
};
