import { Box, Text } from '@primer/react';
import { HeartFillIcon, HeartIcon } from '@primer/octicons-react';

interface Props {
  count: number;
  isLiked: boolean;
  setIsLiked: any;
}

export const Like = (props: Props) => {
  const { count, isLiked, setIsLiked } = props;

  const iconSize = 24;

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(72, 79, 88, 0)',
        alignContent: 'center',
        transition: 'all .2s',
        width: 'max-content',
        borderRadius: '50px',
        border: '2px solid',
        borderColor: 'ansi.black',
        userSelect: 'none',
        cursor: 'default',
        display: 'flex',
        px: 3,
        py: 2,
        gap: 2,
        ':hover': {
          backgroundColor: 'rgba(72, 79, 88, 0.3)',
        },
      }}
      onClick={() => {
        setIsLiked(!isLiked);
      }}
    >
      {isLiked ? (
        <HeartFillIcon size={iconSize} />
      ) : (
        <HeartIcon size={iconSize} />
      )}
      <Text>{count}</Text>
    </Box>
  );
};
