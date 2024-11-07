import React from 'react';
import { useParams } from 'react-router-dom';

import { getUser } from '@utils/getUser';
import { fetchWrapper } from '@utils/fetchWrapper';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { SkeletonCategoryPanel } from '@components/common/skeletons/skeletonCategoryPanel';
import { ArticlePrivate } from '@components/articles/articlePrivate';

import { Box, Select, Text, Heading, Pagination } from '@primer/react';

export const AdminView = () => {
  const [articles, setArticles] = React.useState<any>(null);
  const [status, setStatus] = React.useState('review');
  const screenWidth = useScreenWidth();
  const { page } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = getUser();
  if (user && user.Admin != 'true') {
    return (window.location.href = '/');
  }

  React.useEffect(() => {
    if (user?.Verified != 'true') {
      alert(
        'Your account is not verified. Please verify your email to review articles.'
      );
      window.location.href = '/account';
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(
      `${backendUrl}/articles/private?status=${status}&page=${page}`,
      { signal },
      true
    ).then((data) => {
      setArticles(data.response.return);
    });

    return () => {
      controller.abort();
    };
  }, [status, page]);

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
      <Box
        sx={{
          width: '100%',
          height: '1px',
          backgroundColor: 'ansi.black',
        }}
      ></Box>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          justifyItems: 'right',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Text
            sx={{
              opacity: 0.7,
              fontSize: '14px',
            }}
          >
            Display:
          </Text>
          <Select
            onChange={(event) => {
              setArticles(null);
              setStatus(event?.target.value);
            }}
          >
            <Select.Option value="review">Review</Select.Option>
            <Select.Option value="private">Private</Select.Option>
          </Select>
        </Box>
      </Box>

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
        {articles ? (
          <>
            {articles.map((item: any, index: any) => (
              <ArticlePrivate key={index} article={item} />
            ))}
          </>
        ) : (
          <SkeletonCategoryPanel bigArticles={false} />
        )}
      </Box>
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
