import React from 'react';

import { BannerPopup } from '@components/common/popups/bannerPopup';
import { getUser } from '@utils/getUser';

export const EmailVerificationPopup = () => {
  const [bannerVis, setBannerVis] = React.useState(false);

  React.useEffect(() => {
    const user = getUser();
    const recentlyClosed = sessionStorage.getItem('verificationBanner');

    const shouldOpen =
      user && !user.roles.includes('verified') && recentlyClosed != 'true';
    if (shouldOpen) {
      setTimeout(() => setBannerVis(true), 700);
    }
  }, []);

  return (
    <BannerPopup
      closeFunc={() => {
        setBannerVis(false);
        sessionStorage.setItem('verificationBanner', 'true');
      }}
      isOpen={bannerVis}
      message="Your account is not verified. Some functionality is locked."
    />
  );
};
