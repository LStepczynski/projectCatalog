import { Box, Heading, Text } from '@primer/react';

interface Props {
  title: string;
  message: string;
}

export const NotFound = (props: Props) => {
  const { title, message } = props;

  return (
    <Box sx={{ mt: '100px' }}>
      <Box sx={{ mb: 4 }}>
        <Heading
          sx={{
            fontSize: '38px',
            display: 'grid',
            justifyContent: 'center',
          }}
        >
          {title}
        </Heading>
      </Box>
      <Box>
        <Text
          as="p"
          sx={{
            fontSize: '22px',
            display: 'grid',
            justifyContent: 'center',
            textAlign: 'center',
            mx: 2,
          }}
        >
          {message}
        </Text>
      </Box>
    </Box>
  );
};
