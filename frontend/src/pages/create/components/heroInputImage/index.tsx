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

  const boxSize = {
    '--box-width': '80vw', // 80% of 100vw
    '--box-height': 'calc(var(--box-width) / (16 / 9))',
    width: 'var(--box-width)',
    height: 'var(--box-height)',
    '@media screen and (min-width: 544px)': {
      '--box-width': '435.2px', // 80% of 544px
    },
    '@media screen and (min-width: 768px)': {
      '--box-width': '614.4px', // 80% of 768px
    },
    '@media screen and (min-width: 1012px)': {
      '--box-width': '809.6px', // 80% of 1012px
    },
    '@media screen and (min-width: 1280px)': {
      '--box-width': '1024px', // 80% of 1280px
    },
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
          <Box sx={{ ...boxSize, borderRadius: '15px', overflow: 'hidden' }}>
            <AnimatedImage url={formData.image} alt="Article image" />
          </Box>
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
