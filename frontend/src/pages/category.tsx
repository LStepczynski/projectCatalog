import { useParams } from 'react-router-dom';
import React from 'react';
import { Box, Heading, Text } from '@primer/react';
import { ArticleLarge } from '../components/contentDisplay/articles/articleLarge';
import { ArticleMedium } from '../components/contentDisplay/articles/articleMedium';
import { ArticleSmall } from '../components/contentDisplay/articles/articleSmall';
import * as styles from '../componentStyles';
import { useScreenWidth } from '../components/other/useScreenWidth';

export const Category: React.FC = () => {
  const { categoryName, page } = useParams<{
    categoryName: string;
    page: string;
  }>();
  const [articles, setArticles] = React.useState([]);
  const screenWidth = useScreenWidth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    if (categoryName && page) {
      fetch(`${backendUrl}/articles/${categoryName}?page=${page}`)
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

  const getArticlesToRender = () => {
    if (screenWidth < 430) {
      return articles.map((item, index) => (
        <ArticleSmall key={index} article={item} />
      ));
    }

    if (screenWidth < 1280) {
      return articles.map((item, index) => (
        <ArticleMedium key={index} article={item} />
      ));
    }

    return (
      <>
        {articles.slice(0, 2).map((item, index) => (
          <ArticleLarge key={index} article={item} />
        ))}
        {articles.slice(2).map((item, index) => (
          <ArticleMedium key={index} article={item} />
        ))}
      </>
    );
  };

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
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {getArticlesToRender()}
    </Box>
  );
};
