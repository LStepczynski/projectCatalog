import React from 'react';

import { getRelativeDate } from '@utils/getRelativeDate';
import { capitalize } from '@utils/capitalize';

import { ArticleDifficultyLabel } from '@components/articles/articleDifficultyLabel';
import { ArticleDropdown } from '@components/articles/articleDropdown';
import { AnimatedImage } from '@components/animation/animatedImage';

import { Box, Heading, Text, Avatar } from '@primer/react';
import { PrivateArticle } from '@type/article';

interface Props {
  article: PrivateArticle;
}

export const ArticlePrivate = (props: Props) => {
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
        width: '330px',
        borderRadius: '15px',
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
          visibility="private"
        />
      </Box>
      <Box
        onClick={() =>
          (window.location.href = `/${article.id}?visibility=private`)
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
          (window.location.href = `/${article.id}?visibility=private`)
        }
      >
        <Heading
          sx={{
            fontSize: '18px',
          }}
        >
          {article.title}
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
            <Avatar size={24} src={article.authorProfilePicture} />
            <Text sx={{ fontSize: '12px' }}>{article.author}</Text>
          </Box>
          <ArticleDifficultyLabel size="small" value={article.difficulty} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'right',
            mr: 4,
            ml: 2,
          }}
        >
          <Text
            sx={{
              fontSize: '12px',
            }}
          >
            {capitalize(article.status)} • {getRelativeDate(article.createdAt)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
