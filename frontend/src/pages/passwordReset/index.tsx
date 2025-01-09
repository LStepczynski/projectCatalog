import React from 'react';
import { useParams } from 'react-router-dom';

import { fetchWrapper } from '@utils/fetchWrapper';
import { logOut } from '@utils/logOut';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

export const PasswordReset = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(`${backendUrl}/user/password-reset/${code}`, {
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
      'Password Reset',
      'Your password has been reset. Check your inbox to view your new password.',
      () => {
        logOut();
        window.location.href = '/sign-in';
      }
    );
    return null;
  } else if (response.status == 404) {
    ShowInformationPopup(
      'Password Reset',
      'This verification link is invalid. Please try a different one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 410) {
    ShowInformationPopup(
      'Password Reset',
      'This verification link is invalid. Please request a new one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.status == 500) {
    ShowInformationPopup(
      'Password Reset',
      'There was a problem the password reset. Please try again later.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  }
};
