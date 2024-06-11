import React from 'react';

import { ProfilePictureModal } from '../contentDisplay/profilePictureModal';
import { ProfilePicture } from '../contentDisplay/profilePicture';

import { getUserFromJWT } from '@helper/helper';
import { Box } from '@primer/react';

interface Props {
  state: boolean;
}

export const ProfileDropdown = (props: Props) => {
  const [dropdownVis, setDropdownVis] = React.useState(false);

  const { state } = props;

  const user = getUserFromJWT();
  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        onClick={() => setDropdownVis(!dropdownVis)}
        sx={{ width: '100%', height: '100%' }}
      >
        <ProfilePicture src={user.ProfilePic && user.ProfilePic} />
      </Box>
      {state && <ProfilePictureModal state={dropdownVis} />}
    </Box>
  );
};
