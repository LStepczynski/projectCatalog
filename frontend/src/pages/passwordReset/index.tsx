import React from 'react';
import { useParams } from 'react-router-dom';

import { fetchWrapper } from '@utils/fetchWrapper';
import { logOut } from '@utils/logOut';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

import { Spinner, Box } from '@primer/react';

export const PasswordReset = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchWrapper(`${backendUrl}/auth/password-reset/${code}`, {
      method: 'POST',
      signal,
    }).then((data) => {
      setResponse(data);
    });

    return () => {
      controller.abort();
    };
  }, []);

  console.log(response);

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
  } else if (response.statusCode == 200) {
    ShowInformationPopup(
      'Password Reset',
      'Your password has been reset. Check your inbox to view your new password.',
      () => {
        logOut();
        window.location.href = '/sign-in';
      }
    );
    return null;
  } else if (response.statusCode == 400) {
    ShowInformationPopup(
      'Password Reset',
      'This verification link is invalid. Please try a different one.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.statusCode == 404) {
    ShowInformationPopup(
      'Password Reset',
      'This verification link is invalid. User does not exist.',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.statusCode == 429) {
    ShowInformationPopup(
      'Password Reset',
      'Your password was reset recently. Please try again later',
      () => {
        window.location.href = '/';
      }
    );
    return null;
  } else if (response.statusCode == 500) {
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
