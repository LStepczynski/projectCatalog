import { useParams } from 'react-router-dom';
import React from 'react';
import { Box, Heading, Text } from '@primer/react';
import { AnimatedImage } from '../components/animation/animatedImage';
import { getRelativeDate } from '@helper/time';

export const Article = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const [article, setArticle] = React.useState<any>(null);

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    if (id) {
      fetch(`${backendUrl}/articles/get?id=${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          setArticle(data.response.return);
          console.log(data);
        })
        .catch((error) => {
          console.error(
            'There has been a problem with calling the API:',
            error
          );
        });
    }
  }, [id]);

  if (article == null) {
    return <p>Error 404. Article not found</p>;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '70px',
      }}
    >
      <Box
        sx={{
          width: '80%',
          borderRadius: '15px',
          overflow: 'hidden',
        }}
      >
        <AnimatedImage
          url={article.metadata.Image ? article.metadata.Image : defaultImage}
          alt="Article image"
        />
      </Box>
      <Box
        sx={{
          width: '80%',
          mx: 4,
          mt: 3,
        }}
      >
        <Heading sx={{ fontSize: '40px' }}>{article.metadata.Title}</Heading>
        <Text
          as="p"
          sx={{ fontSize: '18px', marginTop: '10px', textAlign: 'justify' }}
        >
          {article.metadata.Description}
        </Text>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mr: 4,
            ml: 2,
          }}
        >
          <Text>{article.metadata.Author}</Text>
          <Text>
            {article.metadata.Rating} ✰ •{' '}
            {getRelativeDate(article.metadata.PublishedAt)}
          </Text>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
        <Text as="p">
          {article.body.split('\n').map((paragraph: string, index: number) => {
            return (
              <Text key={index} sx={{ fontSize: '20px' }}>
                {paragraph} <br></br>
              </Text>
            );
          })}
        </Text>
      </Box>
    </Box>
  );
};
