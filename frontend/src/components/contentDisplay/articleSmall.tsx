import { Box, Heading, Text } from '@primer/react';
import React from 'react';
import { getRelativeDate } from '@helper/time';
import { AnimatedImage } from '../animation/animatedImage';

interface Props {
  article: Article;
}

interface Article {
  Title: string;
  Description: string;
  Author: String;
  PrimaryCategory: string;
  SecondaryCategories: string[];
  Rating: number;
  UpdatedAt: number;
  CreatedAt: number;
  PublishedAt: number;
  Difficulty: string;
  Image: string;
  ID: string;
}

export const ArticleSmall = (props: Props) => {
  const [hovering, setHovering] = React.useState(false);
  const { article } = props;

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';

  return (
    <Box
      sx={{
        width: '400px',
        p: 3,
        mt: 4,
        borderRadius: '15px',
        transition: '0.3s all',
        boxShadow: hovering ? '0px 0px 25px rgba(255, 255, 255, 0.1)' : 'none',
      }}
      onClick={() => (window.location.href = `/${article.ID}`)}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* <Box
        sx={{
          width: '100%',
          backgroundColor: 'white',
          height: '1px',
          mb: 3,
        }}
      ></Box> */}
      <Box sx={{ borderRadius: '15px', overflow: 'hidden' }}>
        <AnimatedImage
          url={article.Image ? article.Image : defaultImage}
          alt="Article Image"
        />
      </Box>
      <Box
        sx={{
          mx: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Heading
          sx={{
            fontSize: '22px',
          }}
        >
          {article.Title}
        </Heading>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mr: 4,
            ml: 2,
          }}
        >
          <Text>{article.Author}</Text>
          <Text>
            {article.Rating} ✰ • {getRelativeDate(article.PublishedAt)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
