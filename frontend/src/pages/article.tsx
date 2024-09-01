import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Box, Heading, Text, Avatar, Label, LabelGroup } from '@primer/react';

import { useScreenWidth } from '../components/other/useScreenWidth';
import { getRelativeDate, capitalize } from '@helper/helper';
import { AnimatedImage } from '../components/animation/animatedImage';
import { ArticleDifficultyLabel } from '../components/contentDisplay/articles/articleDifficultyLabel';
import { Like } from '../components/contentDisplay/like';

export const Article = () => {
  const [article, setArticle] = React.useState<any>(null);
  const { id } = useParams<{
    id: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const visibility = searchParams.get('visibility') || 'public';

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    if (id) {
      fetch(`${backendUrl}/articles/get?id=${id}&visibility=${visibility}`, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem('verificationToken') || ''
          }`,
        },
      })
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
        })
        .catch((error) => {
          console.error('There has been a problem with calling the API:');
        });
    }
  }, [id]);

  const screenWidth = useScreenWidth();

  if (article == null) {
    return <p>Error 404. Article not found</p>;
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
    const fetchIsLiked = async () => {
      const isLikedReq = await fetch(`${backendUrl}/user/isLiked`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            localStorage.getItem('verificationToken') || ''
          }`,
        },
        body: JSON.stringify({ articleId: article.metadata.ID }),
      });
      const isLikedRes = await isLikedReq.json();
      setIsLiked(isLikedRes.response.result || false);
    };
    fetchIsLiked();
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
          <Like
            count={article.metadata.Rating}
            id={article.metadata.ID}
            setIsLiked={setIsLiked}
            isLiked={isLiked}
          />
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
