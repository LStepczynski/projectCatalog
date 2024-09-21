import { Box, Text } from '@primer/react';
import { HeartFillIcon, HeartIcon } from '@primer/octicons-react';

import { fetchWrapper, getUser } from '@helper/helper';
import { useSearchParams } from 'react-router-dom';

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
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const visibility = searchParams.get('visibility') || 'public';

  const cooldownTime = 2000;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const iconSize = 24;

  let controller: AbortController;

  const handleLike = async () => {
    if (isButtonDisabled) return;

    setIsButtonDisabled(true);

    if (controller) {
      controller.abort();
    }

    controller = new AbortController();
    const signal = controller.signal;

    const user = getUser();
    if (!user) {
      return (window.location.href = 'sign-up');
    }

    const likeRes = await fetchWrapper(`${backendUrl}/user/like`, {
      method: 'POST',
      body: JSON.stringify({ articleId: id }),
      signal,
    });

    if (likeRes.status != 200) {
      return alert('There was an error while rating the article');
    }

    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }

    setIsLiked(!isLiked);

    sessionStorage.removeItem(`${backendUrl}/user/isLiked?articleId=${id}`);
    sessionStorage.removeItem(
      `${backendUrl}/articles/get?id=${id}&visibility=${visibility}`
    );

    setTimeout(() => {
      setIsButtonDisabled(false);
    }, cooldownTime);
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
