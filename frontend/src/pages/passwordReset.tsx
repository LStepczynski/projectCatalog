import { fetchWrapper, logOut } from '@helper/helper';
import { useParams } from 'react-router-dom';

import { InformationPopup } from '../components/contentDisplay/informationPopup';

import React from 'react';

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
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          logOut();
          window.location.href = '/sign-in';
        }}
        title="Password Reset"
        description="Your password has been reset. Check your inbox to view your new password."
      />
    );
  } else if (response.status == 404) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Password Reset"
        description="This verification link is invalid. Please try a different one."
      />
    );
  } else if (response.status == 410) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Password Reset"
        description="This verification link is invalid. Please request a new one."
      />
    );
  } else if (response.status == 500) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Password Reset"
        description="There was a problem the password reset. Please try again later."
      />
    );
  }
};
