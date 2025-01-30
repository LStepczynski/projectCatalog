import { getUser } from '@utils/getUser';

import { useGetContainerWidth } from '@pages/account/hooks/useGetContainerWidth';
import { useScreenWidth } from '@hooks/useScreenWidth';

import { NotVerifiedNotfication } from '@pages/account/components/main/notVerifiedNotfication';
import { PasswordSettings } from '@pages/account/components/main/passwordSettings';
import { AccountHeader } from '@pages/account/components/main/accountHeader';
import { RemoveAccount } from '@pages/account/components/removeAccount';

import { Separator } from '@components/animation/separator';

import { Box, Heading } from '@primer/react';

export const Account = () => {
  const screenWidth = useScreenWidth();

  const containerWidth = useGetContainerWidth(screenWidth);

  const user = getUser();

  if (user == undefined) {
    window.location.href = '/sign-in';
    return <></>;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'center',
        gap: 3,
        mt: '60px',
      }}
    >
      <Box
        sx={{
          width: containerWidth,
        }}
      >
        {/* Account Header that includes user profile picture username and email */}
        <AccountHeader />

        {/* Notfication informing the user that they are not verified. */}
        <NotVerifiedNotfication />

        {/* Account Details */}
        <Box sx={{ mt: 4 }}>
          <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
            Security:
          </Heading>
        </Box>

        <Separator />

        {/* Password and Email Options */}
        <Box sx={{ display: 'grid', gap: 6, my: 3 }}>
          <PasswordSettings />

          {/* <EmailSettings /> */}
        </Box>

        <Separator sx={{ my: 4 }} />

        {/* Remove account section */}
        <Box
          sx={{
            justifyContent: 'space-around',
            display: 'flex',
          }}
        >
          <RemoveAccount />
        </Box>
      </Box>
    </Box>
  );
};
