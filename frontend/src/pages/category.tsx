import { useParams } from 'react-router-dom';
import React from 'react';
import { Box, Heading, Text, Pagination } from '@primer/react';
import { ArticleLarge } from '../components/contentDisplay/articles/articleLarge';
import { ArticleMedium } from '../components/contentDisplay/articles/articleMedium';
import { ArticleSmall } from '../components/contentDisplay/articles/articleSmall';
import * as styles from '../componentStyles';
import { useScreenWidth } from '../components/other/useScreenWidth';
import { fetchWrapper } from '@helper/helper';

import { SkeletonCategoryPanel } from '../components/core/skeletons/skeletonCategoryPanel';

export const Category: React.FC = () => {
  const { categoryName, page } = useParams<{
    categoryName: string;
    page: string;
  }>();
  const [articles, setArticles] = React.useState<any>(null);
  const screenWidth = useScreenWidth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (categoryName && page) {
      fetchWrapper(
        `${backendUrl}/articles/${categoryName}?page=${page}`,
        {
          signal,
        },
        true,
        60 * 2
      ).then((data) => {
        setArticles(data.response.return);
      });
    }

    return () => {
      controller.abort();
    };
  }, [categoryName, page]);

  const getArticlesToRender = () => {
    if (!articles) return null;
    if (screenWidth < 430) {
      return articles.map((item: any, index: any) => (
        <ArticleSmall key={index} article={item} />
      ));
    }

    if (screenWidth < 1280) {
      return articles.map((item: any, index: any) => (
        <ArticleMedium key={index} article={item} />
      ));
    }

    return (
      <>
        {articles.slice(0, 2).map((item: any, index: any) => (
          <ArticleLarge key={index} article={item} />
        ))}
        {articles.slice(2).map((item: any, index: any) => (
          <ArticleMedium key={index} article={item} />
        ))}
      </>
    );
  };

  if (!articles) {
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

  if (articles.length == 0) {
    return (
      <Box sx={{ mt: '100px' }}>
        <Box sx={{ mb: 4 }}>
          <Heading
            sx={{
              ...styles.H1,
              display: 'grid',
              justifyContent: 'center',
            }}
          >
            No Articles Found
          </Heading>
        </Box>
        <Box>
          <Text
            as="p"
            sx={{
              ...styles.P1,
              display: 'grid',
              justifyContent: 'center',
              textAlign: 'center',
              mx: 2,
            }}
          >
            Sorry, no articles have been published yet. Check again later.
          </Text>
        </Box>
      </Box>
    );
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
        {getArticlesToRender()}
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
