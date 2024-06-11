import { getUserFromJWT } from '@helper/helper';
import { Box, ActionList, Text } from '@primer/react';

import { PersonIcon, MoveToStartIcon } from '@primer/octicons-react';
import { ProfilePicture } from './profilePicture';
import { logOut } from '@helper/helper';

interface Props {
  state: boolean;
}

export const ProfilePictureModal = (props: Props) => {
  const { state } = props;
  const user = getUserFromJWT();

  if (!state || !user) {
    return <></>;
  }

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        position: 'absolute',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'ansi.black',
        left: '-380%',
        width: '500%',
        top: '120%',
        p: 2,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          gap: 3,
          height: '50px',
          display: 'flex',
          my: 3,
          mx: 3,
        }}
      >
        <ProfilePicture src={user.ProfilePic} />
        <Text sx={{ fontWeight: 'bold' }}>{user.Username}</Text>
      </Box>

      <Box
        sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
      ></Box>

      <ActionList>
        <ActionList.Item
          sx={{ py: 2, fontSize: '16px' }}
          onSelect={() => {
            window.location.href = '/account';
          }}
        >
          <ActionList.LeadingVisual>
            <PersonIcon size={20} />
          </ActionList.LeadingVisual>
          Account
        </ActionList.Item>
        <ActionList.Item
          variant="danger"
          sx={{ py: 2, fontSize: '16px' }}
          onSelect={() => logOut()}
        >
          <ActionList.LeadingVisual>
            <MoveToStartIcon size={20} />
          </ActionList.LeadingVisual>
          Log Out
        </ActionList.Item>
      </ActionList>
    </Box>
  );
};
