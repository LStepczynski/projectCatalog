import { Box, Heading, Text } from '@primer/react';

export const NotFound = () => {
  return (
    <Box sx={{ mt: '100px' }}>
      <Box sx={{ mb: 4 }}>
        <Heading
          sx={{
            fontSize: '42px',
            display: 'grid',
            justifyContent: 'center',
          }}
        >
          No Articles Found
        </Heading>
      </Box>
      <Box>
        <Text
          as="p"
          sx={{
            fontSize: '22px',
            display: 'grid',
            justifyContent: 'center',
            textAlign: 'center',
            mx: 2,
          }}
        >
          Sorry, no articles have been published yet. Check again later.
        </Text>
      </Box>
    </Box>
  );
};