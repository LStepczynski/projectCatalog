import React from 'react';

import { Box, Select, Text, Heading } from '@primer/react';

import { ArticlePrivate } from '../components/contentDisplay/articles/articlePrivate';
import { getUserFromJWT } from '@helper/helper';
import { useScreenWidth } from '../components/other/useScreenWidth';

export const AdminView = () => {
  const [articles, setArticles] = React.useState([]);
  const [status, setStatus] = React.useState('review');
  const screenWidth = useScreenWidth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = getUserFromJWT();
  if (user && user.Admin != 'true') {
    return (window.location.href = '/');
  }

  React.useEffect(() => {
    fetch(`${backendUrl}/articles/private?status=${status}`, {
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
  }, [status]);

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
        {articles.map((item: any, index: any) => (
          <ArticlePrivate key={index} article={item} />
        ))}
      </Box>
    </Box>
  );
};
