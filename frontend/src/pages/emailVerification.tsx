import { fetchWrapper, logOut } from '@helper/helper';
import { useParams } from 'react-router-dom';

import { InformationPopup } from '../components/contentDisplay/informationPopup';

import React from 'react';

export const EmailVerification = () => {
  const [response, setResponse] = React.useState<any>(null);
  const { code } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log(`${backendUrl}/user/email-verification/${code}`);
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
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          logOut();
          window.location.href = '/sign-in';
        }}
        title="Email Verification"
        description="Your account has been verified. Please log into your account to view changes."
      />
    );
  } else if (response.status == 404) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Email Verification"
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
        title="Email Verification"
        description="This verification link is invalid. Your account is already verified."
      />
    );
  } else if (response.status == 500) {
    return (
      <InformationPopup
        isOpen={true}
        closeFunc={() => {
          window.location.href = '/';
        }}
        title="Email Verification"
        description="There was a problem with verification. Please try again later."
      />
    );
  }
};
