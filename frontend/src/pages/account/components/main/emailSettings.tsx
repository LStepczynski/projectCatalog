import { EmailChange } from '@pages/account/components/emailChange';

import { Box, Text } from '@primer/react';

export const EmailSettings = () => {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Text sx={{ fontSize: '22px' }}>Email:</Text>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          py: 3,
          borderRadius: '10px',
          backgroundColor: 'canvas.overlay',
        }}
      >
        <EmailChange />
      </Box>
    </Box>
  );
};
