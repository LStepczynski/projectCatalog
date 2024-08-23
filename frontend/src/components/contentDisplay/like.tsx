import { Box, Text } from '@primer/react';
import { HeartFillIcon, HeartIcon } from '@primer/octicons-react';

import { getUserFromJWT } from '@helper/helper';

interface Props {
  count: number;
  isLiked: boolean;
  setIsLiked: any;
  id: string;
}

export const Like = (props: Props) => {
  let { count, isLiked, setIsLiked, id } = props;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUserFromJWT();
  const iconSize = 24;

  const handleLike = async () => {
    const likeReq = await fetch(`${backendUrl}/user/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          localStorage.getItem('verificationToken') || ''
        }`,
      },
      body: JSON.stringify({ articleId: id }),
    });

    const likeRes = await likeReq.json();
    if (!likeRes.ok) {
      return alert('There was an error while rating the article');
    }

    if (isLiked) {
      count -= 1;
    } else {
      count += 1;
    }
    setIsLiked(!isLiked);
  };

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
      onClick={handleLike}
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
