import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Like } from './components/like';

import { getRelativeDate } from '@utils/getRelativeDate';
import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { ArticleDifficultyLabel } from '@components/articles/articleDifficultyLabel';
import { AnimatedImage } from '@components/animation/animatedImage';
import Loading from '@components/animation/loading';

import {
  Box,
  Heading,
  Text,
  Avatar,
  Label,
  Link,
  LabelGroup,
} from '@primer/react';

export const Article = () => {
  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { id } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const visibility = searchParams.get('visibility') || 'public';

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (id) {
      fetchWrapper(
        `${backendUrl}/articles/get?id=${id}&visibility=${visibility}`,
        { signal },
        true,
        60 * 60
      ).then((data) => {
        if (data.status == 200) {
          setArticle(data.response.return);
        }
        setLoading(false);
      });
    }

    return () => {
      controller.abort();
    };
  }, [id]);

  const screenWidth = useScreenWidth();

  if (loading) {
    return <Loading />;
  }

  if (article == null) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '50vh',
        }}
      >
        <Heading>Article Not Found</Heading>
        <Text>Sorry, we could not find this article in our database.</Text>
        <Link sx={{ mt: '15px' }} href="/">
          Go to home
        </Link>
      </Box>
    );
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
          url={article.metadata.Image ? article.metadata.Image : defaultImage}
          alt="Article image"
        />
      </Box>

      <ArticleDetails visibility={visibility} article={article} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: screenWidth < 768 ? '85%' : '70%',
          mt: 4,
        }}
      >
        <Text as="p" sx={{ textAlign: 'justify' }}>
          {article.body.split('\n').map((paragraph: string, index: number) => {
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

interface DetailsProps {
  visibility: string;
  article: any;
}

const ArticleDetails = (props: DetailsProps) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const screenWidth = useScreenWidth();
  const { article, visibility } = props;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchIsLiked = () => {
      fetchWrapper(
        `${backendUrl}/user/isLiked?articleId=${article.metadata.ID}`,
        { signal },
        true,
        60 * 60
      ).then((data) => {
        setIsLiked(data.response.result || false);
      });
    };
    if (visibility == 'public' && article.metadata.Rating != 0) {
      fetchIsLiked();
    }

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          width: screenWidth < 768 ? '90%' : '80%',
          mx: 4,
          mb: 2,
        }}
      >
        <Heading sx={{ fontSize: screenWidth < 700 ? '30px' : '38px' }}>
          {article.metadata.Title}
        </Heading>
        <Text
          as="p"
          sx={{
            fontSize: screenWidth < 768 ? '14px' : '18px',
            marginTop: '10px',
            textAlign: 'justify',
          }}
        >
          {article.metadata.Description}
        </Text>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mr: 4,
            ml: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar size={40} src={article.metadata.AuthorProfilePic} />
            <Text
              sx={{
                fontWeight: 'bold',
                fontSize: screenWidth < 768 ? '14px' : '20px',
              }}
            >
              {article.metadata.Author}
            </Text>
          </Box>
          {visibility == 'public' && (
            <Like
              count={article.metadata.Rating}
              id={article.metadata.ID}
              setIsLiked={setIsLiked}
              isLiked={isLiked}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mr: 4,
            ml: 2,
            mt: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Text
              sx={{
                fontSize: '16px',
                borderRadius: '20px',
                border: '1px solid white',
                px: 3,
                py: 1,
              }}
            >
              {capitalize(article.metadata.PrimaryCategory)}
            </Text>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LabelGroup sx={{ justifyContent: 'center' }}>
              {article.metadata.SecondaryCategories?.map(
                (item: any, index: any) => (
                  <Label sx={{ mx: 1 }} key={index}>
                    {capitalize(item)}
                  </Label>
                )
              )}
            </LabelGroup>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'right',
            alignItems: 'center',
            gap: 4,
            mr: 4,
            ml: 2,
            mt: 4,
          }}
        >
          <ArticleDifficultyLabel value={article.metadata.Difficulty} />
          {visibility == 'public' && (
            <Text sx={{ textAlign: 'center' }}>
              {article.metadata.Rating} ✰ {' • '}
              {getRelativeDate(article.metadata.PublishedAt)}
            </Text>
          )}
          {visibility == 'private' && (
            <Text sx={{ textAlign: 'center' }}>
              {capitalize(article.metadata.Status)}
              {' • '}
              {getRelativeDate(article.metadata.CreatedAt)}
            </Text>
          )}
        </Box>
      </Box>
    </>
  );
};
