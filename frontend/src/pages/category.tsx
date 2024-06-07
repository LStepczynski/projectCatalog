import { useParams } from 'react-router-dom';
import React from 'react';
import { Box } from '@primer/react';
import { ArticleMedium } from '../components/contentDisplay/articleMedium';
import { ArticleSmall } from '../components/contentDisplay/articleSmall';

export const Category: React.FC = () => {
  const { categoryName, page } = useParams<{
    categoryName: string;
    page: string;
  }>();
  const [articles, setArticles] = React.useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    if (categoryName && page) {
      fetch(
        `${backendUrl}/articles/${categoryName}?page=${page}&searchBy=date&sortBy=lowest`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          setArticles(data.response.return);
          console.log(data);
        })
        .catch((error) => {
          console.error(
            'There has been a problem with calling the API:',
            error
          );
        });
    }
  }, [categoryName, page]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {articles?.slice(0, 2).map((item: any, index: any) => {
        return <ArticleMedium key={index} article={item} />;
      })}
      {articles?.slice(2).map((item: any, index: any) => {
        return <ArticleSmall key={index} article={item} />;
      })}
    </Box>
  );
};
