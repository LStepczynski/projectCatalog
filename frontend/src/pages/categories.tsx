import { Box } from '@primer/react';
import React from 'react';

import { CategoryHeader } from '../components/contentDisplay/categoryHeader';
import { ArticleLarge } from '../components/contentDisplay/articles/articleLarge';
import { ArticleMedium } from '../components/contentDisplay/articles/articleMedium';
import { ArticleSmall } from '../components/contentDisplay/articles/articleSmall';

import { capitalize, fetchWrapper } from '@helper/helper';
import { useScreenWidth } from '../components/other/useScreenWidth';
import { SkeletonCategoriesPanel } from '../components/core/skeletons/skeletonCategoriesPanel';

export const Categories = () => {
  const [articles, setArticles] = React.useState<any>({
    programming: null,
    '3d-modeling': null,
    electronics: null,
    woodworking: null,
    chemistry: null,
    cybersecurity: null,
    physics: null,
  });
  const screenWidth = useScreenWidth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchArticles = async () => {
      const newArticles: any = {};
      for (const category of Object.keys(articles)) {
        const data = await fetchWrapper(
          `${backendUrl}/articles/${category}?limit=5`,
          { signal }
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
