import { getUser } from '@utils/getUser';
import { logOut } from '@utils/logOut';

import { ProfilePicture } from '@components/common/user/profilePicture';

import { Box, ActionList, Text } from '@primer/react';
import {
  PersonIcon,
  MoveToStartIcon,
  PencilIcon,
} from '@primer/octicons-react';

interface Props {
  state: boolean;
}

export const ProfilePictureModal = (props: Props) => {
  const { state } = props;
  const user = getUser();

  if (!user) {
    return <></>;
  }

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        position: 'fixed',
        borderRadius: '10px',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
        border: '1px solid',
        borderColor: 'ansi.black',
        right: '0',
        width: '230px',
        top: '100%',
        transform: `translateX(${state ? 0 : 100}%)`,
        transition: '0.25s',
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
        <ProfilePicture src={user.profilePicture} />
        <Text sx={{ fontWeight: 'bold' }}>{user.username}</Text>
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
        {user &&
          (user.roles.includes('publisher') ||
            user.roles.includes('admin')) && (
            <ActionList.Item
              sx={{ py: 2, fontSize: '16px' }}
              onSelect={() => {
                window.location.href = '/myArticles/1';
              }}
            >
              <ActionList.LeadingVisual>
                <PencilIcon size={20} />
              </ActionList.LeadingVisual>
              My Articles
            </ActionList.Item>
          )}
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
