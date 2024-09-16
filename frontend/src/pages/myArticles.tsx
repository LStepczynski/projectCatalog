import React from 'react';
import { useParams } from 'react-router-dom';

import { Box, Heading, Pagination } from '@primer/react';

import { ArticleSmall } from '../components/contentDisplay/articles/articleSmall';
import { ArticlePrivate } from '../components/contentDisplay/articles/articlePrivate';
import { getUser, fetchWrapper } from '@helper/helper';
import { useScreenWidth } from '../components/other/useScreenWidth';
import { PencilIcon } from '@primer/octicons-react';

export const MyArticles = () => {
  const [publicArticles, setPublicArticles] = React.useState<any>([]);
  const [privateArticles, setPrivateArticles] = React.useState<any>([]);
  const screenWidth = useScreenWidth();
  const { page } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();
  if (user && !(user.CanPost == 'true' || user.Admin == 'true')) {
    return (window.location.href = '/');
  }

  React.useEffect(() => {
    fetchWrapper(
      `${backendUrl}/articles/author?authorName=${user?.Username}&page=${page}`
    ).then((data) => {
      setPublicArticles(data.response.return);
    });

    fetchWrapper(
      `${backendUrl}/articles/author?authorName=${user?.Username}&visibility=private`
    ).then((data) => {
      setPrivateArticles(data.response.return);
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
        Your Articles
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
        {publicArticles.map((item: any, index: any) => (
          <ArticleSmall key={index} article={item} />
        ))}
        {privateArticles.map((item: any, index: any) => (
          <ArticlePrivate key={index} article={item} />
        ))}
        <Box
          onClick={() => {
            window.location.href = '/create';
          }}
          sx={{
            width: '330px',
            height: '260px',
            position: 'relative',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'ansi.black',
            boxShadow: '0px 0px 25px rgba(0, 255, 0, 0)',
            transition: '0.3s all',
            ':hover': {
              boxShadow: '0px 0px 15px rgba(0, 255, 0, 0.4)',
            },
          }}
        >
          <Box
            sx={{
              width: '80px',
              position: 'absolute',
              left: '50%',
              top: '20%',
              transform: 'translate(-50%,0%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <PencilIcon size={80} />
            <Heading>Create</Heading>
          </Box>
        </Box>
      </Box>
      <Pagination
        currentPage={Number(page) || 1}
        pageCount={99}
        hrefBuilder={(page) => {
          return `/myArticles/${page}`;
        }}
      />
    </Box>
  );
};
