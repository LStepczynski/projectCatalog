import { fetchWrapper, logOut } from '@helper/helper';
import { useParams } from 'react-router-dom';

import { ShowInformationPopup } from '../components/contentDisplay/informationPopup';

import React from 'react';

export const EmailVerification = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(`${backendUrl}/user/email-verification/${code}`, {
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
    ShowInformationPopup(
      'Email Verification',
      'Your account has been verified. Please log into your account to view changes.',
      () => {
        logOut();
        window.location.href = '/sign-in';
      }
    );
    return null;
  } else if (response.status == 404) {
    ShowInformationPopup(
      'Email Verification',
      'This verification link is invalid. Please try a different one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 410) {
    ShowInformationPopup(
      'Email Verification',
      'This verification link is invalid. Your account is already verified.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 500) {
    ShowInformationPopup(
      'Email Verification',
      'There was a problem with verification. Please try again later.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  }
};
