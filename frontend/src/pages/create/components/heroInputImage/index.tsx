import React from 'react';

import { BannerUploadModal } from '@pages/create/components/main/bannerUploadModal';
import { AnimatedImage } from '@components/animation/animatedImage';

import { Box } from '@primer/react';

interface HeroProps {
  formData: any;
  setFormData: any;
}

export const HeroInputImage = (props: HeroProps) => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [bannerHover, setBannerHover] = React.useState<any>(false);
  const { formData, setFormData } = props;

  const updateImage = (newImage: string) => {
    setFormData((prevFormData: Record<string, any>) => ({
      ...prevFormData,
      image: newImage,
    }));
  };

  return (
    <>
      {/* Display the submitted image and allow for image upload */}
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
              opacity: bannerHover ? 0.7 : 0, // Show image on hover
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

          {/* Show the submitted image, otherwise display the default */}
          <AnimatedImage
            url={formData.image != '' ? formData.Image : 'images/default2.png'}
            alt="Article image"
          />
        </Box>

        {/* Upload modal */}
        <BannerUploadModal
          bannerFunc={updateImage}
          isOpen={uploadModal}
          closeFunc={() => setUploadModal(false)}
        />
      </Box>
    </>
  );
};
