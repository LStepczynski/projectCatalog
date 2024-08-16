import { ThemeProvider, BaseStyles, Box } from '@primer/react';
import { Routes } from './routes';
import { NavBar } from './components/core/navBar';

export const App = () => {
  const mode = 'dark';

  const boxSize = {
    mt: '100px',
    width: '100vw',
    '@media screen and (min-width: 544px)': {
      width: 'small', // Adjust styles for screens with a maximum width of 768px
    },
    '@media screen and (min-width: 768px)': {
      width: 'medium', // Adjust styles for screens with a maximum width of 768px
    },
    '@media screen and (min-width: 1012px)': {
      width: 'large', // Adjust styles for screens with a maximum width of 768px
    },
    '@media screen and (min-width: 1280px)': {
      width: 'xlarge', // Adjust styles for screens with a maximum width of 768px
    },
  };

  return (
    <ThemeProvider colorMode={mode}>
      <BaseStyles>
        <Box
          sx={{
            backgroundColor: 'canvas.default',
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            zIndex: -1000,
          }}
        ></Box>
        <NavBar />

        <Box
          sx={{
            width: '100%',
            display: 'grid',
            justifyItems: 'center',
            mb:"10vh"
          }}
        >
          <Box sx={boxSize}>
            <Routes />
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
};
