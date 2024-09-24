import React from 'react';
import { debounce } from 'lodash';

import { Box, Text } from '@primer/react';
import { useScreenWidth } from '../other/useScreenWidth';
import { XCircleIcon } from '@primer/octicons-react';

interface Props {
  isOpen: boolean;
  closeFunc: any;
  message: string;
}

export const BannerPopup = (props: Props) => {
  const [prevScrollPos, setPrevScrollPos] = React.useState(window.pageYOffset);
  const [bannerVis, setBannerVis] = React.useState(true);
  const { isOpen, closeFunc, message } = props;

  const screenWidth = useScreenWidth();

  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;
    setBannerVis(currentScrollPos <= prevScrollPos || currentScrollPos <= 200);
    setPrevScrollPos(currentScrollPos);
  }, 30);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Box
      sx={{
        height: screenWidth < 500 ? '75px' : '50px',
        width: '100%',
        zIndex: 998,
        backgroundColor: 'attention.emphasis',
        position: 'fixed',
        transition: 'transform 0.2s ease',
        transform: `translateY(${isOpen && bannerVis ? '0' : '-260%'})`,
        top: '80px',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        <Text as="p" sx={{ textAlign: 'center', mx: 6 }}>
          {message}
        </Text>
        <Box
          onClick={closeFunc}
          sx={{
            position: 'absolute',
            width: screenWidth < 500 ? '50px' : '70px',
            height: '100%',
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <XCircleIcon size={24} />
        </Box>
      </Box>
    </Box>
  );
};
