import { getRelativeDate } from '@utils/getRelativeDate';
import { capitalize } from '@utils/capitalize';

import { ArticleDifficultyLabel } from '@components/articles/articleDifficultyLabel';

import { Box, Text } from '@primer/react';

interface Props {
  article: any;
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
      <ArticleDifficultyLabel value={article.metadata.Difficulty} />

      {/* If public render `Rating` and `PublishedAt` */}
      {visibility == 'public' && (
        <Text sx={{ textAlign: 'center' }}>
          {article.metadata.Rating} ✰ {' • '}
          {getRelativeDate(article.metadata.PublishedAt)}
        </Text>
      )}

      {/* If private render `Status` and `CreatedAt` */}
      {visibility == 'private' && (
        <Text sx={{ textAlign: 'center' }}>
          {capitalize(article.metadata.Status)}
          {' • '}
          {getRelativeDate(article.metadata.CreatedAt)}
        </Text>
      )}
    </Box>
  );
};
