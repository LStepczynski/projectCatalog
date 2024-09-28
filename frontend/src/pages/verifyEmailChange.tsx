import { fetchWrapper, logOut } from '@helper/helper';
import { useParams } from 'react-router-dom';

import { InformationPopup } from '../components/contentDisplay/informationPopup';

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
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          logOut();
          window.location.href = '/sign-in';
        }}
        title="Email Change"
        description="Your email has been changed."
      />
    );
  } else if (response.status == 404) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Email Change"
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
        title="Email Change"
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
        title="Email Change"
        description="There was a problem with changing your email address. Please try again later."
      />
    );
  }
};
