import { useParams, useSearchParams } from 'react-router-dom';

import { useScreenWidth } from '@hooks/useScreenWidth';
import { useFetchData } from '@hooks/useFetchData';

import { ArticleDetails } from '@pages/article/components/articleDetails';
import { AnimatedImage } from '@components/animation/animatedImage';
import { NotFound } from '@pages/article/components/main/notFound';
import Loading from '@components/animation/loading';

import { Box, Text } from '@primer/react';

export const Article = () => {
  // Get params
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const visibility = searchParams.get('visibility') || 'public';

  // Fetch article
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const {
    data,
    error,
    isLoading,
  }: { data: any; error: any; isLoading: boolean } = useFetchData(
    `${backendUrl}/articles/get?id=${id}&visibility=${visibility}`
  );

  const defaultImage = `${import.meta.env.VITE_S3_LINK}/images/default.png`;

  const screenWidth = useScreenWidth();

  if (isLoading) {
    return <Loading />;
  }

  if (data == null) {
    return <NotFound />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '30px',
      }}
    >
      {/* Article information (picture, description, tags, etc.) */}
      <Box
        sx={{
          width: screenWidth < 700 ? '90%' : '80%',
          borderRadius: '15px',
          overflow: 'hidden',
          mx: 2,
          mb: 4,
        }}
      >
        <AnimatedImage
          url={data.metadata.Image ? data.metadata.Image : defaultImage}
          alt="Article image"
        />
      </Box>

      <ArticleDetails visibility={visibility} article={data} />

      {/* Article body */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: screenWidth < 768 ? '85%' : '70%',
          mt: 4,
        }}
      >
        <Text as="p" sx={{ textAlign: 'justify' }}>
          {data.body.split('\n').map((paragraph: string, index: number) => {
            return (
              <Text
                key={index}
                sx={{
                  fontSize: screenWidth < 768 ? '14px' : '18px',
                }}
              >
                {paragraph} <br></br>
              </Text>
            );
          })}
        </Text>
      </Box>
    </Box>
  );
};
