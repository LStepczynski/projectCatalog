import { Box, Text, Heading } from '@primer/react';

/**
 * AboutComponent is a functional component that displays a category, title, and children content.
 *
 * @param {object} props - The properties object.
 * @param {string} props.category - The category text to display.
 * @param {string} props.title - The title text to display.
 * @param {React.ReactNode} props.children - The children content to display.
 *
 * @returns {JSX.Element} The rendered AboutComponent.
 */
export const AboutComponent = ({ category, title, children }: any) => {
  return (
    <Box>
      <Text
        sx={{
          fontSize: '20px',
          color: '#f5004e',
          fontFamily: 'inter tight',
          fontWeight: '800',
        }}
      >
        {category}
      </Text>
      <Heading
        sx={{
          fontFamily: 'inter tight',
          fontWeight: '800',
          fontSize: '24px',
          '@media screen and (min-width: 768px)': {
            fontSize: '',
          },
        }}
      >
        {title}
      </Heading>
      <Text
        sx={{
          fontFamily: 'inter tight',
          fontWeight: '500',
          fontSize: '14px',
          '@media screen and (min-width: 768px)': {
            fontSize: '',
          },
        }}
      >
        {children}
      </Text>
    </Box>
  );
};
