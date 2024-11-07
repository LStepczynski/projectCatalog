import { Box, Heading, Text, Link } from '@primer/react';

export const NotFound = () => {
  return (
    <Box sx={{ textAlign: 'center', mt: '100px' }}>
      <Heading>404 - Page Not Found</Heading>
      <Text as="p">Sorry, the page you are looking for does not exist.</Text>
      <Link href="/">Go to Home Page</Link>
    </Box>
  );
};
