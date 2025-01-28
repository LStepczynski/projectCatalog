import React from 'react';

import { getRelativeDate } from '@utils/getRelativeDate';

import { ArticleDifficultyLabel } from '@components/articles/articleDifficultyLabel';
import { ArticleDropdown } from '@components/articles/articleDropdown';
import { AnimatedImage } from '@components/animation/animatedImage';

import { Box, Heading, Text, Avatar } from '@primer/react';
import { PublicArticle } from '@type/article';

interface Props {
  article: PublicArticle;
}

export const ArticleLarge = (props: Props) => {
  const [hovering, setHovering] = React.useState(false);
  const { article } = props;

  const defaultImage =
    'https://project-catalog-storage.s3.us-east-2.amazonaws.com/images/default.png';

  return (
    <Box
      sx={{
        boxShadow: hovering ? '0px 0px 25px rgba(255, 255, 255, 0.1)' : 'none',
        transition: '0.3s all',
        borderRadius: '15px',
        position: 'relative',
        width: '620px',
        p: 4,
      }}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Box sx={{ position: 'absolute', right: 4, bottom: 0 }}>
        <ArticleDropdown
          setHovering={setHovering}
          article={article}
          visibility="public"
        />
      </Box>
      <Box
        onClick={() =>
          (window.location.href = `/${article.id}?visibility=public`)
        }
        sx={{ borderRadius: '15px', overflow: 'hidden' }}
      >
        <AnimatedImage
          url={article.image ? article.image : defaultImage}
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
          (window.location.href = `/${article.id}?visibility=public`)
        }
      >
        <Heading
          sx={{
            fontSize: '28px',
          }}
        >
          {article.title}
        </Heading>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mr: 4,
            ml: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar size={35} src={article.authorProfilePicture} />
            <Text>{article.author}</Text>
          </Box>
          <ArticleDifficultyLabel value={article.difficulty} />
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
            {article.likes} ✰ • {getRelativeDate(article.publishedAt)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
