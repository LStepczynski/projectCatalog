import { useScreenWidth } from '@hooks/useScreenWidth';

import { Box } from '@primer/react';

import { AnimatedWave } from '@pages/index/components/animatedWave';
import { Categories } from '@pages/index/components/categories';
import { StartNow } from '@pages/index/components/startNow';
import { About } from '@pages/index/components/about';
import { Head } from '@pages/index/components/head';

const keyframeStyles = {
  '@keyframes gradient-animation': {
    '0%': {
      backgroundPosition: '0%',
    },
    '100%': {
      backgroundPosition: '100%',
    },
  },
};

const commonStyles = {
  position: 'relative',
  cursor: 'pointer',
  fontFamily: 'inter tight',
  fontWeight: '500',
  fontSize: '22px',
  width: '255px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  px: 3,
  py: 3,
  borderRadius: '4px',
  border: '1px solid transparent',
};

const gradientStyles = (colors: [string, string]) => ({
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
    zIndex: -1,
    borderRadius: '10px',
  },
});

export const Index = () => {
  const screenWidth = useScreenWidth();

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '170px',
        mb: '70px',
        px: '5vw',
        '@media screen and (min-width: 768px)': {
          gap: '250px',
          px: '2vw',
          mb: '120px',
        },
      }}
    >
      {/* Head section */}
      <Head screenWidth={screenWidth} keyframeStyles={keyframeStyles} />

      {/* About section */}
      <About screenWidth={screenWidth} />

      {/* Displays some of the available categories */}
      <Categories />

      {/* Banner inviting the user to Join Course Catalog */}
      <StartNow commonStyles={commonStyles} gradientStyles={gradientStyles} />

      {/* Background animation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '-10px',
          left: 0,
          width: '100vw',
          zIndex: -2,
        }}
      >
        <AnimatedWave />
      </Box>
    </Box>
  );
};
