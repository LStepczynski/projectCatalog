import { capitalize } from '@utils/capitalize';

import { useIsLiked } from '@pages/article/hooks/useIsLiked';
import { useScreenWidth } from '@hooks/useScreenWidth';

import { Details } from '@pages/article/components/articleDetails/components/details';
import { Tags } from '@pages/article/components/articleDetails/components/tags';
import { Like } from '@pages/article/components/like';

import { Box, Heading, Text, Avatar } from '@primer/react';

interface DetailsProps {
  visibility: string;
  article: any;
}

export const ArticleDetails = (props: DetailsProps) => {
  const screenWidth = useScreenWidth();
  const { article, visibility } = props;
  const { isLiked, setIsLiked } = useIsLiked(article, visibility);

  return (
    <>
      <Box
        sx={{
          width: screenWidth < 768 ? '90%' : '80%',
          mx: 4,
          mb: 2,
        }}
      >
        {/* Article Title */}
        <Heading sx={{ fontSize: screenWidth < 700 ? '30px' : '38px' }}>
          {article.metadata.Title}
        </Heading>

        {/* Description */}
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
          {/* Author profile picture and username */}
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

          {/* Like button */}
          {visibility == 'public' && (
            <Like
              count={article.metadata.Rating}
              id={article.metadata.ID}
              setIsLiked={setIsLiked}
              isLiked={isLiked}
            />
          )}
        </Box>

        {/* Category and Tags */}
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
          {/* Category */}
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

          {/* Tags */}
          <Tags tags={article.metadata.SecondaryCategories} />
        </Box>

        {/* Difficulty label, Rating/Status, PublishedAt/CreatedAt */}
        <Details article={article} visibility={visibility} />
      </Box>
    </>
  );
};