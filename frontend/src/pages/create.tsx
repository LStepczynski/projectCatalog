import { Box, TextInput, Textarea, Heading } from '@primer/react';
import React from 'react';

import { AnimatedImage } from '../components/animation/animatedImage';
import { getUserFromJWT } from '@helper/helper';
import { BannerUploadModal } from '../components/contentDisplay/bannerUploadModal';

export const Create = () => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [bannerHover, setBannerHover] = React.useState<any>(false);
  const [bannerUrl, setBannerUrl] = React.useState<any>(null);

  const user = getUserFromJWT();
  if (user && !(user.CanPost == 'true' || user.Admin == 'true')) {
    return (window.location.href = '/');
  }
  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '70px',
        gap: 5,
        mb: '100px',
      }}
    >
      <Heading sx={{ fontSize: '44px' }}>Create an Article</Heading>
      <Box
        sx={{
          width: '80%',
          height: '1px',
          backgroundColor: 'ansi.black',
          mb: 2,
        }}
      ></Box>

      <Box
        onMouseEnter={() => setBannerHover(true)}
        onMouseLeave={() => setBannerHover(false)}
        sx={{
          width: '80%',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          onClick={() => {
            setUploadModal(true);
            setBannerHover(false);
          }}
        >
          <img
            style={{
              transform: 'translate(-50%, -50%)',
              opacity: bannerHover ? 0.7 : 0,
              transition: 'all 0.2s',
              position: 'absolute',
              width: '20%',
              left: '50%',
              zIndex: 10,
              top: '50%',
            }}
            src="images/plus.webp"
            alt="Add Image"
          />
          <AnimatedImage
            url={bannerUrl || 'images/default2.png'}
            alt="Article image"
          />
        </Box>
        <BannerUploadModal
          bannerFunc={setBannerUrl}
          isOpen={uploadModal}
          closeFunc={setUploadModal}
        />
      </Box>
      <TextInput
        maxLength={45}
        placeholder="Title:"
        sx={{
          width: '75%',
          fontSize: '30px',
          p: 2,
        }}
      />
      <Textarea
        placeholder="Description:"
        resize="none"
        maxLength={368}
        sx={{
          width: '75%',
          height: '105px',
          fontSize: '18px',
        }}
      />

      <Box
        sx={{
          width: '75%',
          height: '1px',
          backgroundColor: 'ansi.black',
          my: 3,
        }}
      ></Box>

      <Textarea
        placeholder="Body:"
        resize="none"
        maxLength={4000}
        sx={{
          width: '60%',
          height: '700px',
          fontSize: '18px',
        }}
      />
    </Box>
  );
};
