import React from 'react';

import { Box, Heading, Text, Button } from '@primer/react';

import { getUserFromJWT } from '@helper/helper';
import { ProfilePicture } from '../components/contentDisplay/profilePicture';
import { ProfileUploadModal } from '../components/contentDisplay/profileUploadModal';

import { useScreenWidth } from '../components/other/useScreenWidth';

export const Account = () => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [pfpHover, setpfpHover] = React.useState<any>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUserFromJWT();

  const screenWidth = useScreenWidth();

  const getContainerWidth = () => {
    if (screenWidth < 430) {
      return '270px';
    }
    if (screenWidth < 500) {
      return '300px';
    }
    if (screenWidth < 700) {
      return '450px';
    }
    return '600px';
  };

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
          width: getContainerWidth(),
        }}
      >
        <Box>
          <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
            Your Account:
          </Heading>
        </Box>
        <Box
          sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
        ></Box>
        <Box
          sx={{
            display: screenWidth > 499 ? 'flex' : 'grid',
            alignItems: 'center',
            // justifyContent: "center",
            gap: 5,
            m: 5,
          }}
        >
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
              <ProfilePicture src={user.ProfilePic} />
              <ProfileUploadModal
                endpoint={`${backendUrl}/user/image?username=${user.Username}`}
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
                textAlign: screenWidth > 499 ? '' : 'center',
              }}
            >
              {user.Username}
            </Text>
            <Text
              sx={{
                fontSize: '12px',
                textAlign: screenWidth > 499 ? '' : 'center',
              }}
            >
              {user.Email}
            </Text>
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
            Security:
          </Heading>
        </Box>
        <Box
          sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
        ></Box>

        <Box sx={{ display: 'grid', gap: 6, my: 3 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Text sx={{ fontSize: '22px' }}>Password:</Text>
            <Box
              sx={{
                display: 'flex',
                flexDirection: screenWidth > 499 ? 'row' : 'column',
                gap: 3,
                justifyContent: 'space-around',
                p: 3,
                borderRadius: '10px',
                backgroundColor: 'canvas.overlay',
              }}
            >
              <Button>Change Password</Button>
              <Button>Reset Password</Button>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Text sx={{ fontSize: '22px' }}>Email:</Text>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                py: 3,
                borderRadius: '10px',
                backgroundColor: 'canvas.overlay',
              }}
            >
              <Button>Change Email</Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: '1px',
            backgroundColor: 'ansi.black',
            my: 4,
          }}
        ></Box>
        <Box
          sx={{
            justifyContent: 'space-around',
            display: 'flex',
          }}
        >
          <Button variant="danger" sx={{ fontSize: '16px', p: 3 }}>
            Delete Account
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
