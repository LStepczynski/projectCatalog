import { Box, Heading, Text, Avatar } from '@primer/react';
import React from 'react';
import { getRelativeDate } from '@helper/helper';
import { AnimatedImage } from '../../animation/animatedImage';
import { ArticleDropdown } from './articleDropdown';
import { ArticleDifficultyLabel } from './articleDifficultyLabel';

interface Props {
  article: Article;
}

interface Article {
  Title: string;
  Description: string;
  Author: String;
  AuthorProfilePic: string;
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

export const ArticleMedium = (props: Props) => {
  const [hovering, setHovering] = React.useState(false);
  const { article } = props;

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';

  return (
    <Box
      sx={{
        boxShadow: hovering ? '0px 0px 25px rgba(255, 255, 255, 0.1)' : 'none',
        transition: '0.3s all',
        position: 'relative',
        borderRadius: '15px',
        width: '400px',
        mt: 4,
        p: 3,
      }}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Box sx={{ position: 'absolute', right: 3, bottom: 0 }}>
        <ArticleDropdown
          setHovering={setHovering}
          article={article}
          visibility="public"
        />
      </Box>
      <Box
        onClick={() =>
          (window.location.href = `/${article.ID}?visibility=public`)
        }
        sx={{ borderRadius: '15px', overflow: 'hidden' }}
      >
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
        onClick={() =>
          (window.location.href = `/${article.ID}?visibility=public`)
        }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar size={30} src={article.AuthorProfilePic} />
            <Text>{article.Author}</Text>
          </Box>
          <ArticleDifficultyLabel value={article.Difficulty} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'right',
            mr: 4,
            ml: 2,
          }}
        >
          <Text>
            {article.Rating} ✰ • {getRelativeDate(article.PublishedAt)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
