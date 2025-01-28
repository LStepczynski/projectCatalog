import React from 'react';

import { ProfilePictureModal } from '@components/common/user/profilePictureModal';
import { ProfilePicture } from '@components/common/user/profilePicture';

import { getUser } from '@utils/getUser';
import { Box } from '@primer/react';

interface Props {
  state: boolean;
}

export const ProfileDropdown = (props: Props) => {
  const [dropdownVis, setDropdownVis] = React.useState(false);

  const { state } = props;

  const user = getUser();
  return user ? (
    <Box
      sx={{
        height: '100%',
      }}
    >
      <Box
        onClick={() => setDropdownVis(!dropdownVis)}
        sx={{ width: '100%', height: '100%' }}
      >
        <ProfilePicture src={user.profilePicture} />
      </Box>
      <ProfilePictureModal state={dropdownVis && state} />
    </Box>
  ) : null;
};
