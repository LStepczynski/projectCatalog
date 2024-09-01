import { Box, Text } from '@primer/react';
import { HeartFillIcon, HeartIcon } from '@primer/octicons-react';

import React from 'react';

interface Props {
  count: number;
  isLiked: boolean;
  setIsLiked: any;
  id: string;
}

export const Like = (props: Props) => {
  let { count, isLiked, setIsLiked, id } = props;
  const [likeCount, setLikeCount] = React.useState(count);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const iconSize = 24;

  const handleLike = async () => {
    const token = localStorage.getItem('verificationToken') || '';
    if (token === '') {
      window.location.href = 'sign-up';
    }

    const likeReq = await fetch(`${backendUrl}/user/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId: id }),
    });

    const likeRes = await likeReq.json();

    if (likeRes.status != 200) {
      return alert('There was an error while rating the article');
    }
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
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
      <Text>{likeCount}</Text>
    </Box>
  );
};
