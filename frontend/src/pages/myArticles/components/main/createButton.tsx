import { Box, Heading } from '@primer/react';
import { PencilIcon } from '@primer/octicons-react';

export const CreateButton = ({ user }: any) => {
  const handleCreate = () => {
    if (user?.Verified == 'true') {
      return (window.location.href = '/create');
    }
    alert(
      'This account is not verified. Please verify your email to create articles.'
    );
  };

  return (
    <Box
      onClick={handleCreate}
      sx={{
        width: '330px',
        height: '260px',
        position: 'relative',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'ansi.black',
        boxShadow: '0px 0px 25px rgba(0, 255, 0, 0)',
        transition: '0.3s all',
        ':hover': {
          boxShadow: '0px 0px 15px rgba(0, 255, 0, 0.4)',
        },
      }}
    >
      <Box
        sx={{
          width: '80px',
          position: 'absolute',
          left: '50%',
          top: '20%',
          transform: 'translate(-50%,0%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <PencilIcon size={80} />
        <Heading sx={{ cursor: 'default' }}>Create</Heading>
      </Box>
    </Box>
  );
};
