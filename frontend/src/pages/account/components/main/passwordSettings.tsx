import { useScreenWidth } from '@hooks/useScreenWidth';

import { PasswordChange } from '@pages/account/components/passwordChange';
import { PasswordReset } from '@pages/account/components/passwordReset';

import { Box, Text } from '@primer/react';

export const PasswordSettings = () => {
  const screenWidth = useScreenWidth();

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Text sx={{ fontSize: '22px' }}>Password:</Text>
      <Box
        sx={{
          display: 'flex',
          flexDirection: screenWidth > 499 ? 'row' : 'column',
          gap: 3,
          justifyContent: 'space-around',
          p: 3,
          borderRadius: '10px',
          backgroundColor: 'canvas.overlay',
        }}
      >
        {/* Shows a password change modal */}
        <PasswordChange />

        {/* Sends a password reset email */}
        <PasswordReset />
      </Box>
    </Box>
  );
};
