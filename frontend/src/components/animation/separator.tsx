import { Box } from '@primer/react';

export const Separator = ({ sx = {} }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '1px',
        backgroundColor: 'ansi.black',
        ...sx,
      }}
    ></Box>
  );
};
