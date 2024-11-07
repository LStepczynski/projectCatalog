import React from 'react';
import { Box } from '@primer/react';

import { capitalize } from '@utils/capitalize';
import { fetchWrapper } from '@utils/fetchWrapper';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { ArticleLarge } from '@components/articles/articleLarge';
import { ArticleMedium } from '@components/articles/articleMedium';
import { ArticleSmall } from '@components/articles/articleSmall';

import { CategoryHeader } from './components/categoryHeader';
import { SkeletonCategoriesPanel } from './components/skeletonCategoriesPanel';

import { categories } from '@config/categories';

export const Categories = () => {
  const [articles, setArticles] = React.useState(() => {
    const initialArticles = categories.reduce((acc: any, category) => {
      acc[category.value] = null;
      return acc;
    }, {});

    return initialArticles;
  });
  const screenWidth = useScreenWidth();
  console.log(articles);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchArticles = async () => {
      const newArticles: any = {};
      for (const category of Object.keys(articles)) {
        const data = await fetchWrapper(
          `${backendUrl}/articles/${category}?limit=5`,
          { signal },
          true,
          60 * 60 * 5
        );
        newArticles[category] = data.response.return;
      }
      setArticles(newArticles);
    };

    fetchArticles();

    return () => {
      controller.abort();
    };
  }, []);

  const getArticlesToRender = (keyName: string) => {
    if (screenWidth < 430) {
      return articles[keyName]?.map((item: any, index: any) => (
        <ArticleSmall key={index} article={item} />
      ));
    }

    if (screenWidth < 1280) {
      return articles[keyName]?.map((item: any, index: any) => (
        <ArticleMedium key={index} article={item} />
      ));
    }

    return (
      <>
        {articles[keyName]?.slice(0, 2).map((item: any, index: any) => (
          <ArticleLarge key={index} article={item} />
        ))}
        {articles[keyName]?.slice(2).map((item: any, index: any) => (
          <ArticleMedium key={index} article={item} />
        ))}
      </>
    );
  };

  const getHeaderWidth = () => {
    if (screenWidth < 430) {
      return '95%';
    }
    if (screenWidth < 500) {
      return '90%';
    }
    if (screenWidth < 1012) {
      return '450px';
    }
    if (screenWidth < 1280) {
      return '900px';
    }
    return '1250px';
  };

  return (
    <Box>
      {Object.keys(articles).map((keyName: string) => {
        if (!articles[keyName]) {
          return (
            <SkeletonCategoriesPanel
              headerWidth={getHeaderWidth()}
              key={keyName}
            />
          );
        }
        if (articles[keyName].length == 0) {
          return null;
        }

        return (
          <Box
            key={keyName}
            sx={{ mt: '50px', display: 'grid', justifyItems: 'center' }}
          >
            <Box
              sx={{
                width: getHeaderWidth(),
                mx: 3,
              }}
            >
              <CategoryHeader
                title={capitalize(keyName)}
                link={`/categories/${keyName}/1`}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              {getArticlesToRender(keyName)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
