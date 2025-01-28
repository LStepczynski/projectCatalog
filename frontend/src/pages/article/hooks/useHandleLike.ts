import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchWrapper } from '@utils/fetchWrapper';
import { getUser } from '@utils/getUser';

const validate = (isButtonDisabled: boolean): boolean => {
  // Check if button is on cooldown
  if (isButtonDisabled) return false;

  const user = getUser();

  // Check if user is logged in
  if (!user) {
    window.location.href = 'sign-up';
    return false;
  }

  // Check if user is verified
  if (!user?.roles.includes('verified')) {
    alert(
      'Your account is not verified. Please verify your email to like this post.'
    );
    return false;
  }

  return true;
};

export const useHandleLike = (
  count: number,
  id: string,
  isLiked: boolean,
  setIsLiked: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(count);

  const [searchParams] = useSearchParams();
  const visibility = searchParams.get('visibility') || 'public';

  const cooldownTime = 2000;

  let controller: AbortController;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLike = async () => {
    if (!validate(isButtonDisabled)) {
      return;
    }

    // Put button on cooldown
    setIsButtonDisabled(true);

    if (controller) {
      controller.abort();
    }

    controller = new AbortController();
    const signal = controller.signal;

    // Send request
    const likeRes = await fetchWrapper(`${backendUrl}/articles/like/${id}`, {
      method: 'PUT',
      signal,
    });

    if (likeRes.status != 'success') {
      return alert('There was an error while rating the article');
    }

    // Change the like count based on the previous state
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }

    // Like / Unlike
    setIsLiked(!isLiked);

    // Remove the article from the cache
    sessionStorage.removeItem(`${backendUrl}/articles/like/${id}`);
    sessionStorage.removeItem(
      `${backendUrl}/articles/get/${id}?visibility=${visibility}`
    );

    // Cleanup
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, cooldownTime);
  };

  return { likeCount, handleLike };
};
