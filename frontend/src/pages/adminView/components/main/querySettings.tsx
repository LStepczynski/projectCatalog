import { Box, Select, Text } from '@primer/react';

export const QuerySettings = ({
  setStatus,
}: {
  setStatus: (event: 'In Review' | 'Private') => void;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        justifyItems: 'right',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Text
          sx={{
            opacity: 0.7,
            fontSize: '14px',
          }}
        >
          Display:
        </Text>
        <Select
          onChange={(event) => {
            const val = event?.target.value;
            if (val === 'Private' || val === 'In Review') {
              setStatus(val);
            }
          }}
        >
          <Select.Option value="In Review">Review</Select.Option>
          <Select.Option value="Private">Private</Select.Option>
        </Select>
      </Box>
    </Box>
  );
};
