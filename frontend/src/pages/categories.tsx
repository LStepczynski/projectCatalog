import { Box } from '@primer/react';
import React from 'react';

import { CategoryHeader } from '../components/contentDisplay/categoryHeader';
import { ArticleMedium } from '../components/contentDisplay/articleMedium';
import { ArticleSmall } from '../components/contentDisplay/articleSmall';

import { capitalize } from '@helper/helper';

export const Categories = () => {
  const [articles, setArticles] = React.useState<any>({
    programming: [],
    '3d-modeling': [],
    electronics: [],
    woodworking: [],
    chemistry: [],
    cybersecurity: [],
    physics: [],
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const fetchArticles = async () => {
      const newArticles: any = {};
      for (const category of Object.keys(articles)) {
        try {
          const response = await fetch(
            `${backendUrl}/articles/${category}?limit=5`
          );
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          const data = await response.json();
          newArticles[category] = data.response.return;
        } catch (error) {
          console.error(
            'There has been a problem with calling the API:',
            error
          );
        }
      }
      setArticles(newArticles);
    };

    fetchArticles();
  }, []);

  return (
    <Box>
      {Object.keys(articles).map((keyName: string) => {
        if (articles[keyName].length == 0) {
          return <></>;
        }

        return (
          <Box key={keyName} sx={{ mt: '50px' }}>
            <CategoryHeader
              title={capitalize(keyName)}
              link={`/categories/${keyName}/1`}
            />
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                mt: 4,
              }}
            >
              {articles[keyName]?.slice(0, 2).map((item: any, index: any) => {
                return <ArticleMedium key={index} article={item} />;
              })}
              {articles[keyName]?.slice(2).map((item: any, index: any) => {
                return <ArticleSmall key={index} article={item} />;
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
