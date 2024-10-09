import { fetchWrapper, logOut } from '@helper/helper';
import { useParams } from 'react-router-dom';

import { ShowInformationPopup } from '../components/contentDisplay/informationPopup';

import React from 'react';

export const VerifyEmailChange = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(`${backendUrl}/user/verify-email-change/${code}`, {
      method: 'POST',
      signal,
    }).then((data) => {
      setResponse(data);
    });

    return () => {
      controller.abort();
    };
  }, []);

  if (!response) {
    return null;
  } else if (response.status == 200) {
    ShowInformationPopup('Email Change', 'Your email has been changed.', () => {
      logOut();
      window.location.href = '/sign-in';
    });
    return null;
  } else if (response.status == 404) {
    ShowInformationPopup(
      'Email Change',
      'This verification link is invalid. Please try a different one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 410) {
    ShowInformationPopup(
      'Email Change',
      'This verification link is invalid. Please request a new one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 500) {
    ShowInformationPopup(
      'Email Change',
      'There was a problem with changing your email address. Please try again later.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  }
};
