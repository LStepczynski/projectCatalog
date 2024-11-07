import { Box } from '@primer/react';

interface Props {
  src: string;
}

export const ProfilePicture = (props: Props) => {
  const { src } = props;

  return (
    <Box
      sx={{
        borderRadius: '50%',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <img style={{ height: '100%' }} src={src} alt="Profile Picture" />
    </Box>
  );
};
