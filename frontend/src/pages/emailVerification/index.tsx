import React from 'react';
import { useParams } from 'react-router-dom';

import { fetchWrapper } from '@utils/fetchWrapper';
import { logOut } from '@utils/logOut';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';
import { Spinner, Box } from '@primer/react';

export const EmailVerification = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(`${backendUrl}/auth/verify/${code}`, {
      method: 'POST',
      signal,
    })
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => {
        console.error('Error verifying email:', error);
        setResponse({ status: 'error', message: 'An error occurred.' });
      });

    return () => {
      controller.abort();
    };
  }, [backendUrl, code]);

  React.useEffect(() => {
    if (response?.status === 'success') {
      ShowInformationPopup(
        'Email Verification',
        'Your account has been verified. Please log into your account to view changes.',
        () => {
          logOut();
          window.location.href = '/sign-in';
        }
      );
    } else if (response?.status === 'error') {
      ShowInformationPopup('Email Verification', response.message, () => {
        window.location.href = '/';
      });
    }
  }, [response]);

  if (!response) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Spinner />
      </Box>
    );
  }

  return null;
};
