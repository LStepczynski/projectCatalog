import { RainbowText } from '@pages/index/components/main/rainbowText';
import { Box, Text, Heading } from '@primer/react';

export const Head = ({ screenWidth, keyframeStyles }: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        width: '100%',
        mt: '80px',
        '@media screen and (min-width: 768px)': {
          mt: '120px',
          flexDirection: 'row',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '25px',
          width: '80%',
          justifyContent: 'center',
          flexDirection: 'column',
          display: 'flex',
          height: '100%',
          top: 0,
          '@media screen and (min-width: 768px)': {
            position: 'absolute',
            left: 0,
            width: '50%',
          },
        }}
      >
        {/* Project Catalog text */}
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '700',
            fontSize: '18px',
            '@media screen and (min-width: 768px)': {
              fontSize: '',
            },
          }}
        >
          Project Catalog
        </Heading>

        {/* Title  */}
        <Box sx={keyframeStyles}>
          <Heading
            sx={{
              fontFamily: 'inter tight',
              fontWeight: '800',
              fontSize: '30px',
              mt: 2,
              mb: 3,
              '@media screen and (min-width: 768px)': {
                fontSize: '36px',
                mt: 3,
                mb: 5,
              },
              '@media screen and (min-width: 1012px)': {
                fontSize: '50px',
              },
            }}
          >
            New{' '}
            <RainbowText gradientSettings="90deg, #ff7b00, #ff007b, #00c1ff">
              ideas
            </RainbowText>{' '}
            within <br /> the palm of your hand
          </Heading>
        </Box>

        {/* Brief description of Project Catalog */}
        <Text
          sx={{
            fontSize: '16px',
            fontFamily: 'inter tight',
            fontWeight: '800',
            '@media screen and (min-width: 768px)': {
              fontSize: '20px',
            },
            '@media screen and (min-width: 1012px)': {
              fontSize: '22px',
            },
          }}
        >
          Welcome to Course Catalog, where you can explore and share articles
          about hands-on projects. Dive into tutorials, or create your own and
          inspire others to build and tinker.
        </Text>
      </Box>

      {/* Hero image */}
      <img
        src="images/home-hero.webp"
        alt="home-hero"
        style={{
          borderRadius: '25px',
          aspectRatio: 1920 / 1348,
          zIndex: -1,
          opacity: screenWidth > 767 ? 1 : 0.6,
          width: screenWidth > 767 ? '70%' : '100%',
        }}
      />
    </Box>
  );
};
