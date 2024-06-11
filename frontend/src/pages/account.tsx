import { Box } from '@primer/react';

import { getUserFromJWT } from '@helper/helper';

export const Account = () => {
  const user = getUserFromJWT() || {};

  return (
    <Box>
      <img src={user?.ProfilePic} alt="PFP" />
    </Box>
  );
};
