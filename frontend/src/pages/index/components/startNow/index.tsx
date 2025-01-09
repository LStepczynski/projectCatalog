import { PersonIcon, BookIcon } from '@primer/octicons-react';
import { Box, Text, Heading } from '@primer/react';

export const StartNow = ({ commonStyles, gradientStyles }: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5%',
        '@media screen and (min-width: 768px)': {
          flexDirection: 'row',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          '@media screen and (min-width: 768px)': {
            width: '60%',
          },
        }}
      >
        {/* Title  */}
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '800',
            fontSize: '34px',
            background: 'linear-gradient(90deg, #ff5121, #ff7b00)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            '@media screen and (min-width: 768px)': {
              fontSize: '42px',
            },
          }}
        >
          Create an account and start today
        </Heading>

        {/* Description of Course Catalog */}
        <Text
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '500',
            fontSize: '14px',
            '@media screen and (min-width: 768px)': {
              fontSize: 'inherit',
            },
          }}
        >
          Join Course Catalog today and unlock the full potential of your
          creativity! By creating an account, you can not only access inspiring
          projects and tutorials, but also share your own expertise with others.
          Start today and be part of a thriving community where every idea has
          the power to inspire and educate. Don't wait—create your account now
          and dive into a world of possibilities!
        </Text>
      </Box>

      {/* Create account and browse buttons */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 8,
          gap: 5,
          '@media screen and (min-width: 768px)': {
            width: '35%',
            mt: 0,
          },
        }}
      >
        {/* Create account  */}
        <Box
          onClick={() => (window.location.href = 'sign-up')}
          sx={{
            ...commonStyles,
            ...gradientStyles(['#ff5121', '#ff7b00']),
          }}
        >
          Create an account
          <PersonIcon size={32} />
        </Box>

        {/* Start browsing  */}
        <Box
          onClick={() => (window.location.href = 'categories')}
          sx={{
            ...commonStyles,
            ...gradientStyles(['#ff1f48', '#ff1f2e']),
          }}
        >
          Start browsing
          <BookIcon size={32} />
        </Box>
      </Box>
    </Box>
  );
};
