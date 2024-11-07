import React from 'react';

import { ProfilePictureModal } from './profilePictureModal';
import { ProfilePicture } from './profilePicture';

import { getUser } from '@helper/helper';
import { Box } from '@primer/react';

interface Props {
  state: boolean;
}

export const ProfileDropdown = (props: Props) => {
  const [dropdownVis, setDropdownVis] = React.useState(false);

  const { state } = props;

  const user = getUser() || {};
  return (
    <Box
      sx={{
        height: '100%',
      }}
    >
      <Box
        onClick={() => setDropdownVis(!dropdownVis)}
        sx={{ width: '100%', height: '100%' }}
      >
        <ProfilePicture src={user.ProfilePic && user.ProfilePic} />
      </Box>
      <ProfilePictureModal state={dropdownVis && state} />
    </Box>
  );
};
