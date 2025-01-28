import { getRelativeDate } from '@utils/getRelativeDate';
import { capitalize } from '@utils/capitalize';

import { ArticleDifficultyLabel } from '@components/articles/articleDifficultyLabel';

import { Box, Text } from '@primer/react';
import { PrivateArticle, PublicArticle } from '@type/article';

interface Props {
  article: {
    metadata: Omit<PrivateArticle | PublicArticle, 'body'>;
    body: string;
  };
  visibility: string;
}

export const Details = (props: Props) => {
  const { article, visibility } = props;

  return (
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
      <ArticleDifficultyLabel value={article.metadata.difficulty} />

      {/* If public render `Rating` and `PublishedAt` */}
      {visibility == 'public' && (
        <Text sx={{ textAlign: 'center' }}>
          {article.metadata.likes} ✰ {' • '}
          {getRelativeDate((article.metadata as PublicArticle).publishedAt)}
        </Text>
      )}

      {/* If private render `Status` and `CreatedAt` */}
      {visibility == 'private' && (
        <Text sx={{ textAlign: 'center' }}>
          {capitalize((article.metadata as PrivateArticle).status)}
          {' • '}
          {getRelativeDate(article.metadata.createdAt)}
        </Text>
      )}
    </Box>
  );
};
