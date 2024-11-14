import { Box, Text } from '@primer/react';

import { getUser } from '@utils/getUser';

export const NotVerifiedNotfication = () => {
  const user = getUser();

  return user?.Verified != 'true' ? (
    <Box sx={{ mt: 7 }}>
      <Text as="p" sx={{ color: 'red', textAlign: 'center' }}>
        This account is not verified. <br></br> Check your inbox for a
        verification email.
      </Text>
    </Box>
  ) : null;
};
