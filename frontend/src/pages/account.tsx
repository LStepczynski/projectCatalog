import React from 'react';

import { Box, Heading, Text, Button } from '@primer/react';

import { getUserFromJWT } from '@helper/helper';
import { ProfilePicture } from '../components/contentDisplay/profilePicture';
import { FileUploadModal } from '../components/contentDisplay/fileUploadModal';

export const Account = () => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [pfpHover, setpfpHover] = React.useState<any>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUserFromJWT();

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
        // mb: '1000px',
      }}
    >
      <Box>
        <Heading>Your Account:</Heading>
      </Box>
      <Box
        sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
      ></Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 5, m: 6 }}>
        <Box
          onMouseEnter={() => setpfpHover(true)}
          onMouseLeave={() => setpfpHover(false)}
          sx={{
            height: '170px',
            width: '170px',
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
          <FileUploadModal
            endpoint={`${backendUrl}/user/image?username=${user.Username}`}
            isOpen={uploadModal}
            closeFunc={setUploadModal}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Text sx={{ fontSize: '24px', fontWeight: 'bold' }}>
            {user.Username}
          </Text>
          <Text>{user.Email}</Text>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Heading>Security:</Heading>
      </Box>
      <Box
        sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
      ></Box>

      <Box sx={{ display: 'grid', gap: 6 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Text sx={{ fontSize: '22px' }}>Password:</Text>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              py: 3,
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
  );
};
