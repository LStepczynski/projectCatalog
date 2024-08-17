import React from 'react';

import { Box, Text, Heading } from '@primer/react';

import { ArticlePrivate } from '../components/contentDisplay/articles/articlePrivate';
import { getUserFromJWT } from '@helper/helper';
import { useScreenWidth } from '../components/other/useScreenWidth';

export const AdminView = () => {
  const [articles, setArticles] = React.useState([]);
  const screenWidth = useScreenWidth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = getUserFromJWT();
  if (user && user.Admin != 'true') {
    return (window.location.href = '/');
  }

  React.useEffect(() => {
    fetch(`${backendUrl}/articles/private?status=review`, {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem('verificationToken') || ''
        }`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setArticles(data.response.return);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

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
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          width: '90%',
          mt: 4,
        }}
      >
        {articles.map((item: any, index: any) => (
          <ArticlePrivate key={index} article={item} />
        ))}
      </Box>
    </Box>
  );
};
