import { Box, Heading } from '@primer/react';

interface Props {
  title: string;
  link: string;
}

export const CategoryHeader = (props: Props) => {
  const { title, link } = props;
  return (
    <Box
      onClick={() => (window.location.href = link)}
      sx={{
        width: '100%',
        border: '1px solid',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        p: 3,
        borderColor: 'ansi.black',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
          boxShadow: '0px 0px 25px rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Heading
        sx={{
          ml: 4,
        }}
      >
        {title}
      </Heading>
    </Box>
  );
};
