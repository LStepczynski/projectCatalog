import ReactDOM from 'react-dom';
import { ThemeProvider, BaseStyles, Box, Button } from '@primer/react';

export const Modal = ({ children, isOpen, closeFunc }: any) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return isOpen
    ? ReactDOM.createPortal(
        <ThemeProvider colorMode="dark">
          <BaseStyles>
            <Box
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'fixed',
                display: 'flex',
                height: '100vh',
                width: '100vw',
                zIndex: 1000,
                left: 0,
                top: 0,
              }}
            >
              <Box
                onClick={() => closeFunc(false)}
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  position: 'fixed',
                  height: '100vh',
                  width: '100vw',
                  zIndex: -1,
                  left: 0,
                  top: 0,
                }}
              ></Box>
              <Box
                sx={{
                  backgroundColor: 'canvas.default',
                  border: 'solid 1px',
                  borderColor: 'ansi.black',
                  borderRadius: '10px',
                  p: 8,
                  position: 'relative',
                }}
              >
                <Button
                  sx={{
                    position: 'absolute',
                    right: '18px',
                    top: '18px',
                  }}
                  onClick={() => closeFunc(false)}
                >
                  X
                </Button>
                {children}
              </Box>
            </Box>
          </BaseStyles>
        </ThemeProvider>,
        modalRoot
      )
    : null;
};
