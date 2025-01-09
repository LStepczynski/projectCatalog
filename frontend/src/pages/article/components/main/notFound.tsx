import { Box, Heading, Text, Link } from '@primer/react';

export const NotFound = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '50vh',
      }}
    >
      <Heading>Article Not Found</Heading>
      <Text>Sorry, we could not find this article in our database.</Text>
      <Link sx={{ mt: '15px' }} href="/">
        Go to home
      </Link>
    </Box>
  );
};
