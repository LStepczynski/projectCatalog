import React from 'react';

import { useScreenWidth } from '@hooks/useScreenWidth';
import { getUser } from '@utils/getUser';

import { ProfileUploadModal } from '@pages/account/components/main/profileUploadModal';
import { ProfilePicture } from '@components/common/user/profilePicture';

import { Separator } from '@components/animation/separator';

import { Box, Heading, Text } from '@primer/react';

export const AccountHeader = () => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [pfpHover, setpfpHover] = React.useState<any>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const screenWidth = useScreenWidth();

  const user = getUser();

  if (user == undefined) {
    window.location.href = '/sign-in';
    return <></>;
  }

  return (
    <>
      {/* Title */}
      <Box>
        <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
          Your Account:
        </Heading>
      </Box>

      <Separator />

      {/* Main container */}
      <Box
        sx={{
          display: screenWidth > 499 ? 'flex' : 'grid',
          alignItems: 'center',
          gap: 5,
          m: 5,
        }}
      >
        {/* Profile Picture */}
        <Box
          sx={{
            display: 'grid',
            width: screenWidth > 499 ? '' : '100%',
            justifyContent: 'center',
          }}
        >
          <Box
            onMouseEnter={() => setpfpHover(true)}
            onMouseLeave={() => setpfpHover(false)}
            sx={{
              height: screenWidth > 699 ? '170px' : '120px',
              width: screenWidth > 699 ? '170px' : '120px',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* '+' overlay over profile when hovered */}
            <img
              onClick={() => {
                setUploadModal(true);
                setpfpHover(false);
              }}
              style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                opacity: pfpHover ? 0.7 : 0,
                transition: 'all 0.15s',
              }}
              src="images/plus.webp"
              alt="Add New Icon"
            />

            {/* User's Profile Picture */}
            <ProfilePicture src={user.profilePicture} />

            {/* Modal for submiting new profiles */}
            <ProfileUploadModal
              endpoint={`${backendUrl}/user/image?username=${user.username}`}
              isOpen={uploadModal}
              closeFunc={() => setUploadModal(false)}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Text
            sx={{
              fontSize: '22px',
              fontWeight: 'bold',
              textAlign: screenWidth > 499 ? undefined : 'center',
            }}
          >
            {user.username}
          </Text>
          <Text
            sx={{
              fontSize: '12px',
              textAlign: screenWidth > 499 ? undefined : 'center',
            }}
          >
            {user.email}
          </Text>
        </Box>
      </Box>
    </>
  );
};
